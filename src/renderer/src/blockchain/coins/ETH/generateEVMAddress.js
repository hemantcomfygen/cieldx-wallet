import { HDNodeWallet } from "ethers";

export const generateEVMAddress = async (passphrase, accountIndex = 0) => {
    try {
        const wallet = HDNodeWallet.fromPhrase(passphrase, "", `m/44'/60'/0'/0/${accountIndex}`);
        const data = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey
        }
        return data;
    } catch (error) {
        console.error("❌ error in generate address of ETH : ", error)
    }
}

// const res = await generateEVMAddress(passphrase);

// console.log("res", res);


export const generateDerivedEvmAddressWithPassphrase = async (mnemonic, count = 0) => {
    try {
        const root = HDNodeWallet.fromPhrase(mnemonic, "", `m/44'/60'/0'/0/${count}`);

        const wallets = [];

        return {
            address: root.address,
            privateKey: root.privateKey
        };
    } catch (error) {
        console.error("❌ Error: ", error);
    }
}

// const res = await generateDerivedEvmAddressWithPassphrase(passphrase, 2);
// console.log("res with passphrase:", res);