
export async function getMetaMaskLikeDogeTransactions(address) {
    try {
        if (!address) throw new Error("Doge address is required");

        // BlockCypher API for Doge
        const url = `https://api.blockcypher.com/v1/doge/main/addrs/${address}/full?limit=50`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`BlockCypher HTTP Error: ${response.status}`);

        const data = await response.json();
        const txs = data.txs || [];

        return txs.map(tx => {
            const inputAddresses = (tx.inputs || []).flatMap(i => i.addresses || []);
            const outputAddresses = (tx.outputs || []).flatMap(o => o.addresses || []);

            const isOut = inputAddresses.some(a => a === address);

            let valueInSatoshis = 0;
            if (isOut) {
                valueInSatoshis = (tx.outputs || [])
                    .filter(o => !(o.addresses || []).includes(address))
                    .reduce((sum, o) => sum + (o.value || 0), 0);
            } else {
                valueInSatoshis = (tx.outputs || [])
                    .filter(o => (o.addresses || []).includes(address))
                    .reduce((sum, o) => sum + (o.value || 0), 0);
            }

            const dogeValue = (valueInSatoshis / 1e8).toFixed(8);
            const feeDoge = tx.fees ? (tx.fees / 1e8).toFixed(8) : "0";

            return {
                hash: tx.hash,
                from: isOut ? address : (inputAddresses[0] || "unknown"),
                to: isOut ? (outputAddresses.find(a => a !== address) || "unknown") : address,
                value: dogeValue,
                tokenSymbol: "DOGE",
                tokenDecimal: 8,
                timestamp: tx.confirmed ? new Date(tx.confirmed).getTime() : Date.now(),
                status: tx.confirmations > 0 ? "success" : "pending",
                type: "native",
                direction: isOut ? "out" : "in",
                fee: feeDoge,
                confirmations: tx.confirmations || 0
            };
        });
    } catch (err) {
        console.error("[DOGE FETCH] Error:", err.message);
        return [];
    }
}
