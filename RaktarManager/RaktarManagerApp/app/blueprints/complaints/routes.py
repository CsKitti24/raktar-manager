from flask import jsonify
from app.blueprints.complaints import bp
from app.blueprints.complaints.service import ComplaintService
from apiflask import HTTPError
from app.blueprints.complaints.schemas import (ComplaintResponseSchema, ComplaintCreateRequestSchema, ComplaintUpdateRequestSchema)
from app.extensions import auth
from app.blueprints import role_required

@bp.route("/")

def index():
    return 'This is The Complaints Blueprint'

#Reklamációk listázása    ✔
@bp.get('/list')
@bp.doc(tags=["complaints"])
@bp.auth_required(auth)
@bp.output(ComplaintResponseSchema(many=True))
def get_complaints():
    success, response = ComplaintService.get_all_complaints(auth.current_user)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Reklamáció részletei    ✔
@bp.get('/<int:complaint_id>')
@bp.doc(tags=["complaints"])
@bp.auth_required(auth)
@bp.output(ComplaintResponseSchema)
def get_complaint(complaint_id):
    success, response = ComplaintService.get_complaint_by_id(complaint_id, auth.current_user)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=404)

#Reklamáció létrehozása   ✔
@bp.post('/create')
@bp.doc(tags=["complaints"])
@bp.auth_required(auth)
@role_required(["Orderer"])
@bp.input(ComplaintCreateRequestSchema, location="json")
@bp.output(ComplaintResponseSchema)
def create_complaint(json_data):
    success, response = ComplaintService.create_complaint(json_data, auth.current_user.get("user_id"))
    if success:
        return response, 200 
    raise HTTPError(message=response, status_code=400)

#Reklamáció kezelése    ✔
@bp.put('/<int:complaint_id>/update')
@bp.doc(tags=["complaints"])
@bp.auth_required(auth)
@role_required(["Admin"])
@bp.input(ComplaintUpdateRequestSchema, location="json")
@bp.output(ComplaintResponseSchema)
def update_complaint(complaint_id, json_data):
    success, response = ComplaintService.update_complaint(complaint_id, json_data)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)