from app.extensions import db
from datetime import datetime

class ActiveSession(db.Model):
    __tablename__ = "active_sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    jwt_id = db.Column(db.String(255), unique=True, nullable=False)
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<ActiveSession {self.user_id}>"
