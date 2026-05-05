import { TronWeb } from "tronweb"


const address = "TRDBF2v1etZzwVqawCFWbWTp94mVPetws1"
const rpc = "https://api.trongrid.io"

export const fetchTronBalance = async (
    address,
    rpcUrl,
    contractAddress,
    isToken = false
) => {
    try {
        const tronWeb = new TronWeb({
            fullHost: rpcUrl || "https://api.trongrid.io"
        })

        tronWeb.setAddress(address);

        if (!isToken) {
            const row = await tronWeb.trx.getBalance(address);

            const balance = row / 1e6;

            return balance
        }

        if (!contractAddress) {
            throw new Error("Token contract address required");
        }

        const contract = await tronWeb.contract().at(contractAddress);

        const balance = await contract.balanceOf(address).call();
        const decimals = await contract.decimals().call();

        const divisor = 10n ** BigInt(decimals);
        const formatted = Number(balance) / Number(divisor);

        return formatted;

    } catch (error) {
        console.error("error in fetch balance of tron", error)
    }
}

// const contractAddress = "TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5"


// const res = await fetchTronBalance(address, rpc, contractAddress, false);

// console.log("balance", res)