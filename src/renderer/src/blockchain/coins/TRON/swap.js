import BigNumber from "bignumber.js";
import axios from "axios";
import { approveTronToken } from "./approve";
import { BRIDGER_CONTRACTS } from "../../../config/bridgerContracts";

export const waitForTronTx = async (tronWeb, txid, retries = 20) => {
  for (let i = 0; i < retries; i++) {
    const tx = await tronWeb.trx.getTransactionInfo(txid);

    if (tx && tx.id) {
      console.log("✅ TX Confirmed:", txid);
      return tx;
    }

    await new Promise((res) => setTimeout(res, 3000));
  }

  throw new Error("❌ Transaction not confirmed");
};

export const tronSwap = async ({
  tronWeb,
  fromToken,
  toToken,
  amount,
  quote,
  userAddress,
  slippage
}) => {
  try {
    console.log("🔍 TRON Swap Params:", {
      fromToken,
      toToken,
      amount,
      quote,
      userAddress
    });

    const contractAddress = quote.contractAddress;
    const contract = await tronWeb.contract().at(contractAddress);

    const isNative = fromToken.swapSymbol === "TRX";
    const isSameChain = fromToken.chainType === toToken.chainType;

    const destination = userAddress; // ALWAYS TRON

    const amountRaw = new BigNumber(amount).toFixed(0);
    const minReturn = new BigNumber(quote.amountOutMin).toFixed(0);

    console.log("🔥 SWAP MODE:", {
      isNative,
      isSameChain,
      toToken: toToken.swapSymbol,
      destination,
    });

    let txid;

    // =========================================
    // 🔁 SAME CHAIN (TRON → TRON)
    // =========================================
    if (isSameChain) {
      if (isNative) {
        txid = await contract
          .swapEth(toToken.swapSymbol, destination, minReturn)
          .send({
            callValue: amountRaw,
            feeLimit: 100_000_000,
          });
      } else {
        txid = await contract
          .swap(
            fromToken.swapAddress,
            toToken.swapSymbol,
            destination,
            amountRaw,
            minReturn
          )
          .send({
            feeLimit: 100_000_000,
          });
      }
    }

    // =========================================
    // 🌉 CROSS CHAIN (TRON → BSC, ETH, etc.)
    // =========================================
    else {
      // ⚠️ format MUST be exact
      const toTokenCode = `${toToken.swapSymbol}`;

      if (isNative) {
        txid = await contract
          .swapEth(toTokenCode, destination, minReturn)
          .send({
            callValue: amountRaw,
            feeLimit: 100_000_000,
          });
      } else {
        txid = await contract
          .swap(
            fromToken.swapAddress,
            toTokenCode,
            destination,
            amountRaw,
            minReturn
          )
          .send({
            feeLimit: 100_000_000,
          });
      }
    }

    console.log("🚀 TRON TX:", txid);
    console.log("🚀 TRON Swap TX:", txid);

    // =========================================
    // ✅ ORDER UPDATE
    // =========================================
    const orderPayload = {
      equipmentNo: txid.slice(0, 32),
      sourceFlag: "widget",

      hash: txid,

      fromTokenAddress: fromToken.swapAddress,
      toTokenAddress: toToken.swapAddress,

      fromAddress: fromToken.address, // ✅ TRON
      toAddress: toToken.address,         // destination chain (BSC)

      fromTokenChain: fromToken.chainType,
      toTokenChain: toToken.chainType,

      fromTokenAmount: quote.fromTokenAmount, // ✅ USE THIS
      amountOutMin: quote.amountOutMin,

      fromCoinCode: fromToken.swapSymbol,
      toCoinCode: toToken.swapSymbol,

      slippage: slippage,
    };

    console.log("📊 TRON Order Payload:", orderPayload);

    const order = await axios.post(
      "https://api.bridgers.xyz/api/exchangeRecord/updateDataAndStatus",
      orderPayload
    );


    const re = await axios.post(
      `https://dev-dwm.jamsara.com/api/coin/createSwapMetaData`, { metaData: orderPayload, swapId: order?.data?.data?.orderId || orderPayload.fromAddress }, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("✅ TRON Swap executed:", order);

    return txid;
  } catch (error) {
    console.error("❌ TRON Swap Error:", error);
    throw error?.message || "Swap failed";
  }
};