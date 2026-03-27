from apiflask import APIBlueprint
bp = APIBlueprint('main', __name__, tag="main")
from app.blueprints import bp

@bp.route('/')
def index():
    return 'This is The Main Blueprint'

#Registrate blueprints here...
from app.blueprints.user import bp as bp_user
bp.register_blueprint(bp_user, url_prefix='/user')

from app.models import *