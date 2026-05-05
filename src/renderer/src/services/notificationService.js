import { saveActivity } from "../utils/activity";

const processedHashes = new Set();

export const showNotification = (title, body, data = {}) => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: "/icon.png", // Replace with your app icon
      data: data,
    });
  }
};

export const handleIncomingTransaction = async ({
  wallet_id,
  account_id,
  coin,
  amount,
  from,
  to,
  hash,
  type = "receive"
}) => {
  if (hash && processedHashes.has(hash)) {
    return;
  }
  if (hash) processedHashes.add(hash);

  // 1. Save to activity log first to check for duplicates
  const isNew = await saveActivity({
    wallet_id,
    account_id,
    coinId: coin.id,
    coinName: coin.fullName,
    shortName: coin.shortName,
    coinImage: coin.coinImageUrl,
    type: type,
    status: "success",
    from: from,
    to: to,
    amount: amount,
    hash: hash,
    chainId: coin.chainId,
  });

  // 2. If it's a duplicate, stop here
  if (!isNew) {
    console.log(`Transaction ${hash} already processed, skipping notification.`);
    return;
  }

  // 3. Show notification for new transactions
  const title = type === "receive" ? "Funds Received" : "Funds Sent";
  const body = `${type === "receive" ? "Received" : "Sent"} ${amount} ${coin.shortName} ${type === "receive" ? "from" : "to"} ${from?.slice(0, 6)}...${from?.slice(-4)}`;
  
  showNotification(title, body);

  // 4. Dispatch event for UI updates
  window.dispatchEvent(new CustomEvent("new-transaction", { detail: { hash } }));
};
