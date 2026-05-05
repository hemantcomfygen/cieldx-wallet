// adapters/walletAdapter.js
import { getChainType } from "./chainAdapter";

export const getWallet = (chain) => {
  const type = getChainType(chain);

  switch (type) {
    case "EVM":
      return window.ethereum;

    case "TRON":
      return window.tronWeb;

    case "SOLANA":
      return window.solana;

    default:
      throw new Error("Wallet not supported");
  }
};