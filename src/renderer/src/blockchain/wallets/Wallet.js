import * as bip39 from "bip39";
import { getFromIndexDB, saveToIndexDB } from "../../utils/indexDB.js";
import { generateRandomID, generateWalletName, getUniqueTimestamp } from "../../utils/GlobalFunction.js";
import { decryptData, encryptData } from "../../utils/encryptionFunction.js";
import { USER_ID } from "../../utils/config.js";
import { getCoinsFromDB } from "../../utils/coins.js";
import { generateAllCoinsAddress, fetchBalanceForAllCoins } from "../../utils/blockChianFunctions/dynamicFetcher.js";

export const generateMnemonic = (words = 12) => {
    const strengthMap = {
        12: 128,
        15: 160,
        18: 192,
        21: 224,
        24: 256,
    };

    const strength = strengthMap[words];

    if (!strength) throw new Error("Invalid word length");

    let mnemonic = bip39.generateMnemonic(strength);

    return mnemonic;
};

const createAccount = (index = 0) => ({
    id: generateRandomID(),
    acc_name: `Account ${index + 1}`,
    account_index: index,
    is_active: false,
    is_deleted: false,
    createdAt: getUniqueTimestamp(),
});

const checkAndAddAccountsInBackground = async (mnemonic, walletId) => {
    let coinsToCheck = [];
    try {
        const coinsRes = await getCoinsFromDB();
        if (coinsRes) {
            const allCoins = [...(coinsRes.default_coins || []), ...(coinsRes.custom_imported_coins || [])];
            coinsToCheck = allCoins.filter(c => !c.isDisable && !c.is_token);
        }
    } catch (err) {
        console.error("fetch coins err", err);
    }

    if (coinsToCheck.length === 0) return;

    for (let i = 1; i < 5; i++) {
        let hasBalance = false;

        for (const coin of coinsToCheck) {
            try {
                const derived = await generateAllCoinsAddress(mnemonic, coin, i);
                if (derived?.address) {
                    const balanceObj = await fetchBalanceForAllCoins({
                        ...coin,
                        address: derived.address
                    });
                    if (Number(balanceObj?.balance) > 0) {
                        hasBalance = true;
                        break;
                    }
                }
            } catch (e) {
                console.error("Balance fetch error during import:", e);
            }
        }

        if (hasBalance) {
            try {
                const userData = await getFromIndexDB("wallets", USER_ID);
                if (userData && userData.data) {
                    const decrypted = decryptData(userData.data);
                    const wallets = decrypted.wallets || [];
                    const walletIndex = wallets.findIndex(w => w.id === walletId);
                    if (walletIndex !== -1) {
                        const newAccount = createAccount(i);
                        newAccount.is_active = false;

                        const exists = wallets[walletIndex].accounts.find(a => a.account_index === i);
                        if (!exists) {
                            const targetWallet = wallets[walletIndex];

                            targetWallet.accounts = [
                                ...(targetWallet.accounts || []),
                                newAccount
                            ];

                            decrypted.wallets = wallets;

                            const encryptedData = encryptData(decrypted);
                            await saveToIndexDB("wallets", { id: USER_ID, data: encryptedData });
                            emitWalletsUpdated();
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to add background account", err);
            }
        }
    }
};

const normalizeWalletAccounts = (wallet) => {
    const hasAccounts = Array.isArray(wallet?.accounts) && wallet.accounts.length > 0;

    if (hasAccounts) {
        const accounts = wallet.accounts.map((acc, idx) => ({
            id: acc?.id || generateRandomID(),
            acc_name: acc?.acc_name || `Account ${idx + 1}`,
            account_index: Number.isInteger(acc?.account_index) ? acc.account_index : idx,
            is_active: !!acc?.is_active,
            is_deleted: !!acc?.is_deleted,
            createdAt: acc?.createdAt || getUniqueTimestamp(),
        }));

        const activeAccount =
            accounts.find((acc) => acc.id === wallet?.active_account_id && !acc.is_deleted)
            || accounts.find((acc) => acc.is_active && !acc.is_deleted)
            || accounts.find((acc) => !acc.is_deleted)
            || accounts[0];

        return {
            ...wallet,
            accounts: accounts.map((acc) => ({ ...acc, is_active: acc.id === activeAccount?.id })),
            active_account_id: activeAccount?.id || accounts[0]?.id || null,
        };
    }

    const defaultAccount = createAccount(0);
    return {
        ...wallet,
        accounts: [defaultAccount],
        active_account_id: defaultAccount.id,
    };
};

export const normalizeUserWallets = (decrypted) => {
    const wallets = (decrypted?.wallets || []).map(normalizeWalletAccounts);
    return { ...decrypted, wallets };
};

const emitWalletsUpdated = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("wallets-updated"));
    }
};

