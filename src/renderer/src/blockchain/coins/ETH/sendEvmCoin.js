import { ethers } from "ethers";

const ERC20_ABI = [
    "function transfer(address to, uint amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

export const sendEvmCoin = async (
    toAddress,
    privateKey,
    rpcUrl,
    amount,
    tokenAddress,
    isToken
) => {
    try {

        if (!rpcUrl) throw new Error("RPC URL is required");

        if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
            throw new Error("Invalid private key");
        }

        if (!ethers.isAddress(toAddress)) {
            throw new Error("Invalid recipient address");
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            throw new Error("Invalid amount");
        }

        if (isToken && !ethers.isAddress(tokenAddress)) {
            throw new Error("Invalid token address");
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const wallet = new ethers.Wallet(privateKey, provider);

        const balance = await provider.getBalance(wallet.address);

        let tx;
        let parsedAmount;

        if (isToken && tokenAddress) {
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

            const decimals = await contract.decimals();
            parsedAmount = ethers.parseUnits(amount.toString(), decimals);

            const tokenBalance = await contract.balanceOf(wallet.address);
            if (tokenBalance < parsedAmount) {
                throw new Error("Insufficient token balance");
            }

            tx = await contract.transfer(toAddress, parsedAmount);

        } else {
            parsedAmount = ethers.parseEther(amount.toString());

            if (balance < parsedAmount) {
                throw new Error("Insufficient balance");
            }

            tx = await wallet.sendTransaction({
                to: toAddress,
                value: parsedAmount,
            });
        }

        const receipt = await tx.wait();

        const gasUsed = receipt.gasUsed?.toString();
        const gasPrice = receipt.gasPrice
            ? ethers.formatUnits(receipt.gasPrice, "gwei")
            : null;

        const fee = receipt.gasUsed && receipt.gasPrice
            ? ethers.formatEther(receipt.gasUsed * receipt.gasPrice)
            : null;

        return {
            success: true,
            hash: receipt.hash,
            from: receipt.from,
            to: receipt.to,
            amount,
            type: isToken ? "token" : "native",
            tokenAddress: tokenAddress || null,
            gasUsed,
            gasPrice,
            fee,
            confirmations: receipt.confirmations,
            status: receipt.status === 1 ? "success" : "failed"
        };

    } catch (error) {
        console.error("error in send evm coin", error);

        return {
            success: false,
            error: error.message
        };
    }
};