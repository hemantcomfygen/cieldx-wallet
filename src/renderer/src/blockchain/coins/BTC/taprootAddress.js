import * as bitcoin from "bitcoinjs-lib"
import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1"
import { BIP32Factory } from "bip32"

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc)

export const generateTapRootAddress = async (passPhrase, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(passPhrase);

        const root = bip32.fromSeed(seed);

        const path = `m/86'/0'/0'/0/${accountIndex}`;

        const child = root.derivePath(path);

        const pubkey = child.publicKey.slice(1, 33)

        const { address } = new bitcoin.payments.p2tr({
            internalPubkey: pubkey
        })

        return {
            address,
            privateKey: child.toWIF()
        }

    } catch (error) {
        console.error("error in generate address of taproot", error);
    }
}

// const res = await generateTapRootAddress(mnemonic);

// console.log("res", res);