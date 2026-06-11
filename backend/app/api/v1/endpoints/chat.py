import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.db.database import get_db
from app.core.dependencies import CurrentUser
from app.models.chat import ChatSession
from app.models.report import MedicalReport
from app.models.emergency import EmergencyEvent
from app.schemas.chat import (
    SendMessageRequest,
    CreateSessionRequest,
    SessionResponse,
    SessionWithMessagesResponse,
    MessageResponse,
)
from app.services.chat_service import ChatService

router = APIRouter()


@router.get("/stats")
async def get_stats(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Dashboard stats: session count, report count, emergency count, recent sessions."""

    session_count_result = await db.execute(
        select(func.count()).select_from(ChatSession).where(
            ChatSession.user_id == current_user.id
        )
    )
    session_count = session_count_result.scalar() or 0

    report_count_result = await db.execute(
        select(func.count()).select_from(MedicalReport).where(
            MedicalReport.user_id == current_user.id
        )
    )
    report_count = report_count_result.scalar() or 0

    emergency_count_result = await db.execute(
        select(func.count()).select_from(EmergencyEvent).where(
            EmergencyEvent.user_id == current_user.id
        )
    )
    emergency_count = emergency_count_result.scalar() or 0

    recent_result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(5)
    )
    recent_sessions = recent_result.scalars().all()

    return {
        "session_count": session_count,
        "report_count": report_count,
        "emergency_count": emergency_count,
        "recent_sessions": [
            {
                "id": str(s.id),
                "title": s.title,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "message_count": s.message_count or 0,
            }
            for s in recent_sessions
        ],
    }


@router.post("/message")
async def send_message(
    data: SendMessageRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        stream = ChatService.stream_chat(db, current_user, data)
        return StreamingResponse(
            stream,
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}",
        )


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    data: CreateSessionRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    session = await ChatService.create_session(db, current_user, title=data.title or "New Conversation")
    return SessionResponse.model_validate(session)


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    sessions = await ChatService.list_sessions(db, current_user.id)
    return [SessionResponse.model_validate(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=SessionWithMessagesResponse)
async def get_session(
    session_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    session = await ChatService.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = await ChatService.get_messages(db, session_id)
    return SessionWithMessagesResponse(
        session=SessionResponse.model_validate(session),
        messages=[MessageResponse.model_validate(m) for m in messages],
    )


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    session = await ChatService.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await ChatService.delete_session(db, session)
