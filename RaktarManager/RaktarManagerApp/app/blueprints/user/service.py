from app.extensions import db
from app.blueprints.user.schemas import UserResponseSchema, PayloadSchema, RoleSchema
from app.models.user import User
from app.models.address import Address
from app.models.role import Role
from datetime import datetime, timedelta
from flask import current_app
from authlib.jose import jwt
import traceback

from sqlalchemy import select

class UserService:
    @staticmethod
    def user_registrate(request):
        try:
            if db.session.execute(select(User).filter_by(email=request["email"])).scalar_one_or_none():
                return False, "E-mail already exist!"

            plain_password = request.pop('password', None)
            address_data = request.pop('address', None)

            user = User(**request)

            if plain_password:
                user.set_password(plain_password)

            if address_data:
                new_address = Address(**address_data)
                user.addresses.append(new_address)

       
            db.session.add(user)
            db.session.commit()
        except Exception as ex:
            traceback.print_exc()
            return False, f"Hiba a lekérdezésnél! {str(ex)}"
        return True, UserResponseSchema().dump(user)

    @staticmethod
    def user_login(request):
        try:
           user = db.session.execute(select(User).filter_by(email=request["email"])).scalar_one_or_none()
           if user is None or not user.check_password(request["password"]):
                return False, "Incorrect e-mail or password!"
        
           user_schema = UserResponseSchema().dump(user)
           user_schema["token"] = UserService.token_generate(user)
        
           return True, user_schema  

        except Exception as ex:
            traceback.print_exc() 
            return False, f"Server error: {str(ex)}"


class UserService:
    @staticmethod
    def get_all_users():
        return db.session.execute(select(User)).scalars().all()

    @staticmethod
    def get_user_by_id(user_id):
        return db.session.get(User, user_id)

    @staticmethod
    def update_user(user_id, data):
        user = db.session.get(User, user_id)
        if user:
            for key, value in data.items():
                setattr(user, key, value)
            db.session.commit()
            return True, user
        return False, "User not found"

    @staticmethod
    def delete_user(user_id):
        user = db.session.get(User, user_id)
        if user:
            user.is_active = False 
            db.session.commit()
            return True
        return False

    @staticmethod
    def add_address(user_id, address_data):
        user = db.session.get(User, user_id)
        if user:
            new_address = Address(**address_data, user_id=user_id)
            db.session.add(new_address)
            db.session.commit()
            return True, new_address
        return False, "User not found"
    @staticmethod
    def token_generate(user : User):
        payload = PayloadSchema()
        payload.exp = int((datetime.now()+ timedelta(minutes=30)).timestamp())
        payload.user_id = user.id
        payload.roles = RoleSchema().dump(obj=user.roles, many=True)
        
        return jwt.encode({'alg': 'RS256'}, PayloadSchema().dump(payload), current_app.config['SECRET_KEY']).decode()
