from __future__ import annotations
from datetime import datetime
from sqlalchemy import DateTime
import datetime

from app import db, create_app
from config import Config
from app.models.user import User
from app.models.role import Role
from app.models.address import Address
from app.models.category import Category
from app.models.product import Product
from app.models.user_role import UserRole
from app.models.order import Order, StatusEnum
from app.models.order_item import OrderItem
from app.models.complaint import Complaint
from app.models.storage import StorageLocation
from app.models.inventory import Inventory
from app.models.inventory_log import InventoryLog



# Create the Flask app and push the app context
app = create_app(config_class=Config)
app.app_context().push()

# Verify database configuration
if not app.config.get("SQLALCHEMY_DATABASE_URI"):
    raise ValueError("Database URI not set in configuration")

try:
    # Drop and recreate tables (optional, comment out if not desired)
   # db.drop_all()
   # db.create_all()

    # Roles
    if not Role.query.filter_by(rolename="Admin").first():
        db.session.add_all([
            Role(rolename="Admin"),
            Role(rolename="Orderer"),
            Role(rolename="Warehouseman"),
            Role(rolename="Carrier"),
            Role(rolename="Supplier")
        ])
        db.session.commit()

    # Product
    if not Product.query.filter_by(name="Vezeték nélküli fülhallgató").first():
        product = Product(
            category_id="3",
            name="Vezeték nélküli fülhallgató",
            description="Zajszûrõs Bluetooth fülhallgató 20 órás üzemidõvel.",
            sku="ELEC-WF-001",
            price=25000.00,
            is_active=True,
            created_at=datetime(2026, 3, 1, 10, 15)
        )
        db.session.add(product)
    if not Product.query.filter_by(name="A tiszta kód").first():
        product2 = Product(
            category_id="2",
            name="A tiszta kód",
            description="Útmutató agilis szoftverfejlesztõknek.",
            sku="BOOK-CLN-002",
            price=8500.00,
            is_active=True,
            created_at=datetime(2026, 3, 2, 14, 30)
        )
        db.session.add(product2)
    if not Product.query.filter_by(name="ZEszpresszó Kávéfõzõ").first():
        product3 = Product(
            category_id="1",
            name="Eszpresszó Kávéfõzõ",
            description="Prémium kávéfõzõ beépített tejhabosítóval.",
            sku="KITC-COF-003",
            price=45000.00,
            is_active=False,
            created_at=datetime(2026, 3, 3, 9)
        )
        db.session.add(product3)
    if not Product.query.filter_by(name="Vízálló Okosóra").first():
        product4 = Product(
            category_id="3",
            name="Vízálló Okosóra",
            description="Okosóra pulzusmérõvel, lépésszámlálóval és GPS-szel.",
            sku="ELEC-SMW-004",
            price=55000.00,
            is_active=True,
            created_at=datetime(2026, 3, 4, 8, 45)
        )
        db.session.add(product4)
    if not Product.query.filter_by(name="Python Mesterkurzus").first():
        product5 = Product(
            category_id="2",
            name="Python Mesterkurzus",
            description="Haladó programozási technikák és webfejlesztés.",
            sku="BOOK-PYT-005",
            price=12000.00,
            is_active=True,
            created_at=datetime(2026, 2, 28, 16, 20)
        )
        db.session.add(product5)
    if not Product.query.filter_by(name="Kétrekeszes Kenyérpirító").first():
        product6 = Product(
            category_id="1",
            name="Kétrekeszes Kenyérpirító",
            description="Acél bevonatú pirító 6 különbözõ fokozattal.",
            sku="KITC-TOA-006",
            price=14500.00,
            is_active=True,
            created_at=datetime(2026, 3, 4, 11, 10)
        )
        db.session.add(product6)
    db.session.commit()

    # Address
    user = User.query.filter_by(email="testuser@example.com").first()
    if user and not Address.query.first():
        
        address = Address(
            user_id=user.id,
            country="Magyarország",
            city="Budapest",
            street="Kossuth Lajos tér 1-3.",
            postal_code="1055"
        )
        db.session.add(address)
        address1 = Address(
            user_id=user.id,
            country="Magyarország",
            city="Veszprém",
            street="Egyetem utca 10.",
            postal_code="8200"
        )
        db.session.add(address1)
        address2 = Address(
            user_id=user.id,
            country="Magyarország",
            city="Szeged",
            street="Kárász utca 5.",
            postal_code="6720"
        )
        db.session.add(address2)
    db.session.commit()

    # Categories
    if not Category.query.filter_by(catname="Elektronika").first():
        db.session.add_all([
            Category(catname="Konyhai", id=1),
            Category(catname="Könyv", id=2),
            Category(catname="Elektronika", id=3)
        ])
        db.session.commit()

    # Orders
    user = User.query.filter_by(email="testuser@example.com").first()
    if user:
        address = Address.query.filter_by(user_id=user.id).first()
        if address:
                if not Order.query.filter_by(order_number="ORD-2026-001").first():
                    order = Order(
                        order_number="ORD-2026-001",
                        orderer_id=user.id,
                        address_id=address.id,
                        status="kifizetve", 
                        total_amount=58500.00 
                    )
                    db.session.add(order)
                    db.session.commit()

    # Storage
    if not StorageLocation.query.filter_by(code="A-01").first():
        loc1 = StorageLocation(
            code="A-01",
            description="A sor, 1. polc (Elektronika fõraktár)",
            is_active=1
        )
        db.session.add(loc1)
    if not StorageLocation.query.filter_by(code="A-02").first():
        loc2 = StorageLocation(
            code="A-02",
            description="A sor, 2. polc (Kisebb elektronikai cikkek)",
            is_active=1
        )
        db.session.add(loc2)
    if not StorageLocation.query.filter_by(code="B-01").first():
        loc3 = StorageLocation(
            code="B-01",
            description="B sor, 1. polc (Könyvek és kiadványok)",
            is_active=1
        )
        db.session.add(loc3)
    if not StorageLocation.query.filter_by(code="C-01").first():
        loc4 = StorageLocation(
            code="C-01",
            description="C sor, 1. polc (Konyhafelszerelés)",
            is_active=1
        )
        db.session.add(loc4)
    if not StorageLocation.query.filter_by(code="C-02").first():
        loc5 = StorageLocation(
            code="C-02",
            description="C sor, 2. polc (Törékeny konyhai áru)",
            is_active=1
        )
        db.session.add(loc5)
    if not StorageLocation.query.filter_by(code="B-02").first():
        loc6 = StorageLocation(
            code="B-02",
            description="B sor, 2. polc (Oktatóanyagok és füzetek)",
            is_active=1
        )
        db.session.add(loc6)
    db.session.commit()

except Exception as e:
    db.session.rollback()
    print(f"Hibába ütközött: {e}")
    raise
