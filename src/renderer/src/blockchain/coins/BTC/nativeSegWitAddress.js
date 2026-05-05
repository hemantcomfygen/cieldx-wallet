import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";

bitcoin.initEccLib(ecc);

const bip32 = BIP32Factory(ecc);

export const nativeSegWitAddress = async (mnemonic, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed);

        const path = `m/84'/0'/0'/0/${accountIndex}`;
        const child = root.derivePath(path);

        const { address } = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            // network: bitcoin.networks.bitcoin
        })

        return {
            address,
            privateKey: child.toWIF()
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

// const res = await nativeSegWitAddress(mnemonic);
// console.log(res);

export const derivedNativeSegWitAddress = async (mnemonic, count = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed);

        const path = `m/84'/0'/${count}'/0/0`;
        const child = root.derivePath(path);

        const { address } = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network: bitcoin.networks.bitcoin
        })

        return {
            address,
            privateKey: child.toWIF()
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

// const res = await derivedNativeSegWitAddress(mnemonic, 7);
// console.log(res);