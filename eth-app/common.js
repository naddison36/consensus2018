// Configuration

if (!process.env.hasOwnProperty("NODE_ENV")) {
    console.warn(`Environment variable NODE_ENV has not been explicitly set. Defaulting to "development"`)
}

const node_env = process.env.NODE_ENV || 'development'

console.log(`Using ${node_env} environment configuration`)

const config = require('config');

exports.config = function()
{
    return config
}

// Logger

const winston = require('winston')

const logLevel = process.env.LOG_LEVEL || 'info'

const loggingOptions = {
    exitOnError: false,
    levels: winston.config.syslog.levels,
    level: logLevel,
    transports: [
        new winston.transports.Console()
    ]
}

console.log(`Starting logger at level "${logLevel}" of ${JSON.stringify(loggingOptions.levels)}`)

exports.logger = function()
{
    return new winston.Logger(loggingOptions);
}

// NB: To run the app in production mode :  $ NODE_ENV=production node app.js
