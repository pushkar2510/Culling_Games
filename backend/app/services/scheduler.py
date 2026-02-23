# Scheduling has been moved to Firebase Cloud Functions.
# See firebase/functions/ for the weekly reset Cloud Function.
#
# This file is kept as a stub for backwards compatibility.

def start_scheduler(app):
    """No-op: APScheduler removed. Weekly resets handled by Firebase Cloud Functions."""
    app.logger.info(
        "Scheduler stub called — weekly reset is managed by Firebase Cloud Functions."
    )

