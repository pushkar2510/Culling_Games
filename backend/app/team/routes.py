from flask import Blueprint, request, jsonify
from app.firebase_app import get_db, next_team_id
from app.middleware.role_required import role_required, get_current_uid
from app.services.coordinator_assignment_service import assign_coordinator_to_team
from datetime import datetime

team_bp = Blueprint("team", __name__, url_prefix="/api/team")


# ─── helpers ─────────────────────────────────────────────────────────────────

def _get_team_by_leader(uid):
    """Return (team_id_str, team_dict) or (None, None) if not found."""
    db = get_db()
    docs = db.collection("teams").where("leader_uid", "==", uid).limit(1).get()
    if not docs:
        return None, None
    doc = docs[0]
    return doc.id, doc.to_dict()


def _get_team_rank(team_id, total_points):
    db = get_db()
    higher = db.collection("teams")\
        .where("is_disqualified", "==", False)\
        .where("total_points", ">", total_points).get()
    return len(higher) + 1


# ─── routes ───────────────────────────────────────────────────────────────────

@team_bp.route("/create", methods=["POST"])
@role_required("TEAM")
def create_team():
    uid = get_current_uid()
    db = get_db()
    data = request.get_json()

    team_name = data.get("team_name")
    members = data.get("members")

    if not team_name or not members:
        return jsonify({"error": "Team name and members required"}), 400

    if len(members) != 4:
        return jsonify({
            "error": "Team must have exactly 5 members including leader (add 4 members)"
        }), 400

    # Check if leader already has a team
    existing, _ = _get_team_by_leader(uid)
    if existing:
        return jsonify({"error": "You have already created a team"}), 400

    new_id = next_team_id()
    team_id_str = str(new_id)

    team_data = {
        "team_id": new_id,
        "team_name": team_name,
        "leader_uid": uid,
        "coordinator_uid": None,
        "total_points": 0,
        "weekly_points": 0,
        "week_number": 1,
        "weekly_cap_reached": False,
        "is_disqualified": False,
        "created_at": datetime.utcnow().isoformat(),
    }

    db.collection("teams").document(team_id_str).set(team_data)

    # Add members
    batch = db.batch()
    for member in members:
        name = member.get("name")
        email = member.get("email")
        if not name or not email:
            return jsonify({"error": "Each member must have name and email"}), 400
        ref = db.collection("team_members").document()
        batch.set(ref, {
            "team_id": new_id,
            "member_name": name,
            "member_email": email,
        })
    batch.commit()

    assign_coordinator_to_team(team_id_str)

    return jsonify({"message": "Team created successfully"}), 201


@team_bp.route("/me", methods=["GET"])
@role_required("TEAM")
def get_my_team():
    uid = get_current_uid()
    db = get_db()

    team_id_str, team = _get_team_by_leader(uid)
    if not team:
        return jsonify({"error": "No team found for this leader"}), 404

    members_docs = db.collection("team_members")\
        .where("team_id", "==", team["team_id"]).get()

    members_list = [
        {"name": m.to_dict()["member_name"], "email": m.to_dict()["member_email"]}
        for m in members_docs
    ]

    return jsonify({
        "team_id": team["team_id"],
        "team_name": team["team_name"],
        "leader_id": team["leader_uid"],
        "total_points": team["total_points"],
        "weekly_points": team["weekly_points"],
        "week_number": team["week_number"],
        "weekly_cap_reached": team["weekly_cap_reached"],
        "is_disqualified": team["is_disqualified"],
        "members": members_list,
    }), 200


@team_bp.route("/dashboard", methods=["GET"])
@role_required("TEAM")
def team_dashboard():
    uid = get_current_uid()
    db = get_db()

    team_id_str, team = _get_team_by_leader(uid)
    if not team:
        return jsonify({"error": "No team found for this leader"}), 404

    members_docs = db.collection("team_members")\
        .where("team_id", "==", team["team_id"]).get()

    members_list = [
        {"name": m.to_dict()["member_name"], "email": m.to_dict()["member_email"]}
        for m in members_docs
    ]

    rank = _get_team_rank(team_id_str, team["total_points"])

    return jsonify({
        "team_info": {
            "team_name": team["team_name"],
            "team_id": team["team_id"],
            "leader_id": team["leader_uid"],
            "total_points": team["total_points"],
            "weekly_points": team["weekly_points"],
            "week_number": team["week_number"],
            "weekly_cap_reached": team["weekly_cap_reached"],
            "is_disqualified": team["is_disqualified"],
            "created_at": team.get("created_at"),
        },
        "members": members_list,
        "member_count": len(members_list),
        "stats": {
            "total_members": len(members_list),
            "rank": rank,
        },
    }), 200


@team_bp.route("/full-dashboard", methods=["GET"])
@role_required("TEAM")
def full_dashboard():
    uid = get_current_uid()
    db = get_db()

    team_id_str, team = _get_team_by_leader(uid)
    if not team:
        return jsonify({"error": "No team found"}), 404

    notif_docs = db.collection("notifications")\
        .where("is_active", "==", True).get()

    power_docs = db.collection("team_powers")\
        .where("team_id", "==", team["team_id"]).get()

    query_docs = db.collection("queries")\
        .where("team_id", "==", team["team_id"]).get()

    return jsonify({
        "team": {
            "team_name": team["team_name"],
            "total_points": team["total_points"],
            "weekly_points": team["weekly_points"],
            "week_number": team["week_number"],
        },
        "notifications": [
            {"title": n.to_dict()["title"], "message": n.to_dict()["message"]}
            for n in notif_docs
        ],
        "powers": [
            {
                "type": p.to_dict()["power_type"],
                "value": p.to_dict()["power_value"],
                "active": p.to_dict()["is_active"],
            }
            for p in power_docs
        ],
        "queries": [
            {
                "question": q.to_dict()["question"],
                "response": q.to_dict().get("response"),
            }
            for q in query_docs
        ],
    }), 200


@team_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    db = get_db()
    docs = db.collection("teams")\
        .where("is_disqualified", "==", False)\
        .order_by("total_points", direction="DESCENDING").get()

    result = []
    for rank, doc in enumerate(docs, 1):
        t = doc.to_dict()
        result.append({
            "rank": rank,
            "team_id": t["team_id"],
            "team_name": t["team_name"],
            "total_points": t["total_points"],
            "weekly_points": t["weekly_points"],
        })

    return jsonify(result), 200