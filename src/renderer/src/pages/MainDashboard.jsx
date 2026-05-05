import { useEffect, useState } from "react";
import { Fade } from "react-awesome-reveal";

import DashboardHeader from "../components/Dashboard/DashboardHeader";
import StakingPage from "../components/Staking/Staking";
import { useDispatch, useSelector } from "react-redux";
import { localStorageGetItem } from "../utils/GlobalFunction";
import Modal from "../components/Modal/Modal";
import SearchInput from "../components/Input/SearchInput";
import Image from "../components/Assets/Image";
import { useNavigate } from "react-router-dom";
import { getCoinsFromDB, updateMultipleCoinsInDB } from "../utils/coins.js";
import { fetchBalanceForAllCoins, generateAllCoinsAddress } from "../utils/blockChianFunctions/dynamicFetcher.js";
import { getAllFromIndexDB } from "../utils/indexDB.js";
import { decryptData } from "../utils/encryptionFunction.js";
import ReceiveModal from "../components/GlobalModal/ReceiveModal.jsx";
import CustomImportToken from "../components/GlobalModal/CustomImportToken.jsx";
import { fetchCoinsMarketData } from "../utils/coinsMarketValue.js";

const MainDashboard = () => {

  const [coinsData, setCoinsData] = useState([])
  const [walletData, setWalletData] = useState({})
  const [search2, setSearch2] = useState("");
  const [isCoinModal, setIsCoinModal] = useState({
    isOpen: false,
    type: ''
  })
  const [isOpenQrModal, setIsOpenQrModal] = useState({ isOpen: false, item: null })
  const [isTokenModal, setIsTokenModal] = useState(false)
  const [isRefresh, setIsRefresh] = useState(false)

  const navigate = useNavigate();


  const groupCoins = (coins) => {
    const grouped = [];
    const seenGroups = new Set();

    coins.forEach(coin => {
      const s = coin.shortName.toUpperCase();
      let groupKey = null;
      if (s.includes("BTC")) groupKey = "BTC";
      else if (s.includes("SOL")) groupKey = "SOL";

      if (groupKey) {
        if (!seenGroups.has(groupKey)) {
          // Prefer Native Segwit for BTC, and Main for SOL
          const bestInGroup = coins.find(c =>
            (groupKey === "BTC" && c.shortName.toUpperCase().includes("BTC")) ||
            (groupKey === "SOL" && (c.shortName.toUpperCase() === "SOLANA" || c.shortName.toUpperCase() === "SOL"))
          ) || coin;
          grouped.push(bestInGroup);
          seenGroups.add(groupKey);
        }
      } else {
        grouped.push(coin);
      }
    });
    return grouped;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCoinsFromDB();
        const allCoins = [...(res?.default_coins || []), ...(res?.custom_imported_coins || [])];
        setCoinsData(groupCoins(allCoins));
      } catch (err) {
        console.error("error in get coins from db", err);
      }
    };

    fetchData();
  }, [isRefresh]);

  // console.log("coin list", coinsData)

  const handleGetData = async () => {
    try {
      const response = await getAllFromIndexDB('wallets');
      const decrypt = await decryptData(response[0]?.data)
      setWalletData(decrypt)
    } catch (error) {
      console.log("error in get data", error)
    }
  }

  useEffect(() => {
    handleGetData()
  }, [])

  useEffect(() => {
    const handleWalletsUpdated = () => {
      handleGetData();
      setIsRefresh((prev) => !prev);
    };

    window.addEventListener("wallets-updated", handleWalletsUpdated);
    return () => window.removeEventListener("wallets-updated", handleWalletsUpdated);
  }, []);

  const active_wallet = walletData?.wallets?.find((w) => {
    if (w?.is_active) return true;
    return (w?.accounts || []).some((acc) => acc?.is_active);
  });
  const activeAccount =
    active_wallet?.accounts?.find((acc) => acc.id === active_wallet?.active_account_id && !acc.is_deleted)
    || active_wallet?.accounts?.find((acc) => acc.is_active && !acc.is_deleted)
    || active_wallet?.accounts?.find((acc) => !acc.is_deleted)
    || (active_wallet ? { id: "fallback_account_0", acc_name: "Account 1", account_index: 0 } : null);

  useEffect(() => {
    if (!active_wallet?.passPhrase) return;
    if (!activeAccount) return;
    let cancelled = false;

    const generateAndFetch = async () => {
      try {
        const res = await getCoinsFromDB();

        const allCoins = [
          ...(res?.default_coins || []),
          ...(res?.custom_imported_coins || [])
        ];

        const coinsWithAddressAndBalance = await Promise.all(
          allCoins.map(async (coin) => {
            const addressRes = await generateAllCoinsAddress(
              active_wallet.passPhrase,
              coin,
              activeAccount?.account_index || 0
            );

            if (!addressRes?.address) {
              return {
                ...coin,
                address: null,
                balance: 0
              };
            }

            const coinWithAddress = {
              ...coin,
              ...addressRes,
              address: addressRes.address,
              privateKey: addressRes.privateKey,
            };

            const balanceRes = await fetchBalanceForAllCoins({
              ...coinWithAddress,
              rpcUrl: coin.rpcUrl,
              tokenAddress: coin.contractAddress,
              isToken: coin.is_token
            });

            const updatedCoin = {
              ...coinWithAddress,
              balance: balanceRes?.balance || 0
            };

            return updatedCoin;

          })
        );

        const coinsWithMarket = await fetchCoinsMarketData(coinsWithAddressAndBalance);

        // 🔥 SAVE TO DB (all coins, not just grouped)
        const updatesArray = coinsWithMarket.map(coin => {
          const isSol = coin.shortName.toUpperCase().includes("SOL");
          const updates = {
            address: coin.address,
            privateKey: coin.privateKey,
            balance: coin.balance,
            coinValue: coin.coinValue,
            coinMarket: coin.coinMarket,
            valueInDollar: coin.valueInDollar,
            wallet_id: active_wallet?.id,
            account_id: activeAccount?.id,
            account_index: activeAccount?.account_index || 0
          };

          if (isSol && coin.optional) {
            updates.optionalAddress = coin.optional.address;
            updates.optionalPrivateKey = coin.optional.privateKey;
          }

          return {
            coinId: coin.id,
            updates
          };
        });

        await updateMultipleCoinsInDB(updatesArray);

        if (cancelled) return;

        // ✅ Update UI with grouped coins
        setCoinsData(groupCoins(coinsWithMarket));
        window.dispatchEvent(new CustomEvent("coins-updated"));

      } catch (err) {
        console.error("❌ error in generate + balance", err);
      }
    };

    generateAndFetch();
    return () => {
      cancelled = true;
    };

  }, [active_wallet?.passPhrase, active_wallet?.id, activeAccount?.id, activeAccount?.account_index]);


  const handleAction = (coin) => {
    switch (isCoinModal.type) {
      case "send":
        navigate(`/app/send-coin/${coin?.id}`)
        setIsCoinModal({ isOpen: false, type: '' })
        break;
      case "receive":
        setIsOpenQrModal({ isOpen: true, item: coin })
        setIsCoinModal({ isOpen: false, type: '' })
        break;
      case "swap":
        navigate(`/app/swap/${coin?.id}`)
        setIsCoinModal({ isOpen: false, type: '' })
        break;
      case "buy":
        setIsCoinModal({ isOpen: false, type: '' })
        break;
      case "sell":
        setIsCoinModal({ isOpen: false, type: '' })
        break;
      default:
        break;
    }
  }


  return (
    <>
      {/* <Loader loading={true} /> */}
      <div className="space-y-6">
        <Fade duration={500} delay={100} triggerOnce>
          <DashboardHeader
            setIsCoinModal={setIsCoinModal}
            setIsTokenModal={setIsTokenModal}
          />
        </Fade>

        {/* <Fade duration={600} delay={200} triggerOnce>
          <MyAssets balanceCoin={balanceCoin} />
        </Fade> */}

        <Fade duration={600} delay={250} triggerOnce>
          <StakingPage coinListData={coinsData} />
        </Fade>
      </div>

      <ReceiveModal
        isOpen={isOpenQrModal?.isOpen}
        onClose={() => setIsOpenQrModal({ isOpen: false, item: null })}
        title="Receive"
        coinAddress={isOpenQrModal?.item?.address}
        coinName={isOpenQrModal?.item?.fullName}
        coinShortName={isOpenQrModal?.item?.shortName}
        coinImageUrl={isOpenQrModal?.item?.coinImageUrl}
        contractAddress={isOpenQrModal?.item?.contractAddress}
        isCustom={isOpenQrModal?.item?.isCustom}
        coinData={isOpenQrModal?.item}
      />

      <CustomImportToken
        isOpen={isTokenModal}
        onClose={() => setIsTokenModal(false)}
        coinsData={coinsData}
        setIsRefresh={setIsRefresh}
      />

      <Modal
        isOpen={isCoinModal.isOpen}
        onClose={() => setIsCoinModal({ isOpen: false, type: '' })}
        title={isCoinModal.type === "send" ? "Send Coin" : isCoinModal.type === "receive" ? "Receive Coin" : isCoinModal.type === "swap" ? "Swap Coin" : "Buy & Sell Coin"}
      >
        <div className="space-y-4 px-1">
          <div className="flex items-center gap-3">
            <SearchInput
              value={search2}
              onChange={(e) => setSearch2(e.target.value)}
              onClear={() => setSearch2('')}
            />
          </div>

          <div className="relative flex">
            <div className=" flex-1 h-[60vh] overflow-y-auto  mb-4  [&::-webkit-scrollbar]:w-0">
              <div className="">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm text-gray-400 mb-2">Coins</h3>
                </div>
                {Array.isArray(coinsData) && coinsData.length > 0 &&
                  coinsData
                    .filter((coin) => !coin?.isDisable)
                    .filter((coin) => {
                      const fullName = coin?.fullName?.toLowerCase() || "";
                      const shortName = coin?.shortName?.toLowerCase() || "";
                      const s = search2?.toLowerCase() || "";

                      return fullName.includes(s) || shortName.includes(s);
                    })
                    .map((coin, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-gray-700 cursor-pointer hover:bg-glass-bg p-2 rounded-2xl"
                        onClick={() => handleAction(coin)}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={coin?.coinImageUrl}
                            alt={coin.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <p className="text-[16px]">{coin?.fullName}</p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>

  );
};

export default MainDashboard;
