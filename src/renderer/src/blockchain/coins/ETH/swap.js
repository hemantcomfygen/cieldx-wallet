import { ethers } from "ethers";
import { approveToken } from "./approve";
import { abi } from "../../../utils/swap/bridgerAbi";
import { BRIDGER_CONTRACTS } from "../../../config/bridgerContracts";
import axios from "axios";

// https://bsc.publicnode.com
export const evmSwap = async ({
  fromToken,
  toToken,
  amount,
  quote,
  rpcUrl = "",
  userAddress,
  mnemonic,
  slippage
}) => {
  try {
    rpcUrl = rpcUrl || fromToken.rpcUrl;

    console.log("🔍 EVM Swap Params:", {
      fromToken,
      toToken,
      amount,
      quote,
      rpcUrl,
      userAddress
    });

    // ✅ Setup provider & wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    const contractAddress = BRIDGER_CONTRACTS[fromToken.chainType];

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      wallet
    );

    // ✅ IMPORTANT FIXES
    const destination = toToken.address // must be string
    const minReturn = ethers.toBigInt(quote.amountOutMin);

    // ✅ Convert amount to wei
    const parsedAmount = ethers.parseUnits(
      amount.toString(),
      fromToken.decimals
    );

    console.log("🧾 Final Params Before Tx:", {
      fromToken: fromToken.swapAddress,
      toToken: toToken.swapSymbol, // string (correct as per ABI)
      destination,
      amount: parsedAmount.toString(),
      minReturn: minReturn.toString()
    });

    // ============================
    // ✅ NATIVE TOKEN FLOW
    // ============================
    if (
      fromToken.swapAddress.toLowerCase() ===
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      console.log("⚡ Native token swap");

      const tx = await contract.swapEth(
        toToken.swapSymbol,
        destination,
        minReturn,
        {
          value: parsedAmount
        }
      );

      console.log("⏳ Waiting for confirmation...");
      await tx.wait();

      console.log("✅ Native Swap Success:", tx.hash);

      await sendOrderPayload({
        txHash: tx.hash,
        fromToken,
        toToken,
        quote,       // ✅ REQUIRED
        slippage
      });

      return tx.hash;
    }

    // ============================
    // ✅ ERC20 FLOW
    // ============================
    console.log("🔐 Approving token...");

    await approveToken(
      wallet,
      fromToken.swapAddress,
      contractAddress,
      parsedAmount,
      rpcUrl
    );

    console.log("🔄 Executing swap...");

    const tx = await contract.swap(
      fromToken.swapAddress,
      toToken.swapSymbol,
      destination,
      parsedAmount,
      minReturn
    );

    console.log("⏳ Waiting for confirmation...");
    await tx.wait();

    console.log("✅ Swap Success:", tx.hash);

    await sendOrderPayload({
      txHash: tx.hash,
      fromToken,
      toToken,
      quote,       // ✅ REQUIRED
      slippage
    });

    return tx.hash;

  } catch (error) {
    console.error("❌ Swap EVM Hook Error:", error);
    throw error.message || "Swap failed";
  }
};


// ============================
// ✅ Helper: API Payload Sender
// ============================
const sendOrderPayload = async ({
  txHash,
  fromToken,
  toToken,
  quote,
  slippage
}) => {
  try {
    const payload = {
      equipmentNo: txHash?.slice(0, 32),

      sourceFlag: "widget",
      sourceType: "H5",

      hash: txHash,

      fromTokenAddress: fromToken.swapAddress.toLowerCase(),
      toTokenAddress: toToken.swapAddress.toLowerCase(),

      // ✅ FIXED
      fromAddress: fromToken.address,
      toAddress: toToken.address,

      fromTokenChain: fromToken.chainType,
      toTokenChain: toToken.chainType,

      fromTokenAmount: quote.fromTokenAmount,
      amountOutMin: quote.amountOutMin,

      fromCoinCode: fromToken.swapSymbol,
      toCoinCode: toToken.swapSymbol,

      slippage: String(slippage || "0.1")
    };


    console.log("📦 Payload:", payload);

    const res = await axios.post(
      "https://api.bridgers.xyz/api/exchangeRecord/updateDataAndStatus",
      payload
    );

    const re = await axios.post(
      `https://dev-dwm.jamsara.com/api/coin/createSwapMetaData`,{ metaData: payload, swapId: res?.data?.data?.orderId }, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      })

    console.log("📡 Response:", res.data, re);
  } catch (err) {
    console.error("⚠️ Order API failed:", err?.response?.data || err.message);
  }
};


