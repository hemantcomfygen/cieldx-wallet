import { createSolanaRpc } from "@solana/kit"

const rpc = "https://api.mainnet.solana.com"
const address = "4AScjEz8YciQRwP3VVmjdTQZWeLNargbXndFWqb6PvSz"

export const fetchSolBalance = async (address, rpcUrl) => {
    try {
        const rpc = createSolanaRpc(rpcUrl);

        const rowBalance = await rpc.getBalance(address).send();

        const sol = Number(rowBalance.value) / 1e9

        return sol;

    } catch (error) {
        console.error("❌ error in fetch balance of SOL : ", error)
    }
}
// const res = await fetchSolBalance(address, rpc)
// console.log("res", res)