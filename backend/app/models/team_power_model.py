from app.extensions import db
from datetime import datetime


class TeamPower(db.Model):

    __tablename__ = "team_powers"

    id = db.Column(db.Integer, primary_key=True)

    team_id = db.Column(
        db.Integer,
        db.ForeignKey("teams.id"),
        nullable=False
    )

    week_number = db.Column(
        db.Integer,
        nullable=False
    )

    power_type = db.Column(
        db.String(20),
        nullable=False
    )
    # CURSE or SHIELD

    power_value = db.Column(
        db.Integer,
        nullable=False
    )
    # how strong the power is

    used_count = db.Column(
        db.Integer,
        default=0
    )

    max_usage = db.Column(
        db.Integer,
        nullable=False
    )

    granted_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )
