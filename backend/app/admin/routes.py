from flask import Blueprint, request, jsonify
from app.firebase_app import get_db, next_team_id
from app.middleware.role_required import role_required, get_current_uid
from firebase_admin import auth as firebase_auth
from datetime import datetime

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

SUPER_ADMIN_EMAIL = "gamesburner10@gmail.com"


# ─── helpers ─────────────────────────────────────────────────────────────────

def _is_super_admin(uid):
    db = get_db()
    snap = db.collection("users").document(uid).get()
    return snap.exists and snap.to_dict().get("email") == SUPER_ADMIN_EMAIL


def _get_weekly_cap(week_number):
    db = get_db()
    snap = db.collection("week_configs").document(str(week_number)).get()
    return snap.to_dict().get("weekly_cap", 30) if snap.exists else 30


# ─── MASTER — Adjust Points ──────────────────────────────────────────────────

@admin_bp.route("/adjust-points", methods=["POST"])
@role_required("MASTER")
def adjust_points():
    db = get_db()
    master_uid = get_current_uid()
    data = request.get_json()

    team_id = data.get("team_id")
    points = data.get("points")
    reason = data.get("reason")
    proof_url = data.get("proof_url")

    if team_id is None or points is None or not reason:
        return jsonify({"error": "team_id, points, and reason are required"}), 400

    team_ref = db.collection("teams").document(str(team_id))
    team_snap = team_ref.get()
    if not team_snap.exists:
        return jsonify({"error": "Team not found"}), 404

    team = team_snap.to_dict()
    weekly_cap = _get_weekly_cap(team["week_number"])

    if points > 0:
        remaining = weekly_cap - team["weekly_points"]
        if remaining <= 0:
            points = 0
            team_ref.update({"weekly_cap_reached": True})
        elif points > remaining:
            points = remaining
            team_ref.update({"weekly_cap_reached": True})

    team_ref.update({
        "weekly_points": team["weekly_points"] + points,
        "total_points": team["total_points"] + points,
    })

    ref = db.collection("point_adjustments").document()
    ref.set({
        "adj_id": ref.id,
        "team_id": team_id,
        "points_changed": points,
        "reason": reason,
        "adjusted_by": master_uid,
        "week_number": team["week_number"],
        "proof_url": proof_url,
        "created_at": datetime.utcnow().isoformat(),
    })

    updated = team_ref.get().to_dict()
    return jsonify({
        "message": "Points adjusted successfully",
        "points_changed": points,
        "team_total_points": updated["total_points"],
        "team_weekly_points": updated["weekly_points"],
        "proof_url": proof_url,
    }), 200


# ─── MASTER — Disqualify Team ────────────────────────────────────────────────

@admin_bp.route("/disqualify-team", methods=["POST"])
@role_required("MASTER")
def disqualify_team():
    db = get_db()
    data = request.get_json()

    team_id = data.get("team_id")
    reason = data.get("reason")

    if not team_id or not reason:
        return jsonify({"error": "team_id and reason required"}), 400

    team_ref = db.collection("teams").document(str(team_id))
    snap = team_ref.get()
    if not snap.exists:
        return jsonify({"error": "Team not found"}), 404

    team_ref.update({"is_disqualified": True})
    return jsonify({"message": f"Team {snap.to_dict()['team_name']} disqualified"}), 200


# ─── MASTER — Requalify Team ─────────────────────────────────────────────────

@admin_bp.route("/requalify-team", methods=["POST"])
@role_required("MASTER")
def requalify_team():
    db = get_db()
    data = request.get_json()
    team_id = data.get("team_id")

    if not team_id:
        return jsonify({"error": "team_id required"}), 400

    team_ref = db.collection("teams").document(str(team_id))
    snap = team_ref.get()
    if not snap.exists:
        return jsonify({"error": "Team not found"}), 404

    team_ref.update({"is_disqualified": False})
    return jsonify({"message": f"Team {snap.to_dict()['team_name']} requalified"}), 200


