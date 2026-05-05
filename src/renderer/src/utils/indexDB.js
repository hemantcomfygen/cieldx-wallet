import { DB_NAME, VERSION } from "./config.js";
import { decryptData } from "./encryptionFunction.js";


const STORES = ["wallets", "coins", "transactions", "activities"];

let dbInstance = null;

export const openDB = () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);

        const request = indexedDB.open(DB_NAME, VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            STORES.forEach((store) => {
                if (!db.objectStoreNames.contains(store)) {
                    db.createObjectStore(store, { keyPath: "id" });
                }
            });
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };
        request.onerror = () => reject("DB error");
    });
};


export const closeDB = () => {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
};

export const saveToIndexDB = async (collectionName, data) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(collectionName, "readwrite");
        const store = tx.objectStore(collectionName);

        const request = store.put(data);

        request.onsuccess = () => resolve(data);
        request.onerror = () => reject("Save failed");

        tx.onerror = () => reject("Transaction failed");
    });
};


export const getFromIndexDB = async (collectionName, id) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(collectionName, "readonly");
        const store = tx.objectStore(collectionName);

        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject("Fetch failed");
    });
};

export const getAllFromIndexDB = async (collectionName) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(collectionName, "readonly");
        const store = tx.objectStore(collectionName);

        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject("Fetch all failed");
    });
};

export const deleteFromIndexDB = async (collectionName, id) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(collectionName, "readwrite");
        const store = tx.objectStore(collectionName);

        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject("Delete failed");
    });
};

export const deleteEntireDB = async () => {
    return new Promise((resolve, reject) => {
        closeDB();

        const timeout = setTimeout(() => {
            console.warn("Database deletion timed out — proceeding anyway");
            resolve(true);
        }, 2000);

        const request = indexedDB.deleteDatabase(DB_NAME);

        request.onsuccess = () => {
            clearTimeout(timeout);
            console.log("Database deleted successfully");
            resolve(true);
        };

        request.onerror = () => {
            clearTimeout(timeout);
            console.error("Error deleting database");
            reject(false);
        };

        request.onblocked = () => {
            console.warn("Still blocked — make sure no other tabs are open");
            // We don't resolve here, but the timeout will catch it
        };
    });
};