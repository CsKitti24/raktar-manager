from app.extensions import db
from app.models.product import Product
from app.models.category import Category
from sqlalchemy import select

class ProductService:
    @staticmethod
    def get_all_products():
        return db.session.execute(select(Product).filter_by(is_active=True)).scalars().all()

    @staticmethod
    def create_product(data):
        product = Product(**data)
        db.session.add(product)
        db.session.commit()
        return product

    @staticmethod
    def get_all_categories():
        return db.session.execute(select(Category)).scalars().all()
    
    @staticmethod
    def create_category(data):
        cat = Category(**data)
        db.session.add(cat)
        db.session.commit()
        return cat