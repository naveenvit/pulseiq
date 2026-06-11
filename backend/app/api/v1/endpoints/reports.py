import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.dependencies import CurrentUser
from app.core.config import settings
from app.schemas.report import (
    ReportResponse,
    ReportListResponse,
    ReportAnalysisResponse,
    AnalysisInsight,
)
from app.services import report_service
from app.services.report_service import analyse_report_by_id

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "application/x-pdf"}
MAX_SIZE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("/upload", response_model=ReportResponse, status_code=201)
async def upload_report(
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
):
    """
    Upload a medical report PDF.
    Saves the file, commits the DB record, then triggers AI analysis
    in the background. Returns immediately with status='uploaded'.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES and not (
        file.filename and file.filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are accepted",
        )

    # Read file bytes
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if file_size > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed size is {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Save file + create DB record
    report = await report_service.upload_report(
        db=db,
        user=current_user,
        file_bytes=file_bytes,
        original_filename=file.filename or "report.pdf",
        file_size=file_size,
    )

    # ── CRITICAL: commit NOW so the background task can find the record ──
    await db.commit()
    await db.refresh(report)

    # Capture plain values — never pass ORM objects or sessions to background tasks
    report_id = report.id
    user_id = current_user.id

    print(f"[Reports] 📤 Upload committed — report_id={report_id} user_id={user_id}")
    print(f"[Reports] 🕐 Scheduling background analysis...")

    background_tasks.add_task(analyse_report_by_id, report_id, user_id)

    return ReportResponse.model_validate(report)


@router.get("/", response_model=list[ReportListResponse])
async def list_reports(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all of the current user's uploaded reports."""
    reports = await report_service.list_reports(db, current_user.id)
    return [ReportListResponse.model_validate(r) for r in reports]


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get full details and analysis for a specific report."""
    report = await report_service.get_report(db, report_id, current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportResponse.model_validate(report)


@router.get("/{report_id}/analysis", response_model=ReportAnalysisResponse)
async def get_report_analysis(
    report_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get structured AI analysis for a report.
    Poll this after upload until status becomes 'analyzed' or 'failed'.
    Typical wait time: 5-15 seconds depending on provider.
    """
    report = await report_service.get_report(db, report_id, current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.status in ("uploaded", "processing"):
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail=f"Analysis is {report.status}. Please check back in a few seconds.",
        )

    if report.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=report.ai_summary or "Analysis failed. Please try re-uploading the report.",
        )

    # Parse insights into typed objects
    insights = None
    if report.ai_insights:
        try:
            insights = [AnalysisInsight(**item) for item in report.ai_insights]
        except Exception as e:
            print(f"[Reports] ⚠️  Could not parse insights: {e}")
            insights = None

    return ReportAnalysisResponse(
        report_id=report.id,
        status=report.status,
        summary=report.ai_summary,
        insights=insights,
        abnormal_findings=report.abnormal_findings,
        confidence_score=report.confidence_score,
        analyzed_at=report.analyzed_at,
    )


@router.post("/{report_id}/reanalyse", response_model=ReportResponse)
async def reanalyse_report(
    report_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Re-trigger AI analysis for a report.
    Useful after switching AI providers or if the first attempt failed.
    """
    report = await report_service.get_report(db, report_id, current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.status == "processing":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Analysis is already running for this report",
        )

    # Reset to uploaded so background task picks it up cleanly
    report.status = "uploaded"
    await db.flush()

    background_tasks.add_task(analyse_report_by_id, report.id, current_user.id)
    print(f"[Reports] 🔁 Re-analysis scheduled for {report_id}")

    return ReportResponse.model_validate(report)


@router.delete("/{report_id}", status_code=204)
async def delete_report(
    report_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Archive a report and remove its file from disk."""
    report = await report_service.get_report(db, report_id, current_user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    await report_service.delete_report(db, report)