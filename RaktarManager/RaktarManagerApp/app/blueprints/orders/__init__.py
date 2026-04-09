from apiflask import APIBlueprint

bp = APIBlueprint('orders', __name__, tag="orders")

from app.blueprints.orders import routes
