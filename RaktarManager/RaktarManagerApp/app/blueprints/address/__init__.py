from apiflask import APIBlueprint

bp = APIBlueprint('address', __name__, tag="address")

from app.blueprints.address import routes