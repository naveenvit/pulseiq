import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, ForeignKey, Integer, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.database import Base
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.user import User


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # File info
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(500), nullable=False)  # UUID-based safe name
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), default="pdf")
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)

    # Report metadata
    report_type: Mapped[str | None] = mapped_column(String(100), nullable=True)  # "blood_test", "xray", "mri" etc.
    report_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    lab_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Processing status
    status: Mapped[str] = mapped_column(String(30), default="uploaded")
    # Status flow: uploaded → processing → analyzed → failed

    # AI Analysis
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_insights: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    abnormal_findings: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    analyzed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="medical_reports")

    def __repr__(self) -> str:
        return f"<MedicalReport {self.original_filename} — {self.status}>"