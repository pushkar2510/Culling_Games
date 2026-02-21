from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.role_required import role_required
from app.models import Notification
from app.extensions import db

notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)


# 🔹 MASTER + COORDINATOR — Create GENERAL notification
@notifications_bp.route("/create", methods=["POST"])
@role_required("MASTER", "COORDINATOR")
def create_notification():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    title = data.get("title")
    message = data.get("message")
    type = data.get("type", "GENERAL")

    if not title or not message:
        return jsonify({"error": "Title and message required"}), 400

    notification = Notification(
        title=title,
        message=message,
        type=type,
        created_by=user_id
    )

    db.session.add(notification)
    db.session.commit()

    return jsonify({
        "message": "Notification created successfully"
    }), 201


# 🔹 MASTER ONLY — Create BONUS TASK or GUIDE
@notifications_bp.route("/create-master", methods=["POST"])
@role_required("MASTER")
def create_master_notification():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    title = data.get("title")
    message = data.get("message")
    type = data.get("type")

    if type not in ["BONUS_TASK", "GUIDE", "ALERT"]:
        return jsonify({
            "error": "Invalid type for master notification"
        }), 400

    notification = Notification(
        title=title,
        message=message,
        type=type,
        created_by=user_id
    )

    db.session.add(notification)
    db.session.commit()

    return jsonify({
        "message": f"{type} notification created"
    }), 201


# 🔹 PUBLIC — View ALL notifications (no login required)
@notifications_bp.route("/all", methods=["GET"])
def get_all_notifications():

    notifications = Notification.query\
        .filter_by(is_active=True)\
        .order_by(Notification.created_at.desc())\
        .all()

    result = []

    for n in notifications:
        result.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "created_at": n.created_at
        })

    return jsonify(result), 200



# 🔹 PUBLIC — View BONUS TASK notifications
@notifications_bp.route("/bonus", methods=["GET"])
def get_bonus_notifications():

    notifications = Notification.query\
        .filter_by(type="BONUS_TASK", is_active=True)\
        .order_by(Notification.created_at.desc())\
        .all()

    result = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "created_at": n.created_at
        }
        for n in notifications
    ]

    return jsonify(result), 200


# 🔹 PUBLIC — View GUIDE notifications
@notifications_bp.route("/guide", methods=["GET"])
def get_guide_notifications():

    notifications = Notification.query\
        .filter_by(type="GUIDE", is_active=True)\
        .order_by(Notification.created_at.desc())\
        .all()

    result = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "created_at": n.created_at
        }
        for n in notifications
    ]

    return jsonify(result), 200


# 🔹 PUBLIC — View GENERAL notifications
@notifications_bp.route("/general", methods=["GET"])
def get_general_notifications():

    notifications = Notification.query\
        .filter_by(type="GENERAL", is_active=True)\
        .order_by(Notification.created_at.desc())\
        .all()

    result = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "created_at": n.created_at
        }
        for n in notifications
    ]

    return jsonify(result), 200

