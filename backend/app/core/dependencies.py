import uuid
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.security import decode_token
from app.services.user_service import UserService
from app.models.user import User

# This tells FastAPI to expect: Authorization: Bearer <token>
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Protected route dependency.
    
    Usage in a route:
        @router.get("/me")
        async def get_me(user: Annotated[User, Depends(get_current_user)]):
            ...
    
    FastAPI will:
    1. Extract the Bearer token from the Authorization header
    2. Decode and validate the JWT
    3. Look up the user in the database
    4. Inject the User object into your route handler
    5. Return 401 if anything fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise credentials_exception

    if payload.get("type") != "access":
        raise credentials_exception

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    return user


# Shorthand type alias — use this in route handlers
CurrentUser = Annotated[User, Depends(get_current_user)]