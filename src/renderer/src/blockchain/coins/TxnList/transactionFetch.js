import { ethers } from "ethers";


export async function getBNBTransactions(address, coinAddress = null) {
    try {
        if (!address) throw new Error("Wallet address is required");

        const nativeMarkers = [
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "bnb", "native", "null", "0x0000000000000000000000000000000000000000"
        ];
        const isNative = !coinAddress || nativeMarkers.includes(String(coinAddress).toLowerCase());

        const response = await fetch("https://rpc.ankr.com/multichain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "ankr_getTransactionsByAddress",
                params: {
                    address: address,
                    blockchain: ["bsc"],
                    pageSize: 50
                },
                id: 1
            })
        });

        if (!response.ok) throw new Error(`BNB RPC Error: ${response.status}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message || "RPC Error");

        const transactions = data.result?.transactions || [];

        return transactions
            .filter(tx => {
                if (isNative) {
                    return !tx.contractAddress || tx.tokenSymbol === "BNB";
                }
                return tx.contractAddress?.toLowerCase() === coinAddress?.toLowerCase();
            })
            .map(tx => {
                const isOut = String(tx.fromAddress).toLowerCase() === address.toLowerCase();
                const decimals = tx.tokenDecimals || 18;

                let formattedValue = tx.value;
                if (formattedValue && !formattedValue.includes(".")) {
                    try {
                        formattedValue = ethers.formatUnits(tx.value, decimals);
                    } catch (e) {
                        formattedValue = tx.value;
                    }
                }

                return {
                    hash: tx.hash,
                    from: tx.fromAddress,
                    to: tx.toAddress,
                    value: Number(formattedValue).toFixed(4),
                    tokenSymbol: tx.tokenSymbol || (isNative ? "BNB" : "TOKEN"),
                    tokenDecimal: decimals,
                    timestamp: tx.timestamp ? parseInt(tx.timestamp) * 1000 : Date.now(),
                    status: "success",
                    type: tx.contractAddress ? "token" : "native",
                    direction: isOut ? "out" : "in",
                    fee: tx.fee ? Number(tx.fee).toFixed(6) : "0",
                    confirmations: 10
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
        console.error("[BNB FETCH] Error:", err.message);
        return [];
    }
}