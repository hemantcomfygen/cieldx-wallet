import React, { useEffect, useState } from "react";
import AssetHeader from "../components/AssetsDetails/AssetHeader";
import AssetTabs from "../components/AssetsDetails/AssetTabs";
import TradeSection from "../components/AssetsDetails/TradeSection";
import { useNavigate, useParams } from "react-router-dom";;
import { calculateCoinValue, copyToClipboard, shortenAddress } from "../utils/GlobalFunction";
import { Fade } from "react-awesome-reveal";
import { getCoinByIdFromDB, getCoinsFromDB, updateCoinInDB } from "../utils/coins.js";
import ReceiveModal from "../components/GlobalModal/ReceiveModal.jsx";
import { getTransactionsByCoinIdFromDB } from "../utils/transactions.js";
import { getTransactions } from "../core/transactionEngine.js";
import { fetchBalanceForAllCoins } from "../utils/blockChianFunctions/dynamicFetcher.js";
import Modal from "../components/Modal/Modal.jsx";
import { FiCopy } from "react-icons/fi";
import { FaChevronDown, FaCheckCircle } from "react-icons/fa";

const CoinDetails = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(false);
    const [coinData, setCoinData] = useState({})
    const [groupCoins, setGroupCoins] = useState([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isOpenQrModal, setIsOpenQrModal] = useState(false)
    const [fetchTransactionList, setFetchTransactionList] = useState([])
    const [modal, setModal] = useState({ isOpen: false, item: null })
    const navigate = useNavigate();

    const { id } = useParams()

    const fetchCoin = async () => {
        try {
            const coin = await getCoinByIdFromDB(id);
            setCoinData(coin);

            // Fetch related coins in the same group
            if (coin) {
                const allCoinsRes = await getCoinsFromDB();
                const all = [...(allCoinsRes?.default_coins || []), ...(allCoinsRes?.custom_imported_coins || [])];

                const shortName = coin.shortName.toUpperCase();
                let related = [];

                if (shortName.includes("BTC")) {
                    related = all.filter(c => c.shortName.toUpperCase().includes("BTC") && !c.is_token);
                } else if (shortName.includes("SOL")) {
                    // Find all SOL coins
                    const solCoins = all.filter(c => c.shortName.toUpperCase().includes("SOL") && !c.is_token);

                    // If we only have one SOLANA entry but it has an optional address, create virtual entries
                    if (solCoins.length === 1 && solCoins[0].optionalAddress) {
                        related = [
                            { ...solCoins[0], addressType: "default" },
                            { ...solCoins[0], id: solCoins[0].id + "_opt", address: solCoins[0].optionalAddress, privateKey: solCoins[0].optionalPrivateKey, addressType: "optional" }
                        ];
                    } else {
                        related = solCoins;
                    }
                } else {
                    related = all.filter(c => c.shortName.toUpperCase() === shortName && !c.is_token);
                }

                setGroupCoins(related);
            }
        } catch (error) {
            console.log("error in coin detail page fetchCoin", error);
        }
    }


    const fetchTransactionsOfCoin = async () => {
        if (!coinData?.address) return;

        setIsLoading(true);
        try {
            // 1. Fetch Latest Balance
            const balanceRes = await fetchBalanceForAllCoins({
                ...coinData,
                rpcUrl: coinData.rpcUrl,
                tokenAddress: coinData.contractAddress,
                isToken: coinData.is_token
            });

            if (balanceRes && balanceRes.balance !== undefined) {
                setCoinData(prev => ({ ...prev, balance: balanceRes.balance }));
                // Update in DB too
                updateCoinInDB(coinData.id, { balance: balanceRes.balance });
            }

            // 2. Fetch Transactions
            const dbTxs = await getTransactionsByCoinIdFromDB(id);
            const liveTxs = await getTransactions({
                address: coinData.address,
                chainType: coinData.chainType || coinData.shortName,
                contractAddress: coinData.contractAddress,
                shortName: coinData.shortName
            });

            const normalizedLive = liveTxs.map(tx => ({
                ...tx,
                amount: tx.value,
                shortName: tx.tokenSymbol,
                isSent: tx.direction === "out"
            }));

            setFetchTransactionList(normalizedLive.length > 0 ? normalizedLive : dbTxs);

        } catch (error) {
            console.log("error in coin detail page fetchTransactionList", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (coinData?.id) {
            fetchTransactionsOfCoin();
        }
    }, [coinData?.id, coinData?.address, coinData?.chainType]);

    useEffect(() => {
        fetchCoin();

        const handleUpdate = () => {
            fetchCoin();
        };

        window.addEventListener("coins-updated", handleUpdate);

        return () => {
            window.removeEventListener("coins-updated", handleUpdate);
        };
    }, [id]);

    const handleClick = (tx) => {
        setModal({ isOpen: true, item: tx });
    };

    const totalValue = calculateCoinValue(coinData?.balance, coinData?.coinValue)

    const getAddressTypeLabel = (coin) => {
        const s = coin?.shortName?.toUpperCase() || "";
        if (coin?.addressType === "optional") return "Optional";
        if (coin?.addressType === "default") return "Default";

        if (s.includes("NATIVE_SEGBIT")) return "Native SegWit";
        if (s.includes("SEGBIT")) return "SegWit";
        if (s.includes("TAPEROOT")) return "Taproot";
        if (s.includes("BTC")) return "Legacy";
        if (s.includes("SOLANA") || s === "SOL") return "Default";
        return s;
    }

    return (
        <>
            <Fade triggerOnce delay={100}>
                <div className="space-y-8">
                    <div className="flex flex-col gap-2">
                        <AssetHeader
                            coinId={coinData?.id}
                            coinImage={coinData?.coinImageUrl}
                            coinName={coinData?.fullName}
                            shortName={coinData?.shortName}
                            setIsOpenQrModal={setIsOpenQrModal}
                        />

                        {groupCoins.length > 1 && (
                            <div
                                onClick={() => setIsAddressModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl w-fit cursor-pointer hover:bg-white/10 transition ml-14 -mt-4"
                            >
                                <p className="text-sm text-blue-400 font-medium">
                                    {getAddressTypeLabel(coinData)}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {shortenAddress(coinData?.address)}
                                </p>
                                <FaChevronDown className="text-xs text-gray-500" />
                            </div>
                        )}
                    </div>

                    <AssetTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        shortName={coinData?.shortName}
                        coinAmount={coinData?.balance}
                        usdValue={totalValue}
                        address={coinData?.address}
                        contractAddress={coinData?.contractAddress}
                        isCustom={coinData?.isCustom}
                    />

                    <TradeSection
                        coinTransactionData={fetchTransactionList}
                        isLoading={isLoading}
                        handleClick={handleClick}
                    />

                </div>
            </Fade>

            {/* Address Selection Modal */}
            <Modal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                title="Address"
            >
                <div className="space-y-4">
                    {groupCoins.map((coin) => (
                        <div
                            key={coin.id}
                            onClick={() => {
                                if (coin.id.toString().includes("_opt")) {
                                    setCoinData(coin);
                                } else {
                                    navigate(`/app/coin-detail/${coin.id}`);
                                }
                                setIsAddressModalOpen(false);
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border transition cursor-pointer ${coin.address === coinData.address
                                ? "bg-blue-500/10 border-blue-500/30"
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                }`}
                        >
                            <div className="space-y-1">
                                <p className={`font-medium ${coin.address === coinData.address ? "text-blue-400" : "text-white"}`}>
                                    {getAddressTypeLabel(coin)}
                                </p>
                                <p className="text-xs text-gray-400 break-all">
                                    {coin.address}
                                </p>
                            </div>
                            {coin.address === coinData.address && (
                                <FaCheckCircle className="text-blue-500 shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </Modal>

            <ReceiveModal
                isOpen={isOpenQrModal}
                onClose={() => setIsOpenQrModal(false)}
                title="Receive"
                coinAddress={coinData?.address}
                coinName={coinData?.fullName}
                coinShortName={coinData?.shortName}
                coinImageUrl={coinData?.coinImageUrl}
                contractAddress={coinData?.contractAddress}
                isCustom={coinData?.isCustom}
                coinData={coinData}
            />

            <Modal
                isOpen={modal?.isOpen}
                onClose={() => setModal({ isOpen: false, item: null })}
                title="Transaction Details"
            >
                <>
                    <div className="space-y-4 text-sm">

                        <div className="flex justify-between items-center">
                            <p className="text-gray-400">Status</p>
                            <p className={`font-semibold capitalize text-sm ${modal?.item?.status === "success"
                                ? "text-green-500"
                                : modal?.item?.status === "pending"
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }`}>
                                {modal?.item?.status || "pending"}
                            </p>
                        </div>

                        {modal?.item?.from && (
                            <div className="flex justify-between">
                                <p className="text-gray-400">From</p>
                                <p className="flex items-center gap-4 cursor-pointer">
                                    {shortenAddress(modal.item.from)}
                                    <FiCopy
                                        onClick={() =>
                                            copyToClipboard(modal.item.from, "Address Copied Successfully")
                                        }
                                    />
                                </p>
                            </div>
                        )}

                        {modal?.item?.to && (
                            <div className="flex justify-between">
                                <p className="text-gray-400">To</p>
                                <p className="flex items-center gap-4 cursor-pointer">
                                    {shortenAddress(modal.item.to)}
                                    <FiCopy
                                        onClick={() =>
                                            copyToClipboard(modal.item.to, "Address Copied Successfully")
                                        }
                                    />
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <p className="text-gray-400">Amount</p>
                            <p className="font-medium">
                                {modal?.item?.amount || modal?.item?.value} {modal?.item?.shortName || modal?.item?.tokenSymbol}
                            </p>
                        </div>

                        {modal?.item?.type && (
                            <div className="flex justify-between">
                                <p className="text-gray-400">Type</p>
                                <p className="capitalize">{modal.item.type}</p>
                            </div>
                        )}

                        {modal?.item?.timestamp && (
                            <div className="flex justify-between">
                                <p className="text-gray-400">Date</p>
                                <p>{new Date(modal.item.timestamp).toLocaleString()}</p>
                            </div>
                        )}

                        {modal?.item?.fee && (
                            <div className="flex justify-between">
                                <p className="text-gray-400">Network Fee</p>
                                <p>{modal.item.fee} {coinData?.shortName}</p>
                            </div>
                        )}

                        {modal?.item?.hash && (
                            <div className="flex justify-between items-center">
                                <p className="text-gray-400">Txn Hash</p>

                                <p className="flex items-center gap-4 cursor-pointer">
                                    {shortenAddress(modal.item.hash)}
                                    <FiCopy
                                        onClick={() =>
                                            copyToClipboard(modal.item.hash, "Hash Copied Successfully")
                                        }
                                    />
                                </p>
                            </div>
                        )}

                        {modal?.item?.confirmations !== undefined && (
                            <div className="flex justify-between">
                                <p className="text-gray-400">Confirmations</p>
                                <p>{modal.item.confirmations}</p>
                            </div>
                        )}

                    </div>
                </>
            </Modal>
        </>
    );
};

export default CoinDetails;
