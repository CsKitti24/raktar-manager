from __future__ import annotations

from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from sqlalchemy.types import String
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.types import DateTime
from werkzeug.security import generate_password_hash



class User(db.Model):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    roles: Mapped[List['Role']] = relationship( secondary='user_roles', back_populates='users')
    full_name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(onupdate=func.now())
    addresses: Mapped[List['Address']] = relationship(back_populates='user')
    complaints: Mapped[List['Complaint']] = relationship(back_populates='user')

    orders_as_orderer: Mapped[List['Order']] = relationship(foreign_keys="[Order.orderer_id]", back_populates="orderer")
    orders_as_supplier: Mapped[List['Order']] = relationship(foreign_keys="[Order.supplier_id]", back_populates="supplier")
    orders_as_carrier: Mapped[List['Order']] = relationship(foreign_keys="[Order.carrier_id]", back_populates="carrier")
    orders_as_warehouse: Mapped[List['Order']] = relationship(foreign_keys="[Order.warehouse_user_id]", back_populates="warehouse_user")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)