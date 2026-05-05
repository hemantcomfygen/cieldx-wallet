import { sendBTC } from "../../blockchain/coins/BTC/sendBTC.js";
import {
    fetchBalanceXlm,
    fetchETHBalance,
    fetchSolBalance,
    fetchTronBalance,
    fetchXrpBalance,
    generateDogeAddress,
    generateEVMAddress,
    generateLegacyAddress,
    generateLtcAddress,
    generateSegWitAddress,
    generateSolAddress,
    generateTapRootAddress,
    generateTronAddress,
    generateXlmAddress,
    generateXrpAddress,
    nativeSegWitAddress,
    sendDogeCoin,
    sendEvmCoin,
    sendLtcCoin,
    sendSolCoin,
    sendTronCoin,
    sendXlmCoin,
    sendXrpCoin
} from "../../blockchain/coins/index.js";
import { fetchUTXOBalance } from "../../blockchain/coins/UTXO/fetchUtxoBalance.js";
import { UTXO_API } from "../config.js";
import { getChainType } from "./getChainType.js"

const BTC_SYMBOLS = ["BTC", "BTC_NATIVE_SEGBIT", "BTC_SEGBIT", "BTC_TAPEROOT"];


const ADDRESS_GENERATORS = {
    EVM: generateEVMAddress,
    SOLANA: generateSolAddress,
    TRON: generateTronAddress,
    XRP: generateXrpAddress,
    XLM: generateXlmAddress,

    UTXO: {
        BTC: generateLegacyAddress,
        BTC_NATIVE_SEGBIT: nativeSegWitAddress,
        BTC_SEGBIT: generateSegWitAddress,
        BTC_TAPEROOT: generateTapRootAddress,
        DOGE: generateDogeAddress,
        LTC: generateLtcAddress,
    }
};


export const generateAllCoinsAddress = async (passPhrase, coin, accountIndex = 0) => {
    const { shortName } = coin;

    const chainType = getChainType(shortName);

    try {
        if (chainType === "UTXO") {
            const symbol = shortName?.toUpperCase();
            const generator = ADDRESS_GENERATORS.UTXO[symbol];
            if (!generator) throw new Error("Unsupported UTXO coin");

            const res = await generator(passPhrase, accountIndex);
            return {
                chainType: chainType,
                coinName: coin?.fullName,
                address: res?.address,
                privateKey: res?.privateKey,
                default: res?.default,
                optional: res?.optional
            };
        }

        const generator = ADDRESS_GENERATORS[chainType];

        if (!generator) {
            throw new Error(`Unsupported chain type: ${chainType}`);
        }

        const res = await generator(passPhrase, accountIndex);

        return {
            chainType: chainType,
            coinName: coin?.fullName,
            address: res?.address,
            privateKey: res?.privateKey,
            default: res?.default,
            optional: res?.optional
        };

    } catch (error) {
        console.error("Address generation error:", error);
        return null;
    }
};


const BALANCE_FETCHER = {
    EVM: fetchETHBalance,
    SOLANA: fetchSolBalance,
    TRON: fetchTronBalance,
    XRP: fetchXrpBalance,
    XLM: fetchBalanceXlm,

    // LTC: fetchLtcBalance,
    // BTC: fetchBtcBalance,
    // DOGE: fetchDogeBalance,

    UTXO: fetchUTXOBalance
};


export const fetchBalanceForAllCoins = async (coin) => {
    const { shortName, fullName, address, rpcUrl, tokenAddress, isToken, contractAddress } = coin;

    const chainType = getChainType(shortName);

    try {
        if (!address) return 0;

        if (chainType === "UTXO") {
            const symbol = BTC_SYMBOLS.includes(shortName) ? "BTC" : shortName?.toUpperCase();

            const res = await BALANCE_FETCHER.UTXO(symbol, address);

            return {
                coinName: fullName,
                balance: res
            }
        }

        const fetcher = BALANCE_FETCHER[chainType];

        if (!fetcher) {
            console.warn(`No fetcher for ${chainType}`);
            return 0;
        }

        if (chainType === "EVM") {
            const res = await fetcher(address, rpcUrl, tokenAddress, isToken);

            return {
                coinName: fullName,
                balance: res
            }
        }

        const res = await fetcher(address, rpcUrl, contractAddress, isToken);

        return {
            coinName: fullName,
            balance: res
        }

    } catch (error) {
        console.error(`❌ error in fetch balance of ${shortName}`, error);
        return 0;
    }
};


const COIN_SENDER = {
    EVM: sendEvmCoin,
    SOLANA: sendSolCoin,
    TRON: sendTronCoin,
    XRP: sendXrpCoin,
    XLM: sendXlmCoin,

    UTXO: {
        BTC: sendBTC,
        LTC: sendLtcCoin,
        DOGE: sendDogeCoin,
    }
};


export const sendCoinTransaction = async ({
    coin,
    toAddress,
    amount,
    mnemonic,
    accountIndex
}) => {
    try {
        const {
            id,
            fullName,
            shortName,
            address,
            privateKey,
            rpcUrl,
            tokenAddress,
            is_token,
            contractAddress
        } = coin;

        const chainType = getChainType(shortName);
        const sender = COIN_SENDER[chainType];

        if (!sender) {
            throw new Error(`Send not supported for ${chainType}`);
        }

        let res;

        if (chainType === "UTXO") {
            const symbol = shortName?.toUpperCase();

            const key = BTC_SYMBOLS.includes(symbol) ? "BTC" : symbol;

            const sender = COIN_SENDER.UTXO[key];
            if (!sender) throw new Error("Unsupported UTXO coin");

            res = await sender({
                fromAddress: address,
                toAddress,
                privateKey,
                amountBtc: amount,
                rpcNode: UTXO_API.BTC
            });
        }

        else if (chainType === "EVM") {
            res = await sender(
                toAddress,
                privateKey,
                rpcUrl,
                amount,
                tokenAddress,
                is_token
            );
        }

        else {
            res = await sender({
                address,
                toAddress,
                privateKey,
                rpcUrl,
                amount,
                isToken: is_token,
                contractAddress,
                decimals: coin.decimal_value,
                mnemonic,
                accountIndex
            });
        }

        return {
            coinId: id,
            coinName: fullName,
            transaction: res
        };

    } catch (error) {
        console.error("❌ send coin error:", error);
        throw error.message || "Error while sending coin";
    }
};