from app.firebase_app import get_db


def assign_coordinator_to_team(team_id_str):
    """
    Assign the coordinator with the fewest teams to the given team.
    team_id_str: Firestore document ID string (e.g. '101').
    """
    db = get_db()

    coord_docs = db.collection("users")\
        .where("role", "==", "COORDINATOR")\
        .where("is_active", "==", True).get()

    if not coord_docs:
        return None

    # Count teams per coordinator
    coordinator_load = {}
    for coord in coord_docs:
        uid = coord.id
        count = len(db.collection("teams").where("coordinator_uid", "==", uid).get())
        coordinator_load[uid] = count

    selected_uid = min(coordinator_load, key=coordinator_load.get)

    db.collection("teams").document(team_id_str).update({"coordinator_uid": selected_uid})

    return selected_uid


def rebalance_all_teams():
    """
    Round-robin redistribute all teams across active coordinators.
    Called whenever a new coordinator is added.
    """
    db = get_db()

    coord_docs = db.collection("users")\
        .where("role", "==", "COORDINATOR")\
        .where("is_active", "==", True).get()

    if not coord_docs:
        return

    coordinators = [doc.id for doc in coord_docs]  # list of UIDs
    teams = db.collection("teams").order_by("team_id").get()

    batch = db.batch()
    for i, team_doc in enumerate(teams):
        coord_uid = coordinators[i % len(coordinators)]
        batch.update(team_doc.reference, {"coordinator_uid": coord_uid})
    batch.commit()
