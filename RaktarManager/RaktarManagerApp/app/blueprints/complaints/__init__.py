from apiflask import APIBlueprint

bp = APIBlueprint('complaints', __name__, tag="complaints")

from app.blueprints.complaints import routes
