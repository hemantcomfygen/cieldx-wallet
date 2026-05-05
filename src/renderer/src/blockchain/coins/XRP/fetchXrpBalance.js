// import xrpl from "xrpl";
import { Client } from "xrpl";

export const fetchXrpBalance = async (address, rpcUrl) => {
    const client = new Client(rpcUrl);

    try {
        await client.connect();

        const response = await client.request({
            command: "account_info",
            account: address,
            ledger_index: "validated"
        });

        const balanceDrops = response.result.account_data.Balance;

        const xrp = balanceDrops / 1e6;

        await client.disconnect();

        return xrp

    } catch (error) {
        console.log("error in fetch balance of XRP", error)
    }
}

// const address = "rdGzD9oHEUJkiWxiuVA4UnB9f4kF7giQn"
// const rpc = "https://s1.ripple.com:51234"

// const res = await fetchXrpBalance(address, rpc)

// console.log("res", res)

