# originsClient
_A Web Service using Flask & APScheduler on Alpine & Gunicorn inside Docker_  
**by [Collective Acuity](http://collectiveacuity.com)**

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
1. Install Docker on Local Device
2. Install Git on Local Device
3. Clone/Fork Repository from Version Control service
4. **[Optional]** Install Python Module `pip3 install pocketlab` & run `lab init origins`
5. Create a /cred Folder in Root to Store Tokens
6. Create a /data Folder in Root to Store DB Files
7. **[Optional]** Create a New Private Remote Repository
8. Copy AWS IAM credentials for AWS Polly to /cred/aws-polly.yaml
