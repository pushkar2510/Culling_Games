from app import create_app
from app.services.scheduler import start_scheduler

app = create_app()

with app.app_context():
    start_scheduler(app)

# Keep process alive
import time
while True:
    time.sleep(60)
