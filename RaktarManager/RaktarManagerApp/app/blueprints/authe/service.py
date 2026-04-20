from app.models.user import User
from app.models.role import Role
from app.extensions import db
from flask import current_app
from authlib.jose import jwt
from datetime import datetime, timedelta

class AuthService:
    @staticmethod
    def register(data):
        if User.query.filter_by(email=data['email']).first():
            return False, "E-mail már létezik!"
        
        password = data.pop('password')
        user = User(**data)
        user.set_password(password)
        role = Role.query.filter_by(rolename='customer').first()
        if role: user.roles.append(role)
            
        db.session.add(user)
        db.session.commit()
        return True, user

    @staticmethod
    def login(data):
        user = User.query.filter_by(email=data['email']).first()
        if user and user.check_password(data['password']):
            token = AuthService.token_generate(user)
            return True, {"token": token, "user_id": user.id}
        return False, "Hibás hitelesítő adatok!"

    @staticmethod
    def token_generate(user):
        payload = {
            "user_id": user.id,
            "roles": [r.rolename for r in user.roles],
            "exp": int((datetime.now() + timedelta(hours=8)).timestamp())
        }
        return jwt.encode({'alg': 'RS256'}, payload, current_app.config['SECRET_KEY']).decode()