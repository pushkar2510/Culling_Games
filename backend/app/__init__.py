from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from .config import Config
from .extensions import mail, limiter
from .firebase_app import init_firebase
from app.uploads.cloudinary_config import init_cloudinary
from flask_cors import CORS

# Blueprint imports
from app.auth.routes import auth_bp
from app.team.routes import team_bp
from app.tasks.routes import tasks_bp
from app.submissions.routes import submissions_bp
from app.admin.routes import admin_bp
from app.uploads.routes import uploads_bp
from app.notifications.routes import notifications_bp
from app.week_config.routes import week_config_bp
from app.powers.routes import powers_bp
from app.admin.game_state_routes import game_state_bp
from app.query.routes import query_bp
from app.admin.week_routes import week_bp


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    # Boot Firebase Admin SDK (Firestore + Auth)
    init_firebase()

    init_cloudinary(app)
    mail.init_app(app)
    limiter.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(submissions_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(week_config_bp)
    app.register_blueprint(powers_bp)
    app.register_blueprint(game_state_bp)
    app.register_blueprint(query_bp)
    app.register_blueprint(week_bp)

    @app.route("/")
    def home():
        return {"message": "Culling Games Backend Running Successfully"}

    @app.route("/health")
    def health():
        return {"status": "healthy", "service": "culling-games-backend"}, 200

    return app