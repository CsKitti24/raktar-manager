from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app import db


class StorageLocation(db.Model):
    __tablename__ = "storage_locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    inventories: Mapped[List["Inventory"]] = relationship(back_populates="location")
