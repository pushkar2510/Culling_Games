from app.extensions import db


class WeekConfig(db.Model):

    __tablename__ = "week_config"

    week_number = db.Column(
        db.Integer,
        primary_key=True
    )

    curse_power = db.Column(
        db.Integer,
        nullable=False
    )

    shield_power = db.Column(
        db.Integer,
        nullable=False
    )

    weekly_cap = db.Column(
        db.Integer,
        default=30
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )
