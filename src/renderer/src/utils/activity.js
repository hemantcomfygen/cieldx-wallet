import { decryptData, encryptData } from "./encryptionFunction.js";
import { generateRandomID, getUniqueTimestamp } from "./GlobalFunction.js";
import { getAllFromIndexDB, saveToIndexDB } from "./indexDB.js";

/* -------------------- SCHEMA -------------------- */

const createActivitySchema = (tx) => {
  return {
    id: generateRandomID(),

    wallet_id: tx.wallet_id,
    account_id: tx.account_id,

    coinImage: tx.coinImage,
    coinName: tx.coinName,
    shortName: tx.shortName,

    type: tx.type, // send | receive | swap
    status: tx.status || "pending",

    from: tx.from,
    to: tx.to,

    tokenSymbol: tx.tokenSymbol,
    amount: tx.amount,

    chainId: tx.chainId,
    hash: tx.hash,
    coinId: tx.coinId || null,

    is_read: false,

    timestamp: getUniqueTimestamp(),
  };
};

/* -------------------- CORE -------------------- */

export const getActivities = async () => {
  try {
    const res = await getAllFromIndexDB("activities");
    const stored = res?.[0]?.data;

    if (!stored) return [];

    return (await decryptData(stored)) || [];
  } catch (err) {
    console.error("getActivities error", err);
    return [];
  }
};

const saveAllActivities = async (list) => {
  await saveToIndexDB("activities", {
    id: "activities_list",
    data: encryptData(list),
  });
};

/* -------------------- SAVE -------------------- */

export const saveActivity = async (activity) => {
  try {
    const list = await getActivities();

    // Check if hash already exists to prevent duplicates
    if (activity.hash && list.some((tx) => tx.hash === activity.hash)) {
      return false;
    }

    const newActivity = createActivitySchema(activity);

    const updated = [newActivity, ...list];

    await saveAllActivities(updated);

    return true;
  } catch (err) {
    console.error("saveActivity error", err);
    return false;
  }
};

/* -------------------- GETTERS -------------------- */

export const getActivityById = async (id) => {
  const list = await getActivities();
  return list.find((tx) => tx.id === id || tx.hash === id) || null;
};

export const getActivitiesByWalletAccount = async (wallet_id, account_id) => {
  const list = await getActivities();

  return list.filter(
    (tx) =>
      tx.wallet_id === wallet_id &&
      tx.account_id === account_id
  );
};

export const getActivitiesByCoinId = async (
  wallet_id,
  account_id,
  coinId
) => {
  const list = await getActivities();

  return list.filter(
    (tx) =>
      tx.wallet_id === wallet_id &&
      tx.account_id === account_id &&
      tx.coinId === coinId
  );
};

export const getActivitiesByAddress = async (
  wallet_id,
  account_id,
  address
) => {
  const list = await getActivities();

  return list.filter(
    (tx) =>
      tx.wallet_id === wallet_id &&
      tx.account_id === account_id &&
      (tx.from?.toLowerCase() === address.toLowerCase() ||
        tx.to?.toLowerCase() === address.toLowerCase())
  );
};

export const getActivitiesByType = async (
  wallet_id,
  account_id,
  type
) => {
  const list = await getActivities();

  return list.filter(
    (tx) =>
      tx.wallet_id === wallet_id &&
      tx.account_id === account_id &&
      tx.type === type
  );
};

/* -------------------- PAGINATION -------------------- */

export const getActivitiesPaginated = async (
  wallet_id,
  account_id,
  page = 1,
  limit = 20
) => {
  const list = await getActivitiesByWalletAccount(
    wallet_id,
    account_id
  );

  const start = (page - 1) * limit;
  const end = start + limit;

  return list.slice(start, end);
};

/* -------------------- UPDATE -------------------- */

export const updateActivity = async (id, updates) => {
  try {
    const list = await getActivities();

    let changed = false;

    const updated = list.map((tx) => {
      if (tx.id === id || tx.hash === id) {
        changed = true;
        return { ...tx, ...updates };
      }
      return tx;
    });

    if (!changed) return false;

    await saveAllActivities(updated);

    return true;
  } catch (err) {
    console.error("updateActivity error", err);
    return false;
  }
};

/* -------------------- DELETE -------------------- */

export const deleteActivity = async (id) => {
  try {
    const list = await getActivities();

    const updated = list.filter(
      (tx) => tx.id !== id && tx.hash !== id
    );

    await saveAllActivities(updated);

    return true;
  } catch (err) {
    console.error("deleteActivity error", err);
    return false;
  }
};

/* -------------------- MERGE (SYNC) -------------------- */

export const mergeActivities = async (
  wallet_id,
  account_id,
  newTxs = []
) => {
  try {
    const existing = await getActivities();

    const scoped = existing.filter(
      (tx) =>
        tx.wallet_id === wallet_id &&
        tx.account_id === account_id
    );

    const others = existing.filter(
      (tx) =>
        tx.wallet_id !== wallet_id ||
        tx.account_id !== account_id
    );

    const map = new Map(scoped.map((tx) => [tx.hash, tx]));

    newTxs.forEach((tx) => {
      if (!map.has(tx.hash)) {
        map.set(
          tx.hash,
          createActivitySchema({
            ...tx,
            wallet_id,
            account_id,
          })
        );
      }
    });

    const merged = [...others, ...Array.from(map.values())].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    await saveAllActivities(merged);

    return true;
  } catch (err) {
    console.error("mergeActivities error", err);
    return false;
  }
};

/* -------------------- READ STATUS -------------------- */

export const getUnreadActivities = async (wallet_id, account_id) => {
  const list = await getActivitiesByWalletAccount(
    wallet_id,
    account_id
  );

  return list.filter((tx) => !tx.is_read);
};

export const markActivityAsRead = async (id) => {
  return updateActivity(id, { is_read: true });
};

export const markAllAsRead = async (wallet_id, account_id) => {
  try {
    const list = await getActivities();

    const updated = list.map((tx) => {
      if (
        tx.wallet_id === wallet_id &&
        tx.account_id === account_id
      ) {
        return { ...tx, is_read: true };
      }
      return tx;
    });

    await saveAllActivities(updated);

    return true;
  } catch (err) {
    console.error("markAllAsRead error", err);
    return false;
  }
};