import * as bip39 from 'bip39'
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";


export const generateSolAddress = async (passphrase, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(passphrase);

        const defaultPath = `m/44'/501'/${accountIndex}'/0'`
        const optionPath = "m/44'/501'/0'"

        const defaultDerivedSeed = derivePath(defaultPath, seed.toString("hex")).key;

        const defaultKeyPair = Keypair.fromSeed(defaultDerivedSeed);

        const optionDerivedPath = derivePath(optionPath, seed.toString('hex')).key;

        const optionalKeyPair = Keypair.fromSeed(optionDerivedPath)

        // return {
        //     default: {
        //         address: defaultKeyPair.publicKey.toBase58(),
        //         privateKey: bs58.encode(defaultKeyPair.secretKey),
        //     },
        //     optional: {
        //         address: optionalKeyPair.publicKey.toBase58(),
        //         privateKey: bs58.encode(optionalKeyPair.secretKey)
        //     }
        // }

        return {
            default: {
                address: defaultKeyPair.publicKey.toBase58(),
                privateKey: bs58.encode(defaultKeyPair.secretKey),
            },
            optional: {
                address: optionalKeyPair.publicKey.toBase58(),
                privateKey: bs58.encode(optionalKeyPair.secretKey)
            },
            address: defaultKeyPair.publicKey.toBase58(),
            privateKey: bs58.encode(defaultKeyPair.secretKey),
        }
    } catch (error) {
        console.error("❌ error in generate address of SOL : ", error)
    }
}

// const res = await generateSolAddress(passphrase)
// console.log("res", res)


export const generateSolDerivedAddress = async (passphrase, count) => {
    try {
        const seed = await bip39.mnemonicToSeed(passphrase);

        const defaultPath = `m/44'/501'/${count}'/0'`;
        const optionPath = "m/44'/501'/0'"

        const defaultDerivedSeed = derivePath(defaultPath, seed.toString("hex")).key;

        const defaultKeyPair = Keypair.fromSeed(defaultDerivedSeed);

        const optionDerivedPath = derivePath(optionPath, seed.toString('hex')).key;

        const optionalKeyPair = Keypair.fromSeed(optionDerivedPath)

        // return {
        //     default: {
        //         address: defaultKeyPair.publicKey.toBase58(),
        //         privateKey: bs58.encode(defaultKeyPair.secretKey),
        //     },
        //     optional: {
        //         address: optionalKeyPair.publicKey.toBase58(),
        //         privateKey: bs58.encode(optionalKeyPair.secretKey)
        //     }
        // }

        return {
            default: {
                address: defaultKeyPair.publicKey.toBase58(),
                privateKey: bs58.encode(defaultKeyPair.secretKey),
            },
            optional: {
                address: optionalKeyPair.publicKey.toBase58(),
                privateKey: bs58.encode(optionalKeyPair.secretKey)
            },
            address: defaultKeyPair.publicKey.toBase58(),
            privateKey: bs58.encode(defaultKeyPair.secretKey),
        }
    } catch (error) {
        console.error("❌ error in generate address of SOL : ", error)
    }
}

// const res = await generateSolDerivedAddress(passphrase, 1);
// console.log("res", res)


export async function getKeypairFromMnemonic(mnemonic) {
    const seed = await bip39.mnemonicToSeed(mnemonic);

    const path = "m/44'/501'/0'/0'";

    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    const keypair = Keypair.fromSeed(derivedSeed);

    console.log("🪙 Solana Public Key:", keypair.publicKey.toBase58());

    return keypair;
}