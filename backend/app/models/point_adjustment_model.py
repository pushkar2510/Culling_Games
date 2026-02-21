from app.extensions import db
from datetime import datetime

class PointAdjustment(db.Model):
    __tablename__ = "point_adjustments"

    id = db.Column(db.Integer, primary_key=True)

    team_id = db.Column(
        db.Integer,
        db.ForeignKey("teams.id"),
        nullable=False
    )

    points_changed = db.Column(db.Integer, nullable=False)

    reason = db.Column(db.Text, nullable=False)

    adjusted_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    week_number = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    proof_url = db.Column(db.Text, nullable=True)


    def __repr__(self):
        return f"<PointAdjustment Team {self.team_id} Change {self.points_changed}>"
