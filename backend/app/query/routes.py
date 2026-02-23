from flask import Blueprint, request, jsonify, g
from firebase_admin import firestore as firestore_sdk
from app.firebase_app import get_db
from app.middleware.role_required import role_required


query_bp = Blueprint(
    "query",
    __name__,
    url_prefix="/api/query"
)


# TEAM create query
@query_bp.route("/create", methods=["POST"])
@role_required("TEAM")
def create_query():
    uid = g.uid
    db = get_db()

    # Get team by leader_uid
    teams = db.collection("teams").where("leader_uid", "==", uid).limit(1).stream()
    team_doc = next(teams, None)
    if not team_doc:
        return jsonify({"error": "Team not found"}), 404

    data = request.get_json()
    question = data.get("question")
    if not question:
        return jsonify({"error": "Question required"}), 400

    db.collection("queries").add({
        "team_id": team_doc.id,
        "question": question,
        "response": None,
        "responded_by": None,
        "responded_at": None,
        "status": "PENDING",
        "created_at": firestore_sdk.SERVER_TIMESTAMP,
    })

    return jsonify({"message": "Query submitted"}), 201


# TEAM view own queries
@query_bp.route("/my", methods=["GET"])
@role_required("TEAM")
def my_queries():
    uid = g.uid
    db = get_db()

    teams = db.collection("teams").where("leader_uid", "==", uid).limit(1).stream()
    team_doc = next(teams, None)
    if not team_doc:
        return jsonify({"error": "Team not found"}), 404

    team_id = team_doc.id
    docs = db.collection("queries").where("team_id", "==", team_id).stream()

    result = []
    for doc in docs:
        d = doc.to_dict()
        result.append({
            "id": doc.id,
            "question": d.get("question"),
            "response": d.get("response"),
            "status": d.get("status"),
            "created_at": d.get("created_at"),
        })

    return jsonify(result), 200


# ADMIN view all queries
@query_bp.route("/all", methods=["GET"])
@role_required("MASTER", "COORDINATOR")
def all_queries():
    db = get_db()
    docs = db.collection("queries").stream()

    result = []
    for doc in docs:
        d = doc.to_dict()
        result.append({
            "id": doc.id,
            "team_id": d.get("team_id"),
            "question": d.get("question"),
            "response": d.get("response"),
            "status": d.get("status"),
            "created_at": d.get("created_at"),
        })

    return jsonify(result), 200


# ADMIN respond
@query_bp.route("/respond/<query_id>", methods=["PUT"])
@role_required("MASTER", "COORDINATOR")
def respond_query(query_id):
    uid = g.uid
    db = get_db()

    ref = db.collection("queries").document(query_id)
    doc = ref.get()
    if not doc.exists:
        return jsonify({"error": "Query not found"}), 404

    data = request.get_json()
    response = data.get("response")

    ref.update({
        "response": response,
        "responded_by": uid,
        "responded_at": firestore_sdk.SERVER_TIMESTAMP,
        "status": "ANSWERED",
    })

    return jsonify({"message": "Query answered"}), 200


