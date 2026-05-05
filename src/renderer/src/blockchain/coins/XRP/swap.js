import axios from "axios";
import { Client, Wallet, xrpToDrops } from "xrpl";

export const xrpSwap = async ({
  mnemonic,
  userAddress,
  amount,
  fromToken,
  toToken,
  quote
}) => {
  const client = new Client("wss://s2.ripple.com");

  try {
    await client.connect();

    const wallet = Wallet.fromMnemonic(mnemonic);

    // ============================
    // ✅ MEMO
    // ============================
    const memoJSON = {
      fromToken: fromToken.swapAddress,
      toToken: toToken.swapSymbol,
      sender: fromToken.address,
      destination: toToken.address,
      minReturnAmount: quote.amountOutMin,
      fromAmount: quote.fromTokenAmount
    };

    const memoHex = Buffer.from(JSON.stringify(memoJSON)).toString("hex");
    console.log("XRP Swap Memo:", memoHex);
    // ============================
    // ✅ TX
    // ============================
    const tx = {
      TransactionType: "Payment",
      Account: fromToken.address,
      Destination: quote.contractAddress,
      Amount: xrpToDrops(amount.toString()),
      Memos: [{ Memo: { MemoData: memoHex } }]
    };


    console.log("XRP Swap TX:", tx);

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    console.log("XRP Swap Signed:", signed);
    const res = await client.submitAndWait(signed.tx_blob);

    await client.disconnect();

    if (res.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(res.result.meta.TransactionResult);
    }


    console.log("XRP Swap Result:", res);


    const result = await sendOrderPayload({
      txHash: res.result.hash,
      fromToken,
      toToken,
      quote,
      slippage: quote.slippage
    });


    console.log("XRP Swap Result:", result);

    return {
      success: true,
      error: null,
      txHash: res.result.hash
    };

  } catch (err) {
    console.log("XRP Swap Error:", err);
    if (client.isConnected()) await client.disconnect();
    return { success: false, error: err.message };
  }
};



export const sendOrderPayload = async ({
  txHash,
  fromToken,
  toToken,
  quote,
  slippage
}) => {
  try {
    const payload = {
      // ✅ unique 32-char ID
      equipmentNo: txHash.slice(0, 32),

      sourceFlag: "widget",
      sourceType: "H5",

      hash: txHash,

      fromTokenAddress: fromToken.swapAddress,
      toTokenAddress: toToken.swapAddress,

      fromAddress: fromToken.address,
      toAddress: toToken.address,

      fromTokenChain: fromToken.chainType,
      toTokenChain: toToken.chainType,

      // ✅ smallest unit values
      fromTokenAmount: quote.fromTokenAmount,
      amountOutMin: quote.amountOutMin,

      fromCoinCode: fromToken.swapSymbol,
      toCoinCode: toToken.swapSymbol,

      slippage: String(slippage)
    };

    console.log("📦 Order Payload:", payload);

    const res = await axios.post(
      "https://api.bridgers.xyz/api/exchangeRecord/updateDataAndStatus",
      payload
    );


    const re = await axios.post(
      `https://dev-dwm.jamsara.com/api/coin/createSwapMetaData`, { metaData: payload, swapId: res?.data?.data?.orderId || payload.fromAddress }, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })


    console.log("📡 Order API Response:", res.data);

    return res.data;

  } catch (err) {
    console.error(
      "⚠️ Order API Error:",
      err?.response?.data || err.message
    );
    throw err;
  }
};