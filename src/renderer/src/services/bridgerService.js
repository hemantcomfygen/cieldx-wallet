import axios from "axios";

const BASE_URL = "https://api.bridgers.xyz/api";

export const getQuote = async ({
    fromTokenAddress,
    toTokenAddress,
    amount,
    fromChain,
    toChain,
    userAddr,
}) => {
    const params = {
        equipmentNo: userAddr.slice(0, 32), // unique id
        sourceFlag: "widget",
        sourceType: "H5",

        fromTokenAddress,
        toTokenAddress,
        fromTokenAmount: amount,
        fromTokenChain: fromChain,
        toTokenChain: toChain,
        userAddr,
    };

    const res = await axios.post(`${BASE_URL}/sswap/quote`, params);

    console.log("Bridger Quote Response:", res.data);
    if (res.data.resCode != 100) {
        throw new Error(res.data.resMsg);
    }



    return res.data.data.txData;
};