# ─── MASTER + COORDINATOR — Dashboard overview ────────────────────────────────

@admin_bp.route("/dashboard", methods=["GET"])
@role_required("MASTER", "COORDINATOR")
def admin_dashboard():
    db = get_db()

    total_teams = len(db.collection("teams").get())
    total_coordinators = len(
        db.collection("users").where("role", "==", "COORDINATOR").get()
    )
    total_masters = len(
        db.collection("users").where("role", "==", "MASTER").get()
    )
    total_players = len(
        db.collection("users").where("role", "==", "TEAM").get()
    )

    return jsonify({
        "total_teams": total_teams,
        "total_coordinators": total_coordinators,
        "total_masters": total_masters,
        "total_players": total_players,
    }), 200


# ─── MASTER + COORDINATOR — View all teams ────────────────────────────────────

@admin_bp.route("/teams", methods=["GET"])
@role_required("MASTER", "COORDINATOR")
def get_all_teams():
    db = get_db()
    team_docs = db.collection("teams").get()

    result = []
    for doc in team_docs:
        t = doc.to_dict()

        leader_snap = db.collection("users").document(t["leader_uid"]).get()
        leader = leader_snap.to_dict() if leader_snap.exists else {}

        coordinator = None
        if t.get("coordinator_uid"):
            coord_snap = db.collection("users").document(t["coordinator_uid"]).get()
            if coord_snap.exists:
                c = coord_snap.to_dict()
                coordinator = {
                    "coordinator_id": c["uid"],
                    "coordinator_name": c["name"],
                    "coordinator_email": c["email"],
                }

        result.append({
            "team_id": t["team_id"],
            "team_name": t["team_name"],
            "leader": {
                "leader_id": t["leader_uid"],
                "leader_name": leader.get("name"),
                "leader_email": leader.get("email"),
            },
            "coordinator": coordinator,
            "total_points": t["total_points"],
            "weekly_points": t["weekly_points"],
            "week_number": t["week_number"],
            "is_disqualified": t["is_disqualified"],
        })

    return jsonify(result), 200


# ─── MASTER + COORDINATOR — View full team detail ────────────────────────────

@admin_bp.route("/team/<team_id>", methods=["GET"])
@role_required("MASTER", "COORDINATOR")
def get_team_detail(team_id):
    db = get_db()
    team_snap = db.collection("teams").document(str(team_id)).get()
    if not team_snap.exists:
        return jsonify({"error": "Team not found"}), 404

    t = team_snap.to_dict()

    leader_snap = db.collection("users").document(t["leader_uid"]).get()
    leader = leader_snap.to_dict() if leader_snap.exists else {}

    coordinator = None
    if t.get("coordinator_uid"):
        coord_snap = db.collection("users").document(t["coordinator_uid"]).get()
        if coord_snap.exists:
            c = coord_snap.to_dict()
            coordinator = {"name": c["name"], "email": c["email"]}

    members_docs = db.collection("team_members")\
        .where("team_id", "==", t["team_id"]).get()
    members_list = [
        {"name": m.to_dict()["member_name"], "email": m.to_dict()["member_email"]}
        for m in members_docs
    ]

    return jsonify({
        "team_id": t["team_id"],
        "team_name": t["team_name"],
        "leader": {"name": leader.get("name"), "email": leader.get("email")},
        "coordinator": coordinator,
        "members": members_list,
        "total_points": t["total_points"],
        "weekly_points": t["weekly_points"],
        "week_number": t["week_number"],
        "is_disqualified": t["is_disqualified"],
    }), 200


# ─── COORDINATOR — Dashboard (assigned teams only) ───────────────────────────

