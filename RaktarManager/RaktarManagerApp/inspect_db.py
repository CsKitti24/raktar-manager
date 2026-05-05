from app import create_app, db
from app.models.product import Product
from config import Config

app = create_app(config_class=Config)

with app.app_context():
    products = Product.query.all()
    for p in products:
        print(f"ID: {p.id}, Name: {p.name}, ImageURL: {p.image_url}, IsActive: {p.is_active}")
