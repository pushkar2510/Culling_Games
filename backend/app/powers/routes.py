from flask import Blueprint, request, jsonify, g
from firebase_admin import firestore as firestore_sdk
from app.firebase_app import get_db
from app.middleware.role_required import role_required


powers_bp = Blueprint(
    "powers",
    __name__,
    url_prefix="/api/powers"
)


def _get_game_state(db):
    doc = db.collection("game_state").document("current").get()
    return doc.to_dict() if doc.exists else None


# TEAM - Request Curse or Shield
@powers_bp.route("/request", methods=["POST"])
@role_required("TEAM")
def request_power():
    uid = g.uid
    db = get_db()

    state = _get_game_state(db)
    if not state or not state.get("is_active"):
        return jsonify({"error": "Game not active"}), 403
    if state.get("is_paused"):
        return jsonify({"error": "Game is paused"}), 403

    data = request.get_json()
    power_type = data.get("power_type")
    if power_type not in ["CURSE", "SHIELD"]:
        return jsonify({"error": "Invalid power type"}), 400

    teams = db.collection("teams").where("leader_uid", "==", uid).limit(1).stream()
    team_doc = next(teams, None)
    if not team_doc:
        return jsonify({"error": "Team not found"}), 404

    team = team_doc.to_dict()
    team_id = team_doc.id

    if team.get("is_disqualified"):
        return jsonify({"error": "Disqualified team cannot request powers"}), 403

    existing = (
        db.collection("team_powers")
        .where("team_id", "==", team_id)
        .where("week_number", "==", team.get("week_number"))
        .limit(1)
        .stream()
    )
    if next(existing, None):
        return jsonify({"error": "You have already requested or used a power this week."}), 400

    top_teams_stream = (
        db.collection("teams")
        .where("is_disqualified", "==", False)
        .order_by("total_points", direction=firestore_sdk.Query.DESCENDING)
        .limit(10)
        .stream()
    )
    top_team_ids = {t.id for t in top_teams_stream}
    eligible = team_id in top_team_ids

    if not eligible:
        all_tasks = db.collection("tasks").stream()
        bonus_task_ids = []
        for t in all_tasks:
            td = t.to_dict()
            is_bonus = td.get("is_bonus", False)
            category = str(td.get("category", "")).upper()
            name = str(td.get("name", "")).lower()
            if is_bonus or category == "BONUS" or "bonus" in name:
                bonus_task_ids.append(t.id)

        if bonus_task_ids:
            for bonus_task_id in bonus_task_ids:
                approved = (
                    db.collection("submissions")
                    .where("team_id", "==", team_id)
                    .where("task_id", "==", bonus_task_id)
                    .where("status", "==", "APPROVED")
                    .limit(1)
                    .stream()
                )
                if next(approved, None):
                    eligible = True
                    break

    if not eligible:
        return jsonify({
            "error": "Access Denied: You must be in the Top 10 or have an Approved Bonus Task."
        }), 403

    db.collection("team_powers").add({
        "team_id": team_id,
        "week_number": team.get("week_number"),
        "power_type": power_type,
        "power_value": 0,
        "max_usage": 1,
        "used_count": 0,
        "is_active": False,
        "granted_by": None,
        "created_at": firestore_sdk.SERVER_TIMESTAMP,
    })

    return jsonify({"message": f"{power_type} request submitted for approval"}), 200


# MASTER - Approve Power Request
@powers_bp.route("/approve/<power_id>", methods=["PUT"])
@role_required("MASTER")
def approve_power(power_id):
    uid = g.uid
    db = get_db()

    power_ref = db.collection("team_powers").document(power_id)
    power_doc = power_ref.get()
    if not power_doc.exists:
        return jsonify({"error": "Power request not found"}), 404

    power = power_doc.to_dict()
    if power.get("is_active"):
        return jsonify({"error": "Power already active"}), 400

    week_number = power.get("week_number")
    wc_ref = db.collection("week_configs").document(str(week_number)).get()
    if not wc_ref.exists:
        return jsonify({"error": "Week config not set by master"}), 400

    wc = wc_ref.to_dict()
    if power.get("power_type") == "CURSE":
        power_value = wc.get("curse_power", 0)
    else:
        power_value = wc.get("shield_power", 0)

    power_ref.update({
        "is_active": True,
        "power_value": power_value,
        "granted_by": uid,
    })

    return jsonify({
        "message": f"{power.get('power_type')} approved",
        "power_value": power_value,
    }), 200


