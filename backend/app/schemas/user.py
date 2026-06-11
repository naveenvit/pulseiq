from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import uuid


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("full_name", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: object) -> Optional[str]:
        if isinstance(v, str) and v.strip() == "":
            return None
        return v  # type: ignore[return-value]

    @field_validator("email", mode="before")
    @classmethod
    def strip_email(cls, v: object) -> object:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("password", mode="before")
    @classmethod
    def password_not_empty(cls, v: object) -> object:
        if isinstance(v, str) and len(v) < 1:
            raise ValueError("Password cannot be empty")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None

    @field_validator("full_name", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: object) -> Optional[str]:
        if isinstance(v, str) and v.strip() == "":
            return None
        return v  # type: ignore[return-value]


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_verified: bool
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str