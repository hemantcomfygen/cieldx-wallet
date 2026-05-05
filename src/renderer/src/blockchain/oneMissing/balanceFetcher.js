import * as bip39 from "bip39";
import {
    fetchBalanceXlm,
    fetchBtcBalance,
    fetchDogeBalance,
    fetchETHBalance,
    fetchLtcBalance,
    fetchSolBalance,
    fetchTronBalance,
    fetchXrpBalance,
    generateDogeAddress,
    generateEVMAddress,
    generateLegacyAddress,
    generateLtcAddress,
    generateSegWitAddress,
    generateSolAddress,
    generateTapRootAddress,
    generateTronAddress,
    generateXlmAddress,
    generateXrpAddress,
    nativeSegWitAddress,
} from "../coins";

// const solRpc = "https://api.mainnet.solana.com";
const solRpc = "https://methodical-twilight-replica.solana-mainnet.quiknode.pro/e2105c10e6ea80775ec44e9bf034de8d079fe69e";
const tornRpc = "https://api.trongrid.io";
const ethRpc = "https://eth.drpc.org";
// const xrpRpc = "https://s1.ripple.com:51234"
const xrpRpc = "wss://s1.ripple.com";

export const balanceFetcher = async (mnemonic) => {
    try {
        if (!bip39.validateMnemonic(mnemonic)) {
            return {
                success: false,
                message: "Invalid mnemonic",
            };
        }

        const addresses = {
            btc_legacy: (await generateLegacyAddress(mnemonic))?.address,
            btc_segwit: (await generateSegWitAddress(mnemonic))?.address,
            btc_native: (await nativeSegWitAddress(mnemonic))?.address,
            btc_taproot: (await generateTapRootAddress(mnemonic))?.address,

            evm: (await generateEVMAddress(mnemonic))?.address,

            sol: (await generateSolAddress(mnemonic))?.address,
            ltc: (await generateLtcAddress(mnemonic))?.address,
            doge: (await generateDogeAddress(mnemonic))?.address,
            tron: (await generateTronAddress(mnemonic))?.address,
            xrp: (await generateXrpAddress(mnemonic))?.address,
            xlm: (await generateXlmAddress(mnemonic))?.address,
        };

        console.log("address", addresses);

        // balance
        const balances = await Promise.all([
            fetchBtcBalance(addresses.btc_legacy),
            fetchBtcBalance(addresses.btc_segwit),
            fetchBtcBalance(addresses.btc_native),
            fetchBtcBalance(addresses.btc_taproot),

            fetchETHBalance(addresses.evm, ethRpc, null, false),

            fetchSolBalance(addresses.sol, solRpc),
            fetchLtcBalance(addresses.ltc),
            fetchDogeBalance(addresses.doge),
            fetchTronBalance(addresses.tron, tornRpc),
            fetchXrpBalance(addresses.xrp, xrpRpc),
            fetchBalanceXlm(addresses.xlm),
        ]);

        const [
            btc_legacy,
            btc_segwit,
            btc_native,
            btc_taproot,
            evm,
            sol,
            ltc,
            doge,
            tron,
            xrp,
            xlm,
        ] = balances;

        const finalBalances = {
            btc_legacy,
            btc_segwit,
            btc_native,
            btc_taproot,
            evm,
            sol,
            ltc,
            doge,
            tron,
            xrp,
            xlm,
        };

        const hasBalance = Object.values(finalBalances).some(
            (bal) => Number(bal) > 0,
        );
        if (!hasBalance) {
            return { success: false, message: "No balance found" };
        }

        return {
            success: true,
            mnemonic,
        };
    } catch (error) {
        console.log("error in balance fetcher", error);
        return {
            success: false,
            message: error?.message,
        };
    }
};
