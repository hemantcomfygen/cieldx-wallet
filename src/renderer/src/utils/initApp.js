import { getCoinList } from "../redux/slices/AuthSlice.js";
import { getCoinsFromDB, saveCoinsToDB } from "./coins.js";

export const initializeCoins = async (dispatch) => {
  try {
    // 1. Give DB a moment to settle (useful after deletion)
    await new Promise(r => setTimeout(r, 500));

    // 2. Fetch from API
    console.log("Fetching coin list from API...");
    const res = await dispatch(getCoinList()).unwrap();
    const coins = res?.data?.list || [];

    if (coins.length) {
      console.log(`Saving ${coins.length} coins to DB...`);
      await saveCoinsToDB(coins);
    }
  } catch (error) {
    console.error("Init error:", error);
  }
};