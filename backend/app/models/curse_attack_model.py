from app.extensions import db
from datetime import datetime


class CurseAttack(db.Model):

    __tablename__ = "curse_attacks"

    id = db.Column(db.Integer, primary_key=True)

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

    power_value = db.Column(
        db.Integer,
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
