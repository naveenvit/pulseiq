import uuid
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


# ─── Response Schemas ───────────────────────────────────────────────────────

class ReportResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    original_filename: str
    file_size_bytes: int
    file_type: str
    report_type: Optional[str]
    report_date: Optional[str]
    lab_name: Optional[str]
    status: str
    ai_summary: Optional[str]
    ai_insights: Optional[Any]
    abnormal_findings: Optional[Any]
    confidence_score: Optional[float]
    is_archived: bool
    created_at: datetime
    analyzed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ReportListResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    file_size_bytes: int
    report_type: Optional[str]
    report_date: Optional[str]
    lab_name: Optional[str]
    status: str
    ai_summary: Optional[str]
    ai_insights: Optional[Any]
    abnormal_findings: Optional[Any]
    confidence_score: Optional[float]
    created_at: datetime
    analyzed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AnalysisInsight(BaseModel):
    category: str        # e.g. "Blood Sugar", "Liver Function"
    parameter: str       # e.g. "HbA1c"
    value: str           # e.g. "7.2%"
    normal_range: str    # e.g. "Below 5.7%"
    status: str          # "normal" | "high" | "low" | "critical"
    interpretation: str  # Plain language explanation


class ReportAnalysisResponse(BaseModel):
    report_id: uuid.UUID
    status: str
    summary: Optional[str]
    insights: Optional[list[AnalysisInsight]]
    abnormal_findings: Optional[list[str]]
    confidence_score: Optional[float]
    analyzed_at: Optional[datetime]
    disclaimer: str = (
        "⚕️ This AI analysis is for educational purposes only. "
        "Please consult a qualified healthcare professional to interpret your results."
    )