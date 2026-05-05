import Mnemonic from "bitcore-mnemonic";
import bitcore from "bitcore-lib";

export const generateLegacyAddress = async (passPhrase, accountIndex = 0) => {
    try {
        const seed = new Mnemonic(passPhrase);
        const hdPrivateKey = seed.toHDPrivateKey();

        const path = `m/44'/0'/0'/0/${accountIndex}`;

        const derivePath = hdPrivateKey.derive(path);
        const legacyPrivateKey = derivePath.privateKey;

        const privateKey = new bitcore.PrivateKey(legacyPrivateKey);

        const address = privateKey.toAddress().toString();

        return {
            address: address,
            privateKey: privateKey.toString("hex")
        };
    } catch (error) {
        console.error("❌ Error at generateLegacyAddress:", error);
        return null;
    }
}


// const res = await generateLegacyAddress(passphrase)
// console.log("res", res)

export const generateDerivedLegacyAddress = async (mnemonic, index = 0) => {
    try {
        // 1. mnemonic → seed
        const seed = await bip39.mnemonicToSeed(mnemonic);

        // 2. root node
        const root = bip32.fromSeed(seed);

        const path = `m/44'/0'/${index}'/0/0`;
        const child = root.derivePath(path);

        const { address } = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
        });

        return {
            address,
            privateKey: child.toWIF(),
            path,
        };
    } catch (err) {
        console.error("❌ BTC Legacy Error:", err);
    }
};

// const mnemonic = "champion lonely high caution fantasy silk accuse exclude nerve right pear exclude tomorrow vocal leaf pen they ask cherry siege sad detect oxygen sister";

// const res = await generateDerivedLegacyAddress(mnemonic, 1);
// console.log("res", res);