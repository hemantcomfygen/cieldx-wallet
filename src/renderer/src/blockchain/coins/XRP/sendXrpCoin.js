import { Client, Wallet, xrpToDrops } from "xrpl";

// ============================
// ✅ Safe Destination Tag Builder
// ============================
const buildDestinationTag = (tag) => {
  if (tag === undefined || tag === null || tag === "") {
    return undefined;
  }

  const num = Number(tag);

  if (!Number.isInteger(num) || num < 0 || num > 4294967295) {
    throw new Error("Invalid Destination Tag");
  }

  return num;
};

// ============================
// ✅ XRP SEND FUNCTION
// ============================
export const sendXrpCoin = async ({
  toAddress,
  amount, // in XRP (e.g. "0.5")
  mnemonic,
  rpcUrl = "wss://s2.ripple.com",
  destinationTag
}) => {
  const client = new Client(rpcUrl);

  try {
    await client.connect();

    // ============================
    // ✅ Wallet from mnemonic
    // ============================
    const wallet = Wallet.fromMnemonic(mnemonic);

    // ============================
    // ✅ Safe Tag Handling
    // ============================
    const tag = buildDestinationTag(destinationTag);

    // ============================
    // ✅ Check if destination REQUIRES tag
    // ============================
    const info = await client.request({
      command: "account_info",
      account: toAddress
    });

    const requireTag =
      (info.result.account_data.Flags & 0x00020000) !== 0;

    if (requireTag && tag === undefined) {
      throw new Error("Destination requires a destination tag");
    }

    // ============================
    // ✅ Build Transaction
    // ============================
    const tx = {
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: toAddress,
      Amount: xrpToDrops(amount),
      ...(tag !== undefined && { DestinationTag: tag })
    };

    console.log("🚀 XRP TX:", tx);

    // ============================
    // ✅ Autofill + Sign + Submit
    // ============================
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    console.log("📡 XRPL Result:", result);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(result.result.meta.TransactionResult);
    }

    return {
      success: true,
      hash: result.result.hash
    };

  } catch (error) {
    console.error("❌ XRP Send Error:", error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    client.disconnect();
  }
};