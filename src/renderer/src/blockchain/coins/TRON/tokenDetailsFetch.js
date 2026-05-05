import { TronWeb } from "tronweb";

const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",
});

tronWeb.setAddress("TJ2vkqur4zidA88foL1CFaFCR7fKdUE6y7"); // 👈 IMPORTANT

const contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const userAddress = "TJ2vkqur4zidA88foL1CFaFCR7fKdUE6y7";

async function getBalance() {
    try {
        const contract = await tronWeb.contract().at(contractAddress);

        const balance = await contract.balanceOf(userAddress).call();
        const decimals = await contract.decimals().call();

        const divisor = 10n ** BigInt(decimals); // ✅ BigInt math
        const formatted = Number(balance) / Number(divisor); // safe convert

        console.log("Raw:", balance.toString());
        console.log("Formatted:", formatted);

    } catch (err) {
        console.error(err);
    }
}

getBalance();