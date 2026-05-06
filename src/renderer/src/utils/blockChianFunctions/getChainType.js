export const getChainType = (chain) => {
  if (!chain) return "UNKNOWN";

  const normalized = chain.toUpperCase();

  //  EVM CHAINS (ALL)
  const EVM = [
    "ETH", "BSC", "MATIC", "FANTOM", "ARBITRUM", "AVALANCHE",
    "OPTIMISM", "BASE", "CRONOS", "ZKSYNC", "LINEA", "BLAST",
    "OEC", "OPBNB", "CFX", "ZKEVM", "SCROLL",
    "MANTLE", "CELO", "XLAYER", "APE",
    "CORE", "MERLIN", "ONCHAIN",
    "ETHF", "SONIC", "BERA", "ARB", "3C", "BNB", "USDT_ERC20", "USDT_BEP20", "POL", "DRIP" 
  ];

  if (EVM.includes(normalized)) return "EVM";

  // NON-EVM CHAINS
  // if (normalized === "TRON") return "TRON";

  if(["TRON", "USDT_TRC20", "TRX", "sTRX"].includes(normalized)) return "TRON";

  if (["SOLANA", "SOL"].includes(normalized)) return "SOLANA";
  if (normalized === "POL") return "POL";
  if (normalized === "TON") return "TON";

  // MOVE-BASED / ALT CHAINS
  if (normalized === "APTOS") return "APTOS";
  if (normalized === "SUI") return "SUI";

  // UTXO CHAINS
  if (["BTC", "DOGE", "LTC", "BCH", "BTC_NATIVE_SEGBIT", "BTC_SEGBIT", "BTC_TAPEROOT"].includes(normalized)) return "UTXO";

  // COSMOS (IBC)
  if (normalized === "COSMOS") return "COSMOS";

  // XRP
  if (normalized === "XRP") return "XRP";
  if (normalized === "XLM") return "XLM";

  return "UNKNOWN";
};