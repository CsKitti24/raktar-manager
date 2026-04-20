from apiflask import APIBlueprint, HTTPError
from app.blueprints.user import bp
from app.extensions import auth
from app.blueprints import role_required
from app.blueprints.user.schemas import UserDetailResponseSchema, UserUpdateSchema, RoleUpdateSchema, UserProfileUpdateSchema
from app.blueprints.user.service import UserService

@bp.route('/')

def index():
    return 'This is The User Blueprint'

@bp.get('/')
@role_required(['Admin'])
@bp.output(UserDetailResponseSchema(many=True))
def get_users():
    return UserService.get_all()

@bp.put('/<int:id>/roles')
@role_required(['Admin'])
@bp.input(RoleUpdateSchema)
def update_roles(id, json_data):
    success, res = UserService.update_roles(id, json_data['role_ids'])
    if success: return {"message": res}
    raise HTTPError(404, res)

@bp.delete('/<int:id>')
@role_required(['Admin'])
def deactivate_user(id):
    if UserService.deactivate(id): return {"message": "User deactivated"}
    raise HTTPError(404, "User not found")

@bp.put('/me/profile')
@auth.login_required
@bp.input(UserProfileUpdateSchema)
def update_my_profile(json_data):
    pass