export const generateWallet = async (password, word = 12, importedPassphrase) => {
    try {
        const mnemonic = generateMnemonic(word);

        let userData;
        try {
            userData = await getFromIndexDB("wallets", USER_ID);
        } catch (error) {
            userData = null;
        }

        if (!userData) {
            const walletName = generateWalletName([]);

            const walletId = generateRandomID();

            const walletData = {
                id: walletId,
                wallet_name: walletName,
                passPhrase: importedPassphrase || mnemonic,
                is_disable: false,
                is_active: true,
                is_deleted: false,
                is_backup: false,
                createdAt: getUniqueTimestamp(),
                accounts: [],
                active_account_id: null,
            };
            const walletWithAccount = normalizeWalletAccounts(walletData);

            const newUser = {
                user_id: USER_ID,
                password,
                wallets: [walletWithAccount],
                createdAt: getUniqueTimestamp(),
            };

            const encryptedData = encryptData(newUser);

            await saveToIndexDB("wallets", {
                id: USER_ID,
                data: encryptedData,
            });
            emitWalletsUpdated();

            if (importedPassphrase) {
                checkAndAddAccountsInBackground(importedPassphrase, walletId);
            }

            return { type: "created", userId: newUser?.user_id, wallet: walletWithAccount };

        } else {

            let decrypted;
            try {
                decrypted = decryptData(userData.data);
            } catch (decryptError) {
                console.error("Decryption error:", decryptError);
                throw new Error("Failed to access existing wallet data");
            }

            const normalized = normalizeUserWallets(decrypted);

            const wallets = (normalized.wallets || []).map(w => ({
                ...w,
                is_active: false,
                accounts: (w.accounts || []).map(acc => ({ ...acc, is_active: false }))
            }));

            const walletId = generateRandomID();

            const walletData = {
                id: walletId,
                wallet_name: generateWalletName(wallets),
                passPhrase: importedPassphrase || mnemonic,
                is_disable: false,
                is_active: true,
                is_deleted: false,
                is_backup: false,
                createdAt: getUniqueTimestamp(),
                accounts: [],
                active_account_id: null,
            };
            const walletWithAccount = normalizeWalletAccounts(walletData);

            wallets.push(walletWithAccount);

            normalized.wallets = wallets;

            const encryptedData = encryptData(normalized);

            try {
                await saveToIndexDB("wallets", {
                    id: USER_ID,
                    data: encryptedData,
                });
                emitWalletsUpdated();
            } catch (saveError) {
                console.error("Failed to update wallet:", saveError);
                throw new Error("Failed to update wallet in database");
            }

            if (importedPassphrase) {
                checkAndAddAccountsInBackground(importedPassphrase, walletId);
            }

            return { type: "added", userId: USER_ID, wallet: walletWithAccount };
        }

    } catch (error) {
        console.error("REAL ERROR:", error);
        throw error;
    }
};

