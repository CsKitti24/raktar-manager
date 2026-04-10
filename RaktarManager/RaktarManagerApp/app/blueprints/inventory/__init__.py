from apiflask import APIBlueprint

bp = APIBlueprint('inventory', __name__, tag="inventory")

from app.blueprints.inventory import routes
