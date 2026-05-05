import axios from "axios"
import { dogeCoinBlockCypher } from "../../../utils/config.js"

export const fetchDogeBalance = async (address) => {
    try {
        const response = await axios.get(`${dogeCoinBlockCypher}${address}/balance`)
        const koinu = response.data.balance;

        const balance = koinu / 1e8

        return balance
    } catch (error) {
        console.log("error in fetch balance of doge coin", error)
    }
}

const address = "DP9h5zASyq3D918KEHRSx7XLQVh6voTfrP";

// const res = await fetchDogeBalance(address);
// console.log("balance", res)