export const multiImportWallets = async (mnemonics) => {
    try {
        let userData;
        try {
            userData = await getFromIndexDB("wallets", USER_ID);
        } catch (error) {
            userData = null;
        }

        if (!userData) {
            throw new Error("No user found. Please create a wallet first.");
        }

        let decrypted;
        try {
            decrypted = decryptData(userData.data);
        } catch (decryptError) {
            console.error("Decryption error:", decryptError);
            throw new Error("Failed to access existing wallet data");
        }

        const normalized = normalizeUserWallets(decrypted);
        const existingWallets = (normalized.wallets || []).map(w => ({
            ...w,
            is_active: false,
            accounts: (w.accounts || []).map(acc => ({ ...acc, is_active: false }))
        }));

        const newWallets = [];
        const invalidMnemonics = [];

        mnemonics.forEach((mnemonic, index) => {
            const trimmedMnemonic = mnemonic.trim().toLowerCase();
            if (!bip39.validateMnemonic(trimmedMnemonic)) {
                invalidMnemonics.push({
                    row: index + 1,
                    passPhrases: [trimmedMnemonic],
                    error: "Invalid mnemonic"
                });
                return;
            }

            const walletData = {
                id: generateRandomID(),
                wallet_name: generateWalletName([...existingWallets, ...newWallets]),
                passPhrase: trimmedMnemonic,
                is_disable: false,
                is_active: false,
                is_deleted: false,
                is_backup: false,
                createdAt: getUniqueTimestamp(),
                accounts: [],
                active_account_id: null,
            };
            const walletWithAccount = normalizeWalletAccounts(walletData);
            newWallets.push(walletWithAccount);
        });

        if (newWallets.length > 0) {
            const allWallets = [...existingWallets, ...newWallets];

            const finalWallets = allWallets.map((w, idx) => {
                const isLast = idx === allWallets.length - 1;
                return {
                    ...w,
                    is_active: isLast,
                    accounts: (w.accounts || []).map((acc, accIdx) => ({
                        ...acc,
                        is_active: isLast && accIdx === 0
                    })),
                    active_account_id: isLast ? (w.accounts[0]?.id || w.active_account_id) : w.active_account_id
                };
            });

            normalized.wallets = finalWallets;

            const encryptedData = encryptData(normalized);
            await saveToIndexDB("wallets", {
                id: USER_ID,
                data: encryptedData,
            });
            emitWalletsUpdated();
        }

        return {
            importedCount: newWallets.length,
            invalidMnemonics
        };

    } catch (error) {
        console.error("Multi import error:", error);
        throw error;
    }
};


export const updateWallet = async (walletId, updates) => {
    const userData = await getFromIndexDB("wallets", USER_ID);

    const decrypted = normalizeUserWallets(decryptData(userData.data));

    const wallets = decrypted.wallets || [];

    const index = wallets.findIndex(w => w.id === walletId);

    if (index === -1) throw new Error("Wallet not found");

    wallets[index] = normalizeWalletAccounts({
        ...wallets[index],
        ...updates,
    });

    decrypted.wallets = wallets;

    const encryptedData = encryptData(decrypted);

    await saveToIndexDB("wallets", {
        id: USER_ID,
        data: encryptedData,
    });
    emitWalletsUpdated();

    return wallets[index];
};


export const setActiveWallet = async (walletId) => {
    try {
        const userData = await getFromIndexDB("wallets", USER_ID);

        if (!userData || !userData.data) {
            throw new Error("No wallet data found");
        }

        const decrypted = normalizeUserWallets(await decryptData(userData.data));

        const wallets = decrypted.wallets || [];

        const updatedWallets = wallets.map((wallet) => {
            const isTargetWallet = wallet.id === walletId;
            const accounts = (wallet.accounts || []).map((acc, index) => ({
                ...acc,
                is_active: isTargetWallet ? index === 0 : false,
            }));
            const firstActive = accounts.find((acc) => acc.is_active);

            return {
                ...wallet,
                is_active: isTargetWallet,
                accounts,
                active_account_id: isTargetWallet ? (firstActive?.id || wallet.active_account_id || null) : null,
            };
        });

        const updatedData = {
            ...decrypted,
            wallets: updatedWallets,
        };

        const encryptedData = encryptData(updatedData);

        await saveToIndexDB("wallets", {
            id: USER_ID,
            data: encryptedData,
        });
        emitWalletsUpdated();

        return true;

    } catch (error) {
        console.error("Set active wallet failed:", error);
        throw error;
    }
};

