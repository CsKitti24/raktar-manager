from app.extensions import db
from app.blueprints.orders.schemas import OrderResponseSchema
from app.models.order import Order
from app.models.address import Address
from app.models.role import Role
from app.models.user import User
from datetime import datetime, timedelta
from app.models.product import Product
from app.models.order_item import OrderItem
from sqlalchemy import select, or_
import traceback

class OrderService:

    #Megrendelések listázása
    @staticmethod 
    def get_orders(current_user):
        try:
            user_id = current_user.get("user_id")
            user_roles = []
            for role in current_user.get("roles"):
                user_roles.append(role)
  
            stmt = select(Order)

            if 'Admin' not in user_roles and 'Warehouse' not in user_roles:
                filters = []
                if 'Orderer' in user_roles:
                    filters.append(Order.orderer_id == user_id)
                if 'Supplier' in user_roles:
                    filters.append(Order.supplier_id == user_id)
                if 'Carrier' in user_roles:
                    filters.append(Order.carrier_id == user_id)

                if filters:
                    stmt = stmt.filter(or_(*filters))
                else:
                    return False, "Access denied. Nincs megfelelő jogosultságod a rendelések megtekintéséhez."

            orders = db.session.execute(stmt).scalars().all()
            return True, orders
        except Exception as ex:
            return False, "Hiba a lekérdezésnél!"

    #Megrendelés részleteinek lekérése ID alapján   
    @staticmethod
    def get_order_by_id(order_id, current_user):
        try:
            user_id = current_user.get("user_id")
            user_roles = []
            for role in current_user.get("roles"):
                user_roles.append(role)
           

            order = db.session.execute(select(Order).filter_by(id=order_id)).scalar_one_or_none()
            if not order:
                return False, "Order not found!"

            if user_id not in [order.orderer_id, order.supplier_id, order.carrier_id] and 'Admin' not in user_roles and 'Warehouseman' not in user_roles:
                return False, "Access denied."

            return True, order
        except Exception as ex:
            traceback.print_exc()
            return False, f"Hiba a lekérdezésnél! {str(ex)}"

    #Új megrendelés létrehozása
    @staticmethod
    def create_order(request, user_id):
        try:
            now = datetime.now()
            items_data = request.pop('items', [])
            
            order = Order(
                order_number=f"ORD-{now.strftime('%Y%m%d')}-{user_id}-{int(now.timestamp())}",
                orderer_id=user_id,
                address_id=request['address_id'],
                comment=request.get('comment'),
                status='megrendelve',
                total_amount=0.0,
                created_at=now,
                locked_at=now + timedelta(hours=24),
                is_locked=0
            )
            db.session.add(order)
            db.session.flush()

            total = 0.0
            for item in items_data:
                product = db.session.execute(select(Product).filter_by(id=item['product_id'])).scalar_one_or_none()
                if not product:
                    db.session.rollback()
                    return False, f"Product {item['product_id']} not found!"

                sub = product.price * item['quantity']
                db.session.add(OrderItem(
                    order_id=order.id, 
                    product_id=product.id, 
                    quantity=item['quantity'], 
                    unit_price=product.price, 
                    subtotal=sub
                ))
                total += sub

            order.total_amount = total
            db.session.commit()
            return True, order
            
        except Exception as ex:
            db.session.rollback()
            return False, "Hiba a létrehozásnál."

    #Megrendelés módosítása
    @staticmethod
    def update_order(order_id, request, user_id):
        try:
            order = db.session.execute(select(Order).filter_by(id=order_id)).scalar_one_or_none()
            if not order:
                return False, "Order not found!"
            
            if order.orderer_id != user_id:
                return False, "Only your own order can be modified!"
            
            if order.is_locked == 1 or (order.locked_at and datetime.now() > order.locked_at):
                if order.is_locked == 0:
                    order.is_locked = 1
                    db.session.commit()
                return False, "Order is locked (24h passed)!"

            if 'address_id' in request:
                order.address_id = request['address_id']
            if 'comment' in request:
                order.comment = request['comment']
            
            if 'items' in request:
                for old_item in order.items:
                    db.session.delete(old_item)
                db.session.flush()
                
                total = 0.0
                for item in request['items']:
                    product = db.session.execute(select(Product).filter_by(id=item['product_id'])).scalar_one_or_none()
                    if not product:
                        db.session.rollback()
                        return False, f"Product {item['product_id']} not found!"
                    
                    sub = product.price * item['quantity']
                    db.session.add(OrderItem(
                        order_id=order.id, 
                        product_id=product.id, 
                        quantity=item['quantity'], 
                        unit_price=product.price, 
                        subtotal=sub
                    ))
                    total += sub
                order.total_amount = total

            order.updated_at = datetime.now()
            db.session.commit()
            return True, order
            
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, f"Hiba módosítás közben: {str(ex)}"

    #Állapot módosítása
    def update_status(order_id, request):
        try:
            order = db.session.execute(select(Order).filter_by(id=order_id)).scalar_one_or_none()
            if not order:
                return False, "Order not found!"

            order.status = request['status']
            order.updated_at = datetime.now()
            db.session.commit()
            return True, order
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, f"Hiba módosítás közben: {str(ex)}"

    #Felhasználó hozzárendelése
    @staticmethod
    def assign_user(order_id, target_id, role_type, warehouse_id):
        try:
            order = db.session.execute(select(Order).filter_by(id=order_id)).scalar_one_or_none()
            if not order:
                return False, "Order not found!"

            if role_type == 'Supplier':
                order.supplier_id = target_id
            elif role_type == 'Carrier':
                order.carrier_id = target_id
            
            order.warehouse_user_id = warehouse_id
            order.updated_at = datetime.now()
            db.session.commit()
            return True, order
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, f"Incorrect Assignment data: {str(ex)}!"