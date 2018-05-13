import {providers, Wallet, Transaction} from 'ethers';
import {readFileSync} from "fs";
import * as VError from 'verror';

import {Signer, SignerFactory} from "./index";

export default class EncryptedWalletSignerFactory implements SignerFactory
{
    constructor(protected password: string,
                protected folder: string = process.cwd() + '/keystore/')
    {
        if (!password) {
            throw Error("EncryptedWalletSignerFactory constructor's first param must be the password to the encrypted json wallet file");
        }
    };

    create(address: string, provider: providers.Provider): Promise<Signer>
    {
        return new Promise<Signer>(async (resolve, reject) =>
        {
            try {
                // find encrypted json file for the address
                const filename = this.folder + address;

                // read encrypted json wallet from the file
                const encryptedJsonWallet = readFileSync(filename);

                // get the private key from the encrypted json using the password
                const wallet = await Wallet.fromEncryptedWallet(encryptedJsonWallet, this.password);

                resolve(new EncryptedWalletSigner(wallet, provider));
            }
            catch (err) {
                reject(new VError(err, `Could not decrypted keystore file ${this.folder + address} using the given password. Error: ${err.message}`));
            }
        });
    }
}

export class EncryptedWalletSigner implements Signer
{
    constructor(protected wallet: Wallet, public provider: providers.Provider)
    {
        if (!wallet || !(wallet instanceof Wallet)) {
            throw Error("EncryptedWalletSigner constructor's first param must be an Ethers.js Wallet");
        }

        if (!provider) {
            throw Error("EncryptedWalletSigner constructor's second param must be an Ethers.js Provider");
        }
    }

    getAddress(): Promise<string>
    {
        return Promise.resolve(this.wallet.address);
    }

    sign(transaction: Transaction): Promise<string>
    {
        return this.wallet.sign(transaction);
    }
}