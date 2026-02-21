from app.extensions import db
from datetime import datetime


class GameState(db.Model):

    __tablename__ = "game_state"

    id = db.Column(db.Integer, primary_key=True)

    is_active = db.Column(
        db.Boolean,
        default=False
    )
    # Game started or not

    is_paused = db.Column(
        db.Boolean,
        default=False
    )
    # Game paused temporarily

    registration_open = db.Column(
        db.Boolean,
        default=True
    )
    # Allow team registration

    current_week = db.Column(
        db.Integer,
        default=1
    )

    max_weeks = db.Column(
        db.Integer,
        default=4
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    updated_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )


    last_reset_at = db.Column(
    db.DateTime,
    nullable=True
)