@admin_bp.route("/coordinator-dashboard", methods=["GET"])
@role_required("COORDINATOR")
def coordinator_dashboard():
    db = get_db()
    coordinator_uid = get_current_uid()

    team_docs = db.collection("teams")\
        .where("coordinator_uid", "==", coordinator_uid).get()

    result = []
    for doc in team_docs:
        t = doc.to_dict()

        leader_snap = db.collection("users").document(t["leader_uid"]).get()
        leader = leader_snap.to_dict() if leader_snap.exists else {}

        members_docs = db.collection("team_members")\
            .where("team_id", "==", t["team_id"]).get()
        members_list = [
            {"name": m.to_dict()["member_name"], "email": m.to_dict()["member_email"]}
            for m in members_docs
        ]

        result.append({
            "team_id": t["team_id"],
            "team_name": t["team_name"],
            "leader": {"name": leader.get("name"), "email": leader.get("email")},
            "members": members_list,
            "total_points": t["total_points"],
            "weekly_points": t["weekly_points"],
            "week_number": t["week_number"],
            "is_disqualified": t["is_disqualified"],
        })

    return jsonify(result), 200


# ─── COORDINATOR — Pending submissions of assigned teams ─────────────────────

@admin_bp.route("/coordinator-pending-submissions", methods=["GET"])
@role_required("COORDINATOR")
def coordinator_pending_submissions():
    db = get_db()
    coordinator_uid = get_current_uid()

    team_docs = db.collection("teams")\
        .where("coordinator_uid", "==", coordinator_uid).get()
    team_ids = [doc.to_dict()["team_id"] for doc in team_docs]

    result = []
    sub_docs = db.collection("submissions").where("status", "==", "PENDING").get()

    for doc in sub_docs:
        s = doc.to_dict()
        if s["team_id"] not in team_ids:
            continue
        team_snap = db.collection("teams").document(str(s["team_id"])).get()
        task_snap = db.collection("tasks").document(s["task_id"]).get()

        team = team_snap.to_dict() if team_snap.exists else {}
        task = task_snap.to_dict() if task_snap.exists else {}

        result.append({
            "submission_id": doc.id,
            "team_name": team.get("team_name"),
            "task_name": task.get("name"),
            "proof_url": s.get("proof_url", ""),
            "description": s.get("description"),
            "created_at": s.get("created_at"),
        })

    return jsonify(result), 200


# ─── MASTER — Full platform dashboard ────────────────────────────────────────

@admin_bp.route("/master-dashboard", methods=["GET"])
@role_required("MASTER")
def master_dashboard():
    db = get_db()

    total_teams = len(db.collection("teams").get())
    total_coordinators = len(
        db.collection("users").where("role", "==", "COORDINATOR").get()
    )
    total_masters = len(
        db.collection("users").where("role", "==", "MASTER").get()
    )
    total_players = len(
        db.collection("users").where("role", "==", "TEAM").get()
    )
    total_submissions = len(db.collection("submissions").get())
    pending_submissions = len(
        db.collection("submissions").where("status", "==", "PENDING").get()
    )
    active_powers = len(
        db.collection("team_powers").where("is_active", "==", True).get()
    )

    return jsonify({
        "total_teams": total_teams,
        "total_coordinators": total_coordinators,
        "total_masters": total_masters,
        "total_players": total_players,
        "total_submissions": total_submissions,
        "pending_submissions": pending_submissions,
        "active_powers": active_powers,
    }), 200


# ─── MASTER — View coordinators and their teams ───────────────────────────────

@admin_bp.route("/coordinators", methods=["GET"])
@role_required("MASTER")
def get_coordinators():
    db = get_db()
    coord_docs = db.collection("users").where("role", "==", "COORDINATOR").get()

    result = []
    for doc in coord_docs:
        c = doc.to_dict()
        team_docs = db.collection("teams")\
            .where("coordinator_uid", "==", doc.id).get()
        team_list = [
            {
                "team_id": t.to_dict()["team_id"],
                "team_name": t.to_dict()["team_name"],
                "total_points": t.to_dict()["total_points"],
            }
            for t in team_docs
        ]
        result.append({
            "coordinator_id": c["uid"],
            "name": c["name"],
            "email": c["email"],
            "assigned_teams": team_list,
        })

    return jsonify(result), 200


# ─── MASTER — Pending power requests ─────────────────────────────────────────

