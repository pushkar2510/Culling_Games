from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def role_required(*allowed_roles):

    def decorator(fn):

        @wraps(fn)
        def wrapper(*args, **kwargs):

            verify_jwt_in_request()

            jwt_data = get_jwt()

            user_role = jwt_data.get("role")

            if user_role not in allowed_roles:
                return jsonify({
                    "error": "Access forbidden: insufficient role"
                }), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator
