from apiflask import APIBlueprint

bp = APIBlueprint('product', __name__, tag="product")

from app.blueprints.product import routes