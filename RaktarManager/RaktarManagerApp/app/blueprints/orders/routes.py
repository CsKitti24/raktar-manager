from flask import jsonify
from app.blueprints.orders import bp
from apiflask import HTTPError

@bp.route("/")

def index():
    return 'This is The Orders Blueprint'