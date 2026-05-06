from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app import db


class InventoryLog(db.Model):
    __tablename__ = "inventory_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    inventory_id: Mapped[int] = mapped_column(ForeignKey("inventories.id"))
    order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("orders.id"), nullable=True)
    change_type: Mapped[str] = mapped_column(String(10))
    quantity_change: Mapped[int] = mapped_column()
    performed_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    note: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    inventory: Mapped["Inventory"] = relationship(back_populates="logs")
    order: Mapped[Optional["Order"]] = relationship()
    performer: Mapped["User"] = relationship(back_populates="inventory_logs")
