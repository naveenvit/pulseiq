from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserResponse, UserUpdate, TokenResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await UserService.get_by_email(db, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    user = await UserService.create(db, user_data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await UserService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated."
        )

    # Pass plain string — no dict needed
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user = await UserService.get_by_id(db, payload.get("sub"))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive."
        )

    # Pass plain string subject — matches create_access_token(subject: str | dict)
    access_token = create_access_token(str(user.id))
    new_refresh_token = create_refresh_token(str(user.id))

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await UserService.update(db, current_user, update_data)


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully."}


# ── Email verification ────────────────────────────────────────────────────────

@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    user = await UserService.verify_email(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification link is invalid or has expired. Please request a new one."
        )
    return {"message": "Email verified successfully! You can now close this tab."}


@router.post("/resend-verification")
async def resend_verification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.is_verified:
        return {"message": "Your email is already verified."}
    await UserService.regenerate_verification_token(db, current_user)
    return {"message": "Verification email sent! Please check your inbox."}

# ── Password reset ────────────────────────────────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Send a password reset email.
    Always returns 200 — never reveals whether the account exists.
    """
    await UserService.create_reset_token(db, email)
    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify the reset token and save the new password."""
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters."
        )

    user = await UserService.reset_password(db, token, new_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired. Please request a new one."
        )

    return {"message": "Password reset successfully. You can now log in with your new password."}