
import * as solanaWeb3 from "@solana/web3.js";
import axios from "axios";
import { Buffer } from "buffer";
import { getKeypairFromMnemonic } from "./generateSolAddress";


export const solanaSwap = async ({
  quote,
  mnemonic,
  ...rest
}) => {
  try {
    if (!mnemonic) {
      throw new Error("Mnemonic is required for Solana swap");
    }

    const wallet = await getKeypairFromMnemonic(mnemonic);


    // ✅ Dynamic payload
    const payload = {
      equipmentNo: rest.fromAddress.slice(0, 32),
      sourceFlag: "widget",

      fromTokenAddress: rest.fromToken.swapAddress,
      toTokenAddress: rest.toToken.swapAddress,

      fromAddress: rest.fromToken.address,
      toAddress: rest.toToken.address,

      fromTokenChain: rest.fromToken.chainType,
      toTokenChain: rest.toToken.chainType,

      fromTokenAmount: quote.fromTokenAmount,   // ✅ CORRECT
      amountOutMin: quote.amountOutMin,         // ✅ CORRECT

      fromCoinCode: rest.fromToken.swapSymbol,
      toCoinCode: rest.toToken.swapSymbol,

      slippage: "3",
    };

    console.log("🔁 Payload:", payload);

    // 1️⃣ Call API
    const res = await axios.post("https://api.bridgers.xyz/api/sswap/swap", payload);

    const result = await res.data || {};

    if (result.resCode !== 100) {
      throw new Error(result.resMsg);
    }

    const txData = result.data.txData;

    console.log("🔁 Transaction Data:", txData);

    const connection = new solanaWeb3.Connection(
      "https://methodical-twilight-replica.solana-mainnet.quiknode.pro/e2105c10e6ea80775ec44e9bf034de8d079fe69e",
      "confirmed"
    );


    console.log("🔁 Connection established to Solana RPC");

    // ================================
    // ✅ USE SERIALIZED TRANSACTION
    // ================================

    if (!txData.solanaTx?.serializedMessage) {
      throw new Error("No serialized Solana transaction found");
    }

    // 🔄 Decode message
    // const message = solanaWeb3.Message.from(
    //   Buffer.from(txData.solanaTx.serializedMessage, "base64")
    // );

    const transaction = new solanaWeb3.Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    });

    // 🔥 manually attach instructions from txData.tx
    for (const ix of txData.tx) {
      transaction.add(
        new solanaWeb3.TransactionInstruction({
          keys: ix.keys.map((k) => ({
            pubkey: new solanaWeb3.PublicKey(k.pubkey),
            isSigner: k.isSigner,
            isWritable: k.isWritable,
          })),
          programId: new solanaWeb3.PublicKey(ix.programId),
          data: Uint8Array.from(ix.data),
        })
      );
    }

    // 🔥 DEBUG
    console.log("Instructions:", transaction.instructions);

    // simulate before sending
    const sim = await connection.simulateTransaction(transaction);
    console.log("SIMULATION:", sim);

    // 🧾 Set fee payer
    transaction.feePayer = wallet.publicKey;

    // ⛓️ Get latest blockhash
    if (!transaction.recentBlockhash) {
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
    }

    // ✍️ Sign transaction
    transaction.sign(wallet);

    console.log("🔁 Transaction signed");

    // 🚀 Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    console.log("📤 Transaction sent:", signature);

    // ✅ Confirm
    await connection.confirmTransaction(signature, "finalized");

    console.log("✅ Swap Success:", signature);

    const orderPayload = {
      equipmentNo: signature?.slice(0, 32),
      sourceFlag: "widget",
      sourceType: "H5",


      hash: signature, // ✅ IMPORTANT

      fromTokenAddress: payload.fromTokenAddress,
      toTokenAddress: payload.toTokenAddress,

      fromAddress: payload.fromAddress,
      toAddress: payload.toAddress,

      fromTokenChain: payload.fromTokenChain,
      toTokenChain: payload.toTokenChain,

      fromTokenAmount: payload.fromTokenAmount,
      amountOutMin: payload.amountOutMin,

      fromCoinCode: payload.fromCoinCode,
      toCoinCode: payload.toCoinCode,

      slippage: payload.slippage,
    };

    console.log("✅ Solana order payload", orderPayload);


    const orderRes = await axios.post(
      "https://api.bridgers.xyz/api/exchangeRecord/updateDataAndStatus",
      orderPayload
    );

    const re = await axios.post(
      `https://dev-dwm.jamsara.com/api/coin/createSwapMetaData`, { metaData: orderPayload, swapId: orderRes?.data?.data?.orderId || payload.fromAddress }, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })
    console.log("📦 Order Created:", orderRes.data);


    return {
      success: true,
      txHash: signature,
      order: orderRes.data,
    };
  } catch (err) {
    console.error("❌ Swap Error:", err);
    return { success: false, error: err.message };
  }
};