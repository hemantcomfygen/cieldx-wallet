import axios from "axios";

export const getMetaMaskLikeXRPTransactions = async (address) => {
    try {
        const res = await axios.get(
            `https://api.xrpscan.com/api/v1/account/${address}/transactions?limit=50`
        );

        const data = await res.data;

        return data.transactions
            .map((tx) => {

                const isOut =
                    tx.Account?.toLowerCase() === address.toLowerCase();

                /* ---------- AMOUNT FIX ---------- */
                let amount = 0;

                const delivered = tx.meta?.delivered_amount;

                if (typeof delivered === "object") {
                    amount = Number(delivered.value);
                } else if (typeof delivered === "string") {
                    amount = Number(delivered) / 1_000_000;
                }

                if (!amount) return null;

                return {
                    hash: tx.hash,
                    from: tx.Account,
                    to: tx.Destination,

                    value: amount.toString(),

                    tokenSymbol: "XRP",
                    tokenDecimal: 6,

                    // ✅ already ISO string
                    timestamp: new Date(tx.date).getTime(),

                    status:
                        tx.meta?.TransactionResult === "tesSUCCESS"
                            ? "success"
                            : "failed",

                    type: "native",
                    direction: isOut ? "out" : "in",

                    fee: (Number(tx.Fee) / 1_000_000).toString(),

                    confirmations: 0,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.timestamp - a.timestamp);

        // return data;
    } catch (err) {
        console.error("XRP Fetch Error:", err);
    }
};