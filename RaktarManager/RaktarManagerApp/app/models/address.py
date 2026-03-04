from __future__ import annotations

from app.extensions import db
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String
from sqlalchemy import ForeignKey

class Address(db.Model):
    __tablename__ = "addresses"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    country: Mapped[str] = mapped_column(String(50))
    city: Mapped[str] = mapped_column(String(100))
    street: Mapped[str] = mapped_column(String(255))
    postal_code: Mapped[str] = mapped_column(String(20))

    user: Mapped["User"] = relationship(back_populates="addresses")
    orders: Mapped[List["Order"]] = relationship(back_populates="address")