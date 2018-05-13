"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require('koa-router');
const router = new Router();
const logger = require('../common').logger();
const genesis_1 = require("./genesis");
const genesis = new genesis_1.default();
genesis.init();
const config = require('../common').config();
const endpointOk = async (ctx, next) => {
    // by default Koa returns 500, indicating the endpoint doesn't exist
    // so we set it to 200, but if there is an error then that will change it again
    if (!ctx.request.body)
        throw new Error('request missing request body');
    ctx.status = 200;
    await next();
};
var endPoints;
(function (endPoints) {
    endPoints["health_check"] = "/health";
    endPoints["attest"] = "/attest";
    endPoints["verify"] = "/verify";
    endPoints["token_create"] = "/producer/create";
    endPoints["token_destroy"] = "/producer/delete";
    endPoints["token_transfer"] = "/producer/list";
})(endPoints = exports.endPoints || (exports.endPoints = {}));
exports.addRoutes = (app) => {
    app.use(async function globalErrorHandler(ctx, next) {
        try {
            await next();
        }
        catch (err) {
            logger.error(err, `globalErrorHandler hit`);
            ctx.status = err.status || 500;
            ctx.body = { error: {
                    msg: err.msg || err.message,
                    code: err.code || 9999
                    // url: http://ourerrorcodeurl?err_code=(err.code||9999) .. TODO one day :)
                } };
        }
    });
    // GET /
    router.get('/', async (ctx) => {
        ctx.status = 200;
        ctx.body = {
            'name': 'Consensus 2018 API',
            'source_hash': process.env.GIT_HASH
        };
    });
    // GET /health
    // https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/#define-a-liveness-http-request
    router.get(endPoints.health_check, endpointOk);
    router.get(endPoints.attest, async (ctx) => {
        logger.info(`${endPoints.attest} `);
        ctx.status = 200;
    });
    router.get(endPoints.verify, genesis.verify.bind(genesis));
    // async (ctx:Context) => {
    // 	logger.info(`${endPoints.verify} `)
    // 	ctx.status = 200
    // 	ctx.body = {
    // 		'producerAddress': '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A',
    // 		'producerName': 'Andrew\'s Honey',
    // 		'claim': 'Produced in New York',
    // 		'score': 4.5
    // 	}
    // })
    app.use(router.routes()).use(router.allowedMethods());
};
//# sourceMappingURL=endpoints.js.map