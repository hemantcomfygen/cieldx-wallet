import { Contract, ethers, JsonRpcProvider } from "ethers";

// eth

// const address = "0x045Fd7D428e3334bF36F1513Fa2706CCf60a148b";
// const rpcUrl = "https://eth.drpc.org";

// bnb address

const address = "0xf6DC5B1a32f68251cbfD7397F69303E344d4F28c";
const tokenAddress = "0x55d398326f99059ff775485246999027b3197955";
const rpcUrl = "https://1rpc.io/bnb";

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

export const fetchETHBalance = async (
    address,
    rpcUrl,
    tokenAddress,
    isToken
) => {

    // const contractAddress = tokenAddress || address

    try {
        const provider = new JsonRpcProvider(rpcUrl);

        let value = 0;

        if (!isToken) {
            const balance = await provider.getBalance(address)

            value = ethers.formatEther(balance)
        } else {
            if (!tokenAddress) return 0;

            try {
                const contract = new Contract(tokenAddress, ERC20_ABI, provider);

                const balance = await contract.balanceOf(address);
                const decimals = await contract.decimals();

                return ethers.formatUnits(balance, decimals);

            } catch (err) {
                console.warn("Invalid token or RPC", tokenAddress);
                return 0;
            }
        }

        return value
    } catch (error) {
        console.error("❌ error in fetchETHBalance", error)
    }
}

// const res = await fetchETHBalance(address, rpcUrl, tokenAddress, true)

// console.log("result", res)