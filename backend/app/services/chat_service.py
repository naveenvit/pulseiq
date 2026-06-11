import uuid
from typing import Optional, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.chat import ChatSession, Message
from app.models.user import User
from app.services.ai_service import ai_service, detect_emergency
from app.services.emergency_service import scan_keywords, log_emergency_event
from app.schemas.chat import SendMessageRequest
from app.core.config import settings


class ChatService:

    # ── Session Management ────────────────────────────────────────────────────

    @staticmethod
    async def create_session(
        db: AsyncSession,
        user: User,
        title: str = "New Conversation",
    ) -> ChatSession:
        session = ChatSession(user_id=user.id, title=title)
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session

    @staticmethod
    async def get_session(
        db: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[ChatSession]:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_sessions(
        db: AsyncSession,
        user_id: uuid.UUID,
        limit: int = 20,
    ) -> list[ChatSession]:
        result = await db.execute(
            select(ChatSession)
            .where(
                ChatSession.user_id == user_id,
                ChatSession.is_archived == False,
            )
            .order_by(desc(ChatSession.updated_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_messages(
        db: AsyncSession,
        session_id: uuid.UUID,
    ) -> list[Message]:
        result = await db.execute(
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at)
        )
        return list(result.scalars().all())

    @staticmethod
    async def delete_session(
        db: AsyncSession,
        session: ChatSession,
    ) -> None:
        session.is_archived = True
        await db.flush()

    # ── Message Handling ──────────────────────────────────────────────────────

    @staticmethod
    async def save_message(
        db: AsyncSession,
        session_id: uuid.UUID,
        role: str,
        content: str,
        is_emergency: bool = False,
        model_used: Optional[str] = None,
        tokens_used: Optional[int] = None,
    ) -> Message:
        message = Message(
            session_id=session_id,
            role=role,
            content=content,
            is_emergency=is_emergency,
            contains_disclaimer=("educational information only" in content.lower()),
            model_used=model_used,
            tokens_used=tokens_used,
        )
        db.add(message)
        await db.flush()
        await db.refresh(message)
        return message

    @staticmethod
    async def build_history(messages: list[Message]) -> list[dict]:
        """Convert DB messages to AI format. Last 10 messages only."""
        recent = messages[-10:] if len(messages) > 10 else messages
        return [{"role": m.role, "content": m.content} for m in recent]

    # ── RAG context retrieval ─────────────────────────────────────────────────

    @staticmethod
    def _get_rag_context(user_message: str) -> str:
        """
        Retrieve relevant medical knowledge for this message.
        Returns empty string if RAG is unavailable — chat still works.
        """
        try:
            from app.services.rag_service import retrieve_context
            context = retrieve_context(user_message)
            if context:
                print(f"[ChatService] RAG retrieved {len(context)} chars of context")
            return context
        except Exception as e:
            print(f"[ChatService] RAG unavailable: {e}")
            return ""

    # ── Main: Stream a chat response ──────────────────────────────────────────

    @staticmethod
    async def stream_chat(
        db: AsyncSession,
        user: User,
        data: SendMessageRequest,
    ) -> AsyncGenerator[str, None]:
        """
        Main chat flow:
        1. Get or create session
        2. Run emergency detection — log event if triggered
        3. Save user message
        4. Build conversation history
        5. Retrieve RAG context (verified medical knowledge)
        6. Stream AI response (grounded in RAG context)
        7. Save assistant message
        8. Update session metadata
        """
        # Step 1 — Get or create session
        if data.session_id:
            session = await ChatService.get_session(db, data.session_id, user.id)
            if not session:
                raise ValueError("Session not found or access denied")
        else:
            session = await ChatService.create_session(db, user)

        # Step 2 — Emergency detection
        scan = scan_keywords(data.content)
        is_emergency = scan["is_emergency"]

        if is_emergency:
            print(
                f"[ChatService] 🚨 Emergency detected — "
                f"keywords={scan['keywords']} severity={scan['severity']}"
            )
            await log_emergency_event(
                db=db,
                user=user,
                trigger_message=data.content,
                detected_keywords=scan["keywords"],
                detection_method="keyword",
                response_shown="Emergency detected via chat message",
                escalated_to_911=(scan["severity"] == "critical"),
                session_id=session.id,
            )

        # Step 3 — Save user message
        await ChatService.save_message(
            db,
            session_id=session.id,
            role="user",
            content=data.content,
            is_emergency=is_emergency,
        )

        # Step 4 — Build conversation history
        existing_messages = await ChatService.get_messages(db, session.id)
        history_messages = existing_messages[:-1]  # Exclude the message just saved
        history = await ChatService.build_history(history_messages)

        # Step 5 — Retrieve RAG context
        # This runs synchronously but is fast (local vector search, <100ms)
        rag_context = ChatService._get_rag_context(data.content)

        # Build the enriched user message with RAG context injected
        if rag_context:
            enriched_message = (
                f"{data.content}\n\n"
                f"---\n"
                f"RELEVANT MEDICAL KNOWLEDGE (use this to ground your answer):\n"
                f"{rag_context}\n"
                f"---\n"
                f"Please base your response on the above verified medical information "
                f"where relevant. Always remind the user to consult a healthcare professional."
            )
        else:
            enriched_message = data.content

        # Step 6 — Stream AI response using enriched message
        full_response = ""

        async def stream_and_collect() -> AsyncGenerator[str, None]:
            nonlocal full_response
            async for chunk in ai_service.stream_response(
                user_message=enriched_message,
                conversation_history=history,
                is_emergency=is_emergency,
            ):
                full_response += chunk
                yield chunk

        # Yield session ID first so frontend knows which session this is
        yield f"SESSION_ID:{session.id}\n"

        # Yield AI response chunks
        async for chunk in stream_and_collect():
            yield chunk

        # Step 7 — Save assistant message
        provider = settings.AI_PROVIDER.lower().strip()
        model_label = {
            "gemini": settings.GEMINI_MODEL,
            "anthropic": "claude-sonnet-4-20250514",
            "openai": "gpt-4o",
            "mock": "mock-development",
        }.get(provider, f"{provider}-fallback-mock")

        await ChatService.save_message(
            db,
            session_id=session.id,
            role="assistant",
            content=full_response,
            is_emergency=is_emergency,
            model_used=model_label,
        )

        # Step 8 — Update session metadata
        session.message_count += 2

        if session.message_count == 2:
            try:
                title = await ai_service.generate_session_title(data.content)
                session.title = title
            except Exception:
                session.title = data.content[:60] + ("..." if len(data.content) > 60 else "")

        await db.flush()
