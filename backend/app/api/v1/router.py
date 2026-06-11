from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, chat, reports, emergency

api_router = APIRouter()

api_router.include_router(
    health.router,
    prefix="",
    tags=["Health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["Chat"],
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Medical Reports"],
)

api_router.include_router(
    emergency.router,
    prefix="/emergency",
    tags=["Emergency Detection"],
)