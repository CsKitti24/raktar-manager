from app.blueprints.address import bp
from apiflask import APIBlueprint, HTTPError
from app.extensions import auth
from app.blueprints.address.schemas import AddressSchema, AddressUpdateSchema
from app.blueprints.address.service import AddressService

@bp.route('/')

def index():
    return 'This is The Address Blueprint'

@bp.get('/get')
@bp.auth_required(auth)
@bp.output(AddressSchema(many=True))
def get_my_addresses():
    return AddressService.get_by_user(auth.current_user['user_id'])

@bp.post('/add')
@bp.auth_required(auth)
@bp.input(AddressSchema)
@bp.output(AddressSchema)
def add_address(json_data):
    return AddressService.create(auth.current_user['user_id'], json_data)

@bp.put('/<int:id>')
@bp.auth_required(auth)
@bp.input(AddressUpdateSchema)
@bp.output(AddressSchema)
def update_address(id, json_data):
    res = AddressService.update(auth.current_user['user_id'], id, json_data)
    if not res:
        raise HTTPError(404, "Cím nem található vagy nincs hozzá jogosultságod.")
    return res

@bp.delete('/<int:id>')
@bp.auth_required(auth)
def delete_address(id):
    if AddressService.delete(auth.current_user['user_id'], id):
        return {"message": "Cím sikeresen törölve"}, 200
    raise HTTPError(404, "Cím nem található.")