// import * as bitcoin from "bitcoinjs-lib";
// import axios from "axios";
// import { quickNode, quickNodeMainNet, UTXO_API } from "../../../utils/config.js"
// import { ECPairFactory } from "ecpair";
// import * as ecc from "tiny-secp256k1";
// import { Buffer } from "buffer"


// const ECPair = ECPairFactory(ecc);


// const rpcNode = UTXO_API.BTC;

// const toSatoshi = (btc) => Math.floor(btc * 1e8);

// export const getUtxos = async (address, rpcNode) => {
//     try {
//         const url = `${rpcNode}${address}?unspentOnly=true`;

//         const response = await axios.get(url);

//         return response.data.txrefs || [];
//     } catch (error) {
//         console.error("❌ fetch utxo of btc", error.message);
//         return [];
//     }
// };


// export const sendBTC = async ({
//     fromAddress,
//     toAddress,
//     amountBtc,
//     privateKey,
//     rpcNode = UTXO_API.BTC,
//     feeRate = 10
// }) => {
//     try {
//         const NETWORK = bitcoin.networks.bitcoin;
//         // const wif = ECPair.fromWIF(privateKey, NETWORK);
//         const keyPair = ECPair.fromWIF(privateKey, NETWORK);

//         const pubkey = keyPair.publicKey;
//         const { address, output } = bitcoin.payments.p2wpkh({
//             pubkey,
//             network: NETWORK,
//         });

//         const amount = BigInt(toSatoshi(amountBtc));
//         const utxos = await getUtxos(fromAddress, rpcNode.baseUrl);

//         if (!utxos.length) throw new Error("No utxos found");

//         let selected = [];
//         let total = 0n;

//         for (const utxo of utxos) {
//             if (utxo.value < 546) continue;

//             selected.push(utxo);
//             total += BigInt(utxo.value);

//             if (total >= amount) break;
//         }

//         if (total < amount) throw new Error("Insufficient balance");

//         const inputCount = selected.length;
//         const outputCount = 2;

//         const txSize = inputCount * 68 + outputCount * 31 + 10;
//         const fee = BigInt(txSize * feeRate);

//         const change = total - amount - fee;

//         if (change < 0n) throw new Error("Insufficient balance for fee");

//         const psbt = new bitcoin.Psbt({ network: NETWORK });

//         for (const utxo of selected) {
//             psbt.addInput({
//                 hash: utxo.tx_hash,
//                 index: utxo.tx_output_n,
//                 witnessUtxo: {
//                     script: output,
//                     value: BigInt(utxo.value),
//                 },
//             });

//             total += BigInt(utxo.value);
//             if (total >= amount) break;
//         }

//         psbt.addOutput({
//             address: toAddress,
//             value: BigInt(amount),
//         });

//         if (change > 546n) {
//             psbt.addOutput({
//                 address: fromAddress,
//                 value: BigInt(change),
//             });
//         }

//         psbt.signAllInputs(keyPair);
//         psbt.finalizeAllInputs();

//         const rawTx = psbt.extractTransaction().toHex();

//         console.log("rawTx", rawTx)

//         const { data } = await axios.post(
//             rpcNode.txnUrl,
//             { tx: rawTx }
//         );

//         return {
//             success: true,
//             txid: data.tx.hash,
//             from: fromAddress,
//             to: toAddress,
//             amount: amountBtc,
//             fee: Number(fee) / 1e8,
//             status: "pending",
//         };

//     } catch (error) {
//         console.log("❌ error in send btc", error);
//         return { success: false, error: error.message };
//     }
// };

// // const payload = {
// //     fromAddress: "bc1qcs640zf6kdsuh807mujdkrfrspmg9fne09p4j8",
// //     toAddress: "bc1qn0te6kp25zt94y0vr20vfgpymdazvmmm3492td",
// //     amount: 0.000001,
// //     privateKey: "KwxkN2nCBxaiTDyrPB7zTm7rBd3PTsbEYW9x8q7vigcux1gXUjSs",
// //     rpcNode: UTXO_API.BTC
// // }

// // const res = await sendBTC(payload);
// // console.log("res", res)





