
import { providers as Providers, utils } from 'ethers'
import { SignerFactory} from '../ethereum/signers'
import HardcodedSignerFactory from '../ethereum/signers/HardcodedSigner'
import * as VError from 'verror'

import GenesisContract from "../ethereum/GenesisContract"

const config = require('../common').config()
const logger = require('../common').logger()

const HttpErrors = require('./errors').HttpErrors

const contractOwnerAddress = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
const firstProducerAddress = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
const secondProducerAddress = '0x1563915e194D8CfBA1943570603F7606A3115508'
const consumer1Address = '0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB'
const consumer2Address = '0x7564105E977516C53bE337314c7E53838967bDaC'
const consumer3Address = '0xe1fAE9b4fAB2F5726677ECfA912d96b0B683e6a9'
const consumer4Address = '0xdb2430B4e9AC14be6554d3942822BE74811A1AF9'

export default class Genesis
{
	private providerUrl: string | {url: string, user: string, password: string}
	private provider: Providers

	private signerFactory: SignerFactory
	private genesisContract: GenesisContract

	constructor()
	{
		//Genesis.validateConfig()

		this.provider = new Providers.JsonRpcProvider(config.chain.rpc_url, "unspecified")
	}

	// creates an Ethers.js provider url string or object
	// static validateConfig()
	// {
	// 	if (config && config.chain)
	// 	{
	// 		Genesis.checkChainConfig('rpc_url')
	// 		Genesis.checkChainConfig('no_gas_price')
	// 		Genesis.checkChainConfig('contract_address')
	// 	}
	// 	else {
	// 		const error = new Error(`chain config has not been configured. Make sure it's set in the ./config/${process.env.NODE_ENV}.yaml config file or NODE_CONFIG environment variable. eg NODE_CONFIG='{"chain":{"rpc_url":"http://localhost:8646","rpc_username":"username","rpc_password":"password","pk_enc_salt":"your salt"}}`)
	// 		logger.error(error.stack)
	// 		throw error
	// 	}
	// }
	//
	// static checkChainConfig(configProperty: string)
	// {
	// 	if (!config.chain.hasOwnProperty(configProperty)) {
	// 		const error = new Error(`chain.${configProperty} has not been configured for the ${process.env.NODE_ENV} environment. Make sure it's set in the ./config/${process.env.NODE_ENV}.yaml config file or NODE_CONFIG environment variable. eg NODE_CONFIG='{"chain":{"rpc_url":"http://localhost:8646","rpc_username":"username","rpc_password":"password","pk_enc_salt":"your salt"}}`)
	// 		logger.error(error.stack)
	// 		throw error
	// 	}
	// }

	async init(): Promise<void>
	{
		try
		{
			this.signerFactory = new HardcodedSignerFactory()
			const contractOwnerSigner = await this.signerFactory.create(config.chain.contract_owner, this.provider)

			const issuerAddress = await contractOwnerSigner.getAddress()

			logger.info(`Created issuer signer with address ${issuerAddress} for configured issuer participant ${config.chain.issuer_participant_id}`)

			this.genesisContract = new GenesisContract({
				transactionsProvider: this.provider,
				contractAddress: config.chain.contract_address,
				noGasPrice: config.chain.no_gas_price
			})
			this.genesisContract.contractOwner = contractOwnerSigner
		}
		catch(err)
		{
			const error = new VError(err, `could not initialise GenesisContract with chain config. Error: ${err.message}`)
			logger.error(error.stack)
			throw error
		}
	}


	async verify(ctx: any, next:Function)
	{
		const payload = ctx.request.body.payload

		logger.debug(`About to verify payload ${JSON.stringify(payload)}`)

		let errorCode: {code: number, msg: string}

		// Validation
		// if (!payload.hasOwnProperty('amount')) {
		// 	errorCode = {code: 9026, msg: 'amount property must be passed'}
		// }

		if (errorCode) {
			logger.error(`Create token validation failed. ${errorCode.code} ${errorCode.msg}`)
			ctx.throw(HttpErrors.err405, errorCode)
		}

		// sent the http response now

		// ----------------------------------------------------------------------------------------------------------------
		// Continue processing the request onto the chain .................................................................

		try
		{
			const firstProducerSigner = await this.signerFactory.create(firstProducerAddress, this.provider)
			const promiEvent = this.genesisContract.validateClaim(firstProducerSigner, firstProducerAddress, 0, 4)

			ctx.body = {
				'producerAddress': '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A',
				'producerName': 'Andrew\'s Honey',
				'claim': 'Produced in New York',
				'score': 4.5
			}
		}
		catch (err)
		{
			const error = new VError(err, `could not verify tokens for payload ${JSON.stringify(payload)}`)
			logger.error(error.stack)
		}

		await next()
		// Send the API response with the request_id
	}
}
