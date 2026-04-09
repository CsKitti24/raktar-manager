from apiflask import APIBlueprint

bp = APIBlueprint('storage', __name__, tag="storage")

from app.blueprints.storage import routes
