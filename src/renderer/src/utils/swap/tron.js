import { ethers } from "ethers";

export const mnemonicToPrivateKey = (mnemonic) => {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return wallet.privateKey;
};