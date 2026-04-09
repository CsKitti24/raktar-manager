from flask import jsonify
from app.blueprints.complaints import bp
from apiflask import HTTPError

@bp.route("/")

def index():
    return 'This is The Complaints Blueprint'
