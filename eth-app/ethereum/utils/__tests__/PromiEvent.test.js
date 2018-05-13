"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var PromiEvent_1 = require("../PromiEvent");
describe("PromiEvent", function () {
    test("setTimeout resolve", function () { return __awaiter(_this, void 0, void 0, function () {
        var promiEvent, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(2);
                    promiEvent = new PromiEvent_1.default(function (resolve, reject) {
                        setTimeout(function () {
                            promiEvent.emit('done', 'Done!');
                            resolve('Hello!');
                            // reject('Reject!')
                        }, 100);
                    });
                    promiEvent.on('done', function (param) {
                        expect(param).toEqual('Done!');
                    });
                    return [4 /*yield*/, promiEvent];
                case 1:
                    result = _a.sent();
                    expect(result).toEqual('Hello!');
                    return [2 /*return*/];
            }
        });
    }); }, 2000);
    test("setTimeout reject", function () { return __awaiter(_this, void 0, void 0, function () {
        var promiEvent, result, reason_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(2);
                    promiEvent = new PromiEvent_1.default(function (resolve, reject) {
                        setTimeout(function () {
                            promiEvent.emit('done', 'Done!');
                            reject('Reject!');
                        }, 100);
                    });
                    promiEvent.on('done', function (param) {
                        expect(param).toEqual('Done!');
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, promiEvent];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    reason_1 = _a.sent();
                    expect(reason_1).toEqual('Reject!');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, 2000);
    describe("setInterval", function () {
        var promiEvent;
        beforeEach(function () {
            promiEvent = new PromiEvent_1.default(function (resolve, reject) {
                var counter = 0;
                var timer = setInterval(function () {
                    counter++;
                    promiEvent.emit('interval', counter);
                    if (counter === 1) {
                        promiEvent.emit('first', counter);
                        resolve(counter);
                    }
                    if (counter === 10) {
                        promiEvent.emit('last', counter);
                        resolve(counter);
                        // stop the timer
                        clearInterval(timer);
                    }
                }, 100);
            });
        });
        test("interval", function (done) {
            var eventCount = 0;
            promiEvent.on('interval', function (count) {
                eventCount++;
                expect(count).toEqual(eventCount);
                if (eventCount === 10) {
                    done();
                }
            });
        }, 5000);
        test("first", function (done) {
            promiEvent.on('first', function (count) {
                expect(count).toEqual(1);
                done();
            });
        }, 5000);
        test("first2", function (done) {
            promiEvent.on('first', function (count) {
                expect(count).toEqual(1);
                done();
            });
        }, 5000);
        test("last", function (done) {
            promiEvent.on('last', function (count) {
                expect(count).toEqual(10);
                done();
            });
        }, 5000);
    });
});
