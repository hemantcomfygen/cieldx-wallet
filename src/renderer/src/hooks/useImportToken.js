import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { TronWeb } from "tronweb";
import axios from "axios";

const ERC20_ABI = [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)"
];

const TRC20_ABI = [
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        type: "function"
    }
];

// EVM (Ethereum, BSC, Polygon, etc.)
const fetchEvmToken = async ({ contractAddress, rpcUrl }) => {
    if (!ethers.isAddress(contractAddress)) {
        throw new Error("Invalid EVM contract address");
    }

    try {

        if (!ethers.isAddress(contractAddress)) {
            throw new Error("Invalid contract address");
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const contract = new ethers.Contract(
            contractAddress,
            ERC20_ABI,
            provider
        );

        const [symbol, decimals, name] = await Promise.all([
            contract.symbol(),
            contract.decimals(),
            contract.name()
        ]);

        const data = {
            symbol,
            decimals: Number(decimals),
            name,
            contractAddress
        };

        return {
            symbol,
            decimals: Number(decimals),
            name,
            contractAddress,
            chain: "EVM"
        };

    } catch (err) {
        console.error("Token fetch error:", err);
        return null;
    }
}



// TRON (TRC-20)
const fetchTronToken = async ({ contractAddress, rpcUrl, address }) => {
    if (!contractAddress) {
        throw new Error("Invalid TRON contract address");
    }

    try {
        // 🔥 1. Fetch from TronScan API
        const { data } = await axios.get(
            `https://apilist.tronscan.org/api/token_trc20?contract=${contractAddress}`,
        );

        const token = data?.trc20_tokens?.[0];

        if (!token) {
            throw new Error("Token not found on TronScan");
        }

        return {
            name: token.name,
            symbol: token.symbol,
            decimals: Number(token.decimals),
            contractAddress: token.contract_address,

            logo: token.icon_url,
            coinValue: token?.market_info?.priceInUsd || null,
            coinMarket: token?.market_info?.gain || null,
            chainType: "TRON"
        };

    } catch (apiError) {
        console.warn("⚠️ TronScan failed, fallback to contract", apiError);
    }

};


const CHAIN_HANDLERS = {
    EVM: fetchEvmToken,
    TRON: fetchTronToken
};


export const useImportToken = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tokenData, setTokenData] = useState(null);

    const fetchTokenDetails = useCallback(
        async ({ contractAddress, rpcUrl, chainType, address }) => {
            try {
                setLoading(true);
                setError(null);
                setTokenData(null);

                const handler = CHAIN_HANDLERS[chainType];

                if (!handler) {
                    throw new Error(`Unsupported chain: ${chainType}`);
                }

                const data = await handler({
                    contractAddress,
                    rpcUrl,
                    address
                });

                setTokenData(data);
                return data;
            } catch (err) {
                console.error("❌ Token fetch error:", err);
                setError(err.message || "Failed to fetch token");
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const reset = () => {
        setTokenData(null);
        setError(null);
    };

    return {
        fetchTokenDetails,
        tokenData,
        loading,
        error,
        reset
    };
};