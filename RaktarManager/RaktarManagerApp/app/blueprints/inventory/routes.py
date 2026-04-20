from app.extensions import auth
from app.blueprints import role_required
from app.blueprints.inventory import bp
from app.blueprints.inventory.schemas import (InventoryResponseSchema, InventoryLogResponseSchema, InventoryRequestSchema)
from app.blueprints.inventory.service import InventoryService
from apiflask import HTTPError

#Készlet lekérdezése    ✔
@bp.get('/list')
@bp.doc(tags=["inventory"])
@bp.auth_required(auth)
@role_required(["Warehouse", "Admin"])
@bp.output(InventoryResponseSchema(many=True))
def get_inventory():
    success, response = InventoryService.get_all_inventory()
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Készletmozgás napló   ✔
@bp.get('/log')
@bp.doc(tags=["inventory"])
@bp.auth_required(auth)
@role_required(["Warehouse", "Admin"])
@bp.output(InventoryLogResponseSchema(many=True))
def get_inventory_log():
    success, response = InventoryService.get_inventory_logs()
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Áru bevitel  ✔
@bp.post('/receive')
@bp.doc(tags=["inventory"])
@bp.auth_required(auth)
@role_required(["Warehouse", "Admin"]) 
@bp.input(InventoryRequestSchema, location="json")
@bp.output(InventoryResponseSchema)
def receive_inventory(json_data):
    success, response = InventoryService.receive_item(json_data, auth.current_user.get("user_id"))
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Áru kiadása    ✔
@bp.post('/dispatch')
@bp.doc(tags=["inventory"])
@bp.auth_required(auth)
@role_required(["Warehouse", "Admin"]) 
@bp.input(InventoryRequestSchema, location="json")
@bp.output(InventoryResponseSchema)
def dispatch_inventory(json_data):
    success, response = InventoryService.dispatch_item(json_data, auth.current_user.get("user_id"))
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)
