from apscheduler.schedulers.background import BackgroundScheduler

scheduler = None

def start_scheduler(app):

    global scheduler

    if scheduler:
        return

    from app.services.weekly_reset_service import weekly_reset

    scheduler = BackgroundScheduler()

    scheduler.add_job(
        func=lambda: weekly_reset(),
        trigger="cron",
        day_of_week="mon",
        hour=0,
        minute=0
    )

    scheduler.start()

    app.logger.info("Scheduler started successfully")
