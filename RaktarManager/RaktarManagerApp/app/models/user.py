from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from sqlalchemy.types import String

#ez nincs k�sz csak leteszteltem
class User(db.Model):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    def __repr__(self):
        return f'<User {self.username}>'