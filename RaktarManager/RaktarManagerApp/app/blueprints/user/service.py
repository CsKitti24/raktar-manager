from app.models.user import User
from app.models.role import Role
from app.extensions import db

class UserService:
    @staticmethod
    def get_all():
        users =  User.query.all()
        return users

    @staticmethod
    def update_roles(user_id, role_ids):
        user = User.query.get(user_id)
        if not user: return False, "Felhasználó nem található"
        roles = Role.query.filter(Role.id.in_(role_ids)).all()
        user.roles = roles
        db.session.commit()
        return True, "Roles updated"

    @staticmethod
    def update_profile(user_id, data):
        user = User.query.get(user_id)
        if not user: 
            return False, "Felhasználó nem található"
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        from app.extensions import db
        db.session.commit()
        
        return True, "OK"

    @staticmethod
    def deactivate(user_id):
        user = User.query.get(user_id)
        if user:
            user.is_active = False
            db.session.commit()
            return True
        return False