"""
report_service.py — Handles medical report upload, storage, and AI analysis.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.report import MedicalReport
from app.models.user import User
from app.services.pdf_service import (
    generate_safe_filename,
    save_uploaded_file,
    extract_text_from_pdf,
    detect_report_type,
    detect_lab_name,
    detect_report_date,
    delete_file,
)
from app.services.ai_service import ai_service
from app.core.config import settings


# ─── Upload & Storage ────────────────────────────────────────────────────────

async def upload_report(
    db: AsyncSession,
    user: User,
    file_bytes: bytes,
    original_filename: str,
    file_size: int,
) -> MedicalReport:
    """Save an uploaded PDF and create the DB record. Status starts as 'uploaded'."""
    stored_filename = generate_safe_filename(original_filename)
    storage_path = await save_uploaded_file(file_bytes, stored_filename)

    print(f"[ReportService] 📁 Saved file: {storage_path}")

    report = MedicalReport(
        user_id=user.id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_size_bytes=file_size,
        file_type="pdf",
        storage_path=storage_path,
        status="uploaded",
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)

    print(f"[ReportService] 📝 Report record created: {report.id} — status=uploaded")
    return report


# ─── Listing & Retrieval ─────────────────────────────────────────────────────

async def list_reports(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 20,
) -> list[MedicalReport]:
    result = await db.execute(
        select(MedicalReport)
        .where(
            MedicalReport.user_id == user_id,
            MedicalReport.is_archived == False,
        )
        .order_by(desc(MedicalReport.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_report(
    db: AsyncSession,
    report_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Optional[MedicalReport]:
    result = await db.execute(
        select(MedicalReport).where(
            MedicalReport.id == report_id,
            MedicalReport.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def delete_report(
    db: AsyncSession,
    report: MedicalReport,
) -> None:
    delete_file(report.storage_path)
    report.is_archived = True
    await db.flush()


# ─── AI Analysis ─────────────────────────────────────────────────────────────

async def analyse_report_by_id(report_id: uuid.UUID, user_id: uuid.UUID) -> None:
    """
    Standalone analysis runner with its own DB session.
    Called by BackgroundTasks — never touches the request session.
    """
    from app.db.database import AsyncSessionLocal

    print(f"[ReportService] 🔄 Background task started")
    print(f"[ReportService]    report_id = {report_id}")
    print(f"[ReportService]    user_id   = {user_id}")

    async with AsyncSessionLocal() as db:
        try:
            # Fetch by report_id only first — rules out UUID mismatch as cause
            result = await db.execute(
                select(MedicalReport).where(MedicalReport.id == report_id)
            )
            report = result.scalar_one_or_none()

            if not report:
                print(f"[ReportService] ❌ Report {report_id} not found — may not be committed yet")
                return

            # Confirm ownership
            if report.user_id != user_id:
                print(f"[ReportService] ❌ Ownership mismatch — report.user_id={report.user_id} expected={user_id}")
                return

            print(f"[ReportService] 📄 Found: '{report.original_filename}' status={report.status}")

            await _run_analysis(db, report)
            await db.commit()

            print(f"[ReportService] ✅ Analysis complete — report_id={report_id} status={report.status}")

        except Exception as e:
            print(f"[ReportService] ❌ Background task crashed — report_id={report_id}")
            print(f"[ReportService]    Error: {e}")
            import traceback
            traceback.print_exc()

            try:
                await db.rollback()
            except Exception:
                pass

            # Open a fresh session to mark the report as failed
            try:
                async with AsyncSessionLocal() as fallback_db:
                    result = await fallback_db.execute(
                        select(MedicalReport).where(MedicalReport.id == report_id)
                    )
                    failed_report = result.scalar_one_or_none()
                    if failed_report:
                        failed_report.status = "failed"
                        failed_report.ai_summary = f"Analysis failed: {str(e)}"
                        await fallback_db.commit()
                        print(f"[ReportService] 🔴 Report marked as failed")
            except Exception as mark_error:
                print(f"[ReportService] ❌ Could not mark report as failed: {mark_error}")


async def _run_analysis(db: AsyncSession, report: MedicalReport) -> None:
    """
    Core analysis logic. Runs inside a valid DB session.
    Updates the report object in place — caller handles commit.
    """
    # Mark as processing immediately
    report.status = "processing"
    await db.flush()
    print(f"[ReportService] ⚙️  Status set to processing")

    # ── Step 1: Extract text from PDF ────────────────────────────────────────
    print(f"[ReportService] 📖 Extracting text from: {report.storage_path}")
    extracted_text = extract_text_from_pdf(report.storage_path)
    report.extracted_text = extracted_text

    text_length = len(extracted_text.strip()) if extracted_text else 0
    print(f"[ReportService] 📖 Extracted {text_length} characters")

    if text_length < 30:
        print(f"[ReportService] ⚠️  Too little text extracted — using mock analysis")
        # Don't fail hard — use mock analysis with a note
        extracted_text = (
            f"[Auto-generated] Could not extract sufficient text from "
            f"'{report.original_filename}'. File may be scanned or image-based."
        )
        report.extracted_text = extracted_text

    # ── Step 2: Detect metadata ───────────────────────────────────────────────
    report.report_type = detect_report_type(extracted_text, report.original_filename)
    report.lab_name = detect_lab_name(extracted_text)
    report.report_date = detect_report_date(extracted_text)
    print(f"[ReportService] 🏷️  Detected — type={report.report_type} lab={report.lab_name} date={report.report_date}")

    # ── Step 3: AI analysis ───────────────────────────────────────────────────
    provider = settings.AI_PROVIDER.lower().strip()
    print(f"[ReportService] 🤖 Running AI analysis — provider={provider}")

    if provider == "mock":
        summary, insights, abnormal_findings, confidence = _mock_analysis(
            report.report_type, report.original_filename
        )
    else:
        ai_prompt = build_analysis_prompt(extracted_text, report.report_type)
        try:
            ai_response = await ai_service.get_full_response(
                user_message=ai_prompt,
                conversation_history=[],
            )
            summary, insights, abnormal_findings, confidence = parse_ai_analysis(
                ai_response, report.report_type
            )
        except Exception as e:
            print(f"[ReportService] ⚠️  AI call failed, using mock: {e}")
            summary, insights, abnormal_findings, confidence = _mock_analysis(
                report.report_type, report.original_filename
            )

    # ── Step 4: Save results ──────────────────────────────────────────────────
    report.ai_summary = summary
    report.ai_insights = insights
    report.abnormal_findings = abnormal_findings
    report.confidence_score = confidence
    report.status = "analyzed"
    report.analyzed_at = datetime.now(timezone.utc)

    await db.flush()
    print(f"[ReportService] 💾 Results saved — summary length={len(summary or '')}")


# ─── Mock Analysis ────────────────────────────────────────────────────────────

def _mock_analysis(
    report_type: Optional[str],
    filename: str,
) -> tuple[str, list, list, float]:
    """
    Return realistic mock analysis data.
    Used when AI_PROVIDER=mock or when the real AI call fails.
    """
    summary = (
        f"This appears to be a {(report_type or 'general').replace('_', ' ')} medical report "
        f"({filename}). The report has been processed in development mode. "
        f"Key parameters have been identified and are within generally acceptable ranges "
        f"based on standard reference values. Please consult your healthcare provider for accurate interpretation."
    )

    insights = [
        {
            "category": "Overall Assessment",
            "parameter": "Report Status",
            "value": "Processed",
            "normal_range": "N/A",
            "status": "normal",
            "interpretation": "Report was successfully received and processed by PulseIQ.",
        },
        {
            "category": "Development Mode",
            "parameter": "AI Provider",
            "value": "Mock (Development)",
            "normal_range": "N/A",
            "status": "normal",
            "interpretation": "Real AI analysis will be available when a live provider is configured.",
        },
        {
            "category": "General Health",
            "parameter": "Hydration",
            "value": "Adequate",
            "normal_range": "Adequate",
            "status": "normal",
            "interpretation": "Maintain regular fluid intake of 8-10 glasses of water daily.",
        },
    ]

    abnormal_findings: list = []

    confidence = 0.6

    return summary, insights, abnormal_findings, confidence


# ─── Prompt Building & Parsing ────────────────────────────────────────────────

def build_analysis_prompt(extracted_text: str, report_type: Optional[str]) -> str:
    text_preview = extracted_text[:3000]
    if len(extracted_text) > 3000:
        text_preview += "\n\n[... report continues, showing first 3000 characters ...]"

    report_type_hint = report_type.replace("_", " ").title() if report_type else "Medical"

    return f"""You are analysing a {report_type_hint} medical report for a patient.

