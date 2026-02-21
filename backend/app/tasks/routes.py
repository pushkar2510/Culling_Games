from flask import Blueprint, request, jsonify
from app.middleware.role_required import role_required
from app.models import Task, GameState
from app.extensions import db

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


# 🔹 MASTER — Create Task
@tasks_bp.route("/create", methods=["POST"])
@role_required("MASTER")
def create_task():
    data = request.get_json()

    name = data.get("name")
    category = data.get("category")
    description = data.get("description")
    points = data.get("points")
    is_bonus = data.get("is_bonus", False)
    is_one_time = data.get("is_one_time", False)

    if not name or points is None:
        return jsonify({"error": "Task name and points are required"}), 400

    state = GameState.query.first()

    new_task = Task(
        name=name,
        category=category,
        description=description,
        points=points,
        is_bonus=is_bonus,
        is_one_time=is_one_time,
        week_number = state.current_week if state else 1,
        is_active=True
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify({"message": "Task created successfully"}), 201


# 🔹 MASTER — Update Task
@tasks_bp.route("/update/<int:task_id>", methods=["PUT"])
@role_required("MASTER")
def update_task(task_id):
    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()

    task.name = data.get("name", task.name)
    task.category = data.get("category", task.category)
    task.description = data.get("description", task.description)
    task.points = data.get("points", task.points)
    task.is_bonus = data.get("is_bonus", task.is_bonus)
    task.is_one_time = data.get("is_one_time", task.is_one_time)

    db.session.commit()

    return jsonify({"message": "Task updated successfully"}), 200


# 🔹 MASTER — Deactivate Task
@tasks_bp.route("/deactivate/<int:task_id>", methods=["PUT"])
@role_required("MASTER")
def deactivate_task(task_id):
    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404

    task.is_active = False
    db.session.commit()

    return jsonify({"message": "Task deactivated successfully"}), 200


# 🔹 TEAM — View Active Tasks
@tasks_bp.route("/active", methods=["GET"])
@role_required("TEAM")
def get_active_tasks():

    from app.models import GameState

    state = GameState.query.first()

    tasks = Task.query.filter(
        Task.is_active == True,
        Task.week_number == state.current_week
    ).all()

    result = []

    for task in tasks:
        result.append({
            "task_id": task.id,
            "name": task.name,
            "points": task.points,
            "category": task.category,
            "week_number": task.week_number
        })

    return jsonify(result), 200