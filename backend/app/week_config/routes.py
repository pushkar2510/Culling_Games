from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.role_required import role_required
from app.models import WeekConfig
from app.extensions import db


week_config_bp = Blueprint(
    "week_config",
    __name__,
    url_prefix="/api/week-config"
)


# 🔹 MASTER — Set or Update Weekly Power Config
@week_config_bp.route("/set", methods=["POST"])
@role_required("MASTER")
def set_week_config():

    data = request.get_json()

    week_number = data.get("week_number")
    curse_power = data.get("curse_power")
    shield_power = data.get("shield_power")
    weekly_cap = data.get("weekly_cap", 30)

    if not week_number or curse_power is None or shield_power is None:
        return jsonify({
            "error": "week_number, curse_power, shield_power required"
        }), 400


    existing = WeekConfig.query.filter_by(
        week_number=week_number
    ).first()


    if existing:

        existing.curse_power = curse_power
        existing.shield_power = shield_power
        existing.weekly_cap = weekly_cap
        existing.created_by = int(get_jwt_identity())

        db.session.commit()

        return jsonify({
            "message": "Week config updated"
        }), 200


    new_config = WeekConfig(
        week_number=week_number,
        curse_power=curse_power,
        shield_power=shield_power,
        weekly_cap=weekly_cap,
        created_by=int(get_jwt_identity())
    )

    db.session.add(new_config)
    db.session.commit()


    return jsonify({
        "message": "Week config created"
    }), 201



# 🔹 PUBLIC — View All Week Config
@week_config_bp.route("/all", methods=["GET"])
def get_all_week_configs():

    configs = WeekConfig.query.order_by(
        WeekConfig.week_number.asc()
    ).all()

    result = []

    for c in configs:

        result.append({
            "week_number": c.week_number,
            "curse_power": c.curse_power,
            "shield_power": c.shield_power,
            "weekly_cap": c.weekly_cap
        })


    return jsonify(result), 200
