from flask import jsonify
from app.blueprints.orders import bp
from apiflask import HTTPError
from app.blueprints.orders.schemas import OrderRequestSchema, OrderResponseSchema, OrderUpdateRequestSchema,OrderStatusRequestSchema, OrderAssignUserSchema, OrderAssignLocationSchema
from app.blueprints.orders.service import OrderService
from app.extensions import auth
from app.blueprints import role_required

@bp.route("/")

def index():
    return 'This is The Orders Blueprint'

#Megrendelések listázása  ✔
@bp.get('/get-orders')
@bp.doc(tags=["orders"])
@bp.auth_required(auth)
@bp.output(OrderResponseSchema(many=True))
def get_orders():
    success, response = OrderService.get_orders(auth.current_user)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Megrendelés részleteinek lekérése ID alapján   ✔
@bp.get('/<int:order_id>')
@bp.doc(tags=["orders"])
@bp.auth_required(auth)
@bp.output(OrderResponseSchema)
def get_order(order_id):
    success, response = OrderService.get_order_by_id(order_id, auth.current_user)
    if success: 
        return response, 200
    raise HTTPError(message=response, status_code=404)

#Megrendelés létrehozása   ✔
@bp.post('/create')
@bp.doc(tags=["orders"])
@bp.auth_required(auth)
@role_required(["Orderer", "Admin"])
@bp.input(OrderRequestSchema, location="json")
@bp.output(OrderResponseSchema)
def create_order(json_data):
    success, response = OrderService.create_order(json_data, auth.current_user.get("user_id"))
    if success:
        return response, 200 
    raise HTTPError(message=response, status_code=400)

#Megrendelés módosítása     ✔
@bp.put('/<int:order_id>/update')
@bp.doc(tags=["orders"])
@bp.auth_required(auth)
@role_required(["Orderer", "Admin"])
@bp.input(OrderUpdateRequestSchema, location="json")
@bp.output(OrderResponseSchema)
def update_order(order_id, json_data):
    success, response = OrderService.update_order(order_id, json_data, auth.current_user.get("user_id"))
    if success: 
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Állapot módosítása   ✔
@bp.put('/<int:order_id>/status')
@bp.doc(tags=["orders"])
@bp.auth_required(auth)
@role_required(["Warehouseman", "Carrier", "Admin"])
@bp.input(OrderStatusRequestSchema, location="json")
@bp.output(OrderResponseSchema)
def update_status(order_id, json_data):
    success, response = OrderService.update_status(order_id, json_data)
    if success: 
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Beszállító hozzárendelése   ✔
@bp.put('/<int:order_id>/assign-supplier')
@bp.doc(tags=["orders"])
@bp.auth_required(auth)
@role_required(["Warehouseman", "Admin"])
@bp.input(OrderAssignUserSchema, location="json")
@bp.output(OrderResponseSchema)
def assign_supplier(order_id, json_data):
    success, response = OrderService.assign_user(order_id, json_data['user_id'], 'Supplier', auth.current_user.get("user_id"))
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Fuvarozó hozzárendelése   ✔
@bp.put('/<int:order_id>/assign-carrier')
@bp.doc(tags=["orders"])
@bp.auth_required(auth)
@role_required(["Warehouseman", "Admin"])
@bp.input(OrderAssignUserSchema, location="json")
@bp.output(OrderResponseSchema)
def assign_carrier(order_id, json_data):
    success, response = OrderService.assign_user(order_id, json_data['user_id'], 'Carrier', auth.current_user.get("user_id"))
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)
