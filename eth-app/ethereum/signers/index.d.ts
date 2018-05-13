import {Transaction, providers} from 'ethers';

export interface Signer
{
    provider: providers.Provider
    getAddress(): Promise<string>,
    sign(transaction: Transaction): Promise<string>
}

export interface SignerFactory
{
    create(keyId: string, provider: providers.Provider): Promise<Signer>
}