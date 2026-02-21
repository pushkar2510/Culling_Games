from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.role_required import role_required
from app.models import Query, Team
from app.extensions import db
from datetime import datetime


query_bp = Blueprint(
    "query",
    __name__,
    url_prefix="/api/query"
)


# TEAM create query
@query_bp.route("/create", methods=["POST"])
@role_required("TEAM")
def create_query():

    user_id = int(get_jwt_identity())

    team = Team.query.filter_by(
        leader_id=user_id
    ).first()

    if not team:
        return jsonify({"error": "Team not found"}), 404

    data = request.get_json()

    question = data.get("question")

    if not question:
        return jsonify({"error": "Question required"}), 400

    query = Query(
        team_id=team.id,
        question=question
    )

    db.session.add(query)
    db.session.commit()

    return jsonify({
        "message": "Query submitted"
    }), 201


# TEAM view own queries
@query_bp.route("/my", methods=["GET"])
@role_required("TEAM")
def my_queries():

    user_id = int(get_jwt_identity())

    team = Team.query.filter_by(
        leader_id=user_id
    ).first()

    queries = Query.query.filter_by(
        team_id=team.id
    ).all()

    result = []

    for q in queries:

        result.append({
            "id": q.id,
            "question": q.question,
            "response": q.response,
            "status": q.status,
            "created_at": q.created_at
        })

    return jsonify(result), 200


# ADMIN view all queries
@query_bp.route("/all", methods=["GET"])
@role_required("MASTER", "COORDINATOR")
def all_queries():

    queries = Query.query.all()

    result = []

    for q in queries:

        result.append({
            "id": q.id,
            "team_id": q.team_id,
            "question": q.question,
            "response": q.response,
            "status": q.status,
            "created_at": q.created_at
        })

    return jsonify(result), 200


# ADMIN respond
@query_bp.route("/respond/<int:query_id>", methods=["PUT"])
@role_required("MASTER", "COORDINATOR")
def respond_query(query_id):

    user_id = int(get_jwt_identity())

    query = Query.query.get(query_id)

    if not query:
        return jsonify({"error": "Query not found"}), 404

    data = request.get_json()

    response = data.get("response")

    query.response = response

    query.responded_by = user_id

    query.responded_at = datetime.utcnow()

    query.status = "ANSWERED"

    db.session.commit()

    return jsonify({
        "message": "Query answered"
    }), 200
