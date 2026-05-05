import * as bip39 from "bip39"
import * as bitcoin from "bitcoinjs-lib"
import * as ecc from "tiny-secp256k1"
import { BIP32Factory } from "bip32"
import { ECPairFactory } from "ecpair";

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

const liteCoin = {
    messagePrefix: "\x19Litecoin Signed Message:\n",
    bech32: "ltc",
    bip32: {
        public: 0x019da462,
        private: 0x019d9cfe,
    },
    pubKeyHash: 0x30,   // L...
    scriptHash: 0x32,   // M...
    wif: 0xb0,
};

export const generateLtcAddress = async (passPhrase, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeedSync(passPhrase);
        const root = bip32.fromSeed(seed, liteCoin);

        const path = `m/44'/2'/0'/0/${accountIndex}`
        const child = root.derivePath(path);

        const keyPair = ECPair.fromPrivateKey(child.privateKey, {
            network: liteCoin,
        });

        const p2pkhLtc = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: liteCoin
        })

        return {
            p2pkhLtc,
            keyPair,
            address: p2pkhLtc.address,
            privateKey: child.toWIF()
        }
    } catch (error) {
        console.error("❌ Error in generating address of LTC:", error);
    }
}

// const res = await generateLtcAddress(passPhrase);
// console.log("address", res)



export const generateDerivedLtcAddress = async (passPhrase, count = 0) => {
    try {
        const seed = await bip39.mnemonicToSeedSync(passPhrase);
        const root = bip32.fromSeed(seed, liteCoin);

        const path = `m/44'/2'/${count}'/0/0`
        const child = root.derivePath(path);

        const { address } = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: liteCoin
        })

        return {
            address,
            privateKey: child.toWIF()
        }
    } catch (error) {
        console.error("❌ Error in generating address of LTC:", error);
    }
}

