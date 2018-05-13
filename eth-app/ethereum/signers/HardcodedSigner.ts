import AbstractPrivateKeySigner from './AbstractPrivateKeySigner';
import {providers} from 'ethers';
import {SignerFactory, Signer} from "./index";

export default class HardcodedSignerFactory implements SignerFactory
{
    create(address: string, provider: providers.Provider): Promise<Signer>
    {
        const signer = new HardcodedSigner(address, provider);
        return signer.loadSigner();
    }
}

class HardcodedSigner extends AbstractPrivateKeySigner
{
    getPrivateKey(address: string): Promise<string>
    {
        return new Promise((resolve, reject)=>
        {
			if (address == '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf') {
				resolve('0x0000000000000000000000000000000000000000000000000000000000000001');
			}
			else if (address == '2b5ad5c4795c026514f8317c7a215e218dccd6cf') {
				resolve('0x0000000000000000000000000000000000000000000000000000000000000002');
			}
            else if (address == '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A') {
                resolve('0x1111111111111111111111111111111111111111111111111111111111111111');
            }
            else if (address == '0x1563915e194D8CfBA1943570603F7606A3115508') {
                resolve('0x2222222222222222222222222222222222222222222222222222222222222222');
            }
            else if (address == '0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB') {
                resolve('0x3333333333333333333333333333333333333333333333333333333333333333');
            }
            else if (address == '0x7564105E977516C53bE337314c7E53838967bDaC') {
                resolve('0x4444444444444444444444444444444444444444444444444444444444444444');
            }
			else if (address == '0xe1fAE9b4fAB2F5726677ECfA912d96b0B683e6a9') {
                resolve('0x5555555555555555555555555555555555555555555555555555555555555555');
			}
			else if (address == '0xdb2430B4e9AC14be6554d3942822BE74811A1AF9') {
					resolve('0x6666666666666666666666666666666666666666666666666666666666666666');
			}
			else if (address == '0xAe72A48c1a36bd18Af168541c53037965d26e4A8') {
				resolve('0x7777777777777777777777777777777777777777777777777777777777777777');
			}

            reject(new Error(`Could not find private key for address ${address}`));
        });
    }
}