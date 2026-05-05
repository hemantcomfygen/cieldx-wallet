import * as bitcoin from "bitcoinjs-lib";
import axios from "axios";
import { ECPairFactory } from "ecpair";
import * as ecc from "tiny-secp256k1";
import { UTXO_API } from "../../../utils/config.js";
import { Buffer } from "buffer";

const ECPair = ECPairFactory(ecc);

// -----------------------------
// Dogecoin Network Config
// -----------------------------
const DOGE = {
    messagePrefix: "\x19Dogecoin Signed Message:\n",
    bech32: "",
    bip32: {
        public: 0x02facafd,
        private: 0x02fac398,
    },
    pubKeyHash: 0x1e, // D address
    scriptHash: 0x16,
    wif: 0x9e,
};

const DOGE_API = UTXO_API.DOGE;
const DUST_LIMIT = 100000000n; // 1 DOGE (safe)

// convert DOGE → satoshi
const toSatoshi = (doge) => Math.floor(doge * 1e8);

// -----------------------------
// Get UTXOs
// -----------------------------
export const getDogeUtxos = async (address) => {
    try {
        const { data } = await axios.get(
            `${DOGE_API.baseUrl}${address}?unspentOnly=true`
        );
        return data.txrefs || [];
    } catch (err) {
        console.error("❌ DOGE UTXO error:", err.message);
        return [];
    }
};

export const getDogeRawTx = async (txid) => {
    try {
        const { data } = await axios.get(
            `${DOGE_API.transactionUrl}${txid}?includeHex=true`
        );
        return data.hex;
    } catch (err) {
        console.error("❌ DOGE Raw TX error:", err.message);
        throw err;
    }
};

// -----------------------------
// SEND DOGE
// -----------------------------
export const sendDogeCoin = async ({
    fromAddress,
    toAddress,
    amountBtc,
    privateKey,
}) => {
    try {
        const NETWORK = DOGE;
        let keyPair;
        try {
            keyPair = ECPair.fromWIF(privateKey, NETWORK);
        } catch (e) {
            // If the WIF was generated with the Bitcoin network version, parse and convert it
            const fallbackPair = ECPair.fromWIF(privateKey);
            keyPair = ECPair.fromPrivateKey(fallbackPair.privateKey, { network: NETWORK });
        }
        const payment = bitcoin.payments.p2pkh({
            address: fromAddress,
            network: NETWORK,
        });

        const amount = BigInt(toSatoshi(amountBtc));

        if (amount < DUST_LIMIT) {
            throw new Error("Amount too small (min ~1 DOGE)");
        }

        const utxos = await getDogeUtxos(fromAddress);
        if (!utxos.length) throw new Error("No UTXOs found");

        // -----------------------------
        // Select UTXOs
        // -----------------------------
        let selected = [];
        let total = 0n;

        for (const utxo of utxos) {
            const value = BigInt(utxo.value); // Already in satoshis from Blockcypher

            selected.push({
                txid: utxo.tx_hash,
                vout: utxo.tx_output_n,
                value,
            });

            total += value;

            if (total >= amount) break;
        }

        if (total < amount) {
            throw new Error("Insufficient balance");
        }


        const fee = 100000000n; // 1 DOGE flat fee

        let change = total - amount - fee;

        if (change < 0n) {
            throw new Error("Insufficient balance for fee");
        }

        if (change > 0n && change < DUST_LIMIT) {
            change = 0n;
        }

        // -----------------------------
        // Build TX
        // -----------------------------
        const psbt = new bitcoin.Psbt({ network: NETWORK });

        for (const utxo of selected) {
            const rawHex = await getDogeRawTx(utxo.txid);
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(rawHex, 'hex'),
            });
        }

        psbt.addOutput({
            address: toAddress,
            value: amount,
        });

        if (change >= DUST_LIMIT) {
            psbt.addOutput({
                address: fromAddress,
                value: change,
            });
        }

        // -----------------------------
        // Sign
        // -----------------------------
        psbt.signAllInputs(keyPair);
        psbt.finalizeAllInputs();

        // Pass 'true' to disable the maximum fee rate check,
        // because Dogecoin's 1 DOGE fee is high in sats/byte compared to BTC
        const tx = psbt.extractTransaction(true);
        const rawTx = tx.toHex();
        const txid = tx.getId();

        // -----------------------------
        // Broadcast
        // -----------------------------
        await axios.post(
            DOGE_API.txnUrl,
            { tx: rawTx }
        );

        return {
            success: true,
            hash: txid,
            amount: amountBtc,
            fee: Number(fee) / 1e8,
            status: "success",
        };
    } catch (error) {
        console.error("❌ sendDoge error:", error.response?.data || error.message);

        return {
            success: false,
            error: error.response?.data || error.message,
        };
    }
};