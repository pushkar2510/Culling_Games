from flask import Blueprint, request, jsonify
from firebase_admin import firestore as firestore_sdk
from app.firebase_app import get_db
from app.middleware.role_required import role_required


week_bp = Blueprint("week", __name__, url_prefix="/api/admin/week")


@week_bp.route("/set", methods=["PUT"])
@role_required("MASTER")
def set_week():
    data = request.get_json()
    new_week = data.get("week_number")

    if not new_week or new_week < 1:
        return jsonify({"error": "Invalid week"}), 400

    db = get_db()
    batch = db.batch()

    # Update game_state/current
    state_ref = db.collection("game_state").document("current")
    batch.update(state_ref, {
        "current_week": new_week,
        "last_reset_at": firestore_sdk.SERVER_TIMESTAMP,
    })

    # Update all teams
    for t in db.collection("teams").stream():
        batch.update(
            db.collection("teams").document(t.id),
            {"week_number": new_week, "weekly_points": 0, "weekly_cap_reached": False},
        )

    # Deactivate all active powers
    for p in db.collection("team_powers").where("is_active", "==", True).stream():
        batch.update(db.collection("team_powers").document(p.id), {"is_active": False})

    # Deactivate all active tasks
    for tk in db.collection("tasks").where("is_active", "==", True).stream():
        batch.update(db.collection("tasks").document(tk.id), {"is_active": False})

    batch.commit()

    return jsonify({"message": f"Week changed to {new_week}"}), 200
