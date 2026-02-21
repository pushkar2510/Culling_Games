from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.role_required import role_required
from app.models import Team, TeamPower, Submission, Task
from app.extensions import db
from app.models import GameState
from app.models import PowerUsageLog


powers_bp = Blueprint(
    "powers",
    __name__,
    url_prefix="/api/powers"
)


# 🔹 TEAM — Request Curse or Shield
@powers_bp.route("/request", methods=["POST"])
@role_required("TEAM")
def request_power():
    user_id = int(get_jwt_identity())
    state = GameState.query.first()

    if not state or not state.is_active:
        return jsonify({"error": "Game not active"}), 403

    if state.is_paused:
        return jsonify({"error": "Game is paused"}), 403

    data = request.get_json()
    power_type = data.get("power_type")  # CURSE or SHIELD

    if power_type not in ["CURSE", "SHIELD"]:
        return jsonify({"error": "Invalid power type"}), 400

    team = Team.query.filter_by(leader_id=user_id).first()
    if not team:
        return jsonify({"error": "Team not found"}), 404

    if team.is_disqualified:
        return jsonify({"error": "Disqualified team cannot request powers"}), 403

    # 🔥 FIX 1: STRICT WEEKLY LIMIT
    existing_power = TeamPower.query.filter_by(
        team_id=team.id,
        week_number=team.week_number
    ).first()

    if existing_power:
        return jsonify({"error": "You have already requested or used a power this week."}), 400

    # 🔥 FIX 2: TOP 10 CHECK
    top_teams = (
        db.session.query(Team)
        .filter(Team.is_disqualified == False)
        .order_by(Team.total_points.desc())
        .limit(10)
        .all()
    )
    
    top_team_ids = [int(t.id) for t in top_teams]
    eligible = int(team.id) in top_team_ids

    # 🔥 FIX 3: BULLETPROOF BONUS TASK CHECK (Checks active AND archived tasks)
    if not eligible:
        all_tasks = Task.query.all()
        bonus_task_ids = []
        for t in all_tasks:
            is_bonus_flag = getattr(t, 'is_bonus', False)
            category = getattr(t, 'category', '')
            name = getattr(t, 'name', '')
            
            # Check boolean, category, or if the word 'bonus' is anywhere in the name
            if is_bonus_flag or (category and str(category).upper() == "BONUS") or ("bonus" in str(name).lower()):
                bonus_task_ids.append(t.id)

        if bonus_task_ids:
            # Check if they have an APPROVED submission for any of those tasks
            approved_bonus = Submission.query.filter(
                Submission.team_id == team.id,
                Submission.task_id.in_(bonus_task_ids),
                Submission.status == "APPROVED"
            ).first()

            if approved_bonus:
                eligible = True

    if not eligible:
        return jsonify({"error": "Access Denied: You must be in the Top 10 or have an Approved Bonus Task."}), 403

    # Create power request
    new_power = TeamPower(
        team_id=team.id,
        week_number=team.week_number,
        power_type=power_type,
        power_value=0,  
        max_usage=1,
        used_count=0,   
        is_active=False 
    )

    db.session.add(new_power)
    db.session.commit()

    return jsonify({"message": f"{power_type} request submitted for approval"}), 200


# 🔹 MASTER — Approve Power Request
@powers_bp.route("/approve/<int:power_id>", methods=["PUT"])
@role_required("MASTER")
def approve_power(power_id):

    from app.models import WeekConfig

    power = TeamPower.query.get(power_id)

    if not power:
        return jsonify({"error": "Power request not found"}), 404

    if power.is_active:
        return jsonify({"error": "Power already active"}), 400


    week_config = WeekConfig.query.filter_by(
        week_number=power.week_number
    ).first()

    if not week_config:
        return jsonify({
            "error": "Week config not set by master"
        }), 400


    if power.power_type == "CURSE":
        power.power_value = week_config.curse_power

    elif power.power_type == "SHIELD":
        power.power_value = week_config.shield_power


    power.is_active = True
    power.granted_by = int(get_jwt_identity())

    db.session.commit()


    return jsonify({
        "message": f"{power.power_type} approved",
        "power_value": power.power_value
    }), 200



