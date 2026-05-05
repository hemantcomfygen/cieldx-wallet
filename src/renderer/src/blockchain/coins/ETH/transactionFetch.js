import { ethers } from "ethers";
import { getPolTxn } from "../TxnList/getPolTxn.js";

const EXPLORERS = {
    ETH: "https://eth.blockscout.com/api",
    BSC: "https://api.bscscan.com/api",
    BSC_BLOCKSCOUT: "https://bsc.blockscout.com/api",
    POLYGON: "https://polygon.blockscout.com/api",
    BASE: "https://base.blockscout.com/api",
    OPTIMISM: "https://optimism.blockscout.com/api",
    ARBITRUM: "https://arbitrum.blockscout.com/api",
    AVALANCHE: "https://avalanche.blockscout.com/api",
    FANTOM: "https://fantom.blockscout.com/api",
};

const getExplorerBase = (chainType) => {
    const chain = chainType?.toUpperCase() || "";

    if (chain.includes("ETH")) return EXPLORERS.ETH;
    if (chain.includes("BSC") || chain.includes("BNB") || chain.includes("BEP20")) return EXPLORERS.BSC;
    if (chain.includes("POLYGON") || chain.includes("MATIC") || chain === "POL") return EXPLORERS.POLYGON;
    if (chain.includes("ARBITRUM") || chain === "ARB") return EXPLORERS.ARBITRUM;
    if (chain.includes("BASE")) return EXPLORERS.BASE;
    if (chain.includes("OPTIMISM") || chain.startsWith("OP")) return EXPLORERS.OPTIMISM;
    if (chain.includes("AVAX") || chain.includes("AVALANCHE")) return EXPLORERS.AVALANCHE;
    if (chain.includes("FTM") || chain.includes("FANTOM")) return EXPLORERS.FANTOM;

    return EXPLORERS.ETH; // Default fallback
};


export async function getMetaMaskLikeTransactions(address, coinAddress = null, chainType = "ETH") {
    try {
        if (!address) throw new Error("Wallet address is required");

        const normalizedChain = chainType.toUpperCase();
        let explorerBase = getExplorerBase(chainType);

        const nativeAddresses = [
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "eth", "native", "bnb", "matic", "null",
            "0x0000000000000000000000000000000000000000"
        ];

        const isNative = !coinAddress || nativeAddresses.includes(String(coinAddress).toLowerCase());

        // polygon

        if (
            normalizedChain.includes("POLYGON") ||
            normalizedChain.includes("MATIC") ||
            normalizedChain === "POL"
        ) {
            const res = await getPolTxn(address, coinAddress);

            return (await getPolTxn(address, coinAddress))
                .sort((a, b) => b.timestamp - a.timestamp);
        }

        const fetchTxs = async (baseUrl) => {
            try {
                let action = isNative ? "txlist" : "tokentx";
                let url = `${baseUrl}?module=account&action=${action}&address=${address}&sort=desc`;
                if (!isNative) url += `&contractaddress=${coinAddress}`;

                const response = await fetch(url);
                if (!response.ok) {
                    console.error(`[EVM TX Fetch] HTTP Error ${response.status} for ${baseUrl}`);
                    return { status: "0", result: [] };
                }
                const data = await response.json();
                return data;
            } catch (e) {
                console.error(`[EVM TX Fetch] Request failed for ${baseUrl}:`, e.message);
                return { status: "0", result: [] };
            }
        };

        let data = await fetchTxs(explorerBase);

        // Fallback for BSC if primary fails
        if ((data.status !== "1" || !data.result || data.result.length === 0) && normalizedChain.includes("BNB")) {
            const fallbackUrl = explorerBase === EXPLORERS.BSC ? EXPLORERS.BSC_BLOCKSCOUT : EXPLORERS.BSC;
            console.log(`[EVM TX Fetch] Trying fallback for BSC: ${fallbackUrl}`);
            data = await fetchTxs(fallbackUrl);
        }

        if (data.status !== "1" || !data.result || !Array.isArray(data.result)) {
            return [];
        }

        return data.result.map(tx => {
            const isOut = String(tx.from).toLowerCase() === address.toLowerCase();
            const txTimestamp = tx.timeStamp || tx.timestamp || 0;
            const txStatus = (tx.isError === "0" || tx.txreceipt_status === "1") ? "success" : "failed";

            return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatUnits(tx.value || "0", tx.tokenDecimal || 18),
                tokenSymbol: tx.tokenSymbol || normalizedChain,
                tokenDecimal: tx.tokenDecimal || 18,
                timestamp: parseInt(txTimestamp) * 1000,
                status: txStatus,
                type: isNative ? "native" : "token",
                direction: isOut ? "out" : "in",
                fee: calculateFee(tx),
                confirmations: tx.confirmations || 0
            };
        });
    } catch (err) {
        console.error("EVM TX Fetch Error:", err);
        return [];
    }
}


function calculateFee(tx) {
    try {
        const gasUsed = BigInt(tx.gasUsed || 0);
        const gasPrice = BigInt(tx.gasPrice || 0);
        return ethers.formatEther(gasUsed * gasPrice);
    } catch {
        return "0";
    }
}

// const res = await getMetaMaskLikeTransactions("0xfcdCc5d9058a5EB3949008d866b2Eb57a21284dd");

// console.log("res", res)