# TEAM - View own powers
@powers_bp.route("/my", methods=["GET"])
@role_required("TEAM")
def get_my_powers():
    uid = g.uid
    db = get_db()

    teams = db.collection("teams").where("leader_uid", "==", uid).limit(1).stream()
    team_doc = next(teams, None)
    if not team_doc:
        return jsonify({"error": "Team not found"}), 404

    team_id = team_doc.id
    docs = db.collection("team_powers").where("team_id", "==", team_id).stream()

    result = []
    for doc in docs:
        d = doc.to_dict()
        result.append({
            "power_id": doc.id,
            "power_type": d.get("power_type"),
            "power_value": d.get("power_value"),
            "week_number": d.get("week_number"),
            "is_active": d.get("is_active"),
            "used_count": d.get("used_count"),
        })

    return jsonify(result), 200


# TEAM - Use Curse on another team
@powers_bp.route("/use", methods=["POST"])
@role_required("TEAM")
def use_power():
    uid = g.uid
    db = get_db()

    data = request.get_json()
    power_id = data.get("power_id")
    target_team_id = data.get("target_team_id")

    if not power_id or not target_team_id:
        return jsonify({"error": "power_id and target_team_id required"}), 400

    teams = db.collection("teams").where("leader_uid", "==", uid).limit(1).stream()
    team_doc = next(teams, None)
    if not team_doc:
        return jsonify({"error": "Team not found"}), 404

    team = team_doc.to_dict()
    team_id = team_doc.id

    if team.get("is_disqualified"):
        return jsonify({"error": "Disqualified team cannot use powers"}), 403

    power_ref = db.collection("team_powers").document(power_id)
    power_doc = power_ref.get()
    if not power_doc.exists:
        return jsonify({"error": "Power not found"}), 404

    power = power_doc.to_dict()
    if power.get("team_id") != team_id:
        return jsonify({"error": "Not your power"}), 403
    if not power.get("is_active"):
        return jsonify({"error": "Power is not active"}), 400
    if power.get("week_number") != team.get("week_number"):
        return jsonify({"error": "Power belongs to different week"}), 400
    if power.get("used_count", 0) >= power.get("max_usage", 1):
        return jsonify({"error": "Power usage limit reached"}), 400
    if team_id == target_team_id:
        return jsonify({"error": "Cannot target own team"}), 400

    target_ref = db.collection("teams").document(target_team_id)
    target_doc = target_ref.get()
    if not target_doc.exists:
        return jsonify({"error": "Target team not found"}), 404

    target_team = target_doc.to_dict()
    if target_team.get("is_disqualified"):
        return jsonify({"error": "Target team disqualified"}), 400

    GLOBAL_CURSE_LIMIT = 3
    usage_count = sum(
        1 for _ in db.collection("power_usage_logs")
        .where("attacker_team_id", "==", team_id)
        .where("target_team_id", "==", target_team_id)
        .stream()
    )
    if usage_count >= GLOBAL_CURSE_LIMIT:
        return jsonify({"error": "Global curse limit on this target reached"}), 400

    shields = (
        db.collection("team_powers")
        .where("team_id", "==", target_team_id)
        .where("week_number", "==", target_team.get("week_number"))
        .where("power_type", "==", "SHIELD")
        .where("is_active", "==", True)
        .limit(1)
        .stream()
    )
    shield_doc = next(shields, None)

    if shield_doc:
        shield = shield_doc.to_dict()
        if shield.get("used_count", 0) < shield.get("max_usage", 1):
            new_shield_count = shield.get("used_count", 0) + 1
            shield_updates = {"used_count": new_shield_count}
            if new_shield_count >= shield.get("max_usage", 1):
                shield_updates["is_active"] = False
            db.collection("team_powers").document(shield_doc.id).update(shield_updates)

            new_power_count = power.get("used_count", 0) + 1
            power_updates = {"used_count": new_power_count}
            if new_power_count >= power.get("max_usage", 1):
                power_updates["is_active"] = False
            power_ref.update(power_updates)

            return jsonify({"message": "Curse blocked by shield", "shield_used": True}), 200

    curse_value = power.get("power_value", 0)
    current_weekly = target_team.get("weekly_points", 0)
    current_total = target_team.get("total_points", 0)
    deduction = min(current_weekly, curse_value)

    target_ref.update({
        "weekly_points": current_weekly - deduction,
        "total_points": current_total - deduction,
    })

    new_used = power.get("used_count", 0) + 1
    power_updates = {"used_count": new_used}
    if new_used >= power.get("max_usage", 1):
        power_updates["is_active"] = False
    power_ref.update(power_updates)

    db.collection("power_usage_logs").add({
        "power_id": power_id,
        "attacker_team_id": team_id,
        "target_team_id": target_team_id,
        "week_number": team.get("week_number"),
        "created_at": firestore_sdk.SERVER_TIMESTAMP,
    })

    return jsonify({
        "message": "Curse applied successfully",
        "points_deducted": deduction,
    }), 200
