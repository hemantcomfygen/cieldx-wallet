
export async function getMetaMaskLikeLTCTransactions(address) {
    try {
        if (!address) throw new Error("LTC address is required");

        try {
            return await fetchFromBlockCypher(address);
        } catch (primaryErr) {
            console.warn(`[LTC BLOCKCYPHER] Failed: ${primaryErr.message}. Trying fallback...`);
            return await fetchFromLitecoinSpace(address);
        }
    } catch (err) {
        console.error("[LTC FETCH] All providers failed:", err.message);
        return [];
    }
}

async function fetchFromBlockCypher(address) {
    const url = `https://api.blockcypher.com/v1/ltc/main/addrs/${address}/full?limit=50`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`BlockCypher HTTP ${response.status}`);

    const data = await response.json();
    const txs = data.txs || [];

    return txs.map(tx => {
        const inputAddresses = (tx.inputs || []).flatMap(i => i.addresses || []);
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

        const valueInLTC = (valueInSatoshis / 1e8).toFixed(8);
        const feeInLTC = tx.fees ? (tx.fees / 1e8).toFixed(8) : "0";

        const fromAddr = isOut ? address : (inputAddresses[0] || "unknown");
        const toAddr = isOut
            ? (tx.outputs || []).find(o => !(o.addresses || []).includes(address))?.addresses?.[0] || "unknown"
            : address;

        return {
            hash: tx.hash,
            from: fromAddr,
            to: toAddr,
            value: valueInLTC,
            tokenSymbol: "LTC",
            tokenDecimal: 8,
            timestamp: tx.confirmed
                ? new Date(tx.confirmed).getTime()
                : tx.received
                    ? new Date(tx.received).getTime()
                    : Date.now(),
            status: tx.confirmations > 0 ? "success" : "pending",
            type: "native",
            direction: isOut ? "out" : "in",
            fee: feeInLTC,
            confirmations: tx.confirmations || 0,
        };
    });
}


async function fetchFromLitecoinSpace(address) {
    const url = `https://litecoinspace.org/api/address/${address}/txs`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`LitecoinSpace HTTP ${response.status}`);

    const txs = await response.json();

    return txs.map(tx => {
        const inputAddresses = (tx.vin || []).flatMap(i => i.prevout?.scriptpubkey_address ? [i.prevout.scriptpubkey_address] : []);
        const isOut = inputAddresses.some(a => a === address);

        let valueInSatoshis = 0;
        if (isOut) {
            valueInSatoshis = (tx.vout || [])
                .filter(o => o.scriptpubkey_address !== address)
                .reduce((sum, o) => sum + (o.value || 0), 0);
        } else {
            valueInSatoshis = (tx.vout || [])
                .filter(o => o.scriptpubkey_address === address)
                .reduce((sum, o) => sum + (o.value || 0), 0);
        }

        const valueInLTC = (valueInSatoshis / 1e8).toFixed(8);
        const feeInLTC = tx.fee ? (tx.fee / 1e8).toFixed(8) : "0";

        const fromAddr = isOut ? address : (inputAddresses[0] || "unknown");
        const toAddr = isOut
            ? (tx.vout || []).find(o => o.scriptpubkey_address !== address)?.scriptpubkey_address || "unknown"
            : address;

        const confirmed = tx.status?.confirmed;
        const blockTime = tx.status?.block_time;

        return {
            hash: tx.txid,
            from: fromAddr,
            to: toAddr,
            value: valueInLTC,
            tokenSymbol: "LTC",
            tokenDecimal: 8,
            timestamp: blockTime ? blockTime * 1000 : Date.now(),
            status: confirmed ? "success" : "pending",
            type: "native",
            direction: isOut ? "out" : "in",
            fee: feeInLTC,
            confirmations: confirmed ? 1 : 0,
        };
    });
}