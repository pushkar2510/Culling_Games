from app.firebase_app import get_db
from datetime import datetime, timedelta


def weekly_reset():
    """
    Increment the current week in Firestore and reset all teams' weekly stats.
    Uses a Firestore transaction on game_state/current to prevent double-runs.
    """
    db = get_db()
    state_ref = db.collection("game_state").document("current")

    @db.transaction()
    def _run_in_txn(txn):
        snap = state_ref.get(transaction=txn)
        if not snap.exists:
            return

        state = snap.to_dict()
        now = datetime.utcnow()

        last_reset = state.get("last_reset_at")
        if last_reset:
            # last_reset may be stored as ISO string
            if isinstance(last_reset, str):
                last_reset = datetime.fromisoformat(last_reset)
            if now - last_reset < timedelta(hours=23):
                print("Weekly reset skipped (already executed within 23 h)")
                return

        new_week = state.get("current_week", 1) + 1
        txn.update(state_ref, {
            "current_week": new_week,
            "last_reset_at": now.isoformat(),
        })

    _run_in_txn()

    # Read updated week number
    state = state_ref.get().to_dict()
    new_week = state.get("current_week", 1)

    # Reset all teams
    teams = db.collection("teams").get()
    batch = db.batch()
    for team_doc in teams:
        batch.update(team_doc.reference, {
            "weekly_points": 0,
            "weekly_cap_reached": False,
            "week_number": new_week,
        })

    # Deactivate all team powers
    powers = db.collection("team_powers").get()
    for power_doc in powers:
        batch.update(power_doc.reference, {"is_active": False})

    batch.commit()
    print(f"Weekly reset executed successfully. Now on week {new_week}.")
