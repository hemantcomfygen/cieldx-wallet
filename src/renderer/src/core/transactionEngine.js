import { getChainType } from "../adapters/chainAdapter";

// Import your services
import { getMetaMaskLikeTransactions as evmTx } from "../blockchain/coins/ETH/transactionFetch.js";
import { getMetaMaskLikeTransactions as tronTx } from "../blockchain/coins/TRON/transactionFetch.js";
import { getMetaMaskLikeSolanaTx as solanaTx } from "../blockchain/coins/SOL/transactionFetch.js";
import { getMetaMaskLikeBTCTransactions as btcTx } from "../blockchain/coins/BTC/transactionFetch.js";
import { getMetaMaskLikeLTCTransactions as ltcTx } from "../blockchain/coins/LTC/transactionFetch.js";
import { getMetaMaskLikeDogeTransactions as dogeTx } from "../blockchain/coins/DOGE/transactionFetch.js";
import { getMetaMaskLikeXRPTransactions as xrpTx } from "../blockchain/coins/XRP/transactionFetch.js";
import { getMetaMaskLikeXLMTransactions as xlmTx } from "../blockchain/coins/XLM/transactionFetch.js";




export const getTransactions = async (params) => {
    try {
        const { address, chainType, contractAddress, shortName } = params;

        const type = getChainType(shortName || chainType);

        switch (type) {

            case "EVM":
                return await evmTx(address, contractAddress, chainType);

            case "SOLANA":
                return await solanaTx(address);

            case "UTXO": {
                const utxoType = chainType?.toUpperCase() || "";
                console.log(`[ENGINE] UTXO Type: ${utxoType}`);

                if (utxoType.includes("BTC")) {
                    return await btcTx(address);
                }
                if (utxoType.includes("LTC")) {
                    return await ltcTx(address);
                }
                if (utxoType.includes("DOGE")) {
                    return await dogeTx(address);
                }
                throw new Error(`Unsupported UTXO chain: ${chainType}`);
            }

            case "TRON":
                return await tronTx(address);

            case "XRP":
                return await xrpTx(address);

            case "XLM":
                return await xlmTx(address);

            case "TON":
                return Promise.reject(
                    new Error("TON transactions not implemented yet")
                );

            default:
                throw new Error(`❌ Unsupported chain: ${type}`);
        }
    } catch (err) {
        console.error("❌ Transaction Engine Error:", err);
        throw err;
    }
};