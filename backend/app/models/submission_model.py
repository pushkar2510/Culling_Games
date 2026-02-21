from app.extensions import db
from datetime import datetime

class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)

    team_id = db.Column(
        db.Integer,
        db.ForeignKey("teams.id", ondelete="CASCADE"),
        nullable=False
    )

    task_id = db.Column(
        db.Integer,
        db.ForeignKey("tasks.id"),
        nullable=False
    )

    proof_url = db.Column(db.Text, nullable=False)
    proof_type = db.Column(db.String(50), nullable=True)  # pdf, image, link

    description = db.Column(db.Text, nullable=True)

    week_number = db.Column(db.Integer, nullable=False)

    status = db.Column(
        db.String(50),
        default="PENDING"
    )

    verified_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    approved_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    points_awarded = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Submission Team {self.team_id} Task {self.task_id}>"
