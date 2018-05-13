"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const fs_1 = require("fs");
const VError = require("verror");
class EncryptedWalletSignerFactory {
    constructor(password, folder = process.cwd() + '/keystore/') {
        this.password = password;
        this.folder = folder;
        if (!password) {
            throw Error("EncryptedWalletSignerFactory constructor's first param must be the password to the encrypted json wallet file");
        }
    }
    ;
    create(address, provider) {
        return new Promise(async (resolve, reject) => {
            try {
                // find encrypted json file for the address
                const filename = this.folder + address;
                // read encrypted json wallet from the file
                const encryptedJsonWallet = fs_1.readFileSync(filename);
                // get the private key from the encrypted json using the password
                const wallet = await ethers_1.Wallet.fromEncryptedWallet(encryptedJsonWallet, this.password);
                resolve(new EncryptedWalletSigner(wallet, provider));
            }
            catch (err) {
                reject(new VError(err, `Could not decrypted keystore file ${this.folder + address} using the given password. Error: ${err.message}`));
            }
        });
    }
}
exports.default = EncryptedWalletSignerFactory;
class EncryptedWalletSigner {
    constructor(wallet, provider) {
        this.wallet = wallet;
        this.provider = provider;
        if (!wallet || !(wallet instanceof ethers_1.Wallet)) {
            throw Error("EncryptedWalletSigner constructor's first param must be an Ethers.js Wallet");
        }
        if (!provider) {
            throw Error("EncryptedWalletSigner constructor's second param must be an Ethers.js Provider");
        }
    }
    getAddress() {
        return Promise.resolve(this.wallet.address);
    }
    sign(transaction) {
        return this.wallet.sign(transaction);
    }
}
exports.EncryptedWalletSigner = EncryptedWalletSigner;
//# sourceMappingURL=EncryptedWalletSigner.js.map