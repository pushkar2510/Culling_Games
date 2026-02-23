from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Firebase Firestore is used instead of SQLAlchemy.
# Import get_db from app.firebase_app wherever you need Firestore.

mail = Mail()
limiter = Limiter(key_func=get_remote_address)
