import { useEffect, useState, useCallback } from "react";
import { fetchBalanceForAllCoins } from "../utils/blockChianFunctions/dynamicFetcher";

export const useBalanceRefresh = (
    address,
    shortName,
    fullName,
    rpcUrl,
    tokenAddress,
    contractAddress,
    isToken
) => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshBalance = useCallback(async () => {
        try {
            if (!address) return 0;

            setLoading(true);

            const res = await fetchBalanceForAllCoins({
                address,
                shortName,
                fullName,
                rpcUrl,
                tokenAddress,
                contractAddress,
                isToken,
            });

            const newBalance = Number(res?.balance || 0);

            setBalance(newBalance);

            return newBalance;
        } catch (err) {
            console.log("balance fetch error", err);
            return 0;
        } finally {
            setLoading(false);
        }
    }, [address, shortName, rpcUrl, tokenAddress, contractAddress, isToken]);

    useEffect(() => {
        if (!address) return;
        refreshBalance();
    }, [address]);

    return { balance, loading, refreshBalance };
};