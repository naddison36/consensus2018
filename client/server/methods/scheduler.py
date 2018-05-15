__author__ = 'rcj1492'
__created__ = '2018.05'
__license__ = '©2018 Collective Acuity'

def config_scheduler(scheduler_settings=None):

# validate input
    if not scheduler_settings:
        scheduler_settings = {}
    elif not isinstance(scheduler_settings, dict):
        raise TypeError('Scheduler settings must be a dictionary.')

# construct default configuration
    scheduler_configs = {}

# retrieve job store credentials
    job_store_on = False
    job_store_settings = []
    job_store_login_names = []
    job_store_login_keys = ['user', 'pass', 'host', 'port']
    for key in job_store_login_keys:
        key_name = 'scheduler_job_store_%s' % key
        job_store_login_names.append(key_name)
        scheduler_setting = scheduler_settings.get(key_name, None)
        if scheduler_setting:
            job_store_settings.append(scheduler_settings)
            job_store_on = True

# add job store to scheduler
    if job_store_on:
        if len(job_store_settings) != len(job_store_login_keys):
            raise IndexError('Initialization of the scheduler job store requires values for all %s login fields.' % job_store_login_names)
        from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
        job_store_url = 'postgresql://%s:%s@%s:%s' % (job_store_settings[0], job_store_settings[1], job_store_settings[2], job_store_settings[3])
        postgresql_store = SQLAlchemyJobStore(url=job_store_url)
        jobstore_settings = { 'default': postgresql_store }
        scheduler_configs['SCHEDULER_JOBSTORES'] = jobstore_settings

# adjust job default settings
    scheduler_job_defaults = {}
    default_coalesce = scheduler_settings.get('scheduler_job_defaults_coalesce', False)
    max_instances = scheduler_settings.get('scheduler_job_defaults_max_instances', 0)
    if default_coalesce:
        scheduler_job_defaults['coalesce'] = True
    if max_instances:
        scheduler_job_defaults['max_instances'] = max_instances
    if scheduler_job_defaults:
        scheduler_configs['SCHEDULER_JOB_DEFAULTS'] = scheduler_job_defaults

# adjust executor settings
#     scheduler_executors = {}
#     if scheduler_settings['scheduler_executors_type']:
#         scheduler_executors['type'] = scheduler_settings['scheduler_executors_type']
#     if scheduler_settings['scheduler_executors_max_workers']:
#         scheduler_executors['max_workers'] = scheduler_settings['scheduler_executors_max_workers']
#     if scheduler_executors:
#         scheduler_configs['SCHEDULER_EXECUTORS'] = scheduler_executors

    return scheduler_configs

if __name__ == '__main__':

# test config scheduler
    import os
    os.environ['SCHEDULER_JOB_STORE_PASS'] = 'test_pass'
    model_path = '../models/scheduler-model.json'
    from labpack.records.settings import load_settings, ingest_environ
    settings_model = load_settings(model_path)
    assert settings_model['schema']['scheduler_job_store_user'] == 'postgres'
    env_settings = ingest_environ(model_path)
    assert env_settings['scheduler_job_store_pass'] == 'test_pass'
    example_settings = settings_model['schema']
    scheduler_config = config_scheduler(example_settings)
    assert scheduler_config['SCHEDULER_JOB_DEFAULTS']['coalesce']