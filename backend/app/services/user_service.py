from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime, timedelta, timezone

from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate, UserUpdate
from app.services.email_service import (
    generate_verification_token,
    send_verification_email,
    send_password_reset_email,
)


class UserService:

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_verification_token(db: AsyncSession, token: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.verification_token == token))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, user_data: UserCreate) -> User:
        token, expires = generate_verification_token()
        user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            is_verified=False,
            verification_token=token,
            verification_token_expires=expires,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        try:
            send_verification_email(user.email, user.full_name, token)
        except Exception as e:
            print(f"[EMAIL WARNING] Could not send verification email: {e}")
        return user

    @staticmethod
    async def authenticate(db: AsyncSession, email: str, password: str) -> Optional[User]:
        user = await UserService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    async def verify_email(db: AsyncSession, token: str) -> Optional[User]:
        user = await UserService.get_by_verification_token(db, token)
        if not user:
            return None
        if user.is_verified:
            return user
        now = datetime.now(timezone.utc)
        expires = user.verification_token_expires
        if expires:
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if now > expires:
                return None
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expires = None
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def regenerate_verification_token(db: AsyncSession, user: User) -> str:
        token, expires = generate_verification_token()
        user.verification_token = token
        user.verification_token_expires = expires
        await db.commit()
        try:
            send_verification_email(user.email, user.full_name, token)
        except Exception as e:
            print(f"[EMAIL WARNING] Could not resend verification email: {e}")
        return token
    
    @staticmethod
    async def create_reset_token(db: AsyncSession, email: str) -> bool:
        """
        Generate a reset token for the user with this email and send the email.
        Returns True whether or not the email exists (security best practice —
        never reveal whether an account exists).
        """
        user = await UserService.get_by_email(db, email)
        if not user:
            return True  # Pretend it worked — don't leak account existence

        token, expires = generate_verification_token()
        # Reset token expires in 1 hour, not 24 — override the expiry
        from datetime import datetime, timedelta, timezone
        expires = datetime.now(timezone.utc) + timedelta(hours=1)

        user.reset_token = token
        user.reset_token_expires = expires
        await db.commit()

        try:
            send_password_reset_email(user.email, user.full_name, token)
        except Exception as e:
            print(f"[EMAIL WARNING] Could not send reset email: {e}")

        return True

    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str):
        """
        Find the user by reset token, validate it, save the new password.
        Returns the User on success, None on failure.
        """
        from sqlalchemy import select
        result = await db.execute(
            select(User).where(User.reset_token == token)
        )
        user = result.scalar_one_or_none()

        if not user:
            return None

        now = datetime.now(timezone.utc)
        expires = user.reset_token_expires
        if expires:
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if now > expires:
                return None  # Token expired

        user.hashed_password = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update(db: AsyncSession, user: User, update_data: UserUpdate) -> User:
        if update_data.full_name is not None:
            user.full_name = update_data.full_name
        if update_data.password is not None:
            user.hashed_password = get_password_hash(update_data.password)
        if update_data.date_of_birth is not None:
            user.date_of_birth = update_data.date_of_birth
        if update_data.gender is not None:
            user.gender = update_data.gender
        await db.commit()
        await db.refresh(user)
        return user