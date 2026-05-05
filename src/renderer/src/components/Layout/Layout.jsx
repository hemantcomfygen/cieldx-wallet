import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { MdClose } from "react-icons/md";
import Sidebar from "./Sidebar";
import ActivityModal from "../Modal/ActivityModal";
import Header from "../header/Header";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../context/SocketProvider";
import { localStorageGetItem } from "../../utils/GlobalFunction";
import { decryptData } from "../../utils/encryptionFunction";
import { getAllFromIndexDB } from "../../utils/indexDB.js";
import { getCoinsFromDB } from "../../utils/coins.js";

const Layout = ({ balanceRefresh }) => {

  const { socket, isConnected, setIsRefresh } = useSocket();

  useEffect(() => {
    setIsRefresh(true);
  }, []);

  const user_id = localStorageGetItem("userId");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  // const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [walletData, setWalletData] = useState(null)
  const [coinsData, setCoinsData] = useState([])

  const dispatch = useDispatch();
  const selector = useSelector((state) => state?.auth);
  const coinListData = selector?.getAddressAndBalanceOfPassphraseData?.data?.data?.blockchains;
  const coinList = selector?.getCoinListOfWalletData?.data?.data?.list || []

  const data = selector?.getAllWalletListData?.data?.data?.list?.wallets || []

  const handleGetData = async () => {
    try {
      const response = await getAllFromIndexDB('wallets');
      const decrypt = await decryptData(response[0]?.data)
      setWalletData(decrypt)
    } catch (error) {
      console.log("error in get data", error)
    }
  }

  const fetchData = async () => {
    try {
      const res = await getCoinsFromDB();
      const allCoins = [...res?.default_coins, ...res?.custom_imported_coins];
      setCoinsData(allCoins);
    } catch (err) {
      console.error("error in get coins from db", err);
    }
  };

  useEffect(() => {
    // if (!balanceRefresh) return;
    handleGetData()
    fetchData();
  }, [])

  useEffect(() => {
    const handleWalletsUpdated = () => handleGetData();
    const handleCoinsUpdated = () => fetchData();

    window.addEventListener("wallets-updated", handleWalletsUpdated);
    window.addEventListener("coins-updated", handleCoinsUpdated);

    return () => {
      window.removeEventListener("wallets-updated", handleWalletsUpdated);
      window.removeEventListener("coins-updated", handleCoinsUpdated);
    };
  }, []);

  const active_wallet = walletData?.wallets?.find((w) => {
    if (w?.is_active) return true;
    return (w?.accounts || []).some((acc) => acc?.is_active);
  });
  const active_account = active_wallet?.accounts?.find((acc) => acc?.is_active)
    || active_wallet?.accounts?.find((acc) => acc?.id === active_wallet?.active_account_id)
    || null;
  const scopedCoins = coinsData?.filter((coin) => {
    if (!active_account?.id) return true;
    return !coin?.account_id || coin?.account_id === active_account.id;
  });

  const totalValue = scopedCoins?.filter((coin) => coin?.isDisable !== true)?.reduce((acc, coin) => {
    return acc + (coin?.balance * coin?.coinValue || 0);
  }, 0);

  const btcItem = scopedCoins.find((btc) => btc?.shortName === "BTC");

  const btcPriceUSD = btcItem?.coinValue || 0

  const totalValueInBTC =
    btcPriceUSD && Number.isFinite(totalValue)
      ? (totalValue / btcPriceUSD).toFixed(5)
      : "0.00";


  return (
    <>
      <div className="flex min-h-screen bg-primaryTheme text-default-text">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72
          bg-card-bg border-r border-borderColor
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        >
          {/* Mobile Close Button */}
          <div className="md:hidden flex justify-end p-4">
            <button onClick={() => setSidebarOpen(false)} className="btn-glass">
              <MdClose size={22} />
            </button>
          </div>

          <Sidebar
            setActivityModalOpen={setActivityModalOpen}
            active_wallet={active_wallet}
            active_account={active_account}
            totalValue={totalValue}
            totalValueInBTC={totalValueInBTC}
            allWallets={walletData?.wallets || []}
            onAccountSwitch={handleGetData}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen">
          <Header isButton={false} setSidebarOpen={setSidebarOpen} />

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-10 overflow-y-auto hide-scrollbar">
            <Outlet />
            <ActivityModal
              isOpen={activityModalOpen}
              onClose={() => setActivityModalOpen(false)}
            />
          </main>
        </div>
      </div>

    </>
  );
};

export default Layout;
