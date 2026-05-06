from app.extensions import auth
from app.blueprints import role_required
from app.blueprints.storage import bp 
from app.blueprints.storage.schemas import (StorageLocationRequestSchema, StorageLocationResponseSchema)
from app.blueprints.storage.service import StorageService
from apiflask import HTTPError

#Tárhelyek listázása    ✔
@bp.get('/list')
@bp.doc(tags=["storage"])
@bp.auth_required(auth)
@role_required(["Warehouse", "Admin"]) 
@bp.output(StorageLocationResponseSchema(many=True))
def get_locations():
    success, response = StorageService.get_all_locations()
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Tárhely id alapján   ✔
@bp.get('/<int:location_id>')
@bp.doc(tags=["storage"])
@bp.auth_required(auth)
@role_required(["Warehouse", "Admin"])
@bp.output(StorageLocationResponseSchema)
def get_location(location_id):
    success, response = StorageService.get_location_by_id(location_id)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=404)

#Tárhely létrehozása  ✔
@bp.post('/create')
@bp.doc(tags=["storage"])
@bp.auth_required(auth)
@role_required(["Admin"]) 
@bp.input(StorageLocationRequestSchema, location="json")
@bp.output(StorageLocationResponseSchema)
def create_location(json_data):
    success, response = StorageService.create_location(json_data)
    if success:
        return response, 201
    raise HTTPError(message=response, status_code=400)

#Tárhely módosítása   ✔
@bp.put('/<int:location_id>/update')
@bp.doc(tags=["storage"])
@bp.auth_required(auth)
@role_required(["Admin"])
@bp.input(StorageLocationRequestSchema, location="json")
@bp.output(StorageLocationResponseSchema)
def update_location(location_id, json_data):
    success, response = StorageService.update_location(location_id, json_data)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)

#Tárhely törlése  ✔
@bp.delete('/<int:location_id>/delete')
@bp.doc(tags=["storage"])
@bp.auth_required(auth)
@role_required(["Admin"]) 
def deactivate_location(location_id):
    success, response = StorageService.deactivate_location(location_id)
    if success:
        return response, 200
    raise HTTPError(message=response, status_code=400)
