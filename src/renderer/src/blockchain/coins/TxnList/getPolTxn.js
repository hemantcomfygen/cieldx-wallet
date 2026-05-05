import { ethers } from "ethers";

export const getPolTxn = async (address) => {
    try {
        const res = await fetch(
            "https://polygon-indexer.sequence.app/rpc/Indexer/GetTransactionHistory",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Key": "AQAAAAAAAF_JvPALhBthL7VGn6jV0YDqaFY",
                },
                body: JSON.stringify({
                    filter: { accountAddress: address },
                    includeMetadata: true,
                    page: { pageSize: 100 },
                }),
            }
        );

        const data = await res.json();

        if (!data?.transactions) return [];

        const formatted = [];

        data.transactions.forEach((tx) => {
            const timestamp = new Date(tx.timestamp).getTime();

            (tx.transfers || []).forEach((t) => {
                const decimals = Number(t.contractInfo?.decimals || 18);

                const rawValue = t.amounts?.[0] || "0";

                const value = ethers.formatUnits(rawValue, decimals);

                const isOut = t.transferType === "SEND";

                if (Number(value) === 0) return;

                formatted.push({
                    hash: tx.txnHash,
                    from: t.from,
                    to: t.to,
                    value,
                    tokenSymbol: t.contractInfo?.symbol || "MATIC",
                    tokenDecimal: decimals,
                    timestamp,
                    status: "success",
                    type: t.contractType === "ERC20" ? "token" : "native",
                    direction: isOut ? "out" : "in",
                    fee: "0",
                    confirmations: 0,
                });
            });
        });

        const unique = Array.from(
            new Map(
                formatted.map((i) => [
                    i.hash + i.from + i.to + i.value,
                    i,
                ])
            ).values()
        );

        return unique;
    } catch (err) {
        console.error("Error fetching tx history", err);
        return [];
    }
};

// const address = "0xfcdCc5d9058a5EB3949008d866b2Eb57a21284dd";

// const res = await getPolTxn(address);
// console.log('res', res)