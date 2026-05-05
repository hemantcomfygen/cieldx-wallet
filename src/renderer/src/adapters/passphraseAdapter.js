import * as bip39 from "bip39";
// import { generateDogecoinWallet, generateLitecoinWallet, getBTCWallet } from "../chains/btc/wallet";
// import { getKeypairFromMnemonic } from "../chains/solana/wallet";
// import { getTronWallet } from "../chains/tron/wallet";
// import { getWallet } from "../chains/evm/wallet";
import { getChainType } from "./chainAdapter";
// import { rippleAddressGenerate } from "../chains/xrp/wallet";
// import { stellarAddressGenerate } from "../chains/xml/wallet";
import { getEvmBalance } from "../chains/evm/balance";
// import { getTronBalance } from "../chains/tron/balance";
// import { getSolanaBalance } from "../chains/solana/balance";
// import { getStellarBalance } from "../chains/xml/balance";
// import { getXrpBalance } from "../chains/xrp/balance";
// import { getUtxoBalance } from "../chains/btc/balance";

// 🔥 MAIN FUNCTION
export const generateAddressFromMnemonic = async ({
  mnemonic,
  chain,
  coin
}) => {
  const chainType = getChainType(chain);

  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic");
  }


  switch (chainType) {
    case "EVM":
      return getWallet(mnemonic).address;

    // case "TRON": {
    //   const tronWallet = await getTronWallet(mnemonic);
    //   return tronWallet.address;
    // }

    // case "SOLANA":
    //   return (await getKeypairFromMnemonic(mnemonic)).publicKey.toString();

    // case "UTXO":
    //   if (coin === "DOGE") {
    //     return (await generateDogecoinWallet(mnemonic)).address;
    //   }
    //   if (coin === "LTC") {
    //     return (await generateLitecoinWallet(mnemonic)).address;
    //   }
    //   return (await getBTCWallet(mnemonic)).address;

    // case "XRP":
    //   return (await rippleAddressGenerate(mnemonic)).address;

    // case "XML":
    //   return (await stellarAddressGenerate(mnemonic)).address;

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

export const getBalance = async ({ address, token }) => {
  const chainType = getChainType(token.chain);

  switch (chainType) {
    case "EVM":
      return getEvmBalance({ address, token });

    // case "TRON":
    //   return getTronBalance({ address, token });

    // case "SOLANA":
    //   return getSolanaBalance({ address, token });

    // case "XML":
    //   return getStellarBalance({ address, token });
    // case "XRP":
    //   return getXrpBalance({ address, token });


    // case "UTXO":
    //   return getUtxoBalance({ address, coin: token.symbol });

    // case "SOLANA":
    //   return getSolanaBalance({ address, token });

    default:
      throw new Error(`Unsupported chain: ${token.chain}`);
  }
};