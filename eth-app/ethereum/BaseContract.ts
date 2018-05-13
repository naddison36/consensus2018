import * as VError from 'verror'
import {readFileSync} from 'fs'
import * as BN from 'bn.js'
import {EventEmitter} from "events"

import {providers, Contract, utils, Transaction} from 'ethers'
import {
	TransactionReceipt,
	TransactionReceiptWithEvents,
	TransactionEvent,
	ABI_Interface,
	BaseContractOptions, SendTransaction
} from './index'
import {Signer} from './signers'
import PromiEvent from './utils/PromiEvent'

const debug = require('debug')('eth-contract')

export interface SendOptions {
    gasLimit?: number,
    gasPrice?: number,
    value?: string
}

const defaultConstructorOptions = {
	defaultSendOptions: {
		gasPrice: 1000000000,
		gasLimit: 120000},
	compilerOutputFolder: process.cwd() + '/bin/contracts/',
	noGasPrice: false,
	decimalMultiplier: new BN(1),
	decimalProperties: []
}

export default class BaseContract
{
	readonly networkName: string = 'unspecified'
	readonly transactionsProvider: providers.Provider
	readonly eventsProvider?: providers.Provider

	public contractName?: string
	public compilerOutputFolder = process.cwd() + '/bin/contracts/'

	public defaultSendOptions: SendOptions = {
		gasPrice: 1000000000,
		gasLimit: 1200000}
	public noGasPrice: boolean = false

	protected abiInterface?: ABI_Interface

	protected contract: Contract
	protected contractOwner: Signer

	protected decimals: number = 0
	protected decimalMultiplier: BN = new BN(1)
	public decimalProperties: string[] = []
	public bigNumberFunction: new ()=>any = BN

	public confirmations = 1

