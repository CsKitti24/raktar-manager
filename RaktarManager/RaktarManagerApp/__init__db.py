from __future__ import annotations
from datetime import datetime
import email
from sqlalchemy import DateTime

from app import db, create_app
from config import Config
from app.models.user import User
from app.models.role import Role
from app.models.address import Address
from app.models.category import Category
from app.models.product import Product
from app.models.user_role import UserRole
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.complaint import Complaint
from app.models.storage import StorageLocation
from app.models.inventory import Inventory
from app.models.inventory_log import InventoryLog


app = create_app(config_class=Config)

def seed_database():
    with app.app_context():
        db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
        

        try:
            #db.drop_all()
            #db.create_all()

            # Role
            if not Role.query.filter_by(rolename="Admin").first():
                db.session.add_all([
                    Role(rolename="Admin"),
                    Role(rolename="Orderer"),
                    Role(rolename="Warehouseman"),
                    Role(rolename="Carrier"),
                    Role(rolename="Supplier")
                ])
                db.session.commit()

            # Categories
            if not Category.query.filter_by(name="Elektronika").first():
                db.session.add_all([
                    Category(name="Konyhai", id=1),
                    Category(name="Könyv", id=2),
                    Category(name="Elektronika", id=3)
                ])
                db.session.commit()

            # Test User
            if not User.query.filter_by(email="peldapeter@gmail.com").first():
                user = User(username="Peter", 
                            email="peldapeter@gmail.com",
                            full_name="Példa Péter",
                            phone="+36301234567")
                user.set_password("Jelszo123")
                db.session.add(user)
                db.session.commit()

            # Assign Roles 
            user = User.query.filter_by(email="peldapeter@gmail.com").first()
            admin_role = Role.query.filter_by(rolename="Admin").first()
            user_role = Role.query.filter_by(rolename="Orderer").first()
            
            roles_added = False
            if admin_role and admin_role not in user.roles:
                user.roles.append(admin_role)
                roles_added = True
            if user_role and user_role not in user.roles:
                user.roles.append(user_role)
                roles_added = True
                
            if roles_added:
                db.session.commit()

            # Address
            if user and not Address.query.filter_by(user_id=user.id).first():
                db.session.add_all([
                    Address(user_id=user.id, 
                            country="Magyarország", 
                            city="Budapest", 
                            street="Kossuth Lajos tér 1-3.", 
                            postal_code="1055"),

                    Address(user_id=user.id, 
                            country="Magyarország", 
                            city="Veszprém", 
                            street="Egyetem utca 10.", 
                            postal_code="8200"),

                    Address(user_id=user.id, 
                            country="Magyarország", 
                            city="Szeged", 
                            street="Kárász utca 5.", 
                            postal_code="6720")
                ])
                db.session.commit()

            # Products
            # Products
            product_data = [
                {
                    "category_id": 3,
                    "name": "Vízálló füllhalgató",
                    "description": "Zajszűrős Bluetooth fülhallgató.",
                    "sku": "ELEC-WF-001",
                    "price": 25000.00,
                    "image_url": "/images/fulhallgato.jpg",
                    "is_active": True,
                    "created_at": datetime(2026, 3, 1, 10, 15)
                },
                {
                    "category_id": 2,
                    "name": "A tiszta kód",
                    "description": "Útmutató agilis szoftverfejlesztőknek.",
                    "sku": "BOOK-CLN-002",
                    "price": 8500.00,
                    "image_url": "/images/tisztakod.jpg",
                    "is_active": True,
                    "created_at": datetime(2026, 3, 2, 14, 30)
                },
                {
                    "category_id": 1,
                    "name": "Eszpresszó Kávéfőző",
                    "description": "Prémium kávéfőző.",
                    "sku": "KITC-COF-003",
                    "price": 45000.00,
                    "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
                    "is_active": False,
                    "created_at": datetime(2026, 3, 3, 9, 0)
                },
                {
                    "category_id": 3,
                    "name": "Vízálló okosóra",
                    "description": "Okosóra pulzusmérővel.",
                    "sku": "ELEC-SMW-004",
                    "price": 55000.00,
                    "image_url": "/images/ora.jpg",
                    "is_active": True,
                    "created_at": datetime(2026, 3, 4, 8, 45)
                },
                {
                    "category_id": 2,
                    "name": "Python mesterkurzus",
                    "description": "Haladó programozási technikák.",
                    "sku": "BOOK-PYT-005",
                    "price": 12000.00,
                    "image_url": "/images/python.jpg",
                    "is_active": True,
                    "created_at": datetime(2026, 2, 28, 16, 20)
                },
                {
                    "category_id": 1,
                    "name": "Kétrekeszes kenyérpirító",
                    "description": "Acél bevonatú pirító.",
                    "sku": "KITC-TOA-006",
                    "price": 14500.00,
                    "image_url": "/images/pirito.jpg",
                    "is_active": True,
                    "created_at": datetime(2026, 3, 4, 11, 10)
                }
            ]

            for p_info in product_data:
                existing_prod = Product.query.filter_by(sku=p_info["sku"]).first()
                if existing_prod:
                    existing_prod.name = p_info["name"]
                    existing_prod.image_url = p_info["image_url"]
                    existing_prod.description = p_info["description"]
                    existing_prod.price = p_info["price"]
                    existing_prod.is_active = p_info["is_active"]
                    existing_prod.category_id = p_info["category_id"]
                else:
                    db.session.add(Product(**p_info))
            
            db.session.commit()

            # Storage
            if not StorageLocation.query.filter_by(code="A-01").first():
                db.session.add_all([
                    StorageLocation(code="A-01", description="A sor, 1. polc", is_active=True),
                    StorageLocation(code="A-02", description="A sor, 2. polc", is_active=True),
                    StorageLocation(code="B-01", description="B sor, 1. polc", is_active=True),
                    StorageLocation(code="C-01", description="C sor, 1. polc", is_active=True),
                    StorageLocation(code="C-02", description="C sor, 2. polc", is_active=True),
                    StorageLocation(code="B-02", description="B sor, 2. polc", is_active=True)
                ])
                db.session.commit()

            # Inventory
            if not Inventory.query.first():
                db.session.add_all([
                    Inventory(product_id=1, location_id=2, quantity=48),
                    Inventory(product_id=2, location_id=3, quantity=19),
                    Inventory(product_id=3, location_id=4, quantity=5),
                    Inventory(product_id=4, location_id=1, quantity=15),
                    Inventory(product_id=5, location_id=6, quantity=30),
                    Inventory(product_id=6, location_id=4, quantity=12)
                ])
                db.session.commit()

            # Orders
            if user:
                address = Address.query.filter_by(user_id=user.id).first()
                if address and not Order.query.filter_by(order_number="ORD-2026-001").first():
                    order = Order(
                        order_number="ORD-2026-001",
                        orderer_id=user.id,
                        address_id=address.id,
                        status="kifizetve", 
                        total_amount=58500.00 
                    )
                    db.session.add(order)
                    db.session.commit()

            # Order Items
            order = Order.query.filter_by(order_number="ORD-2026-001").first()
            if order:
                product1 = Product.query.filter_by(sku="ELEC-WF-001").first()
                product2 = Product.query.filter_by(sku="BOOK-CLN-002").first()
            
                if product1 and product2 and not OrderItem.query.filter_by(order_id=order.id).first():
                    item1 = OrderItem(order_id=order.id, 
                                      product_id=product1.id, 
                                      quantity=2, 
                                      unit_price=product1.price, 
                                      subtotal=product1.price * 2)

                    item2 = OrderItem(order_id=order.id, 
                                      product_id=product2.id, 
                                      quantity=1, 
                                      unit_price=product2.price, 
                                      subtotal=product2.price * 1)
                    db.session.add_all([item1, item2])
                    db.session.commit()
                   
            # Inventory Logs 
            if not InventoryLog.query.first():
                db.session.add_all([
                    InventoryLog(inventory_id=1, 
                                 change_type="BE", 
                                 quantity_change=50, 
                                 performed_by=1, 
                                 note="Kezdeti feltöltés"),

                    InventoryLog(inventory_id=2, 
                                 change_type="BE", 
                                 quantity_change=20, 
                                 performed_by=1, 
                                 note="Kezdeti feltöltés"),

                    InventoryLog(inventory_id=1, 
                                 order_id=1, 
                                 change_type="KI", 
                                 quantity_change=-2, 
                                 performed_by=1, 
                                 note="Kiszolgálva"),

                    InventoryLog(inventory_id=2, 
                                 order_id=1, 
                                 change_type="KI", 
                                 quantity_change=-1, 
                                 performed_by=1, 
                                 note="Kiszolgálva")
                ])
                db.session.commit()
                
            # Complaints 
            if not Complaint.query.first():
                 db.session.add_all([
                     Complaint(order_id=1, 
                               user_id=1, 
                               description="Hiányzó kábel.", 
                               file_name="kabel.jpg", 
                               status="nyitott"),

                     Complaint(order_id=1, 
                               user_id=1, 
                               description="Sérült borító.", 
                               status="lezárva", 
                               resolution="Kupon", 
                               resolved_at=datetime(2026, 3, 5, 14, 30))
                 ])
                 db.session.commit()
                 
            print("lefutott")
        except Exception as e:
            db.session.rollback()
            print(f"\nHIBA A feltöltés megszakadt egy hiba miatt: {e}")
            raise

if __name__ == "__main__":
    seed_database()