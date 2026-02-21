from app.extensions import db
from datetime import datetime


class Query(db.Model):

    __tablename__ = "queries"

    id = db.Column(db.Integer, primary_key=True)

    team_id = db.Column(
        db.Integer,
        db.ForeignKey("teams.id"),
        nullable=False
    )

    question = db.Column(
        db.Text,
        nullable=False
    )

    response = db.Column(
        db.Text,
        nullable=True
    )

    responded_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    responded_at = db.Column(
        db.DateTime,
        nullable=True
    )

    status = db.Column(
        db.String(20),
        default="OPEN"
    )
