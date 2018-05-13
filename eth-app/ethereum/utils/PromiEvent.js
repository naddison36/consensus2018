"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
/**
 * Creates a promise that also emits events
 * This has been based off Web3 1.0 PromiEvent https://web3js.readthedocs.io/en/1.0/callbacks-promises-events.html
 * The JS implementation of the Web3 1.0 PromiEvent https://github.com/ethereum/web3.js/blob/1.0/packages/web3-core-promievent/src/index.js
 * The usage of the Web3 1.0 PromiEvent https://github.com/ethereum/web3.js/tree/1.0/packages/web3-core-promievent
 *
 * The following is a TypeScript implementation of the Web3 1.0 PromiEvent
 * The implementation also got inspiration from https://github.com/Microsoft/TypeScript/issues/15202#issuecomment-318900991
 */
var PromiEvent = /** @class */ (function (_super) {
    __extends(PromiEvent, _super);
    // Have the same constructor as a Promise
    function PromiEvent(executor) {
        var _this = 
        // call the EventEmitter constructor
        _super.call(this) || this;
        _this.promise = new Promise(executor);
        return _this;
    }
    // the same signature as Promise.then
    PromiEvent.prototype.then = function (onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    };
    // the same signature as Promise.catch
    PromiEvent.prototype.catch = function (onRejected) {
        return this.promise.catch(onRejected);
    };
    // used if you want to create a PromiEvent for a known value
    PromiEvent.resolve = function (value) {
        return new PromiEvent(function (resolve) {
            resolve(value);
        });
    };
    PromiEvent.reject = function (reason) {
        return new PromiEvent(function (resolve, reject) {
            reject(reason);
        });
    };
    return PromiEvent;
}(events_1.EventEmitter));
exports.default = PromiEvent;
