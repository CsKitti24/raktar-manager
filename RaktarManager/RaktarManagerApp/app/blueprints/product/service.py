from app.models.product import Product
from app.models.category import Category
from app.extensions import db

class ProductService:
    #kategoria muveletek
    @staticmethod
    def get_all_categories():
        return Category.query.all()

    @staticmethod
    def create_category(data):
        new_cat = Category(**data)
        db.session.add(new_cat) #kosarba
        db.session.commit() #mentes
        return new_cat

    #termék muveletek
    @staticmethod
    def get_products(category_id=None):
        query = Product.query.filter_by(is_active=True)
        if category_id:
            query = query.filter_by(category_id=category_id)
        return query.all()

    @staticmethod
    def create_product(data):
        new_prod = Product(**data)
        db.session.add(new_prod)
        db.session.commit()
        return new_prod

    @staticmethod
    def update_product(p_id, data):
        prod = Product.query.get(p_id)
        if not prod: return None
        for key, value in data.items():
            setattr(prod, key, value)
        db.session.commit()
        return prod

    @staticmethod
    def delete_product(p_id):
        prod = Product.query.get(p_id)
        if prod:
            prod.is_active = False 
            db.session.commit()
            return True
        return False