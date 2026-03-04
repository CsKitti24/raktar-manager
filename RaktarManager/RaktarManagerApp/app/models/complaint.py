from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app import db


class Complaint(db.Model):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    description: Mapped[str] = mapped_column(String(1000))
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="nyitott")
    resolution: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    resolved_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    order: Mapped["Order"] = relationship(back_populates="complaints")
    user: Mapped["User"] = relationship(back_populates="complaints")
