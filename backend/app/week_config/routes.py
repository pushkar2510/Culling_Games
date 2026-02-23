from flask import Blueprint, request, jsonify, g
from firebase_admin import firestore as firestore_sdk
from app.firebase_app import get_db
from app.middleware.role_required import role_required


week_config_bp = Blueprint(
    "week_config",
    __name__,
    url_prefix="/api/week-config"
)


# 🔹 MASTER — Set or Update Weekly Power Config
@week_config_bp.route("/set", methods=["POST"])
@role_required("MASTER")
def set_week_config():
    uid = g.uid
    data = request.get_json()

    week_number = data.get("week_number")
    curse_power = data.get("curse_power")
    shield_power = data.get("shield_power")
    weekly_cap = data.get("weekly_cap", 30)

    if not week_number or curse_power is None or shield_power is None:
        return jsonify({
            "error": "week_number, curse_power, shield_power required"
        }), 400

    db = get_db()
    doc_id = str(week_number)
    ref = db.collection("week_configs").document(doc_id)

    ref.set({
        "week_number": week_number,
        "curse_power": curse_power,
        "shield_power": shield_power,
        "weekly_cap": weekly_cap,
        "created_by": uid,
        "updated_at": firestore_sdk.SERVER_TIMESTAMP,
    }, merge=True)

    return jsonify({"message": "Week config saved"}), 200


# 🔹 PUBLIC — View All Week Config
@week_config_bp.route("/all", methods=["GET"])
def get_all_week_configs():
    db = get_db()
    docs = db.collection("week_configs").order_by("week_number").stream()

    result = []
    for doc in docs:
        d = doc.to_dict()
        result.append({
            "week_number": d.get("week_number"),
            "curse_power": d.get("curse_power"),
            "shield_power": d.get("shield_power"),
            "weekly_cap": d.get("weekly_cap"),
        })

