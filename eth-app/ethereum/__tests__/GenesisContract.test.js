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
var GenesisContract_1 = require("../GenesisContract");
var HardcodedSigner_1 = require("../signers/HardcodedSigner");
var contractOwnerAddress = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
var firstProducerAddress = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A';
var secondProducerAddress = '0x1563915e194D8CfBA1943570603F7606A3115508';
var consumer1Address = '0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB';
var consumer2Address = '0x7564105E977516C53bE337314c7E53838967bDaC';
var consumer3Address = '0xe1fAE9b4fAB2F5726677ECfA912d96b0B683e6a9';
var consumer4Address = '0xdb2430B4e9AC14be6554d3942822BE74811A1AF9';
var providerUrl = process.env.RPC_PROVIDER_URL || 'http://localhost:8545';
var provider = new ethers_1.providers.JsonRpcProvider(providerUrl, "unspecified");
var signerFactory = new HardcodedSigner_1.default();
var genesisContract = new GenesisContract_1.default();
var contractOwnerSigner;
var firstProducerSigner;
var secondProducerSigner;
var consumer1Signer;
var consumer2Signer;
var consumer3Signer;
var consumer4Signer;
describe("GenesisContract", function () {
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, signerFactory.create(contractOwnerAddress, provider)];
                case 1:
                    contractOwnerSigner = _a.sent();
                    return [4 /*yield*/, signerFactory.create(firstProducerAddress, provider)];
                case 2:
                    firstProducerSigner = _a.sent();
                    return [4 /*yield*/, signerFactory.create(secondProducerAddress, provider)];
                case 3:
                    secondProducerSigner = _a.sent();
                    return [4 /*yield*/, signerFactory.create(consumer1Address, provider)];
                case 4:
                    consumer1Signer = _a.sent();
                    return [4 /*yield*/, signerFactory.create(consumer1Address, provider)];
                case 5:
                    consumer2Signer = _a.sent();
                    return [4 /*yield*/, signerFactory.create(consumer1Address, provider)];
                case 6:
                    consumer3Signer = _a.sent();
                    return [4 /*yield*/, signerFactory.create(consumer1Address, provider)];
                case 7:
                    consumer4Signer = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("deploy", function () { return __awaiter(_this, void 0, void 0, function () {
        var txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, genesisContract.deploy(contractOwnerSigner)];
                case 1:
                    txReceipt = _a.sent();
                    expect(txReceipt.status).toEqual(1);
                    console.log(txReceipt.contractAddress);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Create producers", function () { return __awaiter(_this, void 0, void 0, function () {
        var txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, genesisContract.createProducer(firstProducerSigner, firstProducerAddress, "Andrew's Honey")];
                case 1:
                    txReceipt = _a.sent();
                    expect(txReceipt.status).toEqual(1);
                    return [2 /*return*/];
            }
        });
    }); }, 20000);
    test("Add Claims", function () { return __awaiter(_this, void 0, void 0, function () {
        var txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, genesisContract.createClaim(firstProducerSigner, "Produced in New York")];
                case 1:
                    txReceipt = _a.sent();
                    expect(txReceipt.status).toEqual(1);
                    return [2 /*return*/];
            }
        });
    }); }, 20000);
    test("Validation", function () { return __awaiter(_this, void 0, void 0, function () {
        var txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, genesisContract.validateClaim(consumer1Signer, firstProducerAddress, 0, 5)];
                case 1:
                    txReceipt = _a.sent();
                    expect(txReceipt.status).toEqual(1);
                    return [2 /*return*/];
            }
        });
    }); }, 20000);
});
