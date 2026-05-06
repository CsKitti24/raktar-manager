from app import create_app, db
from app.models.user import User
from config import Config

app = create_app(config_class=Config)

with app.app_context():
    users = User.query.all()
    print(f"Found {len(users)} users.")
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}, Password Hash: {u.password_hash}")
        print(f"Roles: {[r.rolename for r in u.roles]}")
