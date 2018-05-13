import {provider as Provider} from 'ethers'
import * as BN from 'bn.js'

import BaseContract, {SendOptions} from './BaseContract'
import {BaseContractOptions, TransactionReceipt, TransactionReceiptWithEvents} from './index'
import {Signer} from './signers'
import PromiEvent from './utils/PromiEvent'

export interface Producer {
	pubkey: string,
	name: string
	claims: Claim[];
}

export interface Claim {
	description: string,
	numValidations: number,
	rating: number
}

export interface Attestor {
	pubkey: string,
	name: string,
	validations: Validation[]
}

export interface  Validation {
	owner: string,
	id: number,
	score: number,
	expiry: number
}

/**
 * A client side wrapper for the RemittanceToken smart contract
 */
export default class GenesisContract extends BaseContract
{
	constructor(overrideOptions?: BaseContractOptions)
	{
		const options = Object.assign({}, {
			contractName: "Genesis",
			compilerOutputFolder: process.cwd() + "/ethereum/ABIs/"
		}, overrideOptions)

		super(options)
	}

	deploy(signer: Signer, overrideSendOptions: SendOptions = {}): PromiEvent<TransactionReceipt>
	{
		const sendOptions = Object.assign({}, this.defaultSendOptions, {
			gasPrice: 1000000000,
			gasLimit: 2000000
		}, overrideSendOptions)

		return super.deploy(signer, undefined, sendOptions)
	}

	// function createClaim( address p, Claim c )
	createClaim(signer: Signer, description: string, sendOptions: SendOptions = {gasLimit: 4000000}): PromiEvent<TransactionReceiptWithEvents>
	{
		return super.send("createNewClaim", signer, sendOptions, description)
	}

	// createProducer( Producer p )
	createProducer(signer: Signer, producerAddress: string, producerName: string, sendOptions?: SendOptions): PromiEvent<TransactionReceiptWithEvents>
	{
		return super.send("createNewProducer", signer, sendOptions, producerAddress, producerName)
	}

	// makeAttestation ( address attestor, address producer, uint claim, uint rating )
	makeAttestation(signer: Signer, attestorAddress: string, producerAddress: string, claim: Claim, rating: number, sendOptions?: SendOptions): PromiEvent<TransactionReceiptWithEvents>
	{
		return super.send("makeAttestation", signer, sendOptions, attestorAddress, producerAddress, claim, rating)
	}

	//validate( address p, uint claimID, Validation v )
	validateClaim(consumerSigner: Signer, producerAddress: string, claimId: number, score: number, sendOptions: SendOptions = {gasLimit: 4000000}): PromiEvent<TransactionReceiptWithEvents>
	{
		return super.send("validateClaim", consumerSigner, sendOptions, producerAddress, claimId, score)
	}
}
