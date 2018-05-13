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
var BaseContract_1 = require("./BaseContract");
/**
 * A client side wrapper for the RemittanceToken smart contract
 */
var GenesisContract = /** @class */ (function (_super) {
    __extends(GenesisContract, _super);
    function GenesisContract(overrideOptions) {
        var _this = this;
        var options = Object.assign({}, {
            contractName: "Genesis",
            compilerOutputFolder: process.cwd() + "/ethereum/ABIs/"
        }, overrideOptions);
        _this = _super.call(this, options) || this;
        return _this;
    }
    GenesisContract.prototype.deploy = function (signer, overrideSendOptions) {
        if (overrideSendOptions === void 0) { overrideSendOptions = {}; }
        var sendOptions = Object.assign({}, this.defaultSendOptions, {
            gasPrice: 1000000000,
            gasLimit: 2000000
        }, overrideSendOptions);
        return _super.prototype.deploy.call(this, signer, undefined, sendOptions);
    };
    // function createClaim( address p, Claim c )
    GenesisContract.prototype.createClaim = function (signer, description, sendOptions) {
        if (sendOptions === void 0) { sendOptions = { gasLimit: 4000000 }; }
        return _super.prototype.send.call(this, "createNewClaim", signer, sendOptions, description);
    };
    // createProducer( Producer p )
    GenesisContract.prototype.createProducer = function (signer, producerAddress, producerName, sendOptions) {
        return _super.prototype.send.call(this, "createNewProducer", signer, sendOptions, producerAddress, producerName);
    };
    // makeAttestation ( address attestor, address producer, uint claim, uint rating )
    GenesisContract.prototype.makeAttestation = function (signer, attestorAddress, producerAddress, claim, rating, sendOptions) {
        return _super.prototype.send.call(this, "makeAttestation", signer, sendOptions, attestorAddress, producerAddress, claim, rating);
    };
    //validate( address p, uint claimID, Validation v )
    GenesisContract.prototype.validateClaim = function (consumerSigner, producerAddress, claimId, score, sendOptions) {
        if (sendOptions === void 0) { sendOptions = { gasLimit: 4000000 }; }
        return _super.prototype.send.call(this, "validateClaim", consumerSigner, sendOptions, producerAddress, claimId, score);
    };
    return GenesisContract;
}(BaseContract_1.default));
exports.default = GenesisContract;
