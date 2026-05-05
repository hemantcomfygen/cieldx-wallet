import { useState } from "react";
import { generateAddressFromMnemonic } from "../adapters/passphraseAdapter";

export const useWallet = () => {
  const [fromAddress, setFromAddress] = useState(null);
  const [toAddress, setToAddress] = useState(null);

  const connectFrom = async ({ mnemonic, chain, coin }) => {
    const addr = await generateAddressFromMnemonic({
      mnemonic,
      chain,
      coin,
    });

    setFromAddress(addr);
  };

  const connectTo = async ({ mnemonic, chain, coin }) => {
    const addr = await generateAddressFromMnemonic({
      mnemonic,
      chain,
      coin,
    });

    setToAddress(addr);
  };

  return {
    fromAddress,
    toAddress,
    connectFrom,
    connectTo,
  };
};