from __future__ import annotations
import datetime

from app.extensions import db
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String
from sqlalchemy import DateTime, ForeignKey, Float
from datetime import datetime

class Product(db.Model):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))
    sku: Mapped[str] = mapped_column(String(50))
    price: Mapped[float] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(default = True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    category: Mapped["Category"] = relationship(back_populates="products")
    order_items: Mapped[List["OrderItem"]] = relationship(back_populates="product")
    inventories: Mapped[List["Inventory"]] = relationship(back_populates="product")