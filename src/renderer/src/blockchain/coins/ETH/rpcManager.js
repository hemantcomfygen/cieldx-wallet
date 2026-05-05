// rpcManager.js

import { JsonRpcProvider, Contract } from "ethers";

const rpcCache = {}; // chainId → working RPC

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)"
];



const isNativeToken = (token) =>
    token.isNative ||
    token.address?.toLowerCase() ===
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const getWorkingProvider = async ({
    rpcUrls,
    address,
    token,
    chainId
}) => {
    // 🔥 Use cached RPC if available
    if (rpcCache[chainId]) {
        return new JsonRpcProvider(rpcCache[chainId]);
    }

    for (const rpc of rpcUrls) {
        const url = typeof rpc === "string" ? rpc : rpc.url;

        if (!url || !url.startsWith("http")) continue;

        try {
            const provider = new JsonRpcProvider(url);

            // 🔥 REAL validation (not just ping)
            if (isNativeToken(token)) {
                await provider.getBalance(address);
            } else {
                const contract = new Contract(
                    token.address,
                    ERC20_ABI,
                    provider
                );
                await contract.balanceOf(address);
            }

            console.log("✅ Working RPC:", url);

            // cache it
            rpcCache[chainId] = url;

            return provider;
        } catch (err) {
            console.warn("❌ Dead RPC:", url);
        }
    }

    throw new Error("No working RPC found");
};