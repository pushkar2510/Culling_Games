from app.extensions import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)

    points = db.Column(db.Integer, nullable=False)

    is_bonus = db.Column(db.Boolean, default=False)
    is_one_time = db.Column(db.Boolean, default=False)

    is_active = db.Column(db.Boolean, default=True)

    week_number = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def __repr__(self):
        return f"<Task {self.name}>"