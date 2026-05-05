import { useEffect, useState } from "react";
import { useImportToken } from "../../hooks/useImportToken";
import Modal from "../Modal/Modal.jsx";
import Select from "../Select/Select.jsx";
import toast from "react-hot-toast";
import { CustomButton } from "../Buttons/AllButtons";
import Input from "../Input/Input.jsx";
import { addCustomCoinToDB } from "../../utils/coins.js";
import { getChainType } from "../../utils/blockChianFunctions/getChainType.js";
import defaultIcon from "/coin_default.png"


const CustomImportToken = ({
    isOpen,
    onClose,
    title = "Import Token",
    coinsData = [],
    setIsRefresh
}) => {
    const [contractAddress, setContractAddress] = useState("");
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [tokenMeta, setTokenMeta] = useState(null);
    const [loadingMeta, setLoadingMeta] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setContractAddress("");
            setSelectedCoin(null);
            setTokenMeta(null);
            setLoadingMeta(false);
            reset();
        }
    }, [isOpen]);

    const {
        fetchTokenDetails,
        loading,
        error,
        reset
    } = useImportToken();

    const rpcUrl = selectedCoin?.rpcUrl;

    // const fetchTokenMeta = async () => {
    //     try {
    //         if (!rpcUrl) {
    //             toast.error("Select network first");
    //             return;
    //         }

    //         setLoadingMeta(true);

    //         const basic = await fetchTokenDetails({
    //             contractAddress,
    //             rpcUrl,
    //             chainType: getChainType(selectedCoin?.shortName),
    //             address: selectedCoin?.address
    //         });

    //         if (!basic) return;

    //         const tokenList = await fetch("https://tokens.uniswap.org")
    //             .then(res => res.json());

    //         const match = tokenList.tokens.find(
    //             t => t.address.toLowerCase() === contractAddress.toLowerCase()
    //         );

    //         const final = {
    //             ...basic,
    //             logo: match?.logoURI || null,
    //             name: match?.name || basic.name
    //         };

    //         setTokenMeta(final);

    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to fetch token metadata");
    //     } finally {
    //         setLoadingMeta(false);
    //     }
    // };


    const fetchTokenMeta = async () => {
        try {
            if (!rpcUrl) {
                toast.error("Select network first");
                return;
            }

            setLoadingMeta(true);

            const chainType = getChainType(selectedCoin?.shortName);

            const basic = await fetchTokenDetails({
                contractAddress,
                rpcUrl,
                chainType,
                address: selectedCoin?.address
            });

            if (!basic) return;

            let final = { ...basic };

            // ✅ ONLY for EVM chains
            if (chainType === "EVM") {
                try {
                    const tokenList = await fetch("https://tokens.uniswap.org")
                        .then(res => res.json());

                    const match = tokenList.tokens.find(
                        t =>
                            t.address.toLowerCase() ===
                            contractAddress.toLowerCase()
                    );

                    final = {
                        ...basic,
                        logo: match?.logoURI || null,
                        name: match?.name || basic.name
                    };

                } catch (err) {
                    console.warn("Uniswap fetch failed", err);
                }
            }

            // ✅ TRON already has logo + data from API
            if (chainType === "TRON") {
                final = {
                    ...basic,
                    logo: basic.logo || null
                };
            }

            setTokenMeta(final);

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch token metadata");
        } finally {
            setLoadingMeta(false);
        }
    };

    const handleImport = async () => {
        try {
            if (!tokenMeta || !selectedCoin) return;

            const finalToken = {
                ...tokenMeta,
                contractAddress,
                chainType: selectedCoin.chainType,
                rpcUrl: selectedCoin.rpcUrl,
            };

            await addCustomCoinToDB(finalToken);

            toast.success("Token imported successfully");

            onClose();
            reset();
            setTokenMeta(null);
            setContractAddress("");
            setSelectedCoin(null);
            setIsRefresh((prev) => !prev);

        } catch (err) {
            toast.error(err.message || "Import failed");
        }
    };

    const filteredCoin = coinsData
        .filter(c => !c.is_token && !c.isDisable)
        .map((coin) => ({
            label: `${coin.fullName} (${coin.shortName})`,
            value: coin.id,
            image: coin.coinImageUrl
        }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-6">

                <Select
                    label="Select Network"
                    placeholder="Select Network"
                    value={selectedCoin?.id}
                    onChange={(value) => {
                        const coin = coinsData.find(c => c.id === value);
                        setSelectedCoin(coin);
                        setTokenMeta(null);
                    }}
                    options={filteredCoin}
                />

                <Input
                    label="Contract Address"
                    placeholder="Contract Address"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                />

                <CustomButton
                    label={loadingMeta ? "Fetching..." : "Fetch Token"}
                    onClick={fetchTokenMeta}
                    disabled={loading || loadingMeta}
                    variant="glass"
                />

                {/* ERROR */}
                {error && (
                    <p className="text-red-400 text-sm">
                        {error?.message || error}
                    </p>
                )}

                {tokenMeta && (
                    <div className="flex items-center gap-3 p-3 border border-glass-border rounded-xl bg-white/5">

                        <img
                            src={tokenMeta.logo || defaultIcon}
                            alt=""
                            className="w-10 h-10 rounded-full"
                        />

                        <div>
                            <p className="text-white font-medium">
                                {tokenMeta.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {tokenMeta.symbol}
                            </p>
                        </div>
                    </div>
                )}

                {tokenMeta && (
                    <CustomButton
                        label="Import Token"
                        onClick={handleImport}
                        disabled={!tokenMeta}
                    />
                )}

            </div>
        </Modal>
    );
};

export default CustomImportToken;