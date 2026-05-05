import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";

bitcoin.initEccLib(ecc);

const bip32 = BIP32Factory(ecc);

export const generateSegWitAddress = async (mnemonic, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed);

        const path = `m/49'/0'/0'/0/${accountIndex}`;
        const child = root.derivePath(path);

        const p2kb = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey
        })

        const { address } = bitcoin.payments.p2sh({
            redeem: p2kb
        });

        return {
            address,
            privateKey: child.toWIF()
        }

    } catch (error) {
        console.error("❌ Error in generating segwit address:", error);
    }
};

// const res = await generateSegWitAddress(mnemonic);
// console.log(res);


export const generateDerivedSegWitAddress = async (mnemonic, count = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed);

        const path = `m/49'/0'/${count}'/0/0`;
        const child = root.derivePath(path);

        const p2kb = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey
        })

        const { address } = bitcoin.payments.p2sh({
            redeem: p2kb
        });

        return {
            address,
            privateKey: child.toWIF()
        }

    } catch (error) {
        console.error("❌ Error in generating segwit address:", error);
    }
};