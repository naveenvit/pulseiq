from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns server status and timestamp.
    """
    return {
        "status": "healthy",
        "service": "PulseIQ API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ping")
async def ping():
    """Simple ping endpoint."""
    return {"message": "pong"}