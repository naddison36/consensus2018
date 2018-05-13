import {providers, Wallet, Transaction} from 'ethers';
import {Signer} from "./index";

export default abstract class AbstractPrivateKeySigner implements Signer
{
    wallet: Wallet;

    constructor(protected address: string, public provider: providers.Provider) {}

    async loadSigner(): Promise<Signer>
    {
        const privateKey = await this.getPrivateKey(this.address);
        this.wallet = new Wallet(privateKey, this.provider);

        return Promise.resolve(this);
    }

    getAddress(): Promise<string>
    {
        return Promise.resolve(this.address);
    }

    sign(transaction: Transaction): Promise<string>
    {
        return this.wallet.sign(transaction);
    }

    protected abstract getPrivateKey(address: string): Promise<string>
}