import { Wallet } from "xrpl";

export const generateXrpAddress = async (passPhrase, accountIndex = 0) => {
    try {
        const path = `m/44'/144'/0'/0/${accountIndex}`

        const wallet = Wallet.fromMnemonic(passPhrase, {
            derivationPath: path,
            mnemonicEncoding: "bip39",
        });

        return {
            address: wallet.classicAddress,
            privateKey: wallet.privateKey,
            seed: wallet.privateKey,
            mnemonic: passPhrase 
        }
    } catch (error) {
        console.error("error in generating address of XRP", error)
    }
}

// const res = await generateXrpAddress(passPhrase)
// console.log("res", res)

export const generateDerivedXrpAddress = async (passPhrase, count = 0) => {
    try {
        const path = `m/44'/144'/${count}'/0/0`

        const wallet = Wallet.fromMnemonic(passPhrase, { derivationPath: path, mnemonicEncoding: "bip39" });

        return {
            address: wallet.classicAddress,
            privateKey: wallet.privateKey
        }
    } catch (error) {
        console.error("error in generating address of XRP", error)
    }
}