export const deleteWalletFromDB = async (walletId) => {
    try {
        const userData = await getFromIndexDB("wallets", USER_ID);

        if (!userData || !userData.data) {
            throw new Error("No wallet data found");
        }

        const decrypted = normalizeUserWallets(await decryptData(userData.data));

        const wallets = decrypted.wallets || [];

        const walletToDelete = wallets.find(w => w.id === walletId);

        if (!walletToDelete) {
            throw new Error("Wallet not found");
        }

        let updatedWallets = wallets.filter(w => w.id !== walletId);

        if (updatedWallets.length === 0) {
            const updatedData = {
                ...decrypted,
                wallets: []
            };

            const encryptedData = encryptData(updatedData);

            await saveToIndexDB("wallets", {
                id: USER_ID,
                data: encryptedData,
            });
            emitWalletsUpdated();

            return {
                success: true,
                isLastWalletDeleted: true
            };
        }

        let activeAssigned = false;

        updatedWallets = updatedWallets.map((wallet, index) => {
            let isActive = wallet.is_active;

            if (walletToDelete.is_active) {
                isActive = index === updatedWallets.length - 1;
            } else {
                if (isActive && !activeAssigned) {
                    activeAssigned = true;
                } else {
                    isActive = false;
                }
            }

            const firstAccount = (wallet.accounts || []).find(acc => !acc.is_deleted);

            return {
                ...wallet,
                is_active: isActive,
                active_account_id: isActive ? firstAccount?.id || null : null,
                accounts: (wallet.accounts || []).map((acc) => ({
                    ...acc,
                    is_active: isActive && !acc.is_deleted && acc.id === firstAccount?.id
                }))
            };
        });

        if (!updatedWallets.some(w => w.is_active)) {
            const firstWallet = updatedWallets[0];
            const firstAccount = (firstWallet.accounts || []).find(acc => !acc.is_deleted);

            firstWallet.is_active = true;
            firstWallet.active_account_id = firstAccount?.id || null;

            firstWallet.accounts = (firstWallet.accounts || []).map(acc => ({
                ...acc,
                is_active: acc.id === firstAccount?.id
            }));
        }

        const updatedData = {
            ...decrypted,
            wallets: updatedWallets
        };

        const encryptedData = encryptData(updatedData);

        await saveToIndexDB("wallets", {
            id: USER_ID,
            data: encryptedData,
        });
        emitWalletsUpdated();

        return {
            success: true,
            isLastWalletDeleted: false
        };

    } catch (error) {
        console.error("Delete wallet failed:", error);
        throw error;
    }
};


export const getWalletById = async (walletId) => {
    try {
        const userData = await getFromIndexDB("wallets", USER_ID);

        if (!userData || !userData.data) {
            throw new Error("No wallet data found");
        }

        const decrypted = normalizeUserWallets(decryptData(userData.data));

        const wallets = decrypted.wallets || [];

        const wallet = wallets.find(w => w.id === walletId);

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        return wallet;

    } catch (error) {
        console.error("Get wallet by ID failed:", error);
        throw error;
    }
};


export const addDerivedAccount = async (walletId, accountName) => {
    const userData = await getFromIndexDB("wallets", USER_ID);
    if (!userData?.data) throw new Error("No wallet data found");

    const decrypted = normalizeUserWallets(decryptData(userData.data));
    const wallets = decrypted.wallets || [];
    const walletIndex = wallets.findIndex((w) => w.id === walletId);
    if (walletIndex === -1) throw new Error("Wallet not found");

    const wallet = wallets[walletIndex];
    const activeAccounts = (wallet.accounts || []).filter((acc) => !acc.is_deleted);
    const nextIndex = activeAccounts.length
        ? Math.max(...activeAccounts.map((acc) => acc.account_index || 0)) + 1
        : 0;
    const newAccount = createAccount(nextIndex);
    if (typeof accountName === "string" && accountName.trim()) {
        newAccount.acc_name = accountName.trim();
    }

    // Deactivate all accounts in this wallet
    wallet.accounts = (wallet.accounts || []).map((acc) => ({
        ...acc,
        is_active: false
    }));

    // Add the new account as active
    wallet.accounts.push({ ...newAccount, is_active: true });
    wallet.active_account_id = newAccount.id;
    wallet.is_active = true; // Make sure the wallet itself is active

    // Deactivate all other wallets
    decrypted.wallets = wallets.map((w, idx) => {
        if (idx === walletIndex) {
            return wallet;
        }
        // Deactivate other wallets and their accounts
        return {
            ...w,
            is_active: false,
            active_account_id: null,
            accounts: (w.accounts || []).map((acc) => ({
                ...acc,
                is_active: false
            }))
        };
    });

    const encryptedData = encryptData(decrypted);
    await saveToIndexDB("wallets", { id: USER_ID, data: encryptedData });
    emitWalletsUpdated();

    return newAccount;
};

export const setActiveAccount = async (walletId, accountId) => {
    const userData = await getFromIndexDB("wallets", USER_ID);
    if (!userData?.data) throw new Error("No wallet data found");

    const decrypted = normalizeUserWallets(decryptData(userData.data));
    const wallets = decrypted.wallets || [];
    const walletIndex = wallets.findIndex((w) => w.id === walletId);
    if (walletIndex === -1) throw new Error("Wallet not found");

    const wallet = wallets[walletIndex];
    const exists = (wallet.accounts || []).some((acc) => acc.id === accountId && !acc.is_deleted);
    if (!exists) throw new Error("Account not found");

    wallet.active_account_id = accountId;
    wallet.is_active = true;
    wallet.accounts = (wallet.accounts || []).map((acc) => ({
        ...acc,
        is_active: acc.id === accountId,
    }));

    decrypted.wallets = wallets.map((item) => {
        if (item.id === walletId) return wallet;

        return {
            ...item,
            is_active: false,
            active_account_id: null,
            accounts: (item.accounts || []).map((acc) => ({
                ...acc,
                is_active: false,
            })),
        };
    });
    const encryptedData = encryptData(decrypted);
    await saveToIndexDB("wallets", { id: USER_ID, data: encryptedData });
    emitWalletsUpdated();

    return wallet.accounts.find((acc) => acc.id === accountId);
};

