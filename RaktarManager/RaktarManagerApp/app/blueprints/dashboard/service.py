from app.extensions import db
from app.models.order import Order
from app.models.complaint import Complaint
from app.models.inventory import Inventory
from app.models.storage import StorageLocation
from sqlalchemy import select, func, or_, and_
import traceback

class DashboardService:

    @staticmethod
    def get_summary(current_user):
        try:
            if not current_user:
                return False, "User not authenticated."

            user_id = current_user.get("user_id")
            roles_data = current_user.get("roles", [])
            user_roles = [r.get("rolename") if isinstance(r, dict) else r for r in roles_data]

            orders_query = select(func.count(Order.id))
            
            if 'Admin' not in user_roles and 'Warehouseman' not in user_roles:
                filters = []
                if 'Orderer' in user_roles: filters.append(Order.orderer_id == user_id)
                if 'Supplier' in user_roles: filters.append(and_(Order.supplier_id == user_id, Order.status == 'beszállításra vár'))
                if 'Carrier' in user_roles: filters.append(Order.carrier_id == user_id)
                
                if filters:
                    orders_query = orders_query.filter(or_(*filters))
                else:
                    orders_query = orders_query.filter(Order.id == -1) 

            total_orders = db.session.scalar(orders_query) or 0

            # Itt is Pending-re állítjuk nyitott helyett
            complaints_query = select(func.count(Complaint.id)).filter(
                or_(Complaint.status == 'Pending', Complaint.status == 'nyitott')
            )
            
            if 'Admin' not in user_roles:
                if 'Orderer' in user_roles:
                    complaints_query = complaints_query.filter_by(user_id=user_id)
                else:
                    complaints_query = complaints_query.filter(Complaint.id == -1)

            active_complaints = db.session.scalar(complaints_query) or 0


            low_stock_items = 0
            active_storage_locations = 0

            if 'Admin' in user_roles or 'Warehouseman' in user_roles:
               
                low_stock_items = db.session.scalar(
                    select(func.count(Inventory.id)).filter(Inventory.quantity <= 5)
                ) or 0

                active_storage_locations = db.session.scalar(
                    select(func.count(StorageLocation.id)).filter_by(is_active=1)
                ) or 0

            return True, {
                "total_orders": total_orders,
                "active_complaints": active_complaints,
                "low_stock_items": low_stock_items,
                "active_storage_locations": active_storage_locations
            }

        except Exception as ex:
            traceback.print_exc()
            return False, "Hiba történt a vezérlőpult adatainak lekérdezésekor!"
