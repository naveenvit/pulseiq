import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.database import Base
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User


class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # What triggered it
    trigger_message: Mapped[str] = mapped_column(Text, nullable=False)
    detected_keywords: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    detection_method: Mapped[str] = mapped_column(String(50), default="keyword")  # "keyword" or "ai"
    confidence_score: Mapped[float | None] = mapped_column(String(10), nullable=True)

    # Response given
    response_shown: Mapped[str | None] = mapped_column(Text, nullable=True)
    escalated_to_911: Mapped[bool] = mapped_column(Boolean, default=False)

    # Session context
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="emergency_events")

    def __repr__(self) -> str:
        return f"<EmergencyEvent {self.id} — {self.detection_method}>"