import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from 'ecpair';
import * as ecc from "tiny-secp256k1";
import { Buffer } from "buffer";

export const buildBTCTransaction = async ({
  utxos,
  toAddress,
  amount,
  privateKey,
  memo, // optional
}) => {
  const net = bitcoin.networks.bitcoin;
  const ECPair = ECPairFactory(ecc);
  const keyPair = ECPair.fromWIF(privateKey, net);

  const psbt = new bitcoin.Psbt({ network: net });

  // ✅ derive correct address
  const pubkey = keyPair.publicKey;
  const { address, output } = bitcoin.payments.p2wpkh({
    pubkey,
    network: net,
  });

  let total = 0;

  // ================================
  // INPUTS
  // ================================
  for (const utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: output, // ✅ correct script
        value: BigInt(utxo.value),
      },
    });

    total += utxo.value;
    if (total >= amount) break;
  }

  // ================================
  // OUTPUT → DEPOSIT
  // ================================
  psbt.addOutput({
    address: toAddress,
    value: BigInt(amount), // ✅ FIX
  });

  // ================================
  // OP_RETURN (MEMO) - OPTIONAL
  // ================================
  if (memo) {
    const embed = bitcoin.payments.embed({
      data: [Buffer.from(memo)],
    });

    psbt.addOutput({
      script: embed.output,
      value: 0n, // ✅ must be bigint
    });
  }

  // ================================
  // CHANGE
  // ================================
  const fee = 1000; // improve later
  const change = total - amount - fee;

  if (change > 546) {
    psbt.addOutput({
      address, // ✅ FIX (correct address)
      value: BigInt(change),
    });
  }

  // ================================
  // SIGN
  // ================================
  psbt.signAllInputs(keyPair); // ✅ REQUIRED

  psbt.finalizeAllInputs();

  const txHex = psbt.extractTransaction().toHex();

  return txHex;
};

export const broadcastBTC = async (txHex) => {
  const res = await axios.post(
    "https://blockstream.info/api/tx",
    txHex
  );

  return res.data; // txid
};