export const WSS_ENDPOINTS = {
  // EVM Chains
  1: "wss://ethereum-rpc.publicnode.com", // Ethereum Mainnet
  137: "wss://polygon-bor-rpc.publicnode.com", // Polygon
  56: "wss://bsc-rpc.publicnode.com", // BSC
  42161: "wss://arbitrum-one-rpc.publicnode.com", // Arbitrum
  10: "wss://optimism-rpc.publicnode.com", // Optimism
  43114: "wss://avalanche-c-chain-rpc.publicnode.com", // Avalanche

  // Solana
  SOLANA: "https://solana-rpc.publicnode.com",

  // TRON
  TRON: "wss://api.tronstack.io", // Note: Tron usually uses HTTP polling or dedicated event servers

  // XRP
  XRP: "wss://xrplcluster.com",

  // XLM (Stellar uses SSE, but we can store the base URL)
  XLM: "https://horizon.stellar.org",

  // UTXO (Using Blockbook WSS if available, or placeholder)
  BTC: "wss://blockbook.binance.com/api/v2/websocket",
  DOGE: "wss://doge1.trezor.io/websocket",
  LTC: "wss://ltc1.trezor.io/websocket",

  // Add more as needed
};
