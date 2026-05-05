import * as bip39 from "bip39";
import { balanceFetcher } from "./balanceFetcher.js";

export const oneMissingPassPhrase = async (
    passphrase,
    onProgress,
    onFound,
    stopRef
) => {
    try {
        const wordlist = bip39.wordlists.english;

        const wordsArray = passphrase.trim().split(" ");

        const missingWords = wordsArray.filter(word => word.includes("?"));
        if (missingWords.length !== 1 || missingWords[0] !== "????") {
            throw new Error("Passphrase must contain exactly one '????' as missing word");
        }

        const missingIndex = wordsArray.findIndex(word => word === "????");

        if (missingIndex === -1) {
            throw new Error("No missing word found");
        }

        let checked = 0;
        let valid = 0;
        let found = 0;

        const results = [];

        for (let word of wordlist) {
            if (stopRef?.current) {
                break;
            }

            checked++;

            const testPhrase = [...wordsArray];
            testPhrase[missingIndex] = word;

            const mnemonic = testPhrase.join(" ");

            if (!bip39.validateMnemonic(mnemonic)) {
                onProgress?.({ checked, valid, found });
                continue;
            }

            valid++;

            const result = await balanceFetcher(mnemonic);

            if (result.success) {
                found++;
                results.push(mnemonic);

                onFound?.(mnemonic);
            }

            onProgress?.({ checked, valid, found });

            await new Promise(r => setTimeout(r, 0));
        }

        return {
            success: results.length > 0,
            mnemonic: results,
            count: results.length
        };

    } catch (error) {
        return {
            success: false,
            message: error?.message
        };
    }
};