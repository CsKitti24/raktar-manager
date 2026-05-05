from app import create_app, db
from app.models.product import Product
from config import Config

app = create_app(config_class=Config)

with app.app_context():
    # Deactivate all existing products to clean up
    products = Product.query.all()
    for p in products:
        p.is_active = False
    db.session.commit()
    print("All products deactivated.")
