import * as bip39 from "bip39"
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32"

bitcoin.initEccLib(ecc);

const bip32 = BIP32Factory(ecc);

const dogeCoin = {
    messagePrefix: "\x19Dogecoin Signed Message:\n",
    bech32: "",
    bip32: {
        public: 0x02facafd,
        private: 0x02fac398,
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
};


export const generateDogeAddress = async (passPhrase, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(passPhrase);
        const root = bip32.fromSeed(seed, dogeCoin);

        const path = `m/44'/3'/0'/0/${accountIndex}`;
        const child = root.derivePath(path);

        const { address } = new bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: dogeCoin
        })

        return {
            address,
            privateKey: child.toWIF()
        }
    } catch (error) {
        console.error("error in generate address of doge coin", error)
    }
}

// const res = await generateDogeAddress(passPhrase);

// console.log("res", res);

export const generateDerivedDogeAddress = async (passPhrase, count = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(passPhrase);
        const root = bip32.fromSeed(seed);

        const path = `m/44'/3'/${count}'/0/0`;
        const child = root.derivePath(path);

        const { address } = new bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: dogeCoin
        })

        return {
            address,
            privateKey: child.toWIF()
        }
    } catch (error) {
        console.error("error in generate address of doge coin", error)
    }
}

// const res = await generateDerivedDogeAddress(passPhrase, 1);

// console.log("res", res);
