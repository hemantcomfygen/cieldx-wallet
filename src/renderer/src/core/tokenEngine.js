
import { BRIDGER_API } from "../config/api";

export const fetchTokens = async () => {
    const res = await fetch(BRIDGER_API, { method: "POST" });
    const data = await res.json();

    return data.data.tokens;
};

export const normalizeTokens = (tokens) => {
    return tokens
        .filter((t) => t.isCrossEnable === 1)
        .map((t) => ({
            symbol: t.symbol,
            address: t.address,
            chain: t.chain,
            chainId: Number(t.chainId),
            decimals: t.decimals,
        }));
};


export const getTokens = async () => {
    const res = await fetch(
        "https://api.bridgers.xyz/api/exchangeRecord/getToken",
        { method: "POST" }
    );

    const data = await res.json();

    return data.data.tokens.filter(t => t.isCrossEnable === 1);
};


