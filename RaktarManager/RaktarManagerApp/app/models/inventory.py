from datetime import datetime
from typing import List, Optional

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app import db


class Inventory(db.Model):
    __tablename__ = "inventories"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("storage_locations.id"))
    quantity: Mapped[int] = mapped_column(default=0)
    updated_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    __table_args__ = (UniqueConstraint("product_id", "location_id"),)

    product: Mapped["Product"] = relationship(back_populates="inventories")
    location: Mapped["StorageLocation"] = relationship(back_populates="inventories")
    logs: Mapped[List["InventoryLog"]] = relationship(back_populates="inventory")
