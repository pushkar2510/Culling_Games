from app.extensions import db
from datetime import datetime


class PowerUsageLog(db.Model):

    __tablename__ = "power_usage_logs"

    id = db.Column(db.Integer, primary_key=True)

    power_id = db.Column(
        db.Integer,
        db.ForeignKey("team_powers.id"),
        nullable=False
    )

    attacker_team_id = db.Column(
        db.Integer,
        db.ForeignKey("teams.id"),
        nullable=False
    )

    target_team_id = db.Column(
        db.Integer,
        db.ForeignKey("teams.id"),
        nullable=False
    )

    week_number = db.Column(
        db.Integer,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )
