// indexDB

export const USER_ID = "default_user";

export const DB_NAME = "walletDB";
export const VERSION = 1;

// firebase

// export const firebaseConfig = {
//   apiKey: "AIzaSyDfqsAXUa-SESSTZUNuCyAVFtApKAxNKO0",
//   authDomain: "dwm-wallet.firebaseapp.com",
//   projectId: "dwm-wallet",
//   storageBucket: "dwm-wallet.firebasestorage.app",
//   messagingSenderId: "112568320057",
//   appId: "1:112568320057:web:f5fedfe20b10bced934de8",
//   measurementId: "G-5KK9EP9BQL"
// };

// export const VAPID_KEY = "BOGNQ9YdtjT7s51zyXLL_0DxRQIZAw0CMvazX26ylu1gQCoUtUzH7voR5j-fxxTSYzqt4Iedczd91t2ESntKjy0"

export const VAPID_KEY = "BIN9HpxfAYBzhobnV9mD2Fk4Br0A_u2byuOHMLUqhODNltMLxyxNRTj9ai0rMIG9iRsF1wCf28zxVqbEosIPjxM"

export const firebaseConfig = {
  apiKey: "AIzaSyBHvahrvxoA-GnUEDqufnWv9d2Nf8ttAxI",
  authDomain: "ceildx.firebaseapp.com",
  projectId: "ceildx",
  storageBucket: "ceildx.firebasestorage.app",
  messagingSenderId: "859594422587",
  appId: "1:859594422587:web:3254677c6e7dd16b121f1e",
  measurementId: "G-C1LTBQ2S98"
};

// coin chain

export const coinChain = ["EVM", "TRON", "SOLANA", "TON", "UTXO", "COSMOS", "XRP"]

// encryption
export const SECRET_KEY = "O@Nwt^Nj%1Q2kW|e";

// coin market cap

export const CMC_API_KEY = "dc1ebef024b5417e87eb0b520fbfdfa6"
export const CMC_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";

// export const NEWSDATA_API_KEY = "pub_7e79945b4626413db5d3140f1e5868c8"
export const NEWSDATA_API_KEY = "pub_27d1437463c64a3d91cc1209e5e31674"

export const CMC_SYMBOL_MAP = {
  BTC_LEGACY: "BTC",
  BTC_SEGBIT: "BTC",
  BTC_NATIVE_SEGBIT: "BTC",
  BTC_TAPEROOT: "BTC",
  ETH: "ETH",
  POL: "MATIC",
  BNB_CHAIN: "BNB",
  DOGE: "DOGE",
  XRP: "XRP",
  LTC: "LTC",
  SOLANA: "SOL",
  USDT_BEP20: "USDT",
  USDT_ERC20: "USDT",
  USDT_TRC20: "USDT",
  ARB: "ARB",
  TRON: "TRX"
};

//  quick node rpc

export const quickNode = "https://soft-shy-lambo.btc-testnet4.quiknode.pro/9e7d2ae33e6c29a716502131b1f6fb5c54ef3490/";
export const quickNodeMainNet = "https://misty-stylish-market.btc.quiknode.pro/6f2859ae9fd92920cd0508dc5d54a249aed7a637/";

export const ltcBlockCypherUrl = "https://api.blockcypher.com/v1/ltc/main/addrs/"

export const dogeCoinBlockCypher = "https://api.blockcypher.com/v1/doge/main/addrs/"

export const UTXO_API = {
  BTC: {
    baseUrl: "https://api.blockcypher.com/v1/btc/main/addrs/",
    divider: 1e8,
    txnUrl: "https://api.blockcypher.com/v1/btc/main/txs/push",
    transactionUrl: "https://api.blockcypher.com/v1/btc/main/txs/"

  },
  LTC: {
    baseUrl: "https://api.blockcypher.com/v1/ltc/main/addrs/",
    divider: 1e8,
    txnUrl: "https://api.blockcypher.com/v1/ltc/main/txs/push",
    transactionUrl: "https://api.blockcypher.com/v1/ltc/main/txs/"
  },
  DOGE: {
    baseUrl: "https://api.blockcypher.com/v1/doge/main/addrs/",
    divider: 1e8,
    txnUrl: "https://api.blockcypher.com/v1/doge/main/txs/push",
    transactionUrl: "https://api.blockcypher.com/v1/doge/main/txs/"
  }
};