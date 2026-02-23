from flask import Blueprint, request, jsonify, g
from firebase_admin import firestore as firestore_sdk
from app.firebase_app import get_db
from app.middleware.role_required import role_required


notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)


# 🔹 MASTER + COORDINATOR — Create GENERAL notification
@notifications_bp.route("/create", methods=["POST"])
@role_required("MASTER", "COORDINATOR")
def create_notification():
    uid = g.uid
    data = request.get_json()

    title = data.get("title")
    message = data.get("message")
    notif_type = data.get("type", "GENERAL")

    if not title or not message:
        return jsonify({"error": "Title and message required"}), 400

    db = get_db()
    db.collection("notifications").add({
        "title": title,
        "message": message,
        "type": notif_type,
        "created_by": uid,
        "is_active": True,
        "created_at": firestore_sdk.SERVER_TIMESTAMP,
    })

    return jsonify({"message": "Notification created successfully"}), 201


# 🔹 MASTER ONLY — Create BONUS TASK or GUIDE
@notifications_bp.route("/create-master", methods=["POST"])
@role_required("MASTER")
def create_master_notification():
    uid = g.uid
    data = request.get_json()

    title = data.get("title")
    message = data.get("message")
    notif_type = data.get("type")

    if notif_type not in ["BONUS_TASK", "GUIDE", "ALERT"]:
        return jsonify({"error": "Invalid type for master notification"}), 400

    db = get_db()
    db.collection("notifications").add({
        "title": title,
        "message": message,
        "type": notif_type,
        "created_by": uid,
        "is_active": True,
        "created_at": firestore_sdk.SERVER_TIMESTAMP,
    })

    return jsonify({"message": f"{notif_type} notification created"}), 201


# 🔹 PUBLIC — View ALL notifications (no login required)
@notifications_bp.route("/all", methods=["GET"])
def get_all_notifications():
    db = get_db()
    docs = (
        db.collection("notifications")
        .where("is_active", "==", True)
        .order_by("created_at", direction=firestore_sdk.Query.DESCENDING)
        .stream()
    )

    result = []
    for doc in docs:
        d = doc.to_dict()
        result.append({
            "id": doc.id,
            "title": d.get("title"),
            "message": d.get("message"),
            "type": d.get("type"),
            "created_at": d.get("created_at"),
        })

    return jsonify(result), 200


# 🔹 PUBLIC — View BONUS TASK notifications
@notifications_bp.route("/bonus", methods=["GET"])
def get_bonus_notifications():
    db = get_db()
    docs = (
        db.collection("notifications")
        .where("type", "==", "BONUS_TASK")
        .where("is_active", "==", True)
        .order_by("created_at", direction=firestore_sdk.Query.DESCENDING)
        .stream()
    )

    result = [
        {
            "id": doc.id,
            "title": doc.to_dict().get("title"),
            "message": doc.to_dict().get("message"),
            "created_at": doc.to_dict().get("created_at"),
        }
        for doc in docs
    ]
    return jsonify(result), 200


# 🔹 PUBLIC — View GUIDE notifications
@notifications_bp.route("/guide", methods=["GET"])
def get_guide_notifications():
    db = get_db()
    docs = (
        db.collection("notifications")
        .where("type", "==", "GUIDE")
        .where("is_active", "==", True)
        .order_by("created_at", direction=firestore_sdk.Query.DESCENDING)
        .stream()
    )

    result = [
        {
            "id": doc.id,
            "title": doc.to_dict().get("title"),
            "message": doc.to_dict().get("message"),
            "created_at": doc.to_dict().get("created_at"),
        }
        for doc in docs
    ]
    return jsonify(result), 200


# 🔹 PUBLIC — View GENERAL notifications
@notifications_bp.route("/general", methods=["GET"])
def get_general_notifications():
    db = get_db()
    docs = (
        db.collection("notifications")
        .where("type", "==", "GENERAL")
        .where("is_active", "==", True)
        .order_by("created_at", direction=firestore_sdk.Query.DESCENDING)
        .stream()
    )

    result = [
        {
            "id": doc.id,
            "title": doc.to_dict().get("title"),
            "message": doc.to_dict().get("message"),
            "created_at": doc.to_dict().get("created_at"),
        }
        for doc in docs
    ]
    return jsonify(result), 200



