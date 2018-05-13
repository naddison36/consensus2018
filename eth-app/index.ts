
// Platform entry point

export {} // typescript fix for top-level script (non-module) : see : https://stackoverflow.com/a/41975448/8749874


const config = require('./common').config()
const logger = require('./common').logger()

let port: number

if (!config) {
	const error = new Error(`config not available, check that app/config/${process.env.NODE_ENV}.yaml exists, and that you are running from the app folder`)
	logger.emerg(error)
	throw error
} else if (config && config.hasOwnProperty('api') && config.api.hasOwnProperty('port')) {
	port = config.api.port
} else {
	const error = new Error(`api.port has not been configured in the ${process.env.NODE_ENV} config file or NODE_CONFIG environment variable`)
	logger.emerg(error)
	throw error
}

const API = require('./api/endpoints')

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const app = new Koa()

app.use(bodyParser())

API.addRoutes(app)

app.listen(port)

logger.info(`Running as ${process.env.NODE_ENV || 'development'} on port ${port}`)

