from app import create_app

app = create_app()

# Weekly resets are handled by Firebase Cloud Functions.
# This file is kept for backwards compatibility with Heroku-style clock dynos.
# No APScheduler is started here.

