from flask import Blueprint, request, jsonify
from app.firebase_app import get_db
from app.middleware.role_required import role_required
from datetime import datetime

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


# ─── MASTER — Create Task ─────────────────────────────────────────────────────

@tasks_bp.route("/create", methods=["POST"])
@role_required("MASTER")
def create_task():
    db = get_db()
    data = request.get_json()

    name = data.get("name")
    category = data.get("category")
    description = data.get("description")
    points = data.get("points")
    is_bonus = data.get("is_bonus", False)
    is_one_time = data.get("is_one_time", False)

    if not name or points is None:
        return jsonify({"error": "Task name and points are required"}), 400

    state_snap = db.collection("game_state").document("current").get()
    current_week = state_snap.to_dict().get("current_week", 1) if state_snap.exists else 1

    ref = db.collection("tasks").document()
    ref.set({
        "task_id": ref.id,
        "name": name,
        "category": category,
        "description": description,
        "points": points,
        "is_bonus": is_bonus,
        "is_one_time": is_one_time,
        "week_number": current_week,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    })

    return jsonify({"message": "Task created successfully", "task_id": ref.id}), 201


# ─── MASTER — Update Task ─────────────────────────────────────────────────────

@tasks_bp.route("/update/<task_id>", methods=["PUT"])
@role_required("MASTER")
def update_task(task_id):
    db = get_db()
    task_ref = db.collection("tasks").document(task_id)
    snap = task_ref.get()

    if not snap.exists:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    task = snap.to_dict()

    updates = {
        "name": data.get("name", task["name"]),
        "category": data.get("category", task.get("category")),
        "description": data.get("description", task.get("description")),
        "points": data.get("points", task["points"]),
        "is_bonus": data.get("is_bonus", task.get("is_bonus", False)),
        "is_one_time": data.get("is_one_time", task.get("is_one_time", False)),
        "updated_at": datetime.utcnow().isoformat(),
    }
    task_ref.update(updates)

    return jsonify({"message": "Task updated successfully"}), 200


# ─── MASTER — Deactivate Task ────────────────────────────────────────────────

@tasks_bp.route("/deactivate/<task_id>", methods=["PUT"])
@role_required("MASTER")
def deactivate_task(task_id):
    db = get_db()
    task_ref = db.collection("tasks").document(task_id)

    if not task_ref.get().exists:
        return jsonify({"error": "Task not found"}), 404

    task_ref.update({
        "is_active": False,
        "updated_at": datetime.utcnow().isoformat(),
    })

    return jsonify({"message": "Task deactivated successfully"}), 200


# ─── TEAM — View Active Tasks ─────────────────────────────────────────────────

@tasks_bp.route("/active", methods=["GET"])
@role_required("TEAM")
def get_active_tasks():
    db = get_db()

    state_snap = db.collection("game_state").document("current").get()
    current_week = state_snap.to_dict().get("current_week", 1) if state_snap.exists else 1

    docs = db.collection("tasks")\
        .where("is_active", "==", True)\
        .where("week_number", "==", current_week).get()

    result = []
    for doc in docs:
        t = doc.to_dict()
        result.append({
            "task_id": doc.id,
            "name": t["name"],
            "points": t["points"],
            "category": t.get("category"),
            "week_number": t["week_number"],
        })

    return jsonify(result), 200