import * as bitcoin from "bitcoinjs-lib";
import axios from "axios";
import { ECPairFactory } from "ecpair";
import * as ecc from "tiny-secp256k1";
import { Buffer } from "buffer";

const ECPair = ECPairFactory(ecc);

const MEMPOOL_API = "https://mempool.space/api";
const DUST_LIMIT = 546n;

const toSatoshi = (btc) => Math.floor(btc * 1e8);

// -----------------------------
// Get UTXOs
// -----------------------------
export const getUtxos = async (address) => {
    try {
        const { data } = await axios.get(
            `${MEMPOOL_API}/address/${address}/utxo`
        );
        return data;
    } catch (err) {
        console.error("❌ UTXO fetch error:", err.message);
        return [];
    }
};

// -----------------------------
// Get dynamic fee
// -----------------------------
const getFeeRate = async () => {
    const { data } = await axios.get(
        `${MEMPOOL_API}/v1/fees/recommended`
    );
    return data.fastestFee; // sat/vbyte
};

// -----------------------------
// SEND BTC
// -----------------------------
export const sendBTC = async ({
    fromAddress,
    toAddress,
    amountBtc,
    privateKey,
    fees = 30
}) => {
    try {
        const NETWORK = bitcoin.networks.bitcoin;
        const keyPair = ECPair.fromWIF(privateKey, NETWORK);


        console.log("fromAddress", fromAddress)
        const payment = bitcoin.payments.p2wpkh({
            address: fromAddress,
            network: NETWORK,
        });

        console.log("payment", payment)

        if (!payment.output) {
            throw new Error("Invalid sender address");
        }

        const amount = BigInt(toSatoshi(amountBtc));

        // 🚨 Prevent dust send
        if (amount < DUST_LIMIT) {
            throw new Error("Amount too small (dust). Minimum ~546 sats");
        }

        const utxos = await getUtxos(fromAddress);
        if (!utxos.length) throw new Error("No UTXOs found");

        // -----------------------------
        // Select UTXOs
        // -----------------------------
        let selected = [];
        let total = 0n;

        for (const utxo of utxos) {
            if (utxo.value < Number(DUST_LIMIT)) continue;

            selected.push(utxo);
            total += BigInt(utxo.value);

            if (total >= amount) break;
        }

        if (total < amount) {
            throw new Error("Insufficient balance");
        }

        // -----------------------------
        // Dynamic Fee
        // -----------------------------
        const feeRate = fees || await getFeeRate();

        const inputCount = selected.length;
        const outputCount = 2;

        const estimatedSize = inputCount * 68 + outputCount * 31 + 10;
        const fee = BigInt(Math.ceil((estimatedSize + 20) * feeRate));

        let change = total - amount - fee;

        if (change < 0n) {
            throw new Error("Insufficient balance for fee");
        }

        // 🚨 Prevent dust change
        if (change > 0n && change < DUST_LIMIT) {
            console.log("⚠️ Change is dust, adding to fee");
            change = 0n;
        }

        // -----------------------------
        // Build TX
        // -----------------------------
        const psbt = new bitcoin.Psbt({ network: NETWORK });

        selected.forEach((utxo) => {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: payment.output,
                    value: BigInt(utxo.value),
                },
                sequence: 0xfffffffd, // ✅ Enable RBF
            });
        });

        // Receiver
        psbt.addOutput({
            address: toAddress,
            value: amount,
        });

        // Change (only if valid)
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

        const tx = psbt.extractTransaction();
        const rawTx = tx.toHex();
        const txid = tx.getId();

        console.log("✅ TXID:", txid);

        // -----------------------------
        // Broadcast
        // -----------------------------
        await axios.post(`${MEMPOOL_API}/tx`, rawTx, {
            headers: { "Content-Type": "text/plain" },
        });

        return {
            success: true,
            hash: txid,
            from: fromAddress,
            to: toAddress,
            amount: amountBtc,
            fee: Number(fee) / 1e8,
            status: "success",
        };
    } catch (error) {
        console.error("❌ sendBTC error:", error.response?.data || error.message);

        return {
            success: false,
            error: error.response?.data || error.message,
        };
    }
};