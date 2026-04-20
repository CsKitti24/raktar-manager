from app.extensions import db
from app.models.storage import StorageLocation 
from sqlalchemy import select
import traceback

class StorageService:

    #Tárhelyek listázása  
    @staticmethod
    def get_all_locations():
        try:
            locations = db.session.execute(select(StorageLocation)).scalars().all()
            return True, locations
        except Exception as ex:
            traceback.print_exc()
            return False, "Hiba a tárhelyek lekérdezésénél!"

    #Tárhely id alapján
    @staticmethod
    def get_location_by_id(location_id):
        try:
            location = db.session.execute(select(StorageLocation).filter_by(id=location_id)).scalar_one_or_none()
            if not location:
                return False, "Tárhely nem található!"
            return True, location
        except Exception as ex:
            traceback.print_exc()
            return False, "Hiba a tárhely lekérdezésénél!"

    #Tárhely létrehozása
    @staticmethod
    def create_location(request):
        try:
            existing = db.session.execute(select(StorageLocation).filter_by(code=request['code'])).scalar_one_or_none()
            if existing:
                return False, f"Már létezik tárhely ezzel a kóddal: {request['code']}"

            new_location = StorageLocation(
                code=request['code'],
                description=request.get('description')
            )
            
            db.session.add(new_location)
            db.session.commit()
            return True, new_location
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, "Hiba a tárhely létrehozásánál!"

    #Tárhely módosítása
    @staticmethod
    def update_location(location_id, request):
        try:
            location = db.session.execute(select(StorageLocation).filter_by(id=location_id)).scalar_one_or_none()
            if not location:
                return False, "Tárhely nem található!"

            if 'code' in request and request['code'] != location.code:
                existing = db.session.execute(select(StorageLocation).filter_by(code=request['code'])).scalar_one_or_none()
                if existing:
                    return False, f"Már létezik tárhely ezzel a kóddal: {request['code']}"
                location.code = request['code']

            if 'description' in request:
                location.description = request['description']

            db.session.commit()
            return True, location
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, "Hiba a tárhely módosításánál!"

    #Tárhely deaktiválása
    @staticmethod
    def deactivate_location(location_id):
        try:
            location = db.session.execute(select(StorageLocation).filter_by(id=location_id)).scalar_one_or_none()
            if not location:
                return False, "Tárhely nem található!"

            location.is_active = 0
            db.session.commit()
            
            return True, "A tárhely sikeresen deaktiválva lett."
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, "Hiba a tárhely deaktiválásánál!"
