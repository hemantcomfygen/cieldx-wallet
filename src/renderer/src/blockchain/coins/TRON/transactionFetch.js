import { TronWeb } from "tronweb";

const TRONGRID = "https://api.trongrid.io";

const tronWeb = new TronWeb({
    fullHost: TRONGRID,
});


export async function getMetaMaskLikeTransactions(address) {
    try {
        if (!address) throw new Error("TRON address is required");

        const [trxTxs, trc20Txs] = await Promise.all([
            fetchTRX(address),
            fetchTRC20(address),
        ]);

        const normalizedTRX = (trxTxs || []).map((tx) => mapTRX(tx, address));
        const normalizedTRC20 = (trc20Txs || []).map((tx) => mapTRC20(tx, address));

        const all = [...normalizedTRX, ...normalizedTRC20];

        return all.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
        console.error("[TRON FETCH] Error:", err.message);
        return [];
    }
}


async function fetchTRX(address) {
    try {
        const url = `${TRONGRID}/v1/accounts/${address}/transactions?limit=40`;
        const res = await fetch(url, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        return data.data || [];
    } catch (err) {
        console.warn("[TRON TRX FETCH] Failed:", err.message);
        return [];
    }
}


async function fetchTRC20(address) {
    try {
        const url = `${TRONGRID}/v1/accounts/${address}/transactions/trc20?limit=40`;
        const res = await fetch(url, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        return data.data || [];
    } catch (err) {
        console.warn("[TRON TRC20 FETCH] Failed:", err.message);
        return [];
    }
}

function mapTRX(tx, userAddress) {
    const contract = tx.raw_data?.contract?.[0];
    const val = contract?.parameter?.value;
    const from = val?.owner_address ? tronWeb.address.fromHex(val.owner_address) : "unknown";
    const to = val?.to_address ? tronWeb.address.fromHex(val.to_address) : (val?.contract_address ? tronWeb.address.fromHex(val.contract_address) : "unknown");

    return {
        hash: tx.txID,
        from,
        to,
        value: (Number(val?.amount || 0) / 1e6).toString(),
        tokenSymbol: "TRX",
        tokenDecimal: 6,
        timestamp: tx.raw_data?.timestamp || tx.block_timestamp || Date.now(),
        status: tx.ret?.[0]?.contractRet === "SUCCESS" ? "success" : "failed",
        type: "native",
        direction: from === userAddress ? "out" : "in",
        fee: tx.ret?.[0]?.fee ? (tx.ret[0].fee / 1e6).toString() : "0",
        confirmations: 1
    };
}


function mapTRC20(tx, userAddress) {
    return {
        hash: tx.transaction_id,
        from: tx.from,
        to: tx.to,
        value: (Number(tx.value) / Math.pow(10, tx.token_info?.decimals || 6)).toFixed(4),
        tokenSymbol: tx.token_info?.symbol || "TOKEN",
        tokenDecimal: tx.token_info?.decimals || 6,
        timestamp: tx.block_timestamp || Date.now(),
        status: "success",
        type: "token",
        direction: tx.from === userAddress ? "out" : "in",
        fee: "0",
        confirmations: 1
    };
}