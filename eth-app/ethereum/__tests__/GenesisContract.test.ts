import {providers} from 'ethers'

import GenesisContract from "../GenesisContract"
import SignerFactory from "../signers/HardcodedSigner"
import {Signer} from '../signers'
import {createSecureContext} from 'tls'

const contractOwnerAddress = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
const firstProducerAddress = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
const secondProducerAddress = '0x1563915e194D8CfBA1943570603F7606A3115508'
const consumer1Address = '0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB'
const consumer2Address = '0x7564105E977516C53bE337314c7E53838967bDaC'
const consumer3Address = '0xe1fAE9b4fAB2F5726677ECfA912d96b0B683e6a9'
const consumer4Address = '0xdb2430B4e9AC14be6554d3942822BE74811A1AF9'

const providerUrl = process.env.RPC_PROVIDER_URL || 'http://localhost:8545'
const provider = new providers.JsonRpcProvider(providerUrl, "unspecified")

const signerFactory = new SignerFactory()

const genesisContract = new GenesisContract()

let contractOwnerSigner: Signer
let firstProducerSigner: Signer
let secondProducerSigner: Signer
let consumer1Signer: Signer
let consumer2Signer: Signer
let consumer3Signer: Signer
let consumer4Signer: Signer

describe("GenesisContract", ()=>
{
	beforeAll(async()=>
	{
		contractOwnerSigner = await signerFactory.create(contractOwnerAddress, provider)
		firstProducerSigner = await signerFactory.create(firstProducerAddress, provider)
		secondProducerSigner = await signerFactory.create(secondProducerAddress, provider)
		consumer1Signer = await signerFactory.create(consumer1Address, provider)
		consumer2Signer = await signerFactory.create(consumer1Address, provider)
		consumer3Signer = await signerFactory.create(consumer1Address, provider)
		consumer4Signer = await signerFactory.create(consumer1Address, provider)
	})

	test("deploy", async()=>
	{
		const txReceipt = await genesisContract.deploy(contractOwnerSigner)

		expect(txReceipt.status).toEqual(1)
		console.log(txReceipt.contractAddress)
	})

	test("Create producers", async()=>
	{
		let txReceipt = await genesisContract.createProducer(firstProducerSigner, firstProducerAddress,"Andrew's Honey")

		expect(txReceipt.status).toEqual(1)

		// txReceipt = await genesisContract.createProducer(secondProducerSigner, secondProducerAddress,'City Honey')
		//
		// expect(txReceipt.status).toEqual(1)
	}, 20000)

	test("Add Claims", async()=>
	{
		let txReceipt = await genesisContract.createClaim(firstProducerSigner, "Produced in New York")
		expect(txReceipt.status).toEqual(1)

		// txReceipt = await genesisContract.createClaim(secondProducerSigner, "Produced in New York")
		// expect(txReceipt.status).toEqual(1)
	}, 20000)

	test("Validation", async()=>
	{
		//producerAddress: string, claimId: number, score: number
		let txReceipt = await genesisContract.validateClaim(consumer1Signer, firstProducerAddress, 0, 5)
		expect(txReceipt.status).toEqual(1)
	}, 20000)
})