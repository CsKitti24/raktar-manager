from apiflask import APIFlask
from config import Config
from app.extensions import db

def create_app(config_class=Config):
    app = APIFlask(__name__, json_errors=True, docs_path="/swagger", title="Raktar API")
    app.config.from_object(config_class)

    #Extensions
    db.init_app(app)
    from flask_migrate import Migrate
    migrate = Migrate(app, db)

    #Blueprints
    from app.blueprints import bp as bp_default
    app.register_blueprint(bp_default, url_prefix='/api')

    return app