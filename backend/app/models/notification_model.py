from app.extensions import db
from datetime import datetime

class Notification(db.Model):

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(255), nullable=False)

    message = db.Column(db.Text, nullable=False)

    type = db.Column(db.String(50), nullable=False)
    # GENERAL, BONUS_TASK, GUIDE, ALERT

    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    is_active = db.Column(db.Boolean, default=True)
