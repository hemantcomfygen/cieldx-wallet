import * as bip39 from "bip39"
import { derivePath } from "ed25519-hd-key"
import { Keypair } from "@stellar/stellar-sdk";

export const generateXlmAddress = async (passPhrase, accountIndex = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(passPhrase);

        const path = `m/44'/148'/${accountIndex}'`
        const child = derivePath(path, seed.toString("hex")).key

        const keyPair = Keypair.fromRawEd25519Seed(child)

        const address = keyPair.publicKey()
        const privateKey = keyPair.secret()

        return {
            address,
            privateKey
        }

    } catch (error) {
        console.log("error in generating address of XLM", error)
    }
}

// const res = await generateXlmAddress(passPhrase)
// console.log("res", res)


export const generateDerivedXlmAddress = async (passPhrase, count = 0) => {
    try {
        const seed = await bip39.mnemonicToSeed(passPhrase);

        const path = `m/44'/148'/${count}'`
        const child = derivePath(path, seed.toString("hex")).key

        const keyPair = Keypair.fromRawEd25519Seed(child)

        const address = keyPair.publicKey()
        const privateKey = keyPair.secret()

        return {
            keyPair,
            address,
            privateKey
        }

    } catch (error) {
        console.log("error in generating address of XLM", error)
    }
}

// const res = await generateDerivedXlmAddress(passPhrase, 0);
// console.log("res", res)