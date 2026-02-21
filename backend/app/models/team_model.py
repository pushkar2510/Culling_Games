from app.extensions import db
from datetime import datetime

class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.Integer, primary_key=True)

    team_name = db.Column(db.String(150), nullable=False)

    leader_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    coordinator_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    total_points = db.Column(db.Integer, default=0)
    weekly_points = db.Column(db.Integer, default=0)
    week_number = db.Column(db.Integer, default=1)
    weekly_cap_reached = db.Column(db.Boolean, default=False)

    is_disqualified = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
