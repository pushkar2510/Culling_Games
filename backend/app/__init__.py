from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from .config import Config
from .extensions import db, jwt, migrate, mail, limiter

from app.uploads.cloudinary_config import init_cloudinary

# Blueprints imports
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

# Models imports
from app.models import (
    User,
    ActiveSession,
    Team,
    TeamMember,
    Task,
    Submission,
    PointAdjustment,
    Notification,
    TeamPower,
    WeekConfig
)

from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)


    init_cloudinary(app)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    limiter.init_app(app)

    from flask_jwt_extended import get_jwt
    from app.models import ActiveSession

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):

        jti = jwt_payload["jti"]

        session = ActiveSession.query.filter_by(
            jwt_id=jti
        ).first()

        if not session:
            return True

        return False


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
        return {
            "status": "healthy",
            "service": "culling-games-backend"
        }, 200


    return app