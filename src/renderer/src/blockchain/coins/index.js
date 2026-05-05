import { generateEVMAddress } from "./ETH/generateEVMAddress.js"
import { generateLegacyAddress } from "./BTC/legacyAddress.js"
import { nativeSegWitAddress } from "./BTC/nativeSegWitAddress.js"
import { generateSegWitAddress } from "./BTC/segWitAddress.js"
import { generateTapRootAddress } from "./BTC/taprootAddress.js"
import { generateDogeAddress } from "./DOGE/generateDogeAddress.js"
import { generateLtcAddress } from "./LTC/generateLtcAddress.js"
import { generateSolAddress } from "./SOL/generateSolAddress.js"
import { generateTronAddress } from "./TRON/generateTronAddress.js"
import { generateXlmAddress } from "./XLM/generateXlmAddress.js"
import { generateXrpAddress } from "./XRP/generateXrpAddress.js"


// balance

import { fetchETHBalance } from "./ETH/fetchBalance.js"
import { fetchBtcBalance } from "./BTC/fetchBtcBalance.js"
import { fetchDogeBalance } from "./DOGE/fetchDogebalance.js"
import { fetchLtcBalance } from "./LTC/fetchLtcBalance.js"
import { fetchSolBalance } from "./SOL/fetchSolBalance.js"
import { fetchTronBalance } from "./TRON/fetchTronBalance.js"
import { fetchBalanceXlm } from "./XLM/fetchBalanceXlm.js"
import { fetchXrpBalance } from "./XRP/fetchXrpBalance.js"

// send

import { sendEvmCoin } from "./ETH/sendEvmCoin.js"
import { sendSolCoin } from "./SOL/sendSolCoin.js"
import { sendLtcCoin } from "./LTC/sendLtcCoin.js"
import { sendDogeCoin } from "./DOGE/sendDogeCoin.js"
import { sendTronCoin } from "./TRON/sendTronCoin.js"
import { sendXlmCoin } from "./XLM/sendXlmCoin.js"
import { sendXrpCoin } from "./XRP/sendXrpCoin.js"



export {
    // address

    generateEVMAddress,
    generateLegacyAddress,
    nativeSegWitAddress,
    generateSegWitAddress,
    generateTapRootAddress,
    generateDogeAddress,
    generateLtcAddress,
    generateSolAddress,
    generateTronAddress,
    generateXlmAddress,
    generateXrpAddress,

    // balance

    fetchETHBalance,
    fetchBtcBalance,
    fetchDogeBalance,
    fetchLtcBalance,
    fetchSolBalance,
    fetchTronBalance,
    fetchBalanceXlm,
    fetchXrpBalance,

    // send

    sendEvmCoin,
    sendSolCoin,
    sendLtcCoin,
    sendDogeCoin,
    sendTronCoin,
    sendXlmCoin,
    sendXrpCoin
}