import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ─── Request Schemas ────────────────────────────────────────────────────────

class EmergencyDetectRequest(BaseModel):
    message: str
    session_id: Optional[uuid.UUID] = None


# ─── Response Schemas ───────────────────────────────────────────────────────

class EmergencyDetectResponse(BaseModel):
    is_emergency: bool
    confidence: str                    # "high" | "medium" | "low"
    detected_keywords: list[str]
    detection_method: str              # "keyword" | "ai" | "none"
    response_message: str              # What to show the user
    call_emergency: bool               # Whether to show "Call 112" button
    emergency_number: str = "112"      # India default


class EmergencyEventResponse(BaseModel):
    id: uuid.UUID
    trigger_message: str
    detected_keywords: Optional[list]
    detection_method: str
    response_shown: Optional[str]
    escalated_to_911: bool
    created_at: datetime

    model_config = {"from_attributes": True}