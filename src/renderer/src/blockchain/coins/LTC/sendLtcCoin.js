import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import axios from "axios";
import { ECPairFactory } from "ecpair";
import { generateLtcAddress } from './generateLtcAddress.js'


// -----------------------------
// Litecoin Network Config
// -----------------------------

const LITECOIN = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
};

const MEMPOOL_LTC = "https://litecoinspace.org/api";
const DUST_LIMIT = 1000n; // safer for LTC

const toSatoshi = (ltc) => {
  const num = Number(ltc);

  if (!Number.isFinite(num)) {
    throw new Error(`Invalid LTC amount: ${ltc}`);
  }

  return Math.floor(num * 1e8);
};

// -----------------------------
// Get UTXOs
// -----------------------------
export const getLtcUtxos = async (address) => {
  try {
    const { data } = await axios.get(
      `${MEMPOOL_LTC}/address/${address}/utxo`
    );
    return data;
  } catch (err) {
    console.error("❌ LTC UTXO error:", err.message);
    return [];
  }
};

export const getLtcRawTx = async (txid) => {
  try {
    const { data } = await axios.get(
      `${MEMPOOL_LTC}/tx/${txid}/hex`
    );
    return data;
  } catch (err) {
    console.error("❌ LTC Raw TX error:", err.message);
    throw err;
  }
};

// -----------------------------
// Get Fee
// -----------------------------
const getLtcFeeRate = async () => {
  const { data } = await axios.get(
    `${MEMPOOL_LTC}/v1/fees/recommended`
  );

  return Math.max(data.fastestFee, 20); // LTC lower than BTC
};

// -----------------------------
// SEND LTC
// -----------------------------
export const sendLtcCoin = async ({
  fromAddress,
  toAddress,
  amountBtc,
  privateKey,
  feeRateOverride = 20,
}) => {
  try {
    // -----------------------------
    // SEND LTC
    // -----------------------------
    bitcoin.initEccLib(ecc);

    const ECPair = ECPairFactory(ecc);

    let keyPair;
    try {
      keyPair = ECPair.fromWIF(privateKey, LITECOIN);
    } catch (e) {
      // If the WIF was generated with the Bitcoin network version, parse and convert it
      const fallbackPair = ECPair.fromWIF(privateKey);
      keyPair = ECPair.fromPrivateKey(fallbackPair.privateKey, { network: LITECOIN });
    }

    const payment = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: LITECOIN,
    });

    if (!payment.output) {
      throw new Error("Invalid LTC address");
    }

    const amount = BigInt(toSatoshi(amountBtc));

    // 🚨 Dust check
    if (amount < DUST_LIMIT) {
      throw new Error("Amount too small (dust)");
    }

    const utxos = await getLtcUtxos(fromAddress);
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
    // Fee
    // -----------------------------
    const feeRate =
      feeRateOverride || (await getLtcFeeRate());

    const inputCount = selected.length;
    const outputCount = 2;

    const estimatedSize = inputCount * 68 + outputCount * 31 + 10;
    const fee = BigInt(Math.ceil((estimatedSize + 20) * feeRate));

    let change = total - amount - fee;

    if (change < 0n) {
      throw new Error("Insufficient balance for fee");
    }

    // 🚨 Avoid dust change
    if (change > 0n && change < DUST_LIMIT) {
      change = 0n;
    }

    // -----------------------------
    // Build TX
    // -----------------------------
    const psbt = new bitcoin.Psbt({ network: LITECOIN });

    for (const utxo of selected) {
      const rawHex = await getLtcRawTx(utxo.txid);
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(rawHex, 'hex'),
        sequence: 0xfffffffd, // RBF
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

    const tx = psbt.extractTransaction();
    const rawTx = tx.toHex();
    const txid = tx.getId();

    // -----------------------------
    // Broadcast
    // -----------------------------
    await axios.post(`${MEMPOOL_LTC}/tx`, rawTx, {
      headers: { "Content-Type": "text/plain" },
    });

    return {
      success: true,
      hash: txid,
      amount: amountBtc,
      fee: Number(fee) / 1e8,
      status: "success",
    };
  } catch (error) {
    console.error("❌ sendLTC error:", error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};
