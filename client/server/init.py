__author__ = 'rcj1492'
__created__ = '2018.05'
__license__ = '©2018 Collective Acuity'

# retrieve system environment
from os import environ
system_environment = environ.get('SYSTEM_ENVIRONMENT', 'dev')

# retrieve credentials
from labpack.records.settings import load_settings
flask_config = load_settings('../cred/flask.yaml')
postgres_config = load_settings('../cred/aws-postgres.yaml')
polly_config = load_settings('../cred/aws-polly.yaml')
scheduler_config = {}
# scheduler_config = load_settings('../cred/scheduler.yaml')
# mailgun_config = load_settings('../cred/mailgun.yaml')

# construct postgres database url
postgres_url = ''
if postgres_config['aws_postgres_username']:
    postgres_url = 'postgres://%s:%s@%s:%s/%s' % (
    postgres_config['aws_postgres_username'],
    postgres_config['aws_postgres_password'],
    postgres_config['aws_postgres_hostname'],
    postgres_config['aws_postgres_port'],
    postgres_config['aws_postgres_dbname']
)

# TODO construct cassandra database url and ssl cert

# construct flask app object
from flask import Flask
flask_kwargs = {
    'import_name': __name__,
    'static_folder': 'public',
    'template_folder': 'views'
}
app = Flask(**flask_kwargs)

# define flask environments
class flaskDev(object):
    LAB_SECRET_KEY = flask_config['flask_secret_key']
    LAB_SERVER_PROTOCOL = 'http'
    LAB_SERVER_DOMAIN = 'localhost'
    LAB_SERVER_PORT = 5001
    LAB_SERVER_LOGGING = 'DEBUG'
    LAB_SQL_SERVER = 'sqlite:///../data/records.db'
    LAB_CASSANDRA_SERVER = ''
    UGLIFYJS_EXTRA_ARGS = [ '-m' ]
class flaskProd(object):
    LAB_SECRET_KEY = flask_config['flask_secret_key']
    LAB_SERVER_PROTOCOL = 'https'
    LAB_SERVER_DOMAIN = 'api.collectiveacuity.com'
    LAB_SERVER_PORT = 5001
    LAB_SERVER_LOGGING = 'INFO'
    LAB_SQL_SERVER = 'sqlite:///../data/records.db' # add database to live postgres in production
    LAB_CASSANDRA_SERVER = '' # create keyspace in live cassandra in production
    UGLIFYJS_EXTRA_ARGS = [ '-m' ]

# select flask config from system environment
if system_environment == 'dev':
    app.config.from_object(flaskDev)
else:
    app.config.from_object(flaskProd)
    
# initialize logging and debugging
import sys
import logging
app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.DEBUG)
app.config['ASSETS_DEBUG'] = False

# construct sql tables
sql_tables = None
# from labpack.databases.sql import sqlClient
# sql_tables = {
#     'settings': sqlClient('settings', app.config['LAB_SQL_SERVER'], load_settings('models/sql/settings.json'))
# }

# retrieve producers and attesters
producers_map = load_settings('models/producers.json')
attesters_map = load_settings('models/attesters.json')

# TODO construct cassandra tables

# TODO auto-generate construct api models
api_model = load_settings('models/api-model.json')

# construct speech client
from labpack.speech.aws.polly import pollyClient
polly_kwargs = {
    'access_id': polly_config['aws_polly_access_key_id'],
    'secret_key': polly_config['aws_polly_secret_access_key'],
    'region_name': polly_config['aws_polly_default_region'],
    'owner_id': str(polly_config['aws_polly_owner_id']),
    'user_name': polly_config['aws_polly_user_name']
}
speech_client = pollyClient(**polly_kwargs)

# construct scheduler object (with gevent processor)
from flask_apscheduler import APScheduler
from apscheduler.schedulers.gevent import GeventScheduler
gevent_scheduler = GeventScheduler()
scheduler = APScheduler(scheduler=gevent_scheduler)

# construct default scheduler configurations
from time import time
scheduler_configuration = {
    'SCHEDULER_JOBS': [ {
        'id': 'scheduler.debug.%s' % str(time()),
        'func': 'init:app.logger.debug',
        'kwargs': { 'msg': 'Scheduler has started.' },
        'misfire_grace_time': 5,
        'max_instances': 1,
        'replace_existing': False,
        'coalesce': True
    } ],
    'SCHEDULER_TIMEZONE': 'UTC',
    'SCHEDULER_VIEWS_ENABLED': True
}

# adjust scheduler configuration settings
from server.methods.scheduler import config_scheduler
scheduler_configuration.update(config_scheduler(scheduler_config))

# add jobs to pre-scheduled jobs
from server.jobs import job_list
from labpack.platforms.apscheduler import apschedulerClient
scheduler_client = apschedulerClient('http://localhost:5001')
for job in job_list:
    job_fields = scheduler_client._construct_fields(**job)
    standard_fields = {
        'misfire_grace_time': 5,
        'max_instances': 1,
        'replace_existing': True,
        'coalesce': True
    }
    job_fields.update(**standard_fields)
    scheduler_configuration['SCHEDULER_JOBS'].append(job_fields)

# add schedule fields to app configurations
app.config.update(**scheduler_configuration)