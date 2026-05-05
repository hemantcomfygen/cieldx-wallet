// import axios from "axios";
// import { CMC_API_KEY, CMC_SYMBOL_MAP, CMC_URL } from "./config.js";

// const normalizeSymbol = (symbol) => {
//   if (!symbol) return "";

//   return symbol
//     .toUpperCase()
//     .replace(/[_\s]/g, "")
//     .replace("BEP20", "")
//     .replace("TRC20", "")
//     .replace("ERC20", "")
//     .replace("SOLANA", "SOL");
// };


// export const fetchCoinsMarketData = async (coins = []) => {
//   try {
//     const response = await axios.get(CMC_URL, {
//       headers: {
//         "X-CMC_PRO_API_KEY": CMC_API_KEY,
//       },
//       params: {
//         start: 1,
//         limit: 5000,
//         convert: "USD",
//       },
//     });

//     const marketList = response?.data?.data || [];

//     // console.log("marketList", marketList)

//     // 🔥 create map for fast lookup
//     const marketMap = {};
//     marketList.forEach((coin) => {
//       marketMap[coin.symbol.toUpperCase()] = coin;
//     });

//     // 🔥 map your coins with market data
//     const updatedCoins = coins.map((coin) => {
//       const mappedSymbol =
//         CMC_SYMBOL_MAP[coin.shortName] || coin.shortName;

//       const symbol = normalizeSymbol(mappedSymbol);

//       const marketCoin = marketMap[symbol];

//       return {
//         ...coin,

//         // 💰 price
//         coinValue: marketCoin?.quote?.USD?.price || 0,

//         // 📈 24h change %
//         coinMarket: marketCoin?.quote?.USD?.percent_change_24h || 0,

//         // 💵 total value
//         valueInDollar:
//           (coin.balance || 0) *
//           (marketCoin?.quote?.USD?.price || 0),
//       };
//     });

//     return updatedCoins;
//   } catch (error) {
//     console.error("❌ CMC fetch error:", error);
//     return coins;
//   }
// };



import axios from "axios";

// CoinGecko fallback mapping
const COINGECKO_MAP = {
  POL: "matic-network",
  MATIC: "matic-network",
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  LTC: "litecoin",
  TRX: "tron",
  USDT: "tether",
};


const normalizeSymbol = (symbol) => {
  if (!symbol) return "";

  return symbol
    .toUpperCase()
    .replace(/[_\s]/g, "")
    .replace("BEP20", "")
    .replace("TRC20", "")
    .replace("ERC20", "")
    .replace("SEGBIT", "")
    .replace("TAPEROOT", "")
    .replace("NATIVE", "")
    .replace("SOLANA", "SOL");
};


let marketCache = {};
let lastFetch = 0;

const CACHE_TIME = 1000 * 30; // 30 sec

const fetchBinanceMarket = async () => {
  const res = await axios.get(
    "https://api.binance.com/api/v3/ticker/24hr"
  );

  const map = {};

  res.data.forEach((item) => {
    if (item.symbol.endsWith("USDT")) {
      const base = item.symbol.replace("USDT", "");

      map[base] = {
        price: parseFloat(item.lastPrice),
        change24h: parseFloat(item.priceChangePercent),
      };
    }
  });

  return map;
};


const fetchCoinGeckoFallback = async (symbols = []) => {
  const ids = symbols
    .map((s) => COINGECKO_MAP[s])
    .filter(Boolean);

  if (!ids.length) return {};

  const res = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: {
        vs_currency: "usd",
        ids: ids.join(","),
        price_change_percentage: "24h",
      },
    }
  );

  const map = {};

  res.data.forEach((coin) => {
    map[coin.id] = {
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
    };
  });

  return map;
};


export const fetchCoinsMarketData = async (coins = []) => {
  try {
    const now = Date.now();

    let marketMap = {};

    // ✅ Step 1: cache check
    if (now - lastFetch < CACHE_TIME) {
      marketMap = marketCache;
    } else {
      marketMap = await fetchBinanceMarket();
      marketCache = marketMap;
      lastFetch = now;
    }

    // ✅ Step 2: detect missing coins
    const missingSymbols = [];

    coins.forEach((coin) => {
      const normalized = normalizeSymbol(coin.shortName);

      if (
        normalized !== "USDT" &&
        !marketMap[normalized]
      ) {
        missingSymbols.push(normalized);
      }
    });

    // ✅ Step 3: fetch fallback
    const fallbackData =
      await fetchCoinGeckoFallback(missingSymbols);

    // ✅ Step 4: merge
    const updatedCoins = coins.map((coin) => {
      const normalized = normalizeSymbol(coin.shortName);

      // 🟢 USDT special case
      if (normalized === "USDT") {
        return {
          ...coin,
          coinValue: 1,
          coinMarket: 0,
          valueInDollar: coin.balance || 0,
        };
      }

      let price = 0;
      let change = 0;

      // 🔥 Binance first
      const binanceData = marketMap[normalized];

      if (binanceData) {
        price = binanceData.price;
        change = binanceData.change24h;
      } else {
        // 🔥 CoinGecko fallback
        const cgId = COINGECKO_MAP[normalized];
        const cgData = fallbackData[cgId];

        if (cgData) {
          price = cgData.price;
          change = cgData.change24h;
        }
      }

      return {
        ...coin,
        coinValue: price,
        coinMarket: change,
        valueInDollar: (coin.balance || 0) * price,
      };
    });

    return updatedCoins;
  } catch (error) {
    console.error("❌ Market fetch error:", error);
    return coins;
  }
};