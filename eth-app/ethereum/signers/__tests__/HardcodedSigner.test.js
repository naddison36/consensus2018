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
var ethers_1 = require("ethers");
var HardcodedSigner_1 = require("../HardcodedSigner");
describe("Hardcoded Signer", function () {
    var signerFactory = new HardcodedSigner_1.default();
    var jsonRpcProviderURL = process.env.RPCPROVIDER || "http://localhost:8646"; // Geth or Parity
    var provider = new ethers_1.providers.JsonRpcProvider(jsonRpcProviderURL, "unspecified");
    var firstTestAccount = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A';
    var secondTestAccount = '0x1563915e194D8CfBA1943570603F7606A3115508';
    test("create wallet using known address", function () { return __awaiter(_this, void 0, void 0, function () {
        var signer, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, signerFactory.create(firstTestAccount, provider)];
                case 1:
                    signer = _b.sent();
                    _a = expect;
                    return [4 /*yield*/, signer.getAddress()];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toEqual(firstTestAccount);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Sign a transaction", function () { return __awaiter(_this, void 0, void 0, function () {
        var signer, testTransaction, rawTx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, signerFactory.create('0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A', jsonRpcProviderURL)];
                case 1:
                    signer = _a.sent();
                    testTransaction = {
                        chainId: 0,
                        from: firstTestAccount,
                        to: secondTestAccount,
                        nonce: 0,
                        gasPrice: 1000000000,
                        gasLimit: 2000000,
                        value: 1000000
                    };
                    return [4 /*yield*/, signer.sign(testTransaction)];
                case 2:
                    rawTx = _a.sent();
                    expect(rawTx).toEqual('0xf86780843b9aca00831e8480941563915e194d8cfba1943570603f7606a3115508830f4240801ba0b41f7d303b26e50b712a286803b080b29814060fd052d08f07ed5585fd52ec2ca06c277aeb2a7fb379689c7fe484d70cc9f6aadf810237966ac9960e477209484c');
                    return [2 /*return*/];
            }
        });
    }); });
});
