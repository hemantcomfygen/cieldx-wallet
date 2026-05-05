import { TonClient, JettonMaster } from "@ton/ton";
import { Address, Cell, SendMode } from "@ton/core";

export const getJettonWalletAddress = async ({
    client,
    tokenAddress,
    userAddress,
}) => {
    const jettonMaster = client.open(
        JettonMaster.create(Address.parse(tokenAddress))
    );

    return await jettonMaster.getWalletAddress(
        Address.parse(userAddress)
    );
};


export const tonExecute = async ({
    wallet,
    client,
    key,
    callData,
}) => {
    const sender = wallet.sender(client, key.secretKey);

    await sender.send({
        to: Address.parse(callData.address),
        value: callData.amount,
        body: Cell.fromBase64(callData.payload),
        sendMode: SendMode.PAY_GAS_SEPARATELY,
    });

    console.log("🚀 TON TX sent");

    return "TON_TX_HASH";
};