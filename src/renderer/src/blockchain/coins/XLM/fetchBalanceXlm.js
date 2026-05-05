import { Horizon } from "@stellar/stellar-sdk"

export const fetchBalanceXlm = async (address) => {
    try {
        const server = new Horizon.Server("https://horizon.stellar.org");

        const account = await server.loadAccount(address);

        const xlmBalance = account.balances.find(
            (b) => b.asset_type === "native"
        );

        return parseFloat(xlmBalance.balance)

    } catch (error) {
        if (error?.response?.status === 404) {
            return 0;
        }
        console.error("❌ XLM balance error:", error);
        return null;
    }
};


const address = "GAUA7XL5K54CC2DDGP77FJ2YBHRJLT36CPZDXWPM6MP7MANOGG77PNJU"

// const res = await fetchBalanceXlm(address)

// console.log("res", res)