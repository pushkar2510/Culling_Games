from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.role_required import role_required
from app.models import GameState, Team, User
from app.extensions import db


game_state_bp = Blueprint(
    "game_state",
    __name__,
    url_prefix="/api/game"
)


SUPER_ADMIN_EMAIL = "uzumakiaditya433@gmail.com"


def is_super_admin(user_id):

    user = User.query.get(user_id)

    return user and user.email == SUPER_ADMIN_EMAIL


# START GAME
@game_state_bp.route("/start", methods=["POST"])
@role_required("MASTER")
def start_game():

    user_id = int(get_jwt_identity())

    if not is_super_admin(user_id):
        return jsonify({"error": "Only Super Admin can start game"}), 403

    state = GameState.query.first()

    if not state:
        state = GameState()
        db.session.add(state)

    state.is_active = True
    state.is_paused = False
    state.registration_open = False
    state.updated_by = user_id

    db.session.commit()

    return jsonify({
        "message": "Game started successfully"
    }), 200


# PAUSE GAME
@game_state_bp.route("/pause", methods=["POST"])
@role_required("MASTER")
def pause_game():

    user_id = int(get_jwt_identity())

    if not is_super_admin(user_id):
        return jsonify({"error": "Only Super Admin can pause game"}), 403

    state = GameState.query.first()

    if not state or not state.is_active:
        return jsonify({"error": "Game not active"}), 400

    state.is_paused = True
    state.updated_by = user_id

    db.session.commit()

    return jsonify({
        "message": "Game paused"
    }), 200


# RESUME GAME
@game_state_bp.route("/resume", methods=["POST"])
@role_required("MASTER")
def resume_game():

    user_id = int(get_jwt_identity())

    if not is_super_admin(user_id):
        return jsonify({"error": "Only Super Admin can resume game"}), 403

    state = GameState.query.first()

    state.is_paused = False
    state.updated_by = user_id

    db.session.commit()

    return jsonify({
        "message": "Game resumed"
    }), 200


# STOP GAME
@game_state_bp.route("/stop", methods=["POST"])
@role_required("MASTER")
def stop_game():

    user_id = int(get_jwt_identity())

    if not is_super_admin(user_id):
        return jsonify({"error": "Only Super Admin can stop game"}), 403

    state = GameState.query.first()

    state.is_active = False
    state.registration_open = False
    state.updated_by = user_id

    winner = Team.query.filter_by(
        is_disqualified=False
    ).order_by(Team.total_points.desc()).first()

    db.session.commit()

    return jsonify({
        "message": "Game stopped",
        "winner": winner.team_name if winner else None
    }), 200


# GAME STATUS
@game_state_bp.route("/status", methods=["GET"])
def game_status():

    state = GameState.query.first()

    if not state:
        return jsonify({
            "is_active": False,
            "is_paused": False,
            "registration_open": True
        }), 200

    return jsonify({
        "is_active": state.is_active,
        "is_paused": state.is_paused,
        "registration_open": state.registration_open,
        "current_week": state.current_week
    }), 200