@admin_bp.route("/pending-powers", methods=["GET"])
@role_required("MASTER")
def pending_powers():
    db = get_db()
    power_docs = db.collection("team_powers")\
        .where("is_active", "==", False)\
        .where("used_count", "==", 0)\
        .where("power_value", "==", 0).get()

    result = []
    for doc in power_docs:
        p = doc.to_dict()
        team_snap = db.collection("teams").document(str(p["team_id"])).get()
        if team_snap.exists:
            result.append({
                "power_id": doc.id,
                "team_name": team_snap.to_dict()["team_name"],
                "power_type": p["power_type"],
                "week_number": p["week_number"],
            })

    return jsonify(result), 200


# ─── MASTER + COORDINATOR — Admin create team ────────────────────────────────

@admin_bp.route("/create-team", methods=["POST"])
@role_required("MASTER", "COORDINATOR")
def admin_create_team():
    db = get_db()
    data = request.get_json()

    team_name = data.get("team_name")
    leader_name = data.get("leader_name")
    leader_email = data.get("leader_email")
    leader_password = data.get("leader_password")
    members = data.get("members", [])

    if not all([team_name, leader_name, leader_email, leader_password]):
        return jsonify({
            "error": "team_name, leader_name, leader_email, leader_password required"
        }), 400

    existing = db.collection("users").where("email", "==", leader_email).limit(1).get()
    if existing:
        return jsonify({"error": "Leader email already exists"}), 400

    # Create Firebase Auth user for the leader
    try:
        user_record = firebase_auth.create_user(
            email=leader_email,
            password=leader_password,
            display_name=leader_name,
        )
        uid = user_record.uid
        firebase_auth.set_custom_user_claims(uid, {"role": "TEAM"})

        db.collection("users").document(uid).set({
            "uid": uid,
            "name": leader_name,
            "email": leader_email,
            "role": "TEAM",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
        })
    except firebase_auth.EmailAlreadyExistsError:
        return jsonify({"error": "Leader email already exists"}), 400
    except Exception as e:
        return jsonify({"error": f"User creation failed: {str(e)}"}), 500

    new_id = next_team_id()
    team_id_str = str(new_id)

    db.collection("teams").document(team_id_str).set({
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
    })

    if members:
        batch = db.batch()
        for m in members:
            ref = db.collection("team_members").document()
            batch.set(ref, {
                "team_id": new_id,
                "member_name": m.get("name"),
                "member_email": m.get("email"),
            })
        batch.commit()

    from app.services.coordinator_assignment_service import assign_coordinator_to_team
    assign_coordinator_to_team(team_id_str)

    return jsonify({
        "message": "Team created successfully by admin",
        "leader_email": leader_email,
    }), 201


# ─── MASTER (Super Admin) — Change team password ──────────────────────────────

@admin_bp.route("/change-team-password", methods=["POST"])
@role_required("MASTER")
def change_team_password():
    uid = get_current_uid()
    if not _is_super_admin(uid):
        return jsonify({"error": "ACCESS DENIED: Super Admin privileges required."}), 403

    db = get_db()
    data = request.get_json()
    team_id = data.get("team_id")
    new_password = data.get("new_password")

    if not team_id or not new_password:
        return jsonify({"error": "Team ID and new password required"}), 400

    team_snap = db.collection("teams").document(str(team_id)).get()
    if not team_snap.exists:
        return jsonify({"error": "Team not found"}), 404

    team = team_snap.to_dict()
    leader_uid = team["leader_uid"]

    try:
        # Firebase Admin SDK updates the password server-side
        firebase_auth.update_user(leader_uid, password=new_password)
        # Revoke all existing refresh tokens (forces re-login)
        firebase_auth.revoke_refresh_tokens(leader_uid)
    except Exception as e:
        return jsonify({"error": f"Password update failed: {str(e)}"}), 500

    return jsonify({
        "message": (
            f"Password for Team #{team['team_id']} ({team['team_name']}) "
            "changed successfully! All sessions terminated."
        )
    }), 200


