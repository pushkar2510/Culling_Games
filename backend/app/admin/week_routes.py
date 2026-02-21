from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.role_required import role_required
from app.models import GameState, Team, TeamPower, Task
from app.extensions import db

week_bp = Blueprint("week", __name__, url_prefix="/api/admin/week")


@week_bp.route("/set", methods=["PUT"])
@role_required("MASTER")
def set_week():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    new_week = data.get("week_number")

    if not new_week or new_week < 1:
        return jsonify({"error": "Invalid week"}), 400

    state = GameState.query.first()

    state.current_week = new_week

    from datetime import datetime
    state.last_reset_at = datetime.utcnow()


    # update all teams to new week
    teams = Team.query.all()

    for team in teams:

        team.week_number = new_week
        team.weekly_points = 0
        team.weekly_cap_reached = False

    # deactivate all old powers
    TeamPower.query.update({"is_active": False})

    # deactivate old tasks
    Task.query.update({"is_active": False})

    db.session.commit()

    return jsonify({
        "message": f"Week changed to {new_week}"
    }), 200