from functools import wraps
from flask import jsonify, request, g
from firebase_admin import auth as firebase_auth


def role_required(*allowed_roles):
    """
    Decorator that:
    1. Extracts the Firebase ID token from Authorization: Bearer <token>
    2. Verifies it against Firebase Auth
    3. Reads the 'role' custom claim set when the user was created
    4. Stores g.uid and g.role for use inside route functions
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid Authorization header"}), 401

            id_token = auth_header.split("Bearer ", 1)[1]

            try:
                decoded = firebase_auth.verify_id_token(id_token)
            except firebase_auth.ExpiredIdTokenError:
                return jsonify({"error": "Token has expired"}), 401
            except firebase_auth.InvalidIdTokenError:
                return jsonify({"error": "Invalid token"}), 401
            except Exception as e:
                return jsonify({"error": f"Token verification failed: {str(e)}"}), 401

            uid = decoded.get("uid")
            role = decoded.get("role")  # custom claim set via Admin SDK

            if not role:
                # Fallback: fetch fresh user record (needed right after claim is set)
                try:
                    user_record = firebase_auth.get_user(uid)
                    role = (user_record.custom_claims or {}).get("role")
                except Exception:
                    pass

            if not role:
                return jsonify({"error": "No role assigned to this account"}), 403

            if role not in allowed_roles:
                return jsonify({"error": "Access forbidden: insufficient role"}), 403

            g.uid = uid
            g.role = role

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_uid():
    """Shortcut for route functions: returns the verified Firebase UID."""
    return g.uid
