import {providers as Providers} from 'ethers';
import HardcodedSignerFactory from '../HardcodedSigner';

describe("Hardcoded Signer", ()=>
{
    const signerFactory = new HardcodedSignerFactory();

    const jsonRpcProviderURL = process.env.RPCPROVIDER || "http://localhost:8646";  // Geth or Parity
    const provider = new Providers.JsonRpcProvider(jsonRpcProviderURL, "unspecified");

    const firstTestAccount = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A';
    const secondTestAccount = '0x1563915e194D8CfBA1943570603F7606A3115508';

    test("create wallet using known address", async ()=>
    {
        const signer = await signerFactory.create(firstTestAccount, provider);

        expect(await signer.getAddress()).toEqual(firstTestAccount);
    });

    test("Sign a transaction", async ()=>
    {
        const signer = await signerFactory.create('0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A', jsonRpcProviderURL);

        const testTransaction = {
            chainId: 0,
            from: firstTestAccount,
            to: secondTestAccount,
            nonce: 0,
            gasPrice: 1000000000,
            gasLimit: 2000000,
            value: 1000000
        };

        const rawTx = await signer.sign(testTransaction);
        expect(rawTx).toEqual('0xf86780843b9aca00831e8480941563915e194d8cfba1943570603f7606a3115508830f4240801ba0b41f7d303b26e50b712a286803b080b29814060fd052d08f07ed5585fd52ec2ca06c277aeb2a7fb379689c7fe484d70cc9f6aadf810237966ac9960e477209484c');
    });
});