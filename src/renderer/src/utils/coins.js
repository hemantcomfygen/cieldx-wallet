import axios from "axios";
import { decryptData, encryptData } from "./encryptionFunction.js";
import { generateRandomID } from "./GlobalFunction.js";
import { getAllFromIndexDB, getFromIndexDB, saveToIndexDB } from "./indexDB.js";
import { apiUrl } from "./axiosProvider.js";

const normalizeSymbol = (symbol) => {
  if (!symbol) return "";

  return symbol
    .toUpperCase()
    .replace(/\(.*?\)/g, "") // ✅ remove (ARB)
    .replace(/[_\s]/g, "")
    .replace("BEP20", "BSC")
    .replace("TRC20", "TRON")
    .replace("ERC20", "ETH")
    .replace("SOLANA", "SOL")
    .replace("BTCNATIVESEGBIT", "BTC")
    .replace("BTCSEGBIT", "BTC")
    .replace("BTCTAPEROOT", "BTC")
    .replace("ARBITRUMONE", "ARB")
    .replace("ARBITRUM", "ARB")
    .replace("ARBARB", "ARB");
};
export const saveCoinsToDB = async (coins) => {
  try {
    const existingData = (await getCoinsFromDB()) || {
      default_coins: [],
      custom_imported_coins: [],
    };

    let tokens = [];
    try {
      const getTokens = async () => {
        const res = await fetch(
          "https://api.bridgers.xyz/api/exchangeRecord/getToken",
          { method: "POST" },
        );
        const data = await res.json();
        return data?.data?.tokens?.filter((t) => t.isCrossEnable === 1) || [];
      };
      tokens = await getTokens();
    } catch (e) {
      console.warn("Token fetch failed, continuing with empty token list:", e);
    }

    const customCoins = existingData.custom_imported_coins;

    const formattedData = coins.map((coin) => {
      const token = tokens.find((t) => {
        const apiSymbol = normalizeSymbol(t.symbol);
        const coinSymbol = normalizeSymbol(coin.shortName);

        const isNative =
          t.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

        // ✅ 1. CONTRACT MATCH (highest priority)
        if (
          coin.contractAddress &&
          t.addressAlias &&
          coin.contractAddress.toLowerCase() === t.addressAlias.toLowerCase()
        ) {
          return true;
        }

        // ✅ 2. SYMBOL + CHAIN MATCH
        if (
          apiSymbol === coinSymbol &&
          normalizeSymbol(t.chain) ===
          normalizeSymbol(coin.chainType || coin.group || coin.bridgerChain)
        ) {
          return true;
        }

        // ✅ 3. NATIVE MATCH (fallback)
        if (isNative && apiSymbol === coinSymbol) {
          return true;
        }

        return false;
      });

      // console.log("token", token, coin);

      return {
        id: generateRandomID(),
        coinId: coin?._id,
        shortName: coin?.shortName,
        fullName: coin?.fullName,
        coinImageUrl: coin?.coinImageUrl,
        coinValue: coin?.coinValue,
        coinMarket: coin.coinMarket,
        isCustom: coin.isCustom || false,

        swapAddress: token?.address || null,
        chainType: token?.chain || coin.chainType || null,
        isCrossEnable: token?.isCrossEnable ?? false,
        decimals: token?.decimals ?? null,
        swapSymbol: token?.symbol || null,

        address: coin.address || null,
        privateKey: coin.privateKey || null,
        wallet_id: coin.wallet_id || null,
        account_id: coin.account_id || null,
        account_index: Number.isInteger(coin.account_index)
          ? coin.account_index
          : 0,
        tokenAddress: token?.address || null,
        balance: coin.balance || 0,
        valueInDollar: coin.valueInDollar || 0,
        is_token: coin.is_token || false,
        rpcUrl: coin.rpcUrl || null,
        thirdPartyUrl: coin.thirdPartyUrl || null,
        chainId: token?.chainId || coin.chainId || null,
        decimal_value: coin.decimal_value || null,
        contractAddress: coin.contractAddress || null,
        isDisable: coin.isDisable || false,
      };
    });

    const payload = {
      id: "coins_list",
      data: {
        default_coins: encryptData(formattedData),
        custom_imported_coins: encryptData(customCoins),
      },
    };

    await saveToIndexDB("coins", payload);
  } catch (error) {
    console.error("Error saving coins", error);
  }
};

