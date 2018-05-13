import AbstractPrivateKeySigner from './AbstractPrivateKeySigner';
import {providers} from 'ethers';
import {Signer, SignerFactory} from "./index";

export default class EnvSignerFactory implements SignerFactory
{
    create(address: string, provider: providers.Provider): Promise<Signer>
    {
        const signer = new EnvSigner(address, provider);
        return signer.loadSigner();
    }
}

class EnvSigner extends AbstractPrivateKeySigner
{
    getPrivateKey(address: string): Promise<string>
    {
        return new Promise((resolve, reject)=>
        {
            const privateKey = process.env[address];

            if (privateKey) {
                resolve(privateKey);
            }
            else {
                const error = new Error(`could not find environment variable called ${address} that has the private key`);
                reject(error);
            }
        });
    }
}