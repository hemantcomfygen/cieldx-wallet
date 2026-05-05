import { TronWeb } from "tronweb";

const DEFAULT_RPC = "https://api.trongrid.io";

export const sendTronCoin = async ({
    fromAddress,
    toAddress,
    privateKey,
    rpcUrl = DEFAULT_RPC,
    amount,
    isToken = false,
    contractAddress = null,
    decimals = 6,
}) => {
    try {
        const tronWeb = new TronWeb({
            fullHost: rpcUrl,
            privateKey,
        });

        // -----------------------------
        // TRX (native)
        // -----------------------------
        if (!isToken) {
            const amountSun = tronWeb.toSun(amount);

            if (amountSun <= 0) {
                throw new Error("Invalid TRX amount");
            }

            const tx = await tronWeb.transactionBuilder.sendTrx(
                toAddress,
                amountSun,
                fromAddress
            );

            const signed = await tronWeb.trx.sign(tx, privateKey);
            const receipt = await tronWeb.trx.sendRawTransaction(signed);

            if (!receipt.result) {
                throw new Error("TRX broadcast failed");
            }

            return {
                success: true,
                hash: receipt.txid,
                type: "TRX",
                amount,
                status: "success",
            };
        }

        // -----------------------------
        // TRC20 TOKEN
        // -----------------------------
        if (!contractAddress) {
            throw new Error("Token address required for TRC20");
        }

        const contract = await tronWeb.contract().at(contractAddress);

        const value = BigInt(Math.floor(amount * 10 ** decimals));

        const tx = await contract.transfer(
            toAddress,
            value.toString()
        ).send({
            feeLimit: 100_000_000, // 100 TRX
        });

        return {
            success: true,
            hash: tx,
            type: "TRC20",
            contractAddress,
            amount,
            status: "Success",
        };

    } catch (error) {
        console.error("❌ sendTronCoin error:", error.message);

        return {
            success: false,
            error: error.message,
        };
    }
};