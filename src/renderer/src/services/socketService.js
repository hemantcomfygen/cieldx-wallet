import axios from "axios";
import { SOCKET_API, SOCKET_API_KEY } from "../config/api";

export const getQuoteAPI = async (params) => {
    const res = await axios.get(`${SOCKET_API}/quote`, {
        params,
        headers: { "API-KEY": SOCKET_API_KEY },
    });

    return res.data.result.routes;
};

export const buildTxAPI = async (route) => {
    const res = await axios.post(
        `${SOCKET_API}/build-tx`,
        { route },
        { headers: { "API-KEY": SOCKET_API_KEY } }
    );

    return res.data.result;
};