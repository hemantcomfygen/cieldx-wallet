

export async function getMetaMaskLikeBTCTransactions(address) {
    try {
        if (!address) throw new Error("BTC address is required");
        const response = await fetch(`https://mempool.space/api/address/${address}/txs`);

        if (!response.ok) throw new Error(`Mempool HTTP Error: ${response.status}`);

        const txs = await response.json();

        return txs.map(tx => {
            const inputs = tx.vin || [];
            const outputs = tx.vout || [];

            let sent = 0;
            let received = 0;

            // Calculate amount sent by user (sum of inputs from user address)
            inputs.forEach(input => {
                if (input.prevout?.scriptpubkey_address === address) {
                    sent += input.prevout.value || 0;
                }
            });

            // Calculate amount received by user (sum of outputs to user address)
            outputs.forEach(output => {
                if (output.scriptpubkey_address === address) {
                    received += output.value || 0;
                }
            });

            const netValue = received - sent;
            const direction = netValue < 0 ? "out" : "in";

            // Convert satoshis to BTC string
            const btcValue = (Math.abs(netValue) / 1e8).toFixed(8);

            return {
                hash: tx.txid,
                from: inputs[0]?.prevout?.scriptpubkey_address || "unknown",
                to: outputs[0]?.scriptpubkey_address || "unknown",
                value: btcValue,
                tokenSymbol: "BTC",
                tokenDecimal: 8,
                timestamp: tx.status?.block_time ? tx.status.block_time * 1000 : Date.now(),
                status: tx.status?.confirmed ? "success" : "pending",
                type: "native",
                direction: direction,
                fee: (tx.fee / 1e8).toFixed(8),
                confirmations: tx.status?.confirmed ? 6 : 0
            };
        });
    } catch (err) {
        console.error("[BTC MEMPOOL FETCH] Error:", err.message);
        return [];
    }
}