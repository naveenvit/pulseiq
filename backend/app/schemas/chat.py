import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request Schemas ────────────────────────────────────────────────────────

class SendMessageRequest(BaseModel):
    content: str
    session_id: Optional[uuid.UUID] = None  # None = start a new session


class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Conversation"


# ─── Response Schemas ───────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    is_emergency: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionResponse(BaseModel):
    id: uuid.UUID
    title: str
    summary: Optional[str]
    topic: Optional[str]
    message_count: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SessionWithMessagesResponse(BaseModel):
    session: SessionResponse
    messages: list[MessageResponse]


class SendMessageResponse(BaseModel):
    session_id: uuid.UUID
    message_id: uuid.UUID
    content: str
    is_emergency: bool