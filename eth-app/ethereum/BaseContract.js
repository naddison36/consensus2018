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
Object.defineProperty(exports, "__esModule", { value: true });
var VError = require("verror");
var fs_1 = require("fs");
var BN = require("bn.js");
var ethers_1 = require("ethers");
var PromiEvent_1 = require("./utils/PromiEvent");
var debug = require('debug')('eth-contract');
var defaultConstructorOptions = {
    defaultSendOptions: {
        gasPrice: 1000000000,
        gasLimit: 120000
    },
    compilerOutputFolder: process.cwd() + '/bin/contracts/',
    noGasPrice: false,
    decimalMultiplier: new BN(1),
    decimalProperties: []
};
var BaseContract = /** @class */ (function () {
    function BaseContract(options) {
        this.networkName = 'unspecified';
        this.compilerOutputFolder = process.cwd() + '/bin/contracts/';
        this.defaultSendOptions = {
            gasPrice: 1000000000,
            gasLimit: 1200000
        };
        this.noGasPrice = false;
        this.decimals = 0;
        this.decimalMultiplier = new BN(1);
        this.decimalProperties = [];
        this.bigNumberFunction = BN;
        this.confirmations = 1;
        // set constructor options
        Object.assign(this, defaultConstructorOptions, options);
        if (!this.transactionsProvider) {
            if (options.networkName) {
                this.transactionsProvider = ethers_1.providers.getDefaultProvider(this.networkName);
                debug("No transactionProvider option so used default Ethers.js provider connected to the " + this.transactionsProvider.name + " network with " + this.transactionsProvider.chainId + " chain id");
            }
            else {
                var providerUrl = options.rpc_url || "http://localhost:8545";
                debug("About to connect to JSON RPC HTTP endpoint " + providerUrl);
                this.transactionsProvider = new ethers_1.providers.JsonRpcProvider(providerUrl, this.networkName);
                debug("No transactionProvider option so used JSON RPC provider with url " + providerUrl + ", network " + this.transactionsProvider.name + " and chain id " + this.transactionsProvider.chainId);
            }
        }
        if (!this.eventsProvider) {
            this.eventsProvider = this.transactionsProvider;
        }
        if (this.contractName) {
            if (!this.abiInterface) {
                this.abiInterface = BaseContract.loadAbiInterfaceFromFile(this.compilerOutputFolder, this.contractName);
            }
        }
        if (options.contractAddress && this.abiInterface) {
            this.contract = new ethers_1.Contract(options.contractAddress, this.abiInterface, this.transactionsProvider);
        }
        if (options.decimals) {
            this.setDecimals(options.decimals);
        }
        if (options.pollingInterval) {
            this.setPollingInterval(options.pollingInterval);
        }
    }
    /**
     * deploys a new the contract to the chain using the following steps
     * 1. Creates a deploy transaction with parameters in callParams
     * 2. Signs the transaction using the signer
     * 3. Sends the signed transaction to the transaction provider
     * 4. Receives a transaction hash and emits the hash in the 'hash' event
     * 5. Waits for the transaction to be mined and emits the MinedTransaction in a 'mined' event
     * 6. Gets the transaction receipt and emits the TransactionReceipt in a 'receipt' event
     * 7. Checks the status of the transaction receipt and rejects the promise if the transaction failed
     * 8. Sets this.contract to the instance of the newly deployed contract
     *
     * @param {Signer} signer Ethers.js customer signer used to sign the deploy transaction
     * @param {SendOptions} overrideSendOptions Overrides the default send options. eg gasPrice and gasLimit
     * @param contractConstructorParams Optionals constructor parameters for the contract
     * @returns {PromiEvent<TransactionReceipt>} A promise that resolves a transaction receipt. The following events are also emitted 'hash', 'mined' and 'receipt'
     */
    BaseContract.prototype.deploy = function (signer, contractBinary, overrideSendOptions) {
        var _this = this;
        var contractConstructorParams = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            contractConstructorParams[_i - 3] = arguments[_i];
        }
        var sendOptions = this.constructSendOptions(overrideSendOptions);
        var description = "deploy contract with params " + contractConstructorParams.toString();
        var promiEvent = new PromiEvent_1.default(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var error, error, transactionData, transactionReceipt, err_1, errorMessage, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!signer) {
                            error = new Error("deploy function must pass a signer of type Signer as the first parameter so can not " + description);
                            debug(error.stack);
                            return [2 /*return*/, reject(error)];
                        }
                        if (!contractBinary) {
                            if (!this.contractName) {
                                error = new Error("Failed " + description + ": no contractBinary passed and contract name has not been set so can not load the contract binary from the file system");
                                debug(error.stack);
                                return [2 /*return*/, reject(error)];
                            }
                            else {
                                contractBinary = BaseContract.loadBinaryFromFile(this.compilerOutputFolder, this.contractName);
                            }
                        }
                        this.contractOwner = signer;
                        transactionData = ethers_1.Contract.getDeployTransaction.apply(ethers_1.Contract, [contractBinary, this.abiInterface].concat(contractConstructorParams));
                        debug("Deploy contract data: " + transactionData.data);
                        // need to async await so the promiEvent can be passed into the processTransaction function
                        return [4 /*yield*/, Promise.resolve()];
                    case 1:
                        // need to async await so the promiEvent can be passed into the processTransaction function
                        _a.sent();
                        return [4 /*yield*/, this.processTransaction(signer, description, transactionData, sendOptions, promiEvent)];
                    case 2:
                        transactionReceipt = _a.sent();
                        this.contract = new ethers_1.Contract(transactionReceipt.contractAddress, this.abiInterface, signer);
                        debug(this.contract.address + " created from " + description);
                        resolve(transactionReceipt);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        errorMessage = "Failed to " + description;
                        if (err_1.message === 'invalid json response') {
                            errorMessage = errorMessage + " invalid response: " + err_1.responseText;
                        }
                        error = new VError(err_1, errorMessage);
                        debug(error.stack);
                        reject(error);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return promiEvent;
    };
    /**
     * Sends a transaction to the chain using the following steps:
     * 1. Creates a transaction calling the functionName on the smart contract with callParams
     * 2. Get the address from the signer
     * 2. Signs the transaction using the signer
     * 3. Sends the signed transaction to the transaction provider
     * 4. Receives a transaction hash and emits the hash in the 'hash' event
     * 5. Waits for the transaction to be mined and emits the MinedTransaction in a 'mined' event
     * 6. Gets the transaction receipt and emits the TransactionReceipt in a 'receipt' event
     * 7. Checks the status of the transaction receipt and rejects the promise if the transaction failed
     * 8. Decodes the abi-encoded events in the transaction receipt and emits an event for each event in the tx receipt
     * 9. if the transaction was successful, resolves the promise with the transaction receipt with events as a properties
     *
     * @param {string} functionName Name of function to be called on the Application Binary Interface (ABI)
     * @param {Signer} signer Ethers.js customer signer used to sign the transaction
     * @param {SendOptions} overrideSendOptions Overrides the default send options. eg gasPrice, gasLimit and value in wei
     * @param callParams Parameters of function to be called on the Application Binary Interface (ABI)
     * @returns {PromiEvent<TransactionReceiptWithEvents>} a Promise that resolves a transaction receipt with parsed events. The following events are also emitted 'hash', 'mined', 'receipt' and any tx events
     */
    BaseContract.prototype.send = function (functionName, signer, overrideSendOptions) {
        var _this = this;
        var callParams = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            callParams[_i - 3] = arguments[_i];
        }
        var sendOptions = this.constructSendOptions(overrideSendOptions);
        var description = "get signer address";
        var promiEvent = new PromiEvent_1.default(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var contract, call, callTransactionData, transactionReceipt, err_2, errorMessage, error, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        contract = void 0;
                        if (!this.contract) {
                            throw Error("Contract has not been deployed or instantiated from contract address and JSON interface");
                        }
                        // If a signer was passed
                        // TODO check the signer is of the correct type. ie a Signer
                        if (signer) {
                            // check if the signer is not the same as the one in this.contract
                            if (signer !== this.contract.signer) {
                                // create a new contract with the signer. Note this.contract has the contractOwner as the signer
                                contract = this.contract.connect(signer);
                            }
                            else {
                                // this signer is the same as the one in this.contract so no need to recreate the contract
                                contract = this.contract;
                            }
                        }
                        else {
                            if (!this.contractOwner) {
                                throw Error("Transaction signer has not been passed or contract owner has not been set");
                            }
                            contract = this.contract;
                        }
                        description = "send transaction to function " + functionName + " on contract with address " + this.contract.address + " with parameters " + callParams;
                        call = (_a = contract.interface.functions)[functionName].apply(_a, callParams);
                        callTransactionData = {
                            data: call.data,
                            to: contract.address
                        };
                        // need to async await so the promiEvent can be passed into the processTransaction function
                        return [4 /*yield*/, Promise.resolve()];
                    case 1:
                        // need to async await so the promiEvent can be passed into the processTransaction function
                        _b.sent();
                        return [4 /*yield*/, this.processTransaction(signer, description, callTransactionData, sendOptions, promiEvent)];
                    case 2:
                        transactionReceipt = _b.sent();
                        resolve(transactionReceipt);
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _b.sent();
                        errorMessage = "Failed to " + description;
                        if (err_2.message === 'invalid json response') {
                            errorMessage = errorMessage + " invalid response: " + err_2.responseText;
                        }
                        error = new VError(err_2, errorMessage);
                        debug(error.stack);
                        reject(error);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return promiEvent;
    };
    /**
     * Send ETH from the signer's address to another address
     * @param {number | } amount Ether (not wei) amount to be sent
     * @param {string} toAddress Ethereum address the Ether is to be sent to
     * @param {Signer} signer Optional signer of the transaction. Default is the contract owner
     * @param {SendOptions} overrideSendOptions Overrides the default send options. eg gasPrice, gasLimit and value in wei
     * @returns {PromiEvent<TransactionReceipt>} a Promise that resolves a transaction receipt with parsed events. The following events are also emitted 'hash', 'mined', 'receipt' and any tx events
     */
    BaseContract.prototype.sendEth = function (amount, toAddress, signer, overrideSendOptions) {
        var _this = this;
        // override the default send options
        var sendOptions = Object.assign({}, this.defaultSendOptions, { gasLimit: 21000 }, overrideSendOptions);
        if (this.noGasPrice) {
            sendOptions.gasPrice = 0;
        }
        var description = "send " + amount.toString() + " eth to address " + toAddress;
        var promiEvent = new PromiEvent_1.default(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var weiAmount, transaction, transactionReceipt, err_3, errorMessage, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // If a signer was passed
                        if (!signer) {
                            throw Error("no signer was passed to sendEth");
                        }
                        weiAmount = ethers_1.utils.parseEther(amount.toString());
                        description = description + " (" + weiAmount + " wei)";
                        transaction = {
                            to: toAddress,
                            value: weiAmount
                        };
                        // need to async await so the promiEvent can be passed into the processTransaction function
                        return [4 /*yield*/, Promise.resolve()];
                    case 1:
                        // need to async await so the promiEvent can be passed into the processTransaction function
                        _a.sent();
                        return [4 /*yield*/, this.processTransaction(signer, description, transaction, sendOptions, promiEvent)];
                    case 2:
                        transactionReceipt = _a.sent();
                        resolve(transactionReceipt);
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        errorMessage = "Failed to " + description;
                        if (err_3.message === 'invalid json response') {
                            errorMessage = errorMessage + " invalid response: " + err_3.responseText;
                        }
                        error = new VError(err_3, errorMessage);
                        debug(error.stack);
                        reject(error);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return promiEvent;
    };
    /**
     * a common method for processing transactions that deploy a contract, call a function on a contract or send Ether
     *
     * 1. Get Ethereum address from the signer of the transaction and emit a 'signerAddress' event with the signer's address
     * 2. Add nonce and fromAddress to the transaction to be signed and emit a 'transaction' event with the transaction object
     * 3. Sign the transaction using the signer and emit a 'signed' event with a hexidecimal string of the signed transaction
     * 4. Send the signed transaction to the Ethereum blockchain and emit a 'hash' event with the returned transaction hash
     * 4. Receives a transaction hash and emit the hash in the 'hash' event
     * 5. Wait for the transaction to be mined (added) into a block and emit a 'mined' event with the mined transaction details
     * 6. Get the transaction receipt and emit a 'receipt' event with the returned transaction receipt object
     * 7. Checks the status of the transaction receipt and rejects the promise if the transaction failed
     *
     * @param {Signer} signer Ethers.js customer signer used to sign the transaction
     * @param {string} descriptionParam A string that details what's in the transaction for logging and error handling purposes
     * @param {SendTransaction} transaction An object with the to address of the transaction and data field if deploying or calling a contract
     * @param {SendOptions} sendOptions Overrides the default send transaction options. eg gasPrice, gasLimit and value in wei
     * @param {PromiEvent<TransactionReceipt>} promiEvent. event emitter for the 'signerAddress', 'signed', 'hash', 'mined' and 'receipt' transaction events
     * @returns {Promise<TransactionReceipt>}  A promise that resolves a transaction receipt if the transaction was successful
     *
     */
    BaseContract.prototype.processTransaction = function (signer, descriptionParam, transaction, sendOptions, promiEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var description, signerAddress, transactionToSign, _a, _b, _c, _d, signedTransaction, txHash, minedTransaction, convertedMinedTransaction, rawTransactionReceipt, transactionReceipt, _i, _e, _f, eventName, events, error;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        description = descriptionParam + " with send options " + JSON.stringify(sendOptions);
                        return [4 /*yield*/, signer.getAddress()];
                    case 1:
                        signerAddress = _g.sent();
                        debug("Signer address: " + signerAddress);
                        promiEvent.emit('signerAddress', signerAddress);
                        description = description + " using signer with address " + signerAddress;
                        _b = (_a = Object).assign;
                        _c = [transaction, sendOptions];
                        _d = {};
                        return [4 /*yield*/, this.transactionsProvider.getTransactionCount(signerAddress)];
                    case 2:
                        transactionToSign = _b.apply(_a, _c.concat([(_d.nonce = _g.sent(),
                                _d.from = signerAddress,
                                _d)]));
                        promiEvent.emit('transaction', transaction);
                        description = description + " with nonce " + transactionToSign.nonce;
                        return [4 /*yield*/, signer.sign(transactionToSign)];
                    case 3:
                        signedTransaction = _g.sent();
                        debug("Signed transaction: " + signedTransaction);
                        promiEvent.emit('signed', signedTransaction);
                        // Send the transaction to the Ethereum network
                        debug("About to " + description);
                        return [4 /*yield*/, this.transactionsProvider.sendTransaction(signedTransaction)
                            // if the signer was a Wallet then the hash is in an object
                        ];
                    case 4:
                        txHash = _g.sent();
                        // if the signer was a Wallet then the hash is in an object
                        if (txHash.hash) {
                            txHash = txHash.hash;
                        }
                        promiEvent.emit('hash', txHash);
                        debug(txHash + " is transaction hash for " + description);
                        return [4 /*yield*/, this.transactionsProvider.waitForTransaction(txHash)];
                    case 5:
                        minedTransaction = _g.sent();
                        debug(txHash + " mined in block number " + minedTransaction.blockNumber + " for " + description);
                        convertedMinedTransaction = this.convertEthersBNs(minedTransaction, false);
                        promiEvent.emit('mined', convertedMinedTransaction);
                        return [4 /*yield*/, this.transactionsProvider.getTransactionReceipt(txHash)];
                    case 6:
                        rawTransactionReceipt = _g.sent();
                        transactionReceipt = this.convertEthersBNs(rawTransactionReceipt);
                        // extract events from the logs on the transaction receipt
                        transactionReceipt.events = this.getTransactionEvents(transactionReceipt);
                        // emit events for each event type (name) on the logs
                        for (_i = 0, _e = Object.entries(transactionReceipt.events); _i < _e.length; _i++) {
                            _f = _e[_i], eventName = _f[0], events = _f[1];
                            promiEvent.emit(eventName, events);
                        }
                        debug("Status " + transactionReceipt.status + " and " + transactionReceipt.gasUsed + " gas of " + transaction.gasLimit + " used for " + description);
                        promiEvent.emit('receipt', transactionReceipt);
                        // If a status of 0 was returned then the transaction failed. Status 1 means the transaction worked
                        if (transactionReceipt.status == 0) {
                            error = new VError("Failed transaction " + txHash + " with status code " + transactionReceipt.status + ". " + transactionReceipt.gasUsed + " gas used of " + transaction.gasLimit + " gas limit.");
                            error.receipt = transactionReceipt;
                            debug(error.stack);
                            promiEvent.emit('error', error);
                            throw error;
                        }
                        // wait for the required number of confirmations
                        return [4 /*yield*/, this.waitForConfirmations(transactionReceipt.blockNumber, promiEvent, transactionReceipt.transactionHash)];
                    case 7:
                        // wait for the required number of confirmations
                        _g.sent();
                        return [2 /*return*/, transactionReceipt];
                }
            });
        });
    };
    /**
     * wait for the required number of confirmations emitting an event for each confirmed block
     * This is only called after the transaction is mined which is the first confirmation. For this reason, the confirmation events start from the second confirmation
     * @param {number} minedBlockNumber block number the transaction included in (mined)
     * @param {module:events.internal.EventEmitter} promiEvent used to emit the confirmation events
     * @param {string} identifier used to identify the events. Is likely to be the transaction hash
     * @returns {Promise<number>} the number of confirmations processed
     */
    BaseContract.prototype.waitForConfirmations = function (minedBlockNumber, promiEvent, identifier) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // confirmations is mutable so fixing that value at the start of waiting period as this.confirmations could change later
            var confirmations = _this.confirmations;
            // the mined block is the first confirmation so the -1 is needed. its like counting from index 0
            var targetBlockNumber = minedBlockNumber + confirmations - 1;
            // will always emit the first confirmation as that's when a transaction was mined (included in a block)
            promiEvent.emit('confirmation', 1, identifier);
            if (!_this.confirmations || _this.confirmations <= 1) {
                resolve(_this.confirmations);
            }
            else {
                // the function is the listener identifier so can't be an anonymous function in the provider.on call
                var onConfirmation_1 = function (blockNumber) {
                    // the mined block is the first confirmation so the +1 is needed. its like counting from index 0
                    var numberConfirmations = blockNumber - minedBlockNumber + 1;
                    debug("confirmation " + numberConfirmations + " of " + confirmations + ", blocknumber " + blockNumber + ", mined " + minedBlockNumber + ", target " + targetBlockNumber + " for " + identifier);
                    if (blockNumber >= targetBlockNumber) {
                        // Stop block listener
                        _this.transactionsProvider.removeListener('block', onConfirmation_1);
                        resolve(numberConfirmations);
                    }
                    else {
                        promiEvent.emit('confirmation', numberConfirmations, identifier);
                    }
                };
                // start the block listener for this transaction
                _this.transactionsProvider.on('block', onConfirmation_1);
            }
        });
    };
    /**
     * Calls a pure or view function on a smart contract.
     * The contract must have been deployed for the contract address set
     *
     * @param {string} functionName Name of function to be called on the Application Binary Interface (ABI)
     * @param callParams Any parameters that need to be passed to the calling function
     * @returns {Promise<any>} A promise containing the return value of the called ABI function
     */
    BaseContract.prototype.call = function (functionName) {
        var callParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            callParams[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var description, result, err_4, error, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        description = "call function " + functionName + " with params " + callParams.toString();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        if (!this.contract || !this.contract.address) {
                            throw new Error("contract address has not been set");
                        }
                        description = "call function " + functionName + " with params " + callParams.toString() + " on contract with address " + this.contract.address;
                        return [4 /*yield*/, (_a = this.contract)[functionName].apply(_a, callParams)];
                    case 2:
                        result = _b.sent();
                        // if an Ethers BigNumber
                        if (result._bn) {
                            // convert to a bn.js BigNumber
                            result = result._bn;
                        }
                        debug("Got " + result + " from " + description);
                        return [2 /*return*/, result];
                    case 3:
                        err_4 = _b.sent();
                        error = new VError(err_4, "Failed " + description);
                        debug(error.stack);
                        throw error;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets all past emitted events from the smart contract from a block number
     *
     * @param {string} eventName event name in Application Binary Interface (ABI)
     * @param {number} fromBlock will default to block 0 if not specified
     * @returns {Promise<object[]>} An array of event objects
     */
    BaseContract.prototype.getEvents = function (eventName, fromBlock) {
        if (fromBlock === void 0) { fromBlock = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var description, options, Event_1, logs, events, err_5, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        description = eventName + " events from block " + fromBlock + " and contract address " + this.contract.address;
                        options = {
                            fromBlock: fromBlock
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        debug("About to get " + description);
                        if (!this.contract) {
                            throw new VError("contract has not been deployed or address not set");
                        }
                        if (!this.contract.interface.events[eventName]) {
                            throw new VError("event name " + eventName + " does not exist on the contract interface");
                        }
                        Event_1 = this.contract.interface.events[eventName];
                        return [4 /*yield*/, this.eventsProvider.getLogs({
                                fromBlock: fromBlock,
                                toBlock: "latest",
                                address: this.contract.address,
                                topics: Event_1.topics
                            })];
                    case 2:
                        logs = _a.sent();
                        events = this.getEventsFromLogs(Event_1, logs);
                        debug(events.length + " events successfully returned from " + description);
                        return [2 /*return*/, events];
                    case 3:
                        err_5 = _a.sent();
                        error = new VError(err_5, "Could not get " + description);
                        debug(error.stack);
                        throw error;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new contract
     * @param {string} contractAddress
     * @param {Provider} provider
     * @param {ABI_Interface} abiInterface Application Binary Interface (ABI)
     */
    BaseContract.prototype.setContract = function (contractAddress, provider, abiInterface) {
        if (provider === void 0) { provider = this.transactionsProvider; }
        if (abiInterface === void 0) { abiInterface = this.abiInterface; }
        try {
            this.contract = new ethers_1.Contract(contractAddress, abiInterface, provider);
            this.abiInterface = abiInterface;
        }
        catch (err) {
            var error = new Error("can not set contract address " + contractAddress + " with provider");
            debug(error.stack);
            throw error;
        }
    };
    /**
     * Compares the local binary code to the code deployed on the chain
     * @returns {Promise<boolean>}
     */
    BaseContract.prototype.checkDeployedBinary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deployedCode, runtimeBytecode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.contract) {
                            throw new Error("Can no check contract binary as contract has not been set");
                        }
                        if (!this.transactionsProvider) {
                            throw new Error("Can no check contract binary as the transaction provider has not been set");
                        }
                        return [4 /*yield*/, this.transactionsProvider.getCode(this.contract.address)];
                    case 1:
                        deployedCode = _a.sent();
                        runtimeBytecode = BaseContract.loadRuntimeBytecodeFromFile(this.compilerOutputFolder, this.contractName);
                        return [2 /*return*/, deployedCode === runtimeBytecode];
                }
            });
        });
    };
    // construct the transaction send options using the detaults and any overrides
    BaseContract.prototype.constructSendOptions = function (overrideSendOptions) {
        // override the default send options
        var sendOptions = Object.assign({}, this.defaultSendOptions, overrideSendOptions);
        // chains like Quorum need a zero gasPrice
        if (this.noGasPrice) {
            sendOptions.gasPrice = 0;
        }
        return sendOptions;
    };
    BaseContract.prototype.convertEthersBNs = function (object, convertDecimals) {
        if (convertDecimals === void 0) { convertDecimals = true; }
        var result = {};
        for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = object[key];
            if (typeof (value) == 'object' && value != null && value.hasOwnProperty("_bn")) {
                var bnProperty = void 0;
                // if the event property has a decimal value
                if (convertDecimals && this.decimalProperties.includes(key)) {
                    // convert integer to float
                    bnProperty = value._bn.div(this.decimalMultiplier);
                }
                else {
                    bnProperty = value._bn;
                }
                // Convert from bn.js used by Ethers.js to BigNumber used by client
                result[key] = new this.bigNumberFunction(bnProperty);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    };
    /**
     * Parses transaction events from the logs in a transaction receipt
     * @param {TransactionReceipt} receipt Transaction receipt containing the events in the logs
     * @returns {{[eventName: string]: TransactionEvent}}
     */
    BaseContract.prototype.getTransactionEvents = function (receipt) {
        var txEvents = {};
        // for each log in the transaction receipt
        for (var _i = 0, _a = receipt.logs; _i < _a.length; _i++) {
            var log = _a[_i];
            // for each event in the ABI
            for (var _b = 0, _c = Object.values(this.contract.interface.events); _b < _c.length; _b++) {
                var abiEvent = _c[_b];
                // if the hash of the ABI event equals the tx receipt log
                if (abiEvent.topics[0] == log.topics[0]) {
                    // Parse the event from the log topics and data
                    var txEvent = abiEvent.parse(log.topics, log.data);
                    // convert any Ethers.js BigNumber types to BN
                    txEvents[abiEvent.name] = this.convertEthersBNs(txEvent);
                    // stop looping through the ABI events
                    break;
                }
            }
        }
        return txEvents;
    };
    BaseContract.prototype.getEventsFromLogs = function (Event, logs) {
        var events = [];
        for (var _i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
            var log = logs_1[_i];
            if (Event.topics[0] == log.topics[0]) {
                var event_1 = Event.parse(log.topics, log.data);
                // convert any Ethers.js BigNumber types to BN
                var convertedEvent = this.convertEthersBNs(event_1);
                events.push(convertedEvent);
            }
        }
        return events;
    };
    // TODO this needs to be a setter on this.decimal
    BaseContract.prototype.setDecimals = function (decimals) {
        if (typeof decimals != 'number') {
            var error = new Error("Can not set decimal multiplier as decimal value " + decimals + " is not a number");
            debug(error.stack);
            throw error;
        }
        if (decimals < 0) {
            var error = new Error("Can not set decimal multiplier as decimal value " + decimals + " is negative");
            debug(error.stack);
            throw error;
        }
        this.decimals = decimals;
        // multiplier = 10 ^ decimals
        this.decimalMultiplier = new BN(10).pow(new BN(decimals));
    };
    /**
     * Sets the time between polling for a newly mined block
     * @param {number} milliseconds Time on milliseconds between polling for the latest block number
     */
    BaseContract.prototype.setPollingInterval = function (milliseconds) {
        if (!milliseconds || typeof milliseconds !== 'number') {
            throw new Error("setPollingInterval " + milliseconds + " is not a number in milliseconds");
        }
        else if (milliseconds < 100) {
            throw new Error(milliseconds + " millisecond pollingInterval is less than 100 milliseconds");
        }
        this.transactionsProvider.pollingInterval = milliseconds;
    };
    BaseContract.loadAbiInterfaceFromFile = function (compilerOutputFolder, contractName) {
        var filename = compilerOutputFolder + contractName + ".abi";
        var abiInterfaceStr = fs_1.readFileSync(filename, 'utf8');
        debug("Loaded ABI Interface from file " + filename + ": " + abiInterfaceStr);
        return JSON.parse(abiInterfaceStr);
    };
    BaseContract.loadBinaryFromFile = function (compilerOutputFolder, contractName) {
        var filename = compilerOutputFolder + contractName + ".bin";
        var contractBinary = '0x' + fs_1.readFileSync(filename, 'utf8');
        debug("Loaded contract binary from file " + filename + ": " + contractBinary);
        return contractBinary;
    };
    BaseContract.loadRuntimeBytecodeFromFile = function (compilerOutputFolder, contractName) {
        var filename = compilerOutputFolder + contractName + ".json";
        var compilerOutputStr = fs_1.readFileSync(filename, 'utf8');
        var compilerOutput = JSON.parse(compilerOutputStr);
        var runtimeBytecode = '0x' + compilerOutput.runtimeBytecode;
        debug("Loaded runtime bytecode from file " + filename + ": " + runtimeBytecode);
        return runtimeBytecode;
    };
    BaseContract.wait = function () {
        return Promise.resolve();
    };
    return BaseContract;
}());
exports.default = BaseContract;
