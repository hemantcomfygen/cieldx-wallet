import { useState } from "react";
import { executeSwap } from "../core/swapEngine";

export const useSwap = () => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("idle");

    const swap = async (params) => {
        try {
            setLoading(true);

            // ✅ validation
            // if (!params.fromToken || !params.toToken)
            //     throw new Error("Select tokens");

            // if (!params.amount || Number(params.amount) <= 0)
            //     throw new Error("Invalid amount");

            // if (!params.quote)
            //     throw new Error("Fetch quote first");

            console.log("🚀 Starting swap with params:", params);

            setStep("fetching_quote");

            const hash = await executeSwap({
                ...params,
                setStep,
            });

            setStep("success");
            return hash;

        } catch (err) {
            console.error("❌ Swap Hook Error:", err);
            setStep("error");
            throw err.message || "Swap failed";
        } finally {
            setLoading(false);
        }
    };

    return { swap, loading, step };
};