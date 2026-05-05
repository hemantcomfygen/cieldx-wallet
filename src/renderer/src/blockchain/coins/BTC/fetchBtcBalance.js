import axios from "axios";
import { quickNode, quickNodeMainNet } from "../../../utils/config.js"


const rpcNode = quickNodeMainNet;
const address = "12hQouYQaiX5ksFXTe26gHLBChb7vTV4it"
// const address = "bc1qcs640zf6kdsuh807mujdkrfrspmg9fne09p4j8"

export const getUtxos = async (address, rpcNodeUrl) => {

    // console.log(`${rpcNodeUrl}api/v2/utxo/${address}`)
    try {
        const response = await axios.get(`${rpcNodeUrl}api/v2/utxo/${address}`)
        return response?.data
    } catch (error) {
        console.error("❌ fetch utxo of btc", error)
    }
}

export const fetchBtcBalance = async (address, rpcNodeUrl = rpcNode) => {
    try {
        // const utxos = await getUtxos(address, rpcNodeUrl);

        const response = await axios.get(`${rpcNodeUrl}api/v2/address/${address}`)

        if (!response?.data) {
            console.log("not balance found")
            return 0;
        }

        const balance = response?.data?.balance / 1e8;

        return balance;

    } catch (error) {
        console.error("❌ error in fetch balance of btc", error);
    }
};

// const res = await fetchBtcBalance(address, rpcNode)
// console.log("res", res)