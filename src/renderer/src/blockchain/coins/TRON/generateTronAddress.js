import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import { TronWeb } from "tronweb";
import { BIP32Factory } from "bip32";
import { Buffer } from "buffer";

const bip32 = BIP32Factory(ecc);

export const generateTronAddress = async (mnemonic, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);

        const root = bip32.fromSeed(seed);
        const path = `m/44'/195'/0'/0/${accountIndex}`;
        const child = root.derivePath(path);

        const privateKey = Buffer.from(child.privateKey).toString("hex");

        const tronWeb = new TronWeb({
            fullHost: "https://api.trongrid.io"
        });

        const address = tronWeb.address.fromPrivateKey(privateKey);

        return {
            address,
            privateKey,
            tronWeb
        };

    } catch (error) {
        console.error("❌ Error in generate address for tron:", error);
        return null;
    }
};

export const generateDerivedTronAddress = async (mnemonic, count = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);

        const root = bip32.fromSeed(seed);
        const path = `m/44'/195'/0'/0/${count}`;
        const child = root.derivePath(path);

        const privateKey = Buffer.from(child.privateKey).toString("hex");

        const tronWeb = new TronWeb({
            fullHost: "https://api.trongrid.io",
            privateKey: privateKey
        });

        const address = tronWeb.address.fromPrivateKey(privateKey);

        return {
            address,
            privateKey,
            tronWeb
        };

    } catch (error) {
        console.error("❌ Error in generate address for tron:", error);
        return null;
    }
};

// const res = await generateDerivedTronAddress(mnemonic, 2);
// console.log("res", res);