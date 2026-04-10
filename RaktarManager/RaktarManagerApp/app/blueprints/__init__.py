from apiflask import APIBlueprint
bp = APIBlueprint('main', __name__, tag="main")
from app.blueprints import bp
from app.models import *
from apiflask import HTTPError
from app.extensions import auth
from flask import current_app
from datetime import datetime
from authlib.jose import jwt

@bp.route('/')
def index():
    return 'This is The Main Blueprint'

@auth.verify_token
def verify_token(token):
    try:
        data = jwt.decode(
            token.encode('ascii'),
           
            current_app.config['SECRET_KEY'],
        )
        if data["exp"] < int(datetime.now().timestamp()):
            return None
        return data
    except Exception as ex:
        return None

def role_required(roles):
    def wrapper(fn):
        def decorated_function(*args, **kwargs):
            user_roles = [item["name"] for item in auth.current_user.get("roles")]
            for role in roles:
                if role in user_roles:
                    return fn(*args, **kwargs)        
            raise HTTPError(message="Access denied", status_code=403)
        return decorated_function
    return wrapper

#Registrate blueprints here...
from app.blueprints.user import bp as bp_user
bp.register_blueprint(bp_user, url_prefix='/user')

from app.blueprints.orders import bp as bp_orders
bp.register_blueprint(bp_orders, url_prefix='/orders')

from app.blueprints.storage import bp as bp_storage
bp.register_blueprint(bp_storage, url_prefix='/storage-locations')

from app.blueprints.inventory import bp as bp_inventory
bp.register_blueprint(bp_inventory, url_prefix='/inventory')

from app.blueprints.dashboard import bp as bp_dashboard
bp.register_blueprint(bp_dashboard, url_prefix='/dashboard')

from app.blueprints.complaints import bp as bp_complaints
bp.register_blueprint(bp_complaints, url_prefix='/complaints')