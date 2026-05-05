import axios from "axios";
// import { getBTCWallet } from "./wallet";
import { buildBTCTransaction, broadcastBTC } from "./tx";

export const getUTXOs = async (address) => {
    const res = await axios.get(
        `https://blockstream.info/api/address/${address}/utxo`
    );

    return res.data;
};

export const btcSwap = async (params) => {
    try {
        const { mnemonic, quote, fromToken, toToken, address, privateKey, slippage } = params;

        if (!mnemonic) {
            throw new Error("Mnemonic required");
        }

        // 1️⃣ Wallet
        // const { address, privateKey } = getBTCWallet(mnemonic);
        // console.log("BTC Address:", address);

        // ================================
        // 2️⃣ CALL SWAP API (IMPORTANT)
        // ================================
        const payload = {
            equipmentNo: address.slice(0, 32),
            sourceFlag: "widget",

            fromTokenAddress: fromToken.address,
            toTokenAddress: toToken.address,

            fromAddress: fromToken.swapAddress,
            toAddress: toToken.swapAddress,

            fromTokenChain: fromToken.chain,
            toTokenChain: toToken.chain,

            fromTokenAmount: quote.fromTokenAmount,
            amountOutMin: quote.amountOutMin,

            fromCoinCode: fromToken.symbol,
            toCoinCode: toToken.symbol,

            slippage: slippage,
        };

        console.log(" BTC Payload:", payload);

        const res = await axios.post(
            "https://api.bridgers.xyz/api/sswap/swap",
            payload
        );


        const result = res.data;

        if (result.resCode !== 100) {
            throw new Error(result.resMsg);
        }

        const txData = result.data.txData;
        const depositAddress = txData.toAddress;
        const memo = txData.memo;

        console.log(" TX DATA:", txData);

        // ================================
        // 3️⃣ GET BTC DEPOSIT ADDRESS
        // ================================
        // const depositAddress = txData.toAddress;

        if (!depositAddress) {
            throw new Error("No BTC deposit address received");
        }

        console.log(" Deposit Address:", depositAddress);

        // ================================
        // 4️⃣ FETCH UTXOs
        // ================================
        const utxos = await getUTXOs(address);

        console.log("UTXOs:", utxos);

        if (!utxos.length) {
            throw new Error("No BTC balance");
        }

        // ================================
        // 5️⃣ BUILD TX
        // ================================
        const txHex = await buildBTCTransaction({
            utxos,
            toAddress: depositAddress,
            amount: Number(quote.fromTokenAmount), // ensure satoshi conversion if needed
            privateKey,
            memo
        });

        console.log(" TX HEX:", txHex);

        // ================================
        // 6️⃣ BROADCAST
        // ================================
        const txid = await broadcastBTC(txHex);

        console.log(" BTC TX:", txid);

        // ================================
        // 7️⃣ ORDER UPDATE (IMPORTANT)
        // ================================
        const orderPayload = {
            equipmentNo: txid.slice(0, 32),

            sourceFlag: "widget",
            sourceType: "H5",

            hash: txid,

            fromTokenAddress: payload.fromTokenAddress,
            toTokenAddress: payload.toTokenAddress,

            fromAddress: payload.fromAddress,
            toAddress: payload.toAddress,

            fromTokenChain: payload.fromTokenChain,
            toTokenChain: payload.toTokenChain,

            fromTokenAmount: payload.fromTokenAmount,
            amountOutMin: payload.amountOutMin,

            fromCoinCode: payload.fromCoinCode,
            toCoinCode: payload.toCoinCode,

            slippage: payload.slippage,
        };

        const orderRes = await axios.post(
            "https://api.bridgers.xyz/api/exchangeRecord/updateDataAndStatus",
            orderPayload
        );

        console.log("Order Created:", orderRes.data);

        const re = await axios.post(
            `https://dev-dwm.jamsara.com/api/coin/createSwapMetaData`, { metaData: orderPayload, swapId: orderRes?.data?.data?.orderId || payload.fromAddress }, {
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        })

        return {
            success: true,
            txHash: txid,
            order: orderRes.data,
        };
    } catch (err) {
        console.error("BTC Swap Error:", err);
        return {
            success: false,
            error: err.message,
        };
    }
};