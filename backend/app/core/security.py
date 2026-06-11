from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30


def hash_password(password: str) -> str:
    """Hash a plain password."""
    return pwd_context.hash(password)


# Alias — user_service.py calls get_password_hash
get_password_hash = hash_password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str | dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    Accepts either a plain user-id string OR a dict like {"sub": "user-id"}.
    auth.py calls it with a dict; legacy code may pass a string.
    """
    if isinstance(subject, dict):
        # Called as create_access_token({"sub": user_id})
        sub = subject.get("sub", "")
    else:
        # Called as create_access_token(user_id)
        sub = subject

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": sub,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str | dict) -> str:
    """
    Create a JWT refresh token.
    Accepts either a plain user-id string OR a dict like {"sub": "user-id"}.
    """
    if isinstance(subject, dict):
        sub = subject.get("sub", "")
    else:
        sub = subject

    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": sub,
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token. Returns None if invalid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# Alias — auth.py calls verify_token
verify_token = decode_token