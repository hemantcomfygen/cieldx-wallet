import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC = "https://methodical-twilight-replica.solana-mainnet.quiknode.pro/e2105c10e6ea80775ec44e9bf034de8d079fe69e";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));


const getTransactionSafe = async (connection, signature, retries = 3) => {
    try {
        return await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        });
    } catch (err) {
        if (retries > 0) {
            await sleep(500);
            return getTransactionSafe(connection, signature, retries - 1);
        }
        return null;
    }
};

export const getMetaMaskLikeSolanaTx = async (address) => {
    try {
        if (!address) return [];

        const connection = new Connection(SOLANA_RPC, "confirmed");
        const pubKey = new PublicKey(address);

        const signatures = await connection.getSignaturesForAddress(pubKey, {
            limit: 50,
        });

        if (signatures.length === 0) return [];

        const BATCH_SIZE = 10;
        const rawTransactions = [];

        for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
            const batch = signatures.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(
                batch.map((sig) => getTransactionSafe(connection, sig.signature))
            );
            rawTransactions.push(...results.filter(Boolean));
        }

        return rawTransactions.map(tx => {
            const meta = tx.meta;
            const transaction = tx.transaction;
            const message = transaction.message;
            const instructions = message.instructions || [];

            let from = message.accountKeys[0].pubkey.toString();
            let to = message.accountKeys[1]?.pubkey.toString() || "unknown";
            let value = 0;
            let type = "native";
            let tokenSymbol = "SOL";
            let decimals = 9;

            // Detect transfers
            for (const ix of instructions) {
                if (ix.parsed?.type === "transfer") {
                    const info = ix.parsed.info;
                    from = info.source || from;
                    to = info.destination || to;
                    value = info.lamports || info.amount || 0;
                    if (ix.program === "spl-token") {
                        type = "token";
                        tokenSymbol = "TOKEN";
                        decimals = info.tokenAmount?.decimals || 0;
                    }
                }
            }

            const formattedValue = (value / Math.pow(10, decimals)).toFixed(4);

            return {
                hash: transaction.signatures[0],
                from,
                to,
                value: formattedValue,
                tokenSymbol,
                tokenDecimal: decimals,
                timestamp: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
                status: meta?.err ? "failed" : "success",
                type,
                direction: from === address ? "out" : "in",
                fee: meta?.fee ? (meta.fee / 1e9).toFixed(6) : "0",
                confirmations: 1
            };
        }).sort((a, b) => b.timestamp - a.timestamp);

    } catch (error) {
        console.error("❌ Error in Solana UI Fetch:", error.message);
        return [];
    }
};