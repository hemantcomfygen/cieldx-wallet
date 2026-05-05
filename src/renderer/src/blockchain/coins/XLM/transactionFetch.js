import { Horizon } from "@stellar/stellar-sdk";
/**
 * 🚀 XLM TRANSACTION FETCHER (Stellar Horizon)
 * Uses the official Stellar Horizon API to fetch account history.
 */
export const getMetaMaskLikeXLMTransactions = async (address) => {
    try {
        if (!address) return [];

        // Standard public Horizon server
        const server = new Horizon.Server("https://horizon.stellar.org");

        // Fetch payments (more relevant for history than raw transactions)
        const payments = await server.payments()
            .forAccount(address)
            .order("desc")
            .limit(50)
            .call();

        const rawPayments = payments.records || [];

        // Map to standard UI format

        return rawPayments.map(p => {
            const isOut = p.from === address;

            // Stellar payments can be 'create_account', 'payment', or 'path_payment'
            let value = p.amount || "0";
            let symbol = p.asset_code || "XLM";

            if (p.type === "create_account") {
                value = p.starting_balance;
                symbol = "XLM";
            }

            return {
                hash: p.transaction_hash,
                from: p.from || p.funder,
                to: p.to || p.account,
                value: value,
                tokenSymbol: symbol,
                tokenDecimal: 7,
                timestamp: new Date(p.created_at).getTime(),
                status: "success",
                type: symbol === "XLM" ? "native" : "token",
                direction: isOut ? "out" : "in",
                fee: "0.0001",
                confirmations: 1
            };
        })

    } catch (error) {
        console.error("❌ Error in XLM Fetch:", error.message);
        return [];
    }
};

// const res = await getMetaMaskLikeXLMTransactions("GDSW5AXVTOJQPNILZOCO4JV5AS4F6NXM3PU5GUNEPDUN3G67NJTZ2YQC");

// console.log(res);
