from app.models import User, Team
from app.extensions import db


def assign_coordinator_to_team(team_id):

    coordinators = User.query.filter_by(
        role="COORDINATOR",
        is_active=True
    ).order_by(User.id).all()

    if not coordinators:
        return None

    # Count teams per coordinator
    coordinator_load = {}

    for coord in coordinators:
        count = Team.query.filter_by(
            coordinator_id=coord.id
        ).count()

        coordinator_load[coord.id] = count

    # Find coordinator with minimum load
    selected_coordinator_id = min(
        coordinator_load,
        key=coordinator_load.get
    )

    team = Team.query.get(team_id)

    team.coordinator_id = selected_coordinator_id

    db.session.commit()

    return selected_coordinator_id


def rebalance_all_teams():

    coordinators = User.query.filter_by(
        role="COORDINATOR",
        is_active=True
    ).order_by(User.id).all()

    teams = Team.query.order_by(Team.id).all()

    if not coordinators:
        return

    index = 0
    total_coords = len(coordinators)

    for team in teams:

        coordinator = coordinators[index % total_coords]

        team.coordinator_id = coordinator.id

        index += 1

    db.session.commit()