@powers_bp.route("/my", methods=["GET"])
@role_required("TEAM")
def get_my_powers():

    user_id = int(get_jwt_identity())

    team = Team.query.filter_by(
        leader_id=user_id
    ).first()

    if not team:
        return jsonify({"error": "Team not found"}), 404

    powers = TeamPower.query.filter_by(
        team_id=team.id
    ).all()


    result = []

    for p in powers:

        result.append({
            "power_id": p.id,
            "power_type": p.power_type,
            "power_value": p.power_value,
            "week_number": p.week_number,
            "is_active": p.is_active,
            "used_count": p.used_count
        })

    return jsonify(result), 200



# 🔹 TEAM — Use Curse on another team
@powers_bp.route("/use", methods=["POST"])
@role_required("TEAM")
def use_power():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    power_id = data.get("power_id")
    target_team_id = data.get("target_team_id")

    if not power_id or not target_team_id:
        return jsonify({"error": "power_id and target_team_id required"}), 400

    from app.models import TeamPower, Team, WeekConfig

    # Get user's team
    team = Team.query.filter_by(leader_id=user_id).first()

    if not team:
        return jsonify({"error": "Team not found"}), 404

    if team.is_disqualified:
        return jsonify({"error": "Disqualified team cannot use powers"}), 403

    # Get power
    power = TeamPower.query.get(power_id)

    if not power:
        return jsonify({"error": "Power not found"}), 404

    if power.team_id != team.id:
        return jsonify({"error": "Not your power"}), 403

    if not power.is_active:
        return jsonify({"error": "Power is not active"}), 400

    if power.week_number != team.week_number:
        return jsonify({"error": "Power belongs to different week"}), 400


        
    if power.used_count >= power.max_usage:
        return jsonify({"error": "Power usage limit reached"}), 400

    # Cannot curse self
    if team.id == target_team_id:
        return jsonify({"error": "Cannot target own team"}), 400

    target_team = Team.query.get(target_team_id)

    if not target_team:
        return jsonify({"error": "Target team not found"}), 404

    if target_team.is_disqualified:
        return jsonify({"error": "Target team disqualified"}), 400


    # GLOBAL curse limit check (entire event)
    usage_count = PowerUsageLog.query.filter_by(
        attacker_team_id=team.id,
        target_team_id=target_team.id
    ).count()

    GLOBAL_CURSE_LIMIT = 3  # change to 2 if rule requires

    if usage_count >= GLOBAL_CURSE_LIMIT:
        return jsonify({
        "error": "Global curse limit on this target reached"
        }), 400


    # Check shield
    shield = TeamPower.query.filter_by(
        team_id=target_team.id,
        week_number=target_team.week_number,
        power_type="SHIELD",
        is_active=True
    ).first()

    if shield and shield.used_count < shield.max_usage:

        shield.used_count += 1

        if shield.used_count >= shield.max_usage:
            shield.is_active = False

        power.used_count += 1

        if power.used_count >= power.max_usage:
            power.is_active = False

        db.session.commit()

        return jsonify({
            "message": "Curse blocked by shield",
            "shield_used": True
        }), 200

    # Apply curse
    curse_value = power.power_value

    deduction = min(target_team.weekly_points, curse_value)

    target_team.weekly_points -= deduction

    target_team.total_points -= deduction

    power.used_count += 1

    if power.used_count >= power.max_usage:
        power.is_active = False

    # Log curse usage
    log = PowerUsageLog(
        power_id=power.id,
        attacker_team_id=team.id,
        target_team_id=target_team.id,
        week_number=team.week_number
    )

    db.session.add(log)
    db.session.commit()

    return jsonify({
        "message": "Curse applied successfully",
        "points_deducted": deduction
    }), 200