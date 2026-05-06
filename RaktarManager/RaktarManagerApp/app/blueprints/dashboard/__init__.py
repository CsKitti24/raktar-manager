from apiflask import APIBlueprint

bp = APIBlueprint('dashboard', __name__, tag="dashboard")

from app.blueprints.dashboard import routes
