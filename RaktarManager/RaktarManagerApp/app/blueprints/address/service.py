from app.models.address import Address
from app.extensions import db

class AddressService:
    @staticmethod
    def get_by_user(u_id):
        return Address.query.filter_by(user_id=u_id).all()

    @staticmethod
    def create(u_id, data):
        new_address = Address(**data, user_id=u_id)
        db.session.add(new_address)
        db.session.commit()
        return new_address

    @staticmethod
    def update(u_id, addr_id, data):
        addr = Address.query.filter_by(id=addr_id, user_id=u_id).first()
        if not addr:
            return None
        for key, value in data.items():
            setattr(addr, key, value)
        db.session.commit()
        return addr

    @staticmethod
    def delete(u_id, addr_id):
        addr = Address.query.filter_by(id=addr_id, user_id=u_id).first()
        if addr:
            db.session.delete(addr)
            db.session.commit()
            return True
        return False