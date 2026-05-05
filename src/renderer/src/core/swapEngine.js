import { getChainType } from "../adapters/chainAdapter";
import { btcSwap } from "../blockchain/coins/BTC/swap";
import { evmSwap } from "../blockchain/coins/ETH/swap";
import { solanaSwap } from "../blockchain/coins/SOL/swap";
import { generateTronAddress } from "../blockchain/coins/TRON/generateTronAddress";
import { tronSwap } from "../blockchain/coins/TRON/swap";
import { xlmSwap } from "../blockchain/coins/XLM/swap";
import { xrpSwap } from "../blockchain/coins/XRP/swap";

import { getBridgerQuote } from "./routeEngine";

export const executeSwap = async (params) => {
  try {
    const type = getChainType(params.fromToken.chainType);

    console.log("🔍 Chain Type:", type);

    // ✅ Fix address source
    const userAddr = params.fromAddress;

    // ✅ Use existing quote if available
    const quote = params.quote || await getBridgerQuote({
      fromTokenAddress: params.fromToken.address,
      toTokenAddress: params.toToken.address,
      amount: params.amount,
      fromChain: params.fromToken.chain || params.fromToken.chainType,
      toChain: params.toToken.chain || params.toToken.chainType,
      userAddr,
    });

    console.log("📊 Quote:", quote);

    // ✅ validation
    // if (!params.fromAddress || !params.toAddress) {
    //   throw new Error("❌ Missing from/to address");
    // }

    switch (type) {

      case "EVM":
        return await evmSwap({ ...params, quote });

      case "SOLANA":
        return await solanaSwap({
          ...params,
          quote,
          // fromAddress: params.fromAddress,
          // toAddress: params.toAddress,
          fromAddress: params.fromToken.address,
          toAddress: params.toToken.address,
        });

      case "UTXO": {
        return await btcSwap({ ...params, quote });
      }

      case "TRON": {
        const { tronWeb, privateKey, address } = await generateTronAddress(params?.mnemonic);

        tronWeb.setPrivateKey(privateKey);
        tronWeb.setAddress(address);
        return await tronSwap({ ...params, quote, tronWeb });
      }


      case "XRP": {
        return xrpSwap({ ...params, quote })
      }
      case "XLM": {
        return xlmSwap({ ...params, quote })
      }

      case "TON":
        return Promise.reject(new Error("TON swap not implemented yet"));

      default:
        throw new Error(`❌ Unsupported chain: ${type}`);
    }

  } catch (err) {
    console.error("❌ Swap Engine Error:", err);
    throw err?.message || "Swap failed";
  }
};