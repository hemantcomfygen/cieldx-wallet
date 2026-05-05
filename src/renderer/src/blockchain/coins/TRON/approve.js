import BigNumber from "bignumber.js";

/**
 * Check Allowance
 */
export const isTronApproved = async ({
  tronWeb,
  walletAddress,
  tokenAddress,
  spender,
  amount,
}) => {
  const contract = await tronWeb.contract().at(tokenAddress);

  const allowance = await contract
    .allowance(walletAddress, spender)
    .call();

  return new BigNumber(allowance.toString()).gte(amount);
};
/**
 * Approve Token
 */
export async function approveTronToken(
  tronWeb,
  tokenAddress,
  spender,
  amount
) {


  
  try {
    if (!tronWeb || !tronWeb.defaultAddress?.base58) {
      throw new Error("❌ Tron wallet not connected");
    }

    const walletAddress = tronWeb.defaultAddress.base58;

    console.log("🔐 Approve Params:", {
      walletAddress,
      tokenAddress,
      spender,
      amount,
    });

    const contract = await tronWeb.contract().at(tokenAddress);

    // 🔥 OPTIONAL: Check allowance first (like EVM optimization)
    const allowance = await contract
      .allowance(walletAddress, spender)
      .call();

    const isApproved =
      BigInt(allowance.toString()) >= BigInt(amount);

    if (isApproved) {
      console.log("✅ Already approved");
      return;
    }

    console.log("🔄 Sending approve transaction...");

    const txid = await contract
      .approve(
        spender,
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" // max approve
      )
      .send({
        feeLimit: 100_000_000, // 🔥 MUST (100 TRX)
      });

    console.log("🚀 Approve TX:", txid);

    // ⏳ Wait for confirmation (like tx.wait())
    await waitForTronTx(tronWeb, txid);

    console.log("✅ Approved successfully");

    return txid;
  } catch (err) {
    console.error("❌ approveTronToken error:", err);
    throw err;
  }
}
/**
 * Execute TRON Swap
 */
export const executeTronTx = async ({ tronWeb, txData }) => {
  try {
    const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
      txData.tronRouterAddrees,
      txData.functionName,
      {
        feeLimit: 100_000_000, // ✅ MUST
        callValue: txData.options?.callValue || 0,
      },
      txData.parameter,
      txData.fromAddress
    );

    if (!transaction?.result?.result) {
      throw new Error("Trigger contract failed");
    }

    const signedTx = await tronWeb.trx.sign(transaction.transaction);

    const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

    return receipt.txid;
  } catch (err) {
    console.error("❌ executeTronTx error:", err);
    throw err;
  }
};