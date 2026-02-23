from flask import Blueprint, request, jsonify
from app.firebase_app import get_db
from app.middleware.role_required import role_required, get_current_uid
from datetime import datetime
import cloudinary.uploader

submissions_bp = Blueprint("submissions", __name__, url_prefix="/api/submissions")


# ─── helpers ─────────────────────────────────────────────────────────────────

def _get_team_by_leader(uid):
    db = get_db()
    docs = db.collection("teams").where("leader_uid", "==", uid).limit(1).get()
    if not docs:
        return None, None
    doc = docs[0]
    return doc.id, doc.to_dict()


def _get_or_create_personal_task(db, current_week):
    """Return (task_id, task_dict) for the system Personal/Custom task."""
    docs = db.collection("tasks")\
        .where("name", "==", "Personal / Custom Submission").limit(1).get()
    if docs:
        doc = docs[0]
        return doc.id, doc.to_dict()
    ref = db.collection("tasks").document()
    task_data = {
        "task_id": ref.id,
        "name": "Personal / Custom Submission",
        "category": "PERSONAL",
        "description": "Team submitted a personal achievement.",
        "points": 0,
        "is_bonus": False,
        "is_one_time": False,
        "week_number": current_week,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    ref.set(task_data)
    return ref.id, task_data


def _is_bonus_task(task):
    if not task:
        return False
    if task.get("is_bonus"):
        return True
    cat = (task.get("category") or "").upper()
    name = (task.get("name") or "").lower()
    return cat == "BONUS" or "bonus" in name


# ─── COORDINATOR — Verify Submission ─────────────────────────────────────────

@submissions_bp.route("/verify/<submission_id>", methods=["PUT"])
@role_required("COORDINATOR")
def verify_submission(submission_id):
    db = get_db()
    coordinator_uid = get_current_uid()

    data = request.get_json()
    action = data.get("action")

    sub_ref = db.collection("submissions").document(submission_id)
    sub_snap = sub_ref.get()
    if not sub_snap.exists:
        return jsonify({"error": "Submission not found"}), 404

    submission = sub_snap.to_dict()
    if submission["status"] != "PENDING":
        return jsonify({"error": "Submission already processed"}), 400

    team_snap = db.collection("teams").document(str(submission["team_id"])).get()
    if not team_snap.exists:
        return jsonify({"error": "Team not found"}), 404
    team = team_snap.to_dict()

    if team.get("coordinator_uid") != coordinator_uid:
        return jsonify({"error": "You are not assigned to this team"}), 403

    if team.get("is_disqualified"):
        return jsonify({"error": "Team is disqualified"}), 403

    updates = {"verified_by": coordinator_uid}

    if action == "VERIFIED":
        assigned_points = data.get("points")
        if assigned_points and str(assigned_points).strip():
            try:
                updates["points_awarded"] = int(assigned_points)
            except ValueError:
                updates["points_awarded"] = 0
        updates["status"] = "VERIFIED"
    elif action == "REJECTED":
        updates["status"] = "REJECTED_BY_COORDINATOR"
    else:
        return jsonify({"error": "Invalid action"}), 400

    sub_ref.update(updates)
    return jsonify({"message": f"Submission {updates['status']}"}), 200


# ─── MASTER — View Verified Submissions ──────────────────────────────────────

@submissions_bp.route("/verified", methods=["GET"])
@role_required("MASTER")
def get_verified_submissions():
    db = get_db()
    docs = db.collection("submissions").where("status", "==", "VERIFIED").get()

    result = []
    for doc in docs:
        s = doc.to_dict()
        result.append({
            "id": doc.id,
            "team_id": s["team_id"],
            "task_id": s["task_id"],
            "points_awarded": s.get("points_awarded", 0),
            "proof_url": s.get("proof_url", ""),
            "description": s.get("description"),
            "week_number": s["week_number"],
            "created_at": s.get("created_at"),
        })
    return jsonify(result), 200


# ─── MASTER — Approve Submission ─────────────────────────────────────────────

@submissions_bp.route("/approve/<submission_id>", methods=["PUT"])
@role_required("MASTER")
def approve_submission(submission_id):
    db = get_db()
    master_uid = get_current_uid()

    sub_ref = db.collection("submissions").document(submission_id)
    sub_snap = sub_ref.get()
    if not sub_snap.exists:
        return jsonify({"error": "Submission not found"}), 404

    submission = sub_snap.to_dict()
    if submission["status"] != "VERIFIED":
        return jsonify({"error": "Submission must be VERIFIED first"}), 400

    team_ref = db.collection("teams").document(str(submission["team_id"]))
    team_snap = team_ref.get()
    task_snap = db.collection("tasks").document(submission["task_id"]).get()

    if not team_snap.exists or not task_snap.exists:
        return jsonify({"error": "Invalid team or task"}), 400

    team = team_snap.to_dict()
    task = task_snap.to_dict()

    if team.get("is_disqualified"):
        return jsonify({"error": "Disqualified team cannot receive points"}), 403

    # Week cap
    week_config_snap = db.collection("week_configs")\
        .document(str(team["week_number"])).get()
    weekly_cap = 30
    if week_config_snap.exists:
        weekly_cap = week_config_snap.to_dict().get("weekly_cap", 30)

    if _is_bonus_task(task):
        points_to_award = 0
    elif submission.get("points_awarded") and submission["points_awarded"] > 0:
        points_to_award = submission["points_awarded"]
    else:
        points_to_award = task["points"]

    current_weekly = team["weekly_points"]
    if current_weekly >= weekly_cap:
        points_to_award = 0
        cap_reached = True
    else:
        remaining = weekly_cap - current_weekly
        if points_to_award > remaining:
            points_to_award = remaining
            cap_reached = True
        else:
            cap_reached = team.get("weekly_cap_reached", False)

    team_ref.update({
        "weekly_points": current_weekly + points_to_award,
        "total_points": team["total_points"] + points_to_award,
        "weekly_cap_reached": cap_reached,
    })

    sub_ref.update({
        "status": "APPROVED",
        "points_awarded": points_to_award,
        "approved_by": master_uid,
    })

    return jsonify({
        "message": "Submission APPROVED",
        "points_awarded": points_to_award,
    }), 200


# ─── COORDINATOR — View Pending Submissions ───────────────────────────────────

@submissions_bp.route("/pending", methods=["GET"])
@role_required("COORDINATOR")
def get_pending_submissions():
    db = get_db()
    docs = db.collection("submissions").where("status", "==", "PENDING").get()

    result = []
    for doc in docs:
        s = doc.to_dict()
        team_snap = db.collection("teams").document(str(s["team_id"])).get()
        task_snap = db.collection("tasks").document(s["task_id"]).get()

        team = team_snap.to_dict() if team_snap.exists else {}
        task = task_snap.to_dict() if task_snap.exists else {}

        result.append({
            "submission_id": doc.id,
            "team": {
                "team_id": s["team_id"],
                "team_name": team.get("team_name"),
                "leader_id": team.get("leader_uid"),
            },
            "task": {
                "task_id": s["task_id"],
                "task_name": task.get("name"),
                "points": task.get("points"),
                "category": task.get("category"),
            },
            "proof": {
                "proof_url": s.get("proof_url", ""),
                "proof_type": s.get("proof_type"),
                "description": s.get("description"),
            },
            "week_number": s["week_number"],
            "created_at": s.get("created_at"),
            "status": s["status"],
        })

    return jsonify(result), 200


# ─── TEAM — View Own Submissions ─────────────────────────────────────────────

@submissions_bp.route("/my", methods=["GET"])
@role_required("TEAM")
def get_my_submissions():
    db = get_db()
    uid = get_current_uid()

    _, team = _get_team_by_leader(uid)
    if not team:
        return jsonify({"error": "No team found"}), 404

    docs = db.collection("submissions")\
        .where("team_id", "==", team["team_id"]).get()

    result = []
    for doc in docs:
        s = doc.to_dict()
        task_snap = db.collection("tasks").document(s["task_id"]).get()
        task = task_snap.to_dict() if task_snap.exists else None
        is_bonus = _is_bonus_task(task)

        result.append({
            "id": doc.id,
            "task_id": s["task_id"],
            "status": s["status"],
            "points_awarded": s.get("points_awarded", 0),
            "week_number": s["week_number"],
            "created_at": s.get("created_at"),
            "is_bonus": is_bonus,
        })

    return jsonify(result), 200


# ─── TEAM — Create Submission ─────────────────────────────────────────────────

@submissions_bp.route("/create", methods=["POST"])
@role_required("TEAM")
def create_submission():
    db = get_db()
    uid = get_current_uid()

    state_snap = db.collection("game_state").document("current").get()
    if not state_snap.exists:
        return jsonify({"error": "Game not active"}), 403
    state = state_snap.to_dict()
    if not state.get("is_active"):
        return jsonify({"error": "Game not active"}), 403
    if state.get("is_paused"):
        return jsonify({"error": "Game is paused"}), 403

    task_id_input = request.form.get("task_id")
    description = request.form.get("description")

    if not task_id_input:
        return jsonify({"error": "Task ID required"}), 400

    _, team = _get_team_by_leader(uid)
    if not team:
        return jsonify({"error": "Create team first"}), 400
    if team.get("is_disqualified"):
        return jsonify({"error": "Disqualified team cannot submit tasks"}), 403

    file_url = ""
    current_week = state.get("current_week", 1)

    if task_id_input == "other":
        if not description or len(description.strip()) < 10:
            return jsonify({
                "error": "A detailed description including your GDrive link is required."
            }), 400
        task_id_to_use, _ = _get_or_create_personal_task(db, current_week)
    else:
        task_snap = db.collection("tasks").document(task_id_input).get()
        if not task_snap.exists or not task_snap.to_dict().get("is_active"):
            return jsonify({"error": "Invalid task"}), 400

        if "file" not in request.files or request.files["file"].filename == "":
            return jsonify({
                "error": "File required for official Master directives"
            }), 400

        file = request.files["file"]
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder="culling_games_proofs",
                resource_type="auto",
            )
            file_url = upload_result["secure_url"]
        except Exception as e:
            return jsonify({"error": f"Upload failed: {str(e)}"}), 500

        task_id_to_use = task_id_input

    ref = db.collection("submissions").document()
    ref.set({
        "submission_id": ref.id,
        "team_id": team["team_id"],
        "task_id": task_id_to_use,
        "proof_url": file_url,
        "proof_type": "FILE" if file_url else "LINK",
        "description": description,
        "week_number": team["week_number"],
        "status": "PENDING",
        "points_awarded": 0,
        "verified_by": None,
        "approved_by": None,
        "created_at": datetime.utcnow().isoformat(),
    })

    return jsonify({
        "message": "Submission created successfully",
        "file_url": file_url,
    }), 201
