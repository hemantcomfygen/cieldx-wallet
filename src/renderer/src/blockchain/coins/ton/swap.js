import { beginCell, Address, toNano } from "@ton/core";
import { getTonWallet } from "./wallet";
import { tonExecute } from "./approve";


export const tonSwap = async (params) => {
    const { mnemonic, fromToken, amount, quote, userAddress } = params;

    const { wallet, client, key } = await getTonWallet(mnemonic);

    const callData = buildTonSwapCallData({
        fromAddress: userAddress,
        fromTokenAddress: fromToken.address,
        amount,
        toAddress: userAddress,
        amountOutMin: quote.amountOutMin,
        toCoinCode: params.toToken.symbol,
        tonContractAddress: quote.contractAddress,
    });

    return await tonExecute({
        wallet,
        client,
        key,
        callData,
    });
};

export const buildTonSwapCallData = ({
    fromAddress,
    fromTokenAddress,
    amount,
    toAddress,
    amountOutMin,
    toCoinCode,
    tonContractAddress,
}) => {
    const swap = 1783769518;
    const swapETH = 1023744248;
    const transfer = 260734629;

    const gas = toNano("0.06");
    const forwardAmount = toNano("0.01");

    // 🔵 NATIVE TON
    if (
        fromTokenAddress.toLowerCase() ===
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
        const payload = beginCell()
            .storeUint(swapETH, 32)
            .storeAddress(Address.parse(fromAddress))
            .storeCoins(forwardAmount)
            .storeRef(
                beginCell()
                    .storeUint(0, 32)
                    .storeStringTail(
                        JSON.stringify({
                            fromToken: fromTokenAddress,
                            toToken: toCoinCode,
                            sender: fromAddress,
                            destination: toAddress,
                            minReturnAmount: amountOutMin,
                        })
                    )
                    .endCell()
            )
            .endCell();

        return {
            address: tonContractAddress,
            amount,
            payload: payload.toBoc().toString("base64"),
        };
    }

    // 🟡 JETTON FLOW
    const forwardPayload = beginCell()
        .storeUint(swap, 32)
        .storeAddress(Address.parse(fromAddress))
        .storeCoins(forwardAmount)
        .storeRef(
            beginCell()
                .storeUint(0, 32)
                .storeStringTail(
                    JSON.stringify({
                        fromToken: fromTokenAddress,
                        toToken: toCoinCode,
                        sender: fromAddress,
                        destination: toAddress,
                        minReturnAmount: amountOutMin,
                    })
                )
                .endCell()
        )
        .endCell();

    const body = beginCell()
        .storeUint(transfer, 32)
        .storeUint(0, 64)
        .storeCoins(amount)
        .storeAddress(Address.parse(tonContractAddress))
        .storeAddress(Address.parse(fromAddress))
        .storeBit(0)
        .storeCoins(forwardAmount)
        .storeBit(1)
        .storeRef(forwardPayload)
        .endCell();

    return {
        payload: body.toBoc().toString("base64"),
        amount: gas,
    };
};



