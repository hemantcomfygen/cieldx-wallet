import { decryptData, encryptData } from "./encryptionFunction.js";
import { generateRandomID } from "./GlobalFunction.js";
import { getAllFromIndexDB, getFromIndexDB, saveToIndexDB } from "./indexDB.js";

const createTransactionSchema = (tx) => {
    return {
        id: generateRandomID(),

        hash: tx?.hash || null,
        from: tx?.from || null,
        to: tx?.to || null,
        amount: tx?.amount || 0,
        isSent: tx?.isSent || false,

        coinId: tx?.coinId || null,
        fullName: tx?.fullName || null,

        isToken: tx?.isToken || false,
        tokenAddress: tx?.tokenAddress || null,
        type: tx?.type || null,

        gasUsed: tx?.gasUsed || null,
        gasPrice: tx?.gasPrice || null,
        fee: tx?.fee || null,

        status: tx?.status || "pending",
        confirmations: tx?.confirmations || 0,
    };
};


export const saveTransactionsToDB = async (transaction) => {
    try {
        const existingData = await getTransactionsFromDB();
        const transactions = existingData || [];

        if (transaction?.hash) {
            const exists = transactions.find(tx => tx.hash === transaction.hash);
            if (exists) return true;
        }

        const newTransaction = createTransactionSchema(transaction);

        const updatedTransactions = [newTransaction, ...transactions];

        const payload = {
            id: "transactions_list",
            data: encryptData(updatedTransactions),
        };

        await saveToIndexDB("transactions", payload);

        return true;

    } catch (error) {
        console.error("Error saving transactions", error);
        return false;
    }
};

export const getTransactionsFromDB = async () => {
    try {
        const res = await getAllFromIndexDB("transactions");

        const storedData = res?.[0]?.data;

        if (!storedData) return [];

        const decrypted = await decryptData(storedData);

        return decrypted || [];

    } catch (error) {
        console.error("Error getting transactions", error);
        return [];
    }
};

export const getTransactionByIdFromDB = async (id) => {
    try {
        const transactions = await getTransactionsFromDB();

        return transactions.find(tx => tx.coinId === id) || null;

    } catch (error) {
        console.error("Error finding transaction", error);
        return null;
    }
};

export const getTransactionsByCoinIdFromDB = async (coinId) => {
    try {
        const transactions = await getTransactionsFromDB();

        if (!transactions || !Array.isArray(transactions)) return [];

        const filtered = transactions.filter(
            (tx) => tx.coinId === coinId
        );

        return filtered;

    } catch (error) {
        console.error("Error finding transactions by coinId", error);
        return [];
    }
};

export const updateTransactionInDB = async (txId, updates) => {
    try {
        const transactions = await getTransactionsFromDB();

        const updatedTransactions = transactions.map(tx => {
            if (tx.id === txId || tx.hash === txId) {
                return { ...tx, ...updates };
            }
            return tx;
        });

        const payload = {
            id: "transactions_list",
            data: encryptData(updatedTransactions),
        };

        await saveToIndexDB("transactions", payload);

        return true;

    } catch (error) {
        console.error("Update transaction failed:", error);
        return false;
    }
};


export const deleteTransactionFromDB = async (txId) => {
    try {
        const transactions = await getTransactionsFromDB();

        const updatedTransactions = transactions.filter(
            tx => tx.id !== txId && tx.hash !== txId
        );

        const payload = {
            id: "transactions_list",
            data: encryptData(updatedTransactions),
        };

        await saveToIndexDB("transactions", payload);

        return true;

    } catch (error) {
        console.error("Delete transaction failed:", error);
        return false;
    }
};