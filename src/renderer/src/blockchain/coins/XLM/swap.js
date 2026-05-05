import {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Asset,
  Operation
} from "@stellar/stellar-sdk";

import axios from "axios";

export const xlmSwap = async ({
  fromToken,
  toToken,
  amount,
  quote,
  userAddress
}) => {
  try {
    console.log("🔍 XLM Swap Params:", {
      fromToken,
      toToken,
      amount,
      quote,
      userAddress
    });

    // ✅ Connect to Horizon
    const server = new Server(fromToken.rpcUrl);

    // ✅ Wallet
    const keypair = Keypair.fromSecret(fromToken?.privateKey);
    const account = await server.loadAccount(keypair.publicKey());

    // ============================
    // ✅ Assets
    // ============================
    const sourceAsset =
      fromToken.swapSymbol === "XLM"
        ? Asset.native()
        : new Asset(fromToken.code, fromToken.issuer);

    const destinationAsset =
      toToken.swapSymbol === "XLM"
        ? Asset.native()
        : new Asset(toToken.code, toToken.issuer);

    // ============================
    // ✅ Amounts
    // ============================
    const sendAmount = amount.toString();
    const minDestAmount = quote.amountOutMin.toString();

    console.log("🧾 Final Params:", {
      sendAmount,
      minDestAmount
    });

    // ============================
    // ✅ Build Transaction
    // ============================
    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.PUBLIC
    })
      .addOperation(
        Operation.pathPaymentStrictSend({
          sendAsset: sourceAsset,
          sendAmount: sendAmount,
          destination: userAddress,
          destAsset: destinationAsset,
          destMin: minDestAmount,
          path: [] // optional routing path
        })
      )
      .setTimeout(180)
      .build();

    // ✅ Sign
    tx.sign(keypair);

    console.log("🚀 Submitting XLM transaction...");

    const result = await server.submitTransaction(tx);

    console.log("✅ XLM Swap Success:", result.hash);

    await sendOrderPayload({
      hash: result.hash,
      fromToken,
      toToken,
      userAddress,
      amount: sendAmount,
      minReturn: minDestAmount
    });

    return result.hash;

  } catch (error) {
    console.error("❌ XLM Swap Error:", error.response?.data || error.message);
    throw error.message || "Swap failed";
  }
};


const sendOrderPayload = async ({
  hash,
  fromToken,
  toToken,
  userAddress,
  amount,
  minReturn
}) => {
  try {
    const orderPayload = {
      equipmentNo: userAddress.slice(0, 32),
      sourceFlag: "widget",

      hash,

      fromTokenAddress: fromToken.swapAddress || "XLM",
      toTokenAddress: toToken.swapAddress || "XLM",

      fromAddress: fromToken.address,
      toAddress: toToken.address,

      fromTokenChain: "XLM",
      toTokenChain: "XLM",

      fromTokenAmount: amount,
      amountOutMin: minReturn,

      fromCoinCode: fromToken.swapSymbol,
      toCoinCode: toToken.swapSymbol,

      slippage: "3"
    };

    const res = await axios.post(
      "https://api.bridgers.xyz/api/exchangeRecord/updateDataAndStatus",
      orderPayload
    );

    console.log("📡 Order API Response:", res.data);
  } catch (err) {
    console.error("⚠️ Order API failed:", err?.response?.data || err.message);
  }
};