import { Keypair, Horizon, TransactionBuilder, Networks, Operation, Asset } from "@stellar/stellar-sdk";

export const sendXlmCoin = async ({
    address: fromAddress,
    toAddress,
    privateKey,
    amount,
}) => {
    try {
        const server = new Horizon.Server("https://horizon.stellar.org");

        // Load sender account
        const sourceAccount = await server.loadAccount(fromAddress);

        // Check if destination exists
        let destinationExists = true;
        try {
            await server.loadAccount(toAddress);
        } catch (error) {
            if (error?.response?.status === 404) {
                destinationExists = false;
            } else {
                throw error;
            }
        }

        const fee = await server.fetchBaseFee(); // Base fee in stroops (usually 100)

        const transaction = new TransactionBuilder(sourceAccount, {
            fee: fee.toString(),
            networkPassphrase: Networks.PUBLIC,
        });

        // Format amount up to 7 decimal places as required by Stellar
        const formattedAmount = Number(amount).toFixed(7).replace(/\.?0+$/, "");
        if (!formattedAmount) throw new Error("Invalid amount");

        if (destinationExists) {
            transaction.addOperation(
                Operation.payment({
                    destination: toAddress,
                    asset: Asset.native(),
                    amount: formattedAmount, // amount in XLM
                })
            );
        } else {
            // Stellar requires a minimum reserve of 1 XLM to initialize a new account
            if (Number(amount) < 1) {
                return {
                    success: false,
                    error: "Target address is unfunded. Sending to a new account requires a minimum of 1 XLM to initialize it.",
                };
            }

            transaction.addOperation(
                Operation.createAccount({
                    destination: toAddress,
                    startingBalance: formattedAmount, 
                })
            );
        }

        // Set timeout to 30 seconds
        transaction.setTimeout(30);

        const builtTx = transaction.build();

        // Sign the transaction
        const sourceKeypair = Keypair.fromSecret(privateKey);
        builtTx.sign(sourceKeypair);

        // Submit the transaction
        const response = await server.submitTransaction(builtTx);

        return {
            success: true,
            hash: response.hash,
            from: fromAddress,
            to: toAddress,
            amount: amount,
            fee: parseInt(fee) / 10000000, // Convert stroops to XLM
            status: "success",
        };

    } catch (error) {
        let errorMsg = error.message;
        
        if (error?.response?.data) {
            console.error("❌ Stellar API Error Data:", JSON.stringify(error.response.data, null, 2));
            const extras = error.response.data.extras;
            if (extras?.result_codes) {
                const resultCodes = extras.result_codes;
                if (resultCodes.operations && resultCodes.operations.length > 0) {
                    errorMsg = `Operation Error: ${resultCodes.operations[0]}`;
                } else if (resultCodes.transaction) {
                    errorMsg = `Transaction Error: ${resultCodes.transaction}`;
                }
            }
        } else {
            console.error("❌ sendXLM error:", error.message);
        }

        return {
            success: false,
            error: errorMsg,
        };
    }
};
