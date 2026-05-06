from app.extensions import db
from app.models.inventory import Inventory
from app.models.inventory_log import InventoryLog 
from datetime import datetime
from sqlalchemy import select
import traceback

class InventoryService:

    #Készlet lekérdezése
    @staticmethod
    def get_all_inventory():
        try:
            items = db.session.execute(select(Inventory)).scalars().all()
            return True, items
        except Exception as ex:
            traceback.print_exc()
            return False, "Hiba a készlet lekérdezésénél!"

    #Készletmozgás napló
    @staticmethod
    def get_inventory_logs():
        try:
            logs = db.session.execute(select(InventoryLog).order_by(InventoryLog.created_at.desc())).scalars().all()
            return True, logs
        except Exception as ex:
            traceback.print_exc()
            return False, "Hiba a készletnapló lekérdezésénél!"

    #Áru bevitel
    @staticmethod
    def receive_item(request, user_id):
        try:
            product_id = request['product_id']
            location_id = request['location_id']
            quantity_to_add = request['quantity']

            if quantity_to_add <= 0:
                return False, "A bevételezett mennyiségnek nagyobbnak kell lennie nullánál!"

            inventory = db.session.execute(
                select(Inventory).filter_by(product_id=product_id, location_id=location_id)
            ).scalar_one_or_none()

            if not inventory:
                inventory = Inventory(
                    product_id=product_id,
                    location_id=location_id,
                    quantity=quantity_to_add,
                    updated_at=datetime.now()
                )
                db.session.add(inventory)
                db.session.flush() 
            else:
                inventory.quantity += quantity_to_add
                inventory.updated_at = datetime.now()

            log_entry = InventoryLog(
                inventory_id=inventory.id,
                change_type='in',
                quantity_change=quantity_to_add,
                performed_by=user_id,
                note=request.get('note')
            )
            db.session.add(log_entry)

            db.session.commit()
            return True, inventory

        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, "Hiba az áru bevételezésekor! Ellenőrizd a termék és tárhely ID-t."

    #Áru kiadása
    @staticmethod
    def dispatch_item(request, user_id):
        try:
            product_id = request['product_id']
            location_id = request['location_id']
            quantity_to_remove = request['quantity']

            if quantity_to_remove <= 0:
                return False, "A kiadott mennyiségnek nagyobbnak kell lennie nullánál!"

            inventory = db.session.execute(
                select(Inventory).filter_by(product_id=product_id, location_id=location_id)
            ).scalar_one_or_none()

            if not inventory:
                return False, "Nincs ilyen termék ezen a tárhelyen!"

            if inventory.quantity < quantity_to_remove:
                return False, f"Nincs elegendő készlet! Elérhető: {inventory.quantity} db."

            inventory.quantity -= quantity_to_remove
            inventory.updated_at = datetime.now()

            log_entry = InventoryLog(
                inventory_id=inventory.id,
                order_id=request.get('order_id'), 
                change_type='out',
                quantity_change=quantity_to_remove, 
                performed_by=user_id,
                note=request.get('note')
            )
            db.session.add(log_entry)

            db.session.commit()
            return True, inventory

        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, "Hiba az áru kiadásakor!"
