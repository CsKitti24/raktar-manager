from app.extensions import db
from app.models.complaint import Complaint
from app.models.order import Order
from datetime import datetime
from sqlalchemy import select
import traceback

class ComplaintService:

    #Reklamációk listázása
    @staticmethod
    def get_all_complaints(current_user):
        try:
            user_id = current_user.get("user_id")
            roles_data = current_user.get("roles", [])
            user_roles = [r.get("rolename") for r in roles_data if isinstance(r, dict)]

            stmt = select(Complaint)

            if 'Admin' not in user_roles:
                if 'Orderer' in user_roles:
                    stmt = stmt.filter_by(user_id=user_id)
                else:
                    return False, "Access denied."

            complaints = db.session.execute(stmt).scalars().all()
            return True, complaints
        except Exception as ex:
            traceback.print_exc()
            return False, "Incorrect query data!"

    #Reklamáció részletei
    @staticmethod
    def get_complaint_by_id(complaint_id, current_user):
        try:
            user_id = current_user.get("user_id")
            roles_data = current_user.get("roles", [])
            user_roles = [r.get("rolename") for r in roles_data if isinstance(r, dict)]

            complaint = db.session.execute(select(Complaint).filter_by(id=complaint_id)).scalar_one_or_none()
            if not complaint:
                return False, "Complaint not found!"

            #Csak a sajátját láthatja, kivéve ha Admin
            if complaint.user_id != user_id and 'Admin' not in user_roles:
                return False, "Access denied."

            return True, complaint
        except Exception as ex:
            traceback.print_exc()
            return False, "Incorrect query data!"

    #Reklamáció létrehozása
    @staticmethod
    def create_complaint(request, user_id):
        try:
            order = db.session.execute(select(Order).filter_by(id=request['order_id'])).scalar_one_or_none()
            
            if not order:
                return False, "Order not found!"
            
            if order.orderer_id != user_id:
                return False, "You can only complain about your own orders!"
                
            if order.status.lower() != 'kiszallitva':
                return False, "Complaints can only be submitted for delivered ('kiszallitva') orders!"

            now = datetime.now()
            
            complaint = Complaint(
                order_id=order.id,
                user_id=user_id,
                description=request['description'],
                file_name=request.get('file_name'),
                status='nyitott',
                created_at=now
            )
            
            db.session.add(complaint)
            db.session.commit()
            return True, complaint
            
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, "Incorrect Complaint data!"

    #Reklamáció kezelése
    @staticmethod
    def update_complaint(complaint_id, request):
        try:
            complaint = db.session.execute(select(Complaint).filter_by(id=complaint_id)).scalar_one_or_none()
            if not complaint:
                return False, "Complaint not found!"

            complaint.status = request['status']
            
            if 'resolution' in request:
                complaint.resolution = request['resolution']
                
            if complaint.status.lower() == 'lezart':
                complaint.resolved_at = datetime.now()
            
            db.session.commit()
            return True, complaint
            
        except Exception as ex:
            db.session.rollback()
            traceback.print_exc()
            return False, "Incorrect Update data!"
