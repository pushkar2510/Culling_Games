"""
auth/routes.py  —  Firebase-backed authentication endpoints

Auth flow:
  TEAM self-register:
    POST /api/auth/register  → backend creates Firebase Auth user + Firestore doc
    Frontend then calls signInWithEmailAndPassword to get the ID token
  Login:
    Done entirely on the frontend via Firebase JS SDK (signInWithEmailAndPassword)
    Every subsequent request carries  Authorization: Bearer <Firebase ID token>
  Logout:
    Frontend calls Firebase signOut() — no backend call needed
    /api/auth/logout kept as a stub for compatibility
  Create MASTER / COORDINATOR:
    POST /api/auth/create-admin  (MASTER only) → backend-controlled creation
"""

from flask import Blueprint, request, jsonify, g
from datetime import datetime
from app.firebase_app import get_db
from app.middleware.role_required import role_required, get_current_uid
from firebase_admin import auth as firebase_auth
from app.services.coordinator_assignment_service import rebalance_all_teams

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

SUPER_ADMIN_EMAIL = "gamesburner10@gmail.com"


# ─── helpers ────────────────────────────────────────────────────────────────

def _create_firebase_user(name, email, password, role):
    """
    Create a user in Firebase Auth, set custom role claim, and
    persist the profile to Firestore  users/{uid}.
    Returns the Firebase UID.
    """
    db = get_db()

    user_record = firebase_auth.create_user(
        email=email,
        password=password,
        display_name=name,
    )
    uid = user_record.uid

    # Custom claim so ID tokens carry the role without a Firestore round-trip
    firebase_auth.set_custom_user_claims(uid, {"role": role})

    db.collection("users").document(uid).set({
        "uid": uid,
        "name": name,
        "email": email,
        "role": role,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    })

    return uid


# ─── public endpoints ────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    TEAM self-registration — backend owns user creation.
    Frontend sends: { name, email, password }
    ( The 'role' field is accepted but ignored; always set to TEAM )
    """
    db = get_db()

    state_snap = db.collection("game_state").document("current").get()
    if state_snap.exists:
        state = state_snap.to_dict()
        if not state.get("registration_open", True):
            return jsonify({"error": "Registration is closed"}), 403

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "name, email, and password are required"}), 400

    existing = db.collection("users").where("email", "==", email).limit(1).get()
    if existing:
        return jsonify({"error": "Email already registered"}), 400

    try:
        _create_firebase_user(name, email, password, "TEAM")
    except firebase_auth.EmailAlreadyExistsError:
        return jsonify({"error": "Email already registered"}), 400
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

    return jsonify({"message": "User registered successfully. Please sign in."}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Stub for backward compatibility.
    Real login is handled client-side via Firebase signInWithEmailAndPassword.
    The resulting ID token must be passed as  Authorization: Bearer <token>.
    """
    return jsonify({
        "message": (
            "Login is handled client-side via Firebase Auth. "
            "Call Firebase signInWithEmailAndPassword, then pass "
            "the ID token as Authorization: Bearer <token>."
        )
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Stateless stub — real logout is Firebase signOut() on the frontend.
    """
    return jsonify({"message": "Logged out successfully"}), 200


# ─── protected endpoints ──────────────────────────────────────────────────────

@auth_bp.route("/create-admin", methods=["POST"])
@role_required("MASTER")
def create_admin():
    """MASTER creates a COORDINATOR or another MASTER account."""
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"error": "All fields required"}), 400

    if role not in ["MASTER", "COORDINATOR"]:
        return jsonify({"error": "Invalid role for admin creation"}), 400

    db = get_db()
    existing = db.collection("users").where("email", "==", email).limit(1).get()
    if existing:
        return jsonify({"error": "Email already exists"}), 400

    try:
        _create_firebase_user(name, email, password, role)
    except firebase_auth.EmailAlreadyExistsError:
        return jsonify({"error": "Email already exists"}), 400
    except Exception as e:
        return jsonify({"error": f"Creation failed: {str(e)}"}), 500

    if role == "COORDINATOR":
        rebalance_all_teams()

    return jsonify({"message": f"{role} created successfully"}), 201


@auth_bp.route("/protected", methods=["GET"])
@role_required("MASTER", "COORDINATOR", "TEAM")
def protected():
    return jsonify({
        "message": "Protected route accessed",
        "uid": get_current_uid()
    }), 200


@auth_bp.route("/master-only", methods=["GET"])
@role_required("MASTER")
def master_only():
    return jsonify({"message": "Welcome Master"}), 200


@auth_bp.route("/team-only", methods=["GET"])
@role_required("TEAM")
def team_only():
    return jsonify({"message": "Welcome Team"}), 200
