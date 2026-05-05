import { useEffect, useState } from "react";
import { getAllFromIndexDB } from "../utils/indexDB";
import { decryptData } from "../utils/encryptionFunction";
import {
    generateAllCoinsAddress,
    fetchBalanceForAllCoins,
} from "../utils/blockChianFunctions/dynamicFetcher";

export const useInternalAddresses = (coinData) => {
    const [walletsData, setWalletsData] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [hasInternal, setHasInternal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await getAllFromIndexDB("wallets");
                const decrypted = await decryptData(res?.[0]?.data);
                setWalletsData(decrypted?.wallets || []);
            } catch (err) {
                console.log("wallet fetch error", err);
            }
        };

        fetchWallets();
    }, []);

    useEffect(() => {
        const build = async () => {
            if (!coinData?.shortName || walletsData.length === 0) {
                setAddresses([]);
                setHasInternal(false);
                return;
            }

            try {
                setLoading(true);

                const activeWallet = walletsData.find((w) => w?.is_active);

                const activeAccount =
                    activeWallet?.accounts?.find((a) => a?.is_active) ||
                    activeWallet?.accounts?.find(
                        (a) => a?.id === activeWallet?.active_account_id
                    );

                const totalWallets = walletsData.filter((w) => !w.is_deleted).length;
                const totalAccounts =
                    activeWallet?.accounts?.filter((a) => !a.is_deleted).length || 0;

                setHasInternal(totalWallets > 1 || totalAccounts > 1);

                const results = [];

                for (const wallet of walletsData) {
                    if (wallet?.is_deleted) continue;

                    for (const account of wallet.accounts || []) {
                        if (account?.is_deleted) continue;

                        if (
                            wallet.id === activeWallet?.id &&
                            account.id === activeAccount?.id
                        ) {
                            continue;
                        }

                        const derived = await generateAllCoinsAddress(
                            wallet.passPhrase,
                            coinData,
                            account.account_index || 0
                        );

                        if (!derived?.address) continue;

                        let balance = 0;

                        try {
                            const res = await fetchBalanceForAllCoins({
                                shortName: coinData.shortName,
                                fullName: coinData.fullName,
                                address: derived.address,

                                rpcUrl: coinData.rpcUrl,
                                tokenAddress: coinData.tokenAddress,
                                contractAddress: coinData.contractAddress,
                                isToken: coinData.is_token,
                            });

                            balance = Number(res?.balance || 0);
                        } catch (err) {
                            console.log("balance fetch error", err);
                        }

                        results.push({
                            walletId: wallet.id,
                            walletName: wallet.wallet_name,

                            accountId: account.id,
                            accountName:
                                account.acc_name ||
                                `Account ${(account.account_index || 0) + 1}`,

                            address: derived.address,
                            privateKey: derived.privateKey,

                            balance,
                            hasBalance: balance > 0,
                        });
                    }
                }

                const unique = Array.from(
                    new Map(results.map((i) => [i.address, i])).values()
                );

                setAddresses(unique);
            } catch (err) {
                console.log("internal address error", err);
            } finally {
                setLoading(false);
            }
        };

        build();
    }, [coinData, walletsData]);

    return {
        internalAddresses: addresses,
        hasInternalTransfer: hasInternal,
        loading,
    };
};