import datetime as dt
from typing import Optional

from pydantic import AnyUrl, BaseModel, EmailStr, Field


class NewUser(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class LoginUser(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class CreateUrl(BaseModel):
    original_url: AnyUrl


class UrlOut(BaseModel):
    id: int
    original_url: str
    short_code: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class UrlWithCount(UrlOut):
    click_count: int


class ClickOut(BaseModel):
    id: int
    referrer: Optional[str]
    user_agent: Optional[str]
    timestamp: dt.datetime

    class Config:
        from_attributes = True