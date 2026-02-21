from app.models import Team, TeamPower, GameState
from app.extensions import db
from datetime import datetime, timedelta


def weekly_reset():

    with db.session.begin():

        state = db.session.query(GameState)\
            .with_for_update()\
            .first()

        if not state:
            return

        now = datetime.utcnow()

        # Lock check
        if state.last_reset_at:
            if now - state.last_reset_at < timedelta(hours=23):
                print("Weekly reset skipped (already executed)")
                return

        # Increment week
        state.current_week += 1
        state.last_reset_at = now

        teams = Team.query.all()

        for team in teams:
            team.weekly_points = 0
            team.weekly_cap_reached = False
            team.week_number = state.current_week

        TeamPower.query.update({"is_active": False})

        print("Weekly reset executed safely.")
