from apiflask import APIBlueprint
bp = APIBlueprint('main', __name__, tag="main")
from app.blueprints import bp
from app.models import *

@bp.route('/')
def index():
    return 'This is The Main Blueprint'

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