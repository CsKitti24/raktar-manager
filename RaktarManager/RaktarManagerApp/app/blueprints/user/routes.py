from flask import jsonify
from app.blueprints.user import bp
from app.blueprints.user.schemas import UserResponseSchema, UserRequestSchema, AddressSchema, UserLoginSchema
from app.blueprints.user.service import UserService
from apiflask import HTTPError
from apiflask.fields import String, Email, Nested, Integer, List
from .schemas import UserDetailResponseSchema, UserUpdateSchema, AddressSchema

@bp.route('/')

def index():
    return 'This is The User Blueprint'


#regisztráció
@bp.post('/registrate')
@bp.input(UserRequestSchema, location="json")
@bp.output(UserResponseSchema)
def user_registrate(json_data):
    success, response = UserService.user_registrate(json_data)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#beléptetés
@bp.post('/login')
@bp.doc(tags=["user"])
@bp.input(UserLoginSchema, location="json")
@bp.output(UserResponseSchema)
def user_login(json_data):
    success, response = UserService.user_login(json_data)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

@bp.get('/')
@bp.output(UserDetailResponseSchema(many=True))
def get_users():
    return UserService.get_all_users()

@bp.get('/<int:user_id>')
@bp.output(UserDetailResponseSchema)
def get_user(user_id):
    user = UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPError(404, "User not found")
    return user

@bp.post('/me/addresses')
@bp.input(AddressSchema, location="json")
@bp.output(AddressSchema)
def add_my_address(json_data):
    # Itt élesben a bejelentkezett user ID kellene (tokenbõl)
    # Most példaként vegyünk egy user_id-t a headerbõl vagy fixen
    success, res = UserService.add_address(user_id=1, address_data=json_data)
    if success: return res
    raise HTTPError(400, res)