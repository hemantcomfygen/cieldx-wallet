

// 1.

import { ethersHDNodeWallet } from "tronweb/utils";


const getTonWalletV5 = async(mnemonic) => {
    const signer = await Signer.fromMnemonic(
      mnemonic.split(' '), // list of 24 strings
      {
        type: 'ton',
      },
    );
    
    // 2.
    const walletAdapter = await ethersHDNodeWallet.create(signer, {
      network: Network.mainnet(),
      client: kit.getApiClient(Network.mainnet()),
    });
    const wallet = await kit.addWallet(walletAdapter);


    return {
        wallet
    }
}
    

// 3.
(async () => {
    console.log("getTonWallet", await getTonWalletV5("champion lonely high caution fantasy silk accuse exclude nerve right pear exclude tomorrow vocal leaf pen they ask cherry siege sad detect oxygen sister"))

    const safe = Address.parse("UQB8BC5S33AMr7oHkwlR4qhpJV46u3VLTLT1Ry0Ie3rTdAmu");
console.log("Safe raw:", safe.toRawString());
})()
