from __future__ import annotations
from datetime import datetime

from app import db, create_app
from config import Config
from app.models.user import User
from app.models.role import Role
from app.models.userrole import UserRole
from app.models.address import Address
from app.models.product import Product
from app.models.order import Order, StatusEnum
from app.models.orderitem import OrderItem
from app.models.complaint import Complaint
from app.models.inventory import Inventory
from app.models.inventory_log import Inventory_log
from app.models.category import Category
from app.models.storage_location import Storage_Location