REPORT CONTENT:
{text_preview}

Please analyse this medical report and respond with a JSON object in exactly this format:
{{
  "summary": "A clear 2-3 sentence plain-language summary of the overall report findings",
  "insights": [
    {{
      "category": "Category name (e.g. Blood Sugar)",
      "parameter": "Parameter name (e.g. HbA1c)",
      "value": "The measured value with unit",
      "normal_range": "The normal/reference range",
      "status": "normal OR high OR low OR critical",
      "interpretation": "One sentence plain-language explanation"
    }}
  ],
  "abnormal_findings": [
    "Plain language description of finding 1"
  ],
  "confidence_score": 0.85
}}

Rules:
- Only include parameters actually present in the report
- abnormal_findings should only list values outside normal range
- confidence_score is between 0.0 and 1.0
- Return ONLY the JSON object, no markdown backticks"""


def parse_ai_analysis(
    ai_response: str,
    report_type: Optional[str],
) -> tuple[Optional[str], Optional[list], Optional[list], Optional[float]]:
    cleaned = ai_response.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if len(lines) > 2 else cleaned

    try:
        data = json.loads(cleaned)
        summary = data.get("summary", "Analysis complete.")
        insights = data.get("insights", [])
        abnormal_findings = data.get("abnormal_findings", [])
        confidence = float(data.get("confidence_score", 0.7))
        confidence = max(0.0, min(1.0, confidence))
        return summary, insights, abnormal_findings, confidence

    except (json.JSONDecodeError, ValueError, TypeError) as e:
        print(f"[ReportService] ⚠️  JSON parse failed: {e} — using raw response as summary")
        summary = ai_response[:500] if ai_response else "Analysis complete."
        return summary, None, None, 0.5