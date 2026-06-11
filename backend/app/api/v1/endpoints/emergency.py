import uuid
from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.dependencies import CurrentUser
from app.schemas.emergency import (
    EmergencyDetectRequest,
    EmergencyDetectResponse,
    EmergencyEventResponse,
)
from app.services import emergency_service

router = APIRouter()


@router.post("/detect", response_model=EmergencyDetectResponse)
async def detect_emergency(
    data: EmergencyDetectRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Analyse a message for emergency signals.

    Call this from the frontend before or alongside sending a chat message.
    If is_emergency=True, show the emergency response to the user immediately
    without waiting for the AI chat response.

    The frontend should:
    - Show a red alert banner with response_message
    - Show a "Call 112" button if call_emergency=True
    - Still send the message to the chat endpoint for full AI guidance
    """
    result = await emergency_service.detect_and_respond(
        db=db,
        user=current_user,
        message=data.message,
        session_id=data.session_id,
    )
    return EmergencyDetectResponse(**result)


@router.get("/events", response_model=list[EmergencyEventResponse])
async def list_emergency_events(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    List the current user's past emergency detection events.
    Useful for the emergency history page in the dashboard.
    """
    events = await emergency_service.list_emergency_events(db, current_user.id)
    return [EmergencyEventResponse.model_validate(e) for e in events]