export const deleteDerivedAccount = async (walletId, accountId) => {
    const userData = await getFromIndexDB("wallets", USER_ID);
    if (!userData?.data) throw new Error("No wallet data found");

    const decrypted = normalizeUserWallets(decryptData(userData.data));
    const wallets = decrypted.wallets || [];
    const walletIndex = wallets.findIndex((w) => w.id === walletId);
    if (walletIndex === -1) throw new Error("Wallet not found");

    const wallet = wallets[walletIndex];
    const accounts = (wallet.accounts || []).filter((acc) => !acc.is_deleted);
    if (accounts.length <= 1) {
        return await deleteWalletFromDB(walletId);
    }

    const accountExists = accounts.some((acc) => acc.id === accountId);
    if (!accountExists) throw new Error("Account not found");

    const isDeletingActiveAccount = wallet.accounts.find((acc) => acc.id === accountId)?.is_active === true;

    const updatedAccounts = (wallet.accounts || []).map((acc) => {
        if (acc.id !== accountId) return acc;
        return { ...acc, is_deleted: true, is_active: false };
    });

    // Find the next active account (only among non-deleted accounts)
    const remainingAccounts = updatedAccounts.filter((acc) => !acc.is_deleted);
    let nextActive = null;

    if (isDeletingActiveAccount) {
        // If deleting the active account, find the first remaining account
        nextActive = remainingAccounts[0] || null;
    } else {
        // Otherwise, keep the current active account if it still exists
        const currentActive = remainingAccounts.find((acc) => acc.is_active);
        nextActive = currentActive || remainingAccounts[0] || null;
    }

    // Update accounts with proper active status
    wallet.accounts = updatedAccounts.map((acc) => ({
        ...acc,
        is_active: !acc.is_deleted && acc.id === nextActive?.id,
    }));
    wallet.active_account_id = nextActive?.id || null;

    // Only keep this wallet active if it still has accounts and was previously active
    // or if we're setting it active for the first time
    wallet.is_active = wallet.is_active && remainingAccounts.length > 0;

    decrypted.wallets = wallets.map((w, idx) => {
        if (idx === walletIndex) {
            return wallet;
        }
        // Deactivate all other wallets and their accounts
        return {
            ...w,
            is_active: false,
            active_account_id: null,
            accounts: (w.accounts || []).map((acc) => ({
                ...acc,
                is_active: false
            }))
        };
    });

    const encryptedData = encryptData(decrypted);
    await saveToIndexDB("wallets", { id: USER_ID, data: encryptedData });
    emitWalletsUpdated();

    return true;
};

export const updateUserPassword = async (oldPassword, newPassword) => {
    try {
        const userData = await getFromIndexDB("wallets", USER_ID);

        if (!userData || !userData.data) {
            throw new Error("No wallet data found");
        }

        const decrypted = decryptData(userData.data);

        if (decrypted.password !== oldPassword) {
            throw new Error("Incorrect current PIN");
        }

        const updatedData = {
            ...decrypted,
            password: newPassword,
        };

        const encryptedData = encryptData(updatedData);

        await saveToIndexDB("wallets", {
            id: USER_ID,
            data: encryptedData,
        });

        return true;
    } catch (error) {
        console.error("Update password failed:", error);
        throw error;
    }
};


export const updateUserNamePasswordForPost = async (userName, password) => {
    try {
        const userData = await getFromIndexDB("wallets", USER_ID);

        if (!userData || !userData.data) {
            throw new Error("No wallet data found");
        }

        const decrypted = decryptData(userData.data);

        const updatedData = {
            ...decrypted,
            userName: userName,
            postPassword: password
        };

        const encryptedData = encryptData(updatedData);

        await saveToIndexDB("wallets", {
            id: USER_ID,
            data: encryptedData,
        });

        return true;
    } catch (error) {
        console.error("Update password failed:", error);
        throw error;
    }
};