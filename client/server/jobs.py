__author__ = 'rcj1492'
__created__ = '2018.05'
__license__ = '©2018 Collective Acuity'

job_list = [
    {
        "id": "monitors.running",
        "function": "init:app.logger.info",
        "kwargs": { "msg": "Monitors are running..." },
        "interval": 60
    }
]