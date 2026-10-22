import datetime as dt
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    urls: Mapped[List["Url"]] = relationship(
        "Url", back_populates="user", cascade="all, delete-orphan"
    )


class Url(Base):
    __tablename__ = "urls"

    id: Mapped[int] = mapped_column(primary_key=True)
    original_url: Mapped[str] = mapped_column(String(2048))
    short_code: Mapped[Optional[str]] = mapped_column(
        String(11), unique=True, index=True, nullable=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime, default=dt.datetime.utcnow
    )

    user: Mapped["User"] = relationship("User", back_populates="urls")
    clicks: Mapped[List["Click"]] = relationship(
        "Click", back_populates="url", cascade="all, delete-orphan"
    )


class Click(Base):
    __tablename__ = "clicks"

    id: Mapped[int] = mapped_column(primary_key=True)
    url_id: Mapped[int] = mapped_column(ForeignKey("urls.id"), index=True)
    referrer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[dt.datetime] = mapped_column(
        DateTime, default=dt.datetime.utcnow
    )
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    url: Mapped["Url"] = relationship("Url", back_populates="clicks")