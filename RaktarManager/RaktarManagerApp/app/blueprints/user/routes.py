from apiflask import APIBlueprint, HTTPError
from app.blueprints.user import bp
from app.extensions import auth
from app.blueprints import role_required
from app.blueprints.user.schemas import UserDetailResponseSchema, UserUpdateSchema, RoleUpdateSchema, UserProfileUpdateSchema
from app.blueprints.user.service import UserService

@bp.route('/')

def index():
    return 'This is The User Blueprint'

@bp.get('/get')
@bp.auth_required(auth)
@role_required(['Admin'])
@bp.output(UserDetailResponseSchema(many=True))
def get_users():
    return UserService.get_all()

@bp.put('/<int:id>/roles')
@bp.auth_required(auth)
@role_required(['Admin'])
@bp.input(RoleUpdateSchema)
def update_roles(id, json_data):
    success, res = UserService.update_roles(id, json_data['role_ids'])
    if success: return {"message": res}
    raise HTTPError(404, res)

@bp.delete('/<int:id>')
@bp.auth_required(auth)
@role_required(['Admin'])
def deactivate_user(id):
    if UserService.deactivate(id): return {"message": "Felhasználó deaktiválva"}
    raise HTTPError(404, "Felhasználó nem található")

@bp.put('/me/profile')
@bp.auth_required(auth)
@bp.input(UserProfileUpdateSchema)
def update_my_profile(json_data):
    user_id = auth.current_user.get("id") or auth.current_user.get("user_id")
    success, res = UserService.update_profile(user_id, json_data)
    if success: 
        return {"message": "Profil sikeresen frissítve!"}, 200
    
    raise HTTPError(400, res)
