import axios from "axios";
import { UTXO_API } from "../../../utils/config.js";

export const fetchUTXOBalance = async (symbol, address) => {
  try {
    const config = UTXO_API[symbol?.toUpperCase()];

    if (!config) {
      console.warn(`No API config for ${symbol}`);
      return 0;
    }

    const { baseUrl, divider } = config;

    const response = await axios.get(`${baseUrl}${address}/balance`);

    const raw = response?.data?.balance || 0;

    return raw / divider;

  } catch (error) {
    console.error(`❌ UTXO balance error for ${symbol}`, error);
    return 0;
  }
};


// const res = await fetchUTXOBalance("BTC", "12hQouYQaiX5ksFXTe26gHLBChb7vTV4it")
// console.log("res", res)