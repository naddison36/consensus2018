"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractPrivateKeySigner_1 = require("./AbstractPrivateKeySigner");
class EnvSignerFactory {
    create(address, provider) {
        const signer = new EnvSigner(address, provider);
        return signer.loadSigner();
    }
}
exports.default = EnvSignerFactory;
class EnvSigner extends AbstractPrivateKeySigner_1.default {
    getPrivateKey(address) {
        return new Promise((resolve, reject) => {
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
//# sourceMappingURL=EnvSigner.js.map