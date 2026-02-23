import os
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth


_db = None


def init_firebase():
    """Initialize Firebase Admin SDK and return Firestore client."""
    global _db

    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if not cred_path:
            raise ValueError("FIREBASE_CREDENTIALS_PATH env variable not set")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    _db = firestore.client()
    return _db


def get_db():
    """Return the Firestore client (initialise once)."""
    global _db
    if _db is None:
        return init_firebase()
    return _db


def next_team_id():
    """
    Atomically increment and return the next team numeric ID (starts at 101).
    Uses a Firestore transaction on the counters/teams document.
    """
    db = get_db()
    counter_ref = db.collection("counters").document("teams")

    @firestore.transactional
    def _txn(transaction):
        snap = counter_ref.get(transaction=transaction)
        current = snap.get("last_id") if snap.exists else 100
        next_id = current + 1
        transaction.set(counter_ref, {"last_id": next_id}, merge=True)
        return next_id

    return _txn(db.transaction())
