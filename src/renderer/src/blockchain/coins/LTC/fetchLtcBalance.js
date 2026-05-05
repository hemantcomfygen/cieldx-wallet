import axios from "axios"
import { ltcBlockCypherUrl } from "../../../utils/config.js"

export const fetchLtcBalance = async (address) => {
    try {
        const response = await axios.get(`${ltcBlockCypherUrl}${address}/balance`)
        const litosis = response.data.balance;
        const balance = litosis / 1e8;

        return balance
    } catch (error) {
        console.log("error in fetching balance of LTC", error)
    }
}

const address = "LffkocZM2VQuVykHQeFSWBcbEZFC9MTvrC"

// const res = await fetchLtcBalance(address)
// console.log("balance", res)