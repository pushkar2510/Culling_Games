from flask import Blueprint, jsonify, g
from firebase_admin import firestore as firestore_sdk
from app.firebase_app import get_db
from app.middleware.role_required import role_required


game_state_bp = Blueprint(
    "game_state",
    __name__,
    url_prefix="/api/game"
)


SUPER_ADMIN_EMAIL = "gamesburner10@gmail.com"


def is_super_admin(uid):
    db = get_db()
    doc = db.collection("users").document(uid).get()
    return doc.exists and doc.to_dict().get("email") == SUPER_ADMIN_EMAIL


def _get_or_create_state():
    db = get_db()
    ref = db.collection("game_state").document("current")
    doc = ref.get()
    if not doc.exists:
        default = {
            "is_active": False,
            "is_paused": False,
            "registration_open": True,
            "current_week": 1,
            "updated_by": None,
        }
        ref.set(default)
        return ref, default
    return ref, doc.to_dict()



# START GAME
@game_state_bp.route("/start", methods=["POST"])
@role_required("MASTER")
def start_game():
    uid = g.uid
    if not is_super_admin(uid):
        return jsonify({"error": "Only Super Admin can start game"}), 403

    ref, _ = _get_or_create_state()
    ref.update({
        "is_active": True,
        "is_paused": False,
        "registration_open": False,
        "updated_by": uid,
    })
    return jsonify({"message": "Game started successfully"}), 200


# PAUSE GAME
@game_state_bp.route("/pause", methods=["POST"])
@role_required("MASTER")
def pause_game():
    uid = g.uid
    if not is_super_admin(uid):
        return jsonify({"error": "Only Super Admin can pause game"}), 403

    db = get_db()
    ref = db.collection("game_state").document("current")
    doc = ref.get()
    if not doc.exists or not doc.to_dict().get("is_active"):
        return jsonify({"error": "Game not active"}), 400

    ref.update({"is_paused": True, "updated_by": uid})
    return jsonify({"message": "Game paused"}), 200


# RESUME GAME
@game_state_bp.route("/resume", methods=["POST"])
@role_required("MASTER")
def resume_game():
    uid = g.uid
    if not is_super_admin(uid):
        return jsonify({"error": "Only Super Admin can resume game"}), 403

    db = get_db()
    db.collection("game_state").document("current").update({
        "is_paused": False,
        "updated_by": uid,
    })
    return jsonify({"message": "Game resumed"}), 200


# STOP GAME
@game_state_bp.route("/stop", methods=["POST"])
@role_required("MASTER")
def stop_game():
    uid = g.uid
    if not is_super_admin(uid):
        return jsonify({"error": "Only Super Admin can stop game"}), 403

    db = get_db()
    db.collection("game_state").document("current").update({
        "is_active": False,
        "registration_open": False,
        "updated_by": uid,
    })

    # Find winner: highest total_points, not disqualified
    teams_stream = (
        db.collection("teams")
        .where("is_disqualified", "==", False)
        .order_by("total_points", direction=firestore_sdk.Query.DESCENDING)
        .limit(1)
        .stream()
    )
    winner_name = None
    for t in teams_stream:
        winner_name = t.to_dict().get("team_name")
        break

    return jsonify({"message": "Game stopped", "winner": winner_name}), 200


# GAME STATUS
@game_state_bp.route("/status", methods=["GET"])
def game_status():
    db = get_db()
    doc = db.collection("game_state").document("current").get()
    if not doc.exists:
        return jsonify({
            "is_active": False,
            "is_paused": False,
            "registration_open": True,
        }), 200

    state = doc.to_dict()
    return jsonify({
        "is_active": state.get("is_active", False),
        "is_paused": state.get("is_paused", False),
        "registration_open": state.get("registration_open", True),
        "current_week": state.get("current_week", 1),
    }), 200
