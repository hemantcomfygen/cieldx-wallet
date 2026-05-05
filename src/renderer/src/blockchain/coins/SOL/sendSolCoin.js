import {
    Connection,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey
} from "@solana/web3.js";
import bs58 from "bs58";

export const sendSolCoin = async ({
    fromAddress,
    toAddress,
    privateKey,
    rpcUrl,
    amount
}) => {
    try {

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            throw new Error("Invalid amount");
        }

        const connection = new Connection(
            rpcUrl || "https://api.mainnet-beta.solana.com"
        );

        const sender = Keypair.fromSecretKey(
            bs58.decode(privateKey)
        );
        const receiver = new PublicKey(toAddress);

        const lamports = Math.floor(amount * 1e9);

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: receiver,
                lamports
            })
        );

        tx.feePayer = sender.publicKey;

        const latest = await connection.getLatestBlockhash();
        tx.recentBlockhash = latest.blockhash;

        tx.sign(sender);

        const signature = await connection.sendRawTransaction(
            tx.serialize()
        );

        const confirmation = await connection.confirmTransaction(
            {
                signature,
                blockhash: latest.blockhash,
                lastValidBlockHeight: latest.lastValidBlockHeight
            },
            "confirmed"
        );

        const txDetails = await connection.getTransaction(signature, {
            commitment: "confirmed"
        });

        const fee =
            txDetails?.meta?.fee
                ? txDetails.meta.fee / 1e9
                : 0;

        return {
            success: confirmation.value.err === null,
            hash: signature,
            from: sender.publicKey.toBase58(),
            to: receiver.toBase58(),
            amount,
            type: "native",
            tokenAddress: null,

            gasPrice: fee,
            confirmations: confirmation?.context?.slot || 0,
            status: confirmation.value.err === null ? "success" : "failed"
        };

    } catch (error) {
        console.error("❌ error in send sol coin:", error);

        return {
            success: false,
            error: error.message
        };
    }
};