export const addCustomCoinToDB = async (coin) => {
  try {
    const existingData = (await getCoinsFromDB()) || {
      default_coins: [],
      custom_imported_coins: [],
    };

    const customCoins = existingData.custom_imported_coins || [];

    const exists = customCoins.find(
      (c) =>
        c.contractAddress?.toLowerCase() ===
        coin.contractAddress?.toLowerCase() && c.chainType === coin.chainType,
    );

    if (exists) {
      throw new Error("Token already imported");
    }

    // 🔥 Fetch Bridgers tokens
    let bridgersToken = null;
    try {
      const res = await fetch(
        "https://api.bridgers.xyz/api/exchangeRecord/getToken",
        { method: "POST" },
      );
      const data = await res.json();

      const tokens = data?.data?.tokens || [];

      bridgersToken = tokens.find(
        (t) =>
          t.symbol?.toLowerCase() === coin.symbol?.toLowerCase() &&
          t.chain === coin.chainType,
      );
    } catch (e) {
      console.warn("Bridgers fetch failed, fallback to null");
    }

    const newCoin = {
      id: generateRandomID(),

      shortName: coin.symbol,
      fullName: coin.name,
      coinImageUrl: coin.logo || null,
      coinValue: coin?.coinValue,
      coinMarket: coin.coinMarket,

      contractAddress: coin.contractAddress,

      swapAddress: bridgersToken?.address || null,
      chainType: bridgersToken?.chain || coin.chainType || null,
      isCrossEnable: bridgersToken?.isCrossEnable ?? false,
      decimals: bridgersToken?.decimals ?? coin.decimals ?? null,
      swapSymbol: bridgersToken?.symbol || null,

      rpcUrl: coin.rpcUrl || null,
      chainId: bridgersToken?.chainId || null,

      address: null,
      privateKey: null,
      wallet_id: null,
      account_id: null,
      account_index: 0,
      balance: 0,
      valueInDollar: 0,

      is_token: true,
      isCustom: true,
      isDisable: false,
    };

    const payload = {
      id: "coins_list",
      data: {
        default_coins: encryptData(existingData.default_coins),
        custom_imported_coins: encryptData([...customCoins, newCoin]),
      },
    };

    await saveToIndexDB("coins", payload);

    return newCoin;
  } catch (error) {
    console.error("Error saving custom coin:", error);
    throw error;
  }
};

export const getCoinsFromDB = async () => {
  try {
    const res = await getAllFromIndexDB("coins");

    const storedData = res?.[0]?.data;

    if (!storedData) return null;

    const defaultCoins = storedData?.default_coins
      ? await decryptData(storedData.default_coins)
      : [];

    const customCoins = storedData?.custom_imported_coins
      ? await decryptData(storedData.custom_imported_coins)
      : [];

    return {
      default_coins: defaultCoins,
      custom_imported_coins: customCoins,
    };
  } catch (error) {
    console.error("Error getting coins", error);
    return null;
  }
};

export const getCoinByIdFromDB = async (id) => {
  try {
    const allCoins = await getCoinsFromDB();

    if (!allCoins) return null;

    const all = [...allCoins.default_coins, ...allCoins.custom_imported_coins];

    const coin = all.find((c) => c.id === id || c.coinId === id);

    return coin || null;
  } catch (error) {
    console.error("Error in find coin from db", error);
    return null;
  }
};

export const updateCoinInDB = async (coinId, updates) => {
  try {
    const allCoins = await getCoinsFromDB();
    if (!allCoins) return null;

    const applyUpdate = (coin) => {
      if (coin.id === coinId || coin.coinId === coinId) {
        const updatedCoin = { ...coin, ...updates };
        if (!updatedCoin.accountBalances) updatedCoin.accountBalances = {};
        if (updates.account_id && updates.wallet_id) {
          updatedCoin.accountBalances[updates.account_id] = {
            balance: updates.balance || 0,
            wallet_id: updates.wallet_id,
          };
        }
        return updatedCoin;
      }
      return coin;
    };

    allCoins.default_coins = allCoins.default_coins.map(applyUpdate);
    allCoins.custom_imported_coins =
      allCoins.custom_imported_coins.map(applyUpdate);

    const payload = {
      id: "coins_list",
      data: {
        default_coins: encryptData(allCoins.default_coins),
        custom_imported_coins: encryptData(allCoins.custom_imported_coins),
      },
    };

    await saveToIndexDB("coins", payload);
    return true;
  } catch (error) {
    console.error("Update failed:", error);
    return false;
  }
};

export const updateMultipleCoinsInDB = async (updatesArray) => {
  try {
    const allCoins = await getCoinsFromDB();
    if (!allCoins) return false;

    const updatesMap = new Map();
    updatesArray.forEach((item) => {
      updatesMap.set(item.coinId, item.updates);
    });

    const applyUpdates = (coin) => {
      const update1 = updatesMap.get(coin.id);
      const update2 = updatesMap.get(coin.coinId);
      const mergedUpdate = { ...update1, ...update2 };
      if (Object.keys(mergedUpdate).length > 0) {
        const updatedCoin = { ...coin, ...mergedUpdate };
        if (!updatedCoin.accountBalances) updatedCoin.accountBalances = {};
        if (mergedUpdate.account_id && mergedUpdate.wallet_id) {
          updatedCoin.accountBalances[mergedUpdate.account_id] = {
            balance: mergedUpdate.balance || 0,
            wallet_id: mergedUpdate.wallet_id,
          };
        }
        return updatedCoin;
      }
      return coin;
    };

    allCoins.default_coins = allCoins.default_coins.map(applyUpdates);
    allCoins.custom_imported_coins =
      allCoins.custom_imported_coins.map(applyUpdates);

    const payload = {
      id: "coins_list",
      data: {
        default_coins: encryptData(allCoins.default_coins),
        custom_imported_coins: encryptData(allCoins.custom_imported_coins),
      },
    };

    await saveToIndexDB("coins", payload);
    return true;
  } catch (error) {
    console.error("Update multiple failed:", error);
    return false;
  }
};