	constructor(options: BaseContractOptions)
    {
    	// set constructor options
    	Object.assign(this, defaultConstructorOptions, options)

		if (!this.transactionsProvider)
		{
			if (options.networkName)
			{
				this.transactionsProvider = providers.getDefaultProvider(this.networkName)

				debug(`No transactionProvider option so used default Ethers.js provider connected to the ${this.transactionsProvider.name} network with ${this.transactionsProvider.chainId} chain id`)
			}
    		else {
				let providerUrl = options.rpc_url || "http://localhost:8545"

				debug(`About to connect to JSON RPC HTTP endpoint ${providerUrl}`)

				this.transactionsProvider = new providers.JsonRpcProvider(providerUrl, this.networkName)

				debug(`No transactionProvider option so used JSON RPC provider with url ${providerUrl}, network ${this.transactionsProvider.name} and chain id ${this.transactionsProvider.chainId}`)
			}
		}

		if (!this.eventsProvider)
		{
			this.eventsProvider = this.transactionsProvider
		}

        if (this.contractName)
        {
			if (!this.abiInterface) {
				this.abiInterface = BaseContract.loadAbiInterfaceFromFile(this.compilerOutputFolder, this.contractName)
			}
        }

        if (options.contractAddress && this.abiInterface)
        {
            this.contract = new Contract(options.contractAddress, this.abiInterface, this.transactionsProvider)
        }

        if (options.decimals) {
    		this.setDecimals(options.decimals)
		}

		if (options.pollingInterval) {
    		this.setPollingInterval(options.pollingInterval)
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
    public deploy(signer: Signer, contractBinary?: string, overrideSendOptions?: SendOptions, ...contractConstructorParams: any[]): PromiEvent<TransactionReceipt>
    {
        const sendOptions = this.constructSendOptions(overrideSendOptions)

		const description = `deploy contract with params ${contractConstructorParams.toString()}`

		const promiEvent = new PromiEvent<TransactionReceipt>(async (resolve, reject)=>
		{
			try
			{
				if (!signer) {
					const error = new Error(`deploy function must pass a signer of type Signer as the first parameter so can not ${description}`)
					debug(error.stack)
					return reject(error)
				}

				if(!contractBinary)
				{
					if (!this.contractName)
					{
						const error = new Error(`Failed ${description}: no contractBinary passed and contract name has not been set so can not load the contract binary from the file system`)
						debug(error.stack)
						return reject(error)
					}
					else
					{
						contractBinary = BaseContract.loadBinaryFromFile(this.compilerOutputFolder, this.contractName)
					}
				}

				this.contractOwner = signer

				const transactionData = Contract.getDeployTransaction(contractBinary, this.abiInterface, ...contractConstructorParams)

				debug(`Deploy contract data: ${transactionData.data}`)

				// need to async await so the promiEvent can be passed into the processTransaction function
				await Promise.resolve()

				const transactionReceipt = await this.processTransaction(signer, description, transactionData, sendOptions, promiEvent)

				this.contract = new Contract(transactionReceipt.contractAddress, this.abiInterface, signer)

				debug(`${this.contract.address} created from ${description}`)

				resolve(transactionReceipt)
            }
            catch (err)
            {
                let errorMessage = `Failed to ${description}`

                if (err.message === 'invalid json response')
                {
                    errorMessage = `${errorMessage} invalid response: ${err.responseText}`
                }

                const error = new VError(err, errorMessage)
                debug(error.stack)
                reject(error)
            }
        })

        return promiEvent
    }

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
	public send(functionName: string, signer?: Signer, overrideSendOptions?: SendOptions, ...callParams: any[]): PromiEvent<TransactionReceiptWithEvents>
	{
		const sendOptions = this.constructSendOptions(overrideSendOptions)

		let description = `get signer address`

		const promiEvent = new PromiEvent<TransactionReceiptWithEvents>(async (resolve, reject)=>
		{
			try
			{
				let contract: Contract

				if (!this.contract) {
					throw Error(`Contract has not been deployed or instantiated from contract address and JSON interface`)
				}

				// If a signer was passed
				// TODO check the signer is of the correct type. ie a Signer
				if (signer)
				{
					// check if the signer is not the same as the one in this.contract
					if (signer !== this.contract.signer) {
						// create a new contract with the signer. Note this.contract has the contractOwner as the signer
						contract = this.contract.connect(signer)
					}
					else {
						// this signer is the same as the one in this.contract so no need to recreate the contract
						contract = this.contract
					}
				} else {
					if (!this.contractOwner) {
						throw Error(`Transaction signer has not been passed or contract owner has not been set`)
					}

					contract = this.contract
				}

				description = `send transaction to function ${functionName} on contract with address ${this.contract.address} with parameters ${callParams}`

				let call = contract.interface.functions[functionName](...callParams)

				const callTransactionData = {
					data: call.data,
					to: contract.address
				}

				// need to async await so the promiEvent can be passed into the processTransaction function
				await Promise.resolve()

				const transactionReceipt = await this.processTransaction(signer, description, callTransactionData, sendOptions, promiEvent)

				resolve(transactionReceipt)
			}
			catch (err)
			{
				let errorMessage = `Failed to ${description}`

				if (err.message === 'invalid json response')
				{
					errorMessage = `${errorMessage} invalid response: ${err.responseText}`
				}

				const error = new VError(err, errorMessage)
				debug(error.stack)
				reject(error)
			}
		})

		return promiEvent
	}

	/**
	 * Send ETH from the signer's address to another address
	 * @param {number | } amount Ether (not wei) amount to be sent
	 * @param {string} toAddress Ethereum address the Ether is to be sent to
	 * @param {Signer} signer Optional signer of the transaction. Default is the contract owner
	 * @param {SendOptions} overrideSendOptions Overrides the default send options. eg gasPrice, gasLimit and value in wei
	 * @returns {PromiEvent<TransactionReceipt>} a Promise that resolves a transaction receipt with parsed events. The following events are also emitted 'hash', 'mined', 'receipt' and any tx events
	 */
	public sendEth(amount: number | BN, toAddress: string, signer: Signer, overrideSendOptions?: SendOptions): PromiEvent<TransactionReceipt>
	{
		// override the default send options
		const sendOptions = Object.assign({}, this.defaultSendOptions,{gasLimit: 21000}, overrideSendOptions)

		if (this.noGasPrice) {
			sendOptions.gasPrice = 0
		}

		let description = `send ${amount.toString()} eth to address ${toAddress}`

		const promiEvent = new PromiEvent<TransactionReceipt>(async (resolve, reject)=>
		{
			try
			{
				// If a signer was passed
				if (!signer)
				{
					throw Error(`no signer was passed to sendEth`)
				}

				// convert to Ether amount to a Wei amount
				const weiAmount = utils.parseEther(amount.toString())

				description = `${description} (${weiAmount} wei)`

				const transaction = {
					to: toAddress,
					value: weiAmount
				}

				// need to async await so the promiEvent can be passed into the processTransaction function
				await Promise.resolve()

				const transactionReceipt = await this.processTransaction(signer, description, transaction, sendOptions, promiEvent)

				resolve(transactionReceipt)
			}
			catch (err)
			{
				let errorMessage = `Failed to ${description}`

				if (err.message === 'invalid json response')
				{
					errorMessage = `${errorMessage} invalid response: ${err.responseText}`
				}

				const error = new VError(err, errorMessage)
				debug(error.stack)
				reject(error)
			}
		})

		return promiEvent
	}

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
	protected async processTransaction(
		signer: Signer,
		descriptionParam: string,
		transaction: SendTransaction,
		sendOptions: SendOptions,
		promiEvent: PromiEvent<TransactionReceiptWithEvents>): Promise<TransactionReceiptWithEvents>
	{
		let description = `${descriptionParam} with send options ${JSON.stringify(sendOptions)}`

		// Get address from the signer of the transaction
		const signerAddress = await signer.getAddress()
		debug(`Signer address: ${signerAddress}`)

		promiEvent.emit('signerAddress', signerAddress)

		description = `${description} using signer with address ${signerAddress}`

		// Add nonce to the transaction to be signed
		const transactionToSign = Object.assign(transaction, sendOptions, {
			nonce: await this.transactionsProvider.getTransactionCount(signerAddress)
			from: signerAddress
		})

		promiEvent.emit('transaction', transaction)

		description = `${description} with nonce ${transactionToSign.nonce}`

		// Sign the transaction
		const signedTransaction = await signer.sign(transactionToSign)

		debug(`Signed transaction: ${signedTransaction}`)

		promiEvent.emit('signed', signedTransaction)

		// Send the transaction to the Ethereum network
		debug(`About to ${description}`)

		const txHash = await this.transactionsProvider.sendTransaction(signedTransaction)

		// if the signer was a Wallet then the hash is in an object
		if (txHash.hash) {
			txHash = txHash.hash
		}

		promiEvent.emit('hash', txHash)

		debug(`${txHash} is transaction hash for ${description}`)

		// wait for the transaction to be mined
		const minedTransaction = await this.transactionsProvider.waitForTransaction(txHash)

		debug(`${txHash} mined in block number ${minedTransaction.blockNumber} for ${description}`)

		const convertedMinedTransaction = this.convertEthersBNs(minedTransaction, false)

		promiEvent.emit('mined', convertedMinedTransaction)

		// Get the transaction receipt
		const rawTransactionReceipt: TransactionReceipt = await this.transactionsProvider.getTransactionReceipt(txHash)

		const transactionReceipt: TransactionReceiptWithEvents = this.convertEthersBNs(rawTransactionReceipt)

		// extract events from the logs on the transaction receipt
		transactionReceipt.events = this.getTransactionEvents(transactionReceipt)

		// emit events for each event type (name) on the logs
		for (const [eventName, events] of Object.entries(transactionReceipt.events))
		{
			promiEvent.emit(eventName, events)
		}

		debug(`Status ${transactionReceipt.status} and ${transactionReceipt.gasUsed} gas of ${transaction.gasLimit} used for ${description}`)

		promiEvent.emit('receipt', transactionReceipt)

		// If a status of 0 was returned then the transaction failed. Status 1 means the transaction worked
		if (transactionReceipt.status == 0)
		{
			const error = new VError(`Failed transaction ${txHash} with status code ${transactionReceipt.status}. ${transactionReceipt.gasUsed} gas used of ${transaction.gasLimit} gas limit.`)
			error.receipt = transactionReceipt
			debug(error.stack)

			promiEvent.emit('error', error)

			throw error
		}

		// wait for the required number of confirmations
		await this.waitForConfirmations(transactionReceipt.blockNumber, promiEvent, transactionReceipt.transactionHash)

		return transactionReceipt
	}

	/**
	 * wait for the required number of confirmations emitting an event for each confirmed block
	 * This is only called after the transaction is mined which is the first confirmation. For this reason, the confirmation events start from the second confirmation
	 * @param {number} minedBlockNumber block number the transaction included in (mined)
	 * @param {module:events.internal.EventEmitter} promiEvent used to emit the confirmation events
	 * @param {string} identifier used to identify the events. Is likely to be the transaction hash
	 * @returns {Promise<number>} the number of confirmations processed
	 */
	public waitForConfirmations(minedBlockNumber: number, promiEvent: EventEmitter, identifier: string): Promise<number>
	{
		return new Promise((resolve, reject)=>
		{
			// confirmations is mutable so fixing that value at the start of waiting period as this.confirmations could change later
			const confirmations = this.confirmations
			// the mined block is the first confirmation so the -1 is needed. its like counting from index 0
			const targetBlockNumber = minedBlockNumber + confirmations - 1

			// will always emit the first confirmation as that's when a transaction was mined (included in a block)
			promiEvent.emit('confirmation', 1, identifier)

			if (!this.confirmations || this.confirmations <= 1)
			{
				resolve(this.confirmations)
			}
			else
			{
				// the function is the listener identifier so can't be an anonymous function in the provider.on call
				const onConfirmation = (blockNumber: number)=>
				{
					// the mined block is the first confirmation so the +1 is needed. its like counting from index 0
					const numberConfirmations = blockNumber - minedBlockNumber + 1

					debug(`confirmation ${numberConfirmations} of ${confirmations}, blocknumber ${blockNumber}, mined ${minedBlockNumber}, target ${targetBlockNumber} for ${identifier}`)

					if (blockNumber >= targetBlockNumber)
					{
						// Stop block listener
						this.transactionsProvider.removeListener('block', onConfirmation)

						resolve(numberConfirmations)
					}
					else {
						promiEvent.emit('confirmation', numberConfirmations, identifier)
					}
				}

				// start the block listener for this transaction
				this.transactionsProvider.on('block', onConfirmation)
			}
		})
	}

	/**
	 * Calls a pure or view function on a smart contract.
	 * The contract must have been deployed for the contract address set
	 *
	 * @param {string} functionName Name of function to be called on the Application Binary Interface (ABI)
	 * @param callParams Any parameters that need to be passed to the calling function
	 * @returns {Promise<any>} A promise containing the return value of the called ABI function
	 */
    public async call(functionName: string, ...callParams: any[]): Promise<any>
    {
    	let description = `call function ${functionName} with params ${callParams.toString()}`

        try
        {
        	if (!this.contract || !this.contract.address) {
        		throw new Error(`contract address has not been set`)
			}

        	description = `call function ${functionName} with params ${callParams.toString()} on contract with address ${this.contract.address}`

			let result = await this.contract[functionName](...callParams)

            // if an Ethers BigNumber
            if (result._bn)
            {
                // convert to a bn.js BigNumber
                result = result._bn
            }

            debug(`Got ${result} from ${description}`)
            return result
        }
        catch (err)
        {
            const error = new VError(err, `Failed ${description}`)
            debug(error.stack)
            throw error
        }
    }

	/**
	 * Gets all past emitted events from the smart contract from a block number
	 *
	 * @param {string} eventName event name in Application Binary Interface (ABI)
	 * @param {number} fromBlock will default to block 0 if not specified
	 * @returns {Promise<object[]>} An array of event objects
	 */
    public async getEvents(eventName: string, fromBlock: number = 0): Promise<object[]>
    {
        const description = `${eventName} events from block ${fromBlock} and contract address ${this.contract.address}`

        const options = {
            fromBlock: fromBlock
        }

        try
        {
			debug(`About to get ${description}`)

			if (!this.contract) {
				throw new VError(`contract has not been deployed or address not set`)
			}
            if (!this.contract.interface.events[eventName]) {
                throw new VError(`event name ${eventName} does not exist on the contract interface`)
            }

            const Event = this.contract.interface.events[eventName]

            const logs = await this.eventsProvider.getLogs({
                fromBlock: fromBlock,
                toBlock: "latest",
                address: this.contract.address,
                topics: Event.topics
            })

            const events: object[] = this.getEventsFromLogs(Event, logs)

            debug(`${events.length} events successfully returned from ${description}`)

            return events
        }
        catch (err)
        {
            const error = new VError(err, `Could not get ${description}`)
            debug(error.stack)
            throw error
        }
    }

	/**
	 * Creates a new contract
	 * @param {string} contractAddress
	 * @param {Provider} provider
	 * @param {ABI_Interface} abiInterface Application Binary Interface (ABI)
	 */
	public setContract(contractAddress: string,
				provider: providers.Provider = this.transactionsProvider,
				abiInterface: ABI_Interface = this.abiInterface): void
	{
		try {
			this.contract = new Contract(contractAddress, abiInterface, provider)
			this.abiInterface = abiInterface
		}
		catch(err) {
			const error = new Error(`can not set contract address ${contractAddress} with provider`)
			debug(error.stack)
			throw error
		}
	}

	/**
	 * Compares the local binary code to the code deployed on the chain
	 * @returns {Promise<boolean>}
	 */
	public async checkDeployedBinary(): Promise<boolean>
	{
		if (!this.contract) {
			throw new Error(`Can no check contract binary as contract has not been set`)
		}
		if (!this.transactionsProvider) {
			throw new Error(`Can no check contract binary as the transaction provider has not been set`)
		}

		const deployedCode = await this.transactionsProvider.getCode(this.contract.address)

		const runtimeBytecode = BaseContract.loadRuntimeBytecodeFromFile(this.compilerOutputFolder, this.contractName)

		return deployedCode === runtimeBytecode
	}

	// construct the transaction send options using the detaults and any overrides
	private constructSendOptions(overrideSendOptions?: SendOptions): SendOptions
	{
		// override the default send options
		const sendOptions = Object.assign({}, this.defaultSendOptions, overrideSendOptions)

		// chains like Quorum need a zero gasPrice
		if (this.noGasPrice) {
			sendOptions.gasPrice = 0
		}

		return sendOptions
	}

	private convertEthersBNs(object: object, convertDecimals = true): object
	{
		const result = {}

		for (let key of Object.keys(object))
		{
			const value: any = object[key]

			if (typeof(value) == 'object' && value != null && value.hasOwnProperty("_bn"))
			{
				let bnProperty: BN

				// if the event property has a decimal value
				if (convertDecimals && this.decimalProperties.includes(key))
				{
					// convert integer to float
					bnProperty = value._bn.div(this.decimalMultiplier)
				}
				else {
					bnProperty = value._bn
				}

				// Convert from bn.js used by Ethers.js to BigNumber used by client
				result[key] = new this.bigNumberFunction(bnProperty)
			}
			else {
				result[key] = value
			}
		}

		return result
	}

	/**
	 * Parses transaction events from the logs in a transaction receipt
	 * @param {TransactionReceipt} receipt Transaction receipt containing the events in the logs
	 * @returns {{[eventName: string]: TransactionEvent}}
	 */
	private getTransactionEvents(receipt: TransactionReceipt): {[eventName: string]: TransactionEvent}
	{
		const txEvents: {[eventName: string]: TransactionEvent}  = {}

		// for each log in the transaction receipt
		for (const log of receipt.logs)
		{
			// for each event in the ABI
			for (const abiEvent of Object.values(this.contract.interface.events))
			{
				// if the hash of the ABI event equals the tx receipt log
				if (abiEvent.topics[0] == log.topics[0])
				{
					// Parse the event from the log topics and data
					const txEvent = abiEvent.parse(log.topics, log.data)

					// convert any Ethers.js BigNumber types to BN
					txEvents[abiEvent.name] = this.convertEthersBNs(txEvent)

					// stop looping through the ABI events
					break
				}
			}
		}

		return txEvents
	}

    private getEventsFromLogs(Event: any, logs: {topics: string[], data: string}[]): TransactionEvent[]
	{
		const events: object[] = []

		for (const log of logs)
		{
			if (Event.topics[0] == log.topics[0])
			{
				const event = Event.parse(log.topics, log.data)

				// convert any Ethers.js BigNumber types to BN
				const convertedEvent = this.convertEthersBNs(event)

				events.push(convertedEvent)
			}
		}

		return events
	}

	// TODO this needs to be a setter on this.decimal
	public setDecimals(decimals: number): void
	{
		if (typeof decimals != 'number')
		{
			const error = new Error(`Can not set decimal multiplier as decimal value ${decimals} is not a number`)
			debug(error.stack)
			throw error
		}

		if (decimals < 0)
		{
			const error = new Error(`Can not set decimal multiplier as decimal value ${decimals} is negative`)
			debug(error.stack)
			throw error
		}

		this.decimals = decimals

		// multiplier = 10 ^ decimals
		this.decimalMultiplier = new BN(10).pow(new BN(decimals))
	}

	/**
	 * Sets the time between polling for a newly mined block
	 * @param {number} milliseconds Time on milliseconds between polling for the latest block number
	 */
	public setPollingInterval(milliseconds: number): void
	{
		if (!milliseconds || typeof milliseconds !== 'number') {
			throw new Error(`setPollingInterval ${milliseconds} is not a number in milliseconds`)
		}
		else if (milliseconds < 100) {
			throw new Error(`${milliseconds} millisecond pollingInterval is less than 100 milliseconds`)
		}

		this.transactionsProvider.pollingInterval = milliseconds
	}

    static loadAbiInterfaceFromFile(compilerOutputFolder: string, contractName: string): object[]
    {
		const filename = compilerOutputFolder + contractName + ".abi"

        const abiInterfaceStr = readFileSync(filename, 'utf8')

		debug(`Loaded ABI Interface from file ${filename}: ${abiInterfaceStr}`)

        return JSON.parse(abiInterfaceStr)
    }

    static loadBinaryFromFile(compilerOutputFolder: string, contractName: string): string
    {
    	const filename = compilerOutputFolder + contractName + ".bin"
        const contractBinary = '0x' + readFileSync(filename, 'utf8')

		debug(`Loaded contract binary from file ${filename}: ${contractBinary}`)

		return contractBinary
    }

	static loadRuntimeBytecodeFromFile(compilerOutputFolder: string, contractName: string): string
	{
		const filename = compilerOutputFolder + contractName + ".json"

		const compilerOutputStr = readFileSync(filename, 'utf8')
		const compilerOutput = JSON.parse(compilerOutputStr)
		const runtimeBytecode = '0x' + compilerOutput.runtimeBytecode

			debug(`Loaded runtime bytecode from file ${filename}: ${runtimeBytecode}`)

		return runtimeBytecode
	}

    static wait(): Promise<void>
	{
		return Promise.resolve()
	}
}