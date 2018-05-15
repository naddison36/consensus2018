# flaskAPI 
_A RESTful API using Flask & APScheduler on Alpine & Gunicorn inside Docker_  
**by [Collective Acuity](http://collectiveacuity.com)**

## Features
- REST API architecture
- Auto-generated API endpoints
- Auto-generated API documentation
- Permission control using JWT
- APScheduler support
- WebClient framework
- REST API Client
- Configuration by Environmental Variables
- Lean Footprint

## Requirements
- Python and C dependencies listed in Dockerfile

## Components
- Alpine Edge (OS)
- Python 3.6.3 (Environment)
- Gunicorn 19.4.5 (Server)
- Flask 0.11.1 (Framework)
- APScheduler 3.2.0 (Scheduler)
- Gevent 1.1.2 (Thread Manager)
- SQLAlchemy 1.1.1 (Database ORM)

## Dev Env
- Docker (Provisioning)
- BitBucket (Version Control)
- Postgres (JobStore Database)
- PyCharm (IDE)
- Dropbox (Sync, Backup)

## Languages
- Python 3.6

## Setup DevEnv
1. Install Docker Toolbox on Local Device
2. Install Git on Local Device
3. Clone/Fork Repository from Version Control service
4. Create a /cred Folder in Root to Sensitive Store Tokens
5. **[Optional]** Create a New Private Remote Repository

## Server Sub-Folders
-- _assets/_ (sub-folder for common design elements) 
-- _models/_ (sub-folder for data object model declarations)
-- _public/_ (sub-folder for public accessible application content)
-- _views/_ (sub-folder for jinja html templates)  

## Scheduler Configuration
By default, the scheduler uses a gevent process to manage threads and jobs will be stored in local memory. The launch script checks for new configuration settings in the environmental variables. Any of the following settings can be adjusted (case-insensitive):

- scheduler_job_store_user: postgres
- scheduler_job_store_pass: password
- scheduler_job_store_host: 192.168.99.100
- scheduler_job_store_port: 5432
- scheduler_job_defaults_coalesce: true
- scheduler_job_defaults_max_instances: 1

A copy of the scheduler.yaml file is included in the notes folder. If you are using the pocketLab management tool, lab init will automatically copy the placeholder values to cred/scheduler.yaml. Further details about the different settings can be found with the [Apscheduler Documentation](https://apscheduler.readthedocs.io/en/latest/index.html)
 
## Launch Commands

## Collaboration Notes
_The Git and Docker repos contain all the configuration information required for collaboration except access tokens. To synchronize access tokens across multiple devices, platforms and users without losing local control, you can use LastPass, an encrypted email platform such as ProtonMail or smoke signals. If you use any AWS services, use AWS IAM to assign user permissions and create keys for each collaborator individually. Collaborators are required to install all service dependencies on their local device if they wish to test code on their localhost. A collaborate should always **FORK** the repo from the main master and fetch changes from the upstream repo so reality is controlled by one admin responsible for approving all changes. New dependencies should be added to the Dockerfile, **NOT** to the repo files. Collaborators should test changes to Dockerfile locally before making a pull request to merge any new dependencies:_  

```
docker build -t test-image .
```

_.gitignore and .dockerignore have already been installed in key locations. To prevent unintended file proliferation through version control & provisioning, add/edit .gitignore and .dockerignore to include all new:_  

1. local environments folders
2. localhost dependencies
3. configuration files with credentials and local variables