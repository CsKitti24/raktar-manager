from apiflask import APIBlueprint

bp = APIBlueprint('authe', __name__, tag="authe")

from app.blueprints.authe import routes