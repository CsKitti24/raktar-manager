from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app import db


class Order(db.Model):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(50), unique=True)
    orderer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    supplier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    carrier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    warehouse_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"))
    status: Mapped[str] = mapped_column(String(50), default="megrendelve")
    comment: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    total_amount: Mapped[Optional[float]] = mapped_column(nullable=True)
    is_locked: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    locked_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    orderer: Mapped["User"] = relationship(foreign_keys=[orderer_id], back_populates="orders_as_orderer")
    supplier: Mapped[Optional["User"]] = relationship(foreign_keys=[supplier_id], back_populates="orders_as_supplier")
    carrier: Mapped[Optional["User"]] = relationship(foreign_keys=[carrier_id], back_populates="orders_as_carrier")
    warehouse_user: Mapped[Optional["User"]] = relationship(foreign_keys=[warehouse_user_id], back_populates="orders_as_warehouse")
    address: Mapped["Address"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order")
    complaints: Mapped[List["Complaint"]] = relationship(back_populates="order")
