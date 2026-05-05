import { useEffect, useState } from "react";
import CustomButton from "../components/Buttons/CustomButton";
import Input from "../components/Input/Input";
import Toggle from "../components/Toggle/Toggle";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal/Modal";
import toast from "react-hot-toast";
import { getAllWalletList, getCoinListOfWallet } from "../redux/slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { calculateCoinValue, formatToSixDecimals, localStorageGetItem } from "../utils/GlobalFunction";
import { sendCoin } from "../redux/slices/CoinTransactionSlice";
import Image from "../components/Assets/Image";
import SearchInput from "../components/Input/SearchInput";
import { AiOutlineDollar } from "react-icons/ai";
import { LuCircleAlert } from "react-icons/lu";
import Loader from "../components/Loader/Loader";
import { Fade } from "react-awesome-reveal";
import { getCoinByIdFromDB, getCoinsFromDB, updateCoinInDB } from "../utils/coins.js";
import { generateAllCoinsAddress, sendCoinTransaction } from "../utils/blockChianFunctions/dynamicFetcher.js";
import { saveTransactionsToDB } from "../utils/transactions.js";
import { getAllFromIndexDB } from "../utils/indexDB.js";
import { decryptData } from "../utils/encryptionFunction.js";
import { FiBookOpen } from "react-icons/fi";
import { saveActivity } from "../utils/activity.js";
import { useBalanceRefresh } from "../hooks/useBalanceRefresh.js";

const SendCoin = () => {
  const [sendMax, setSendMax] = useState(false);
  const [isOpenSelectCoin, setIsOpenSelectCoin] = useState(false);
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState("")
  const [formData, setFormData] = useState({
    toAddress: '',
    amount: '',
    usdAmount: '',
  })
  const [coinData, setCoinData] = useState({})
  const [coinList, setCoinList] = useState([])
  const [walletsData, setWalletsData] = useState([])
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false)
  const [addressBookSearch, setAddressBookSearch] = useState("")
  const [addressBookEntries, setAddressBookEntries] = useState([])
  const [coinBalance, setCoinBalance] = useState({ balance: 0, address: 0, privateKey: '' })
  const [active_ids, setActive_ids] = useState({
    wallet_id: null,
    account_id: null,
    wallet: null,
    account: null
  })

  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const userId = localStorageGetItem("userId");

  const location = useLocation();
  const internalTransfer = location?.state?.item;

  const { balance, refreshBalance } = useBalanceRefresh(
    coinBalance.address,
    coinData.shortName,
    coinData.fullName,
    coinData.rpcUrl,
    coinData.tokenAddress,
    coinData.contractAddress,
    coinData.is_token
  );

  const handleUpdateBalanceInDB = async () => {
    try {

      await updateCoinInDB(coinData.id, {
        balance: balance,
        account_id: active_ids.account_id,
        wallet_id: active_ids.wallet_id,
      });
    } catch (error) {
      console.log("error in update balance in db", error)
    }
  }

  useEffect(() => {
    if (internalTransfer && coinData?.address) {
      setFormData((prev) => ({
        ...prev,
        toAddress: coinData.address,
      }));

      setActive_ids((prev) => ({
        ...prev,
        wallet_id: internalTransfer.walletId,
        account_id: internalTransfer.accountId,
      }));

      setIsOpenSelectCoin(false);
    }
  }, [internalTransfer, coinData?.address]);

  useEffect(() => {

    const address = internalTransfer
      ? internalTransfer?.address
      : coinData?.address;

    const privateKey = internalTransfer
      ? internalTransfer?.privateKey
      : coinData?.privateKey;

    setCoinBalance({
      balance: balance,
      address: address,
      privateKey: privateKey
    });
  }, [internalTransfer, coinData]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getAllFromIndexDB("wallets");
        const decrypted = await decryptData(response?.[0]?.data);
        setWalletsData(decrypted?.wallets || []);
      } catch (error) {
        console.log("error in fetching wallets", error);
      }
    };

    fetchWallets();
  }, []);

  useEffect(() => {
    const refetchWallets = async () => {
      try {
        const response = await getAllFromIndexDB("wallets");
        const decrypted = await decryptData(response?.[0]?.data);
        setWalletsData(decrypted?.wallets || []);
      } catch (error) {
        console.log("error in fetching wallets", error);
      }
    };

    window.addEventListener("wallets-updated", refetchWallets);
    return () => window.removeEventListener("wallets-updated", refetchWallets);
  }, []);

  useEffect(() => {
    const fetchCoin = async () => {
      try {
        const coin = await getCoinByIdFromDB(data?.id || id);
        setCoinData(coin)
      } catch (error) {
        console.log("error in coin detail page fetchCoin", error);
      }
    }

    fetchCoin();
  }, [id, data])


  useEffect(() => {
    const buildAddressBook = async () => {
      if (!coinData?.shortName || walletsData.length === 0) {
        setAddressBookEntries([]);
        return;
      }

      try {
        const allEntries = [];
        const activeWallet = walletsData.find((w) => w?.is_active);
        const activeAccount = activeWallet?.accounts?.find((a) => a?.is_active)
          || activeWallet?.accounts?.find((a) => a?.id === activeWallet?.active_account_id);

        setActive_ids({
          wallet_id: activeWallet?.id,
          account_id: activeAccount?.id,
          wallet: activeWallet,
          account: activeAccount,
        })

        for (const wallet of walletsData) {
          if (wallet?.is_deleted) continue;
          const accounts = Array.isArray(wallet?.accounts) && wallet.accounts.length > 0
            ? wallet.accounts
            : [{ id: "fallback_account_0", acc_name: "Account 1", account_index: 0, is_deleted: false }];

          for (const account of accounts) {
            if (account?.is_deleted) continue;
            if (wallet?.id === activeWallet?.id && account?.id === activeAccount?.id) continue;
            const derived = await generateAllCoinsAddress(
              wallet.passPhrase,
              coinData,
              account.account_index || 0
            );

            if (!derived?.address) continue;

            allEntries.push({
              id: `${wallet.id}-${account.id}-${coinData.shortName}`,
              walletId: wallet.id,
              walletName: wallet.wallet_name,
              accountId: account.id,
              accountName: account.acc_name || `Account ${(account.account_index || 0) + 1}`,
              accountIndex: account.account_index || 0,
              address: derived.address,
            });
          }
        }

        const deduped = Array.from(
          new Map(allEntries.map((entry) => [entry.address, entry])).values()
        );
        setAddressBookEntries(deduped);
      } catch (error) {
        console.log("error in buildAddressBook", error);
      }
    };

    buildAddressBook();
  }, [coinData?.shortName, walletsData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCoinsFromDB();
        const allCoins = [...res?.default_coins, ...res?.custom_imported_coins];
        setCoinList(allCoins);
      } catch (err) {
        console.error("error in get coins from db", err);
      }
    };

    fetchData();
  }, [isOpenSelectCoin]);


  const validation = () => {
    const newErrors = {};
    if (!formData.toAddress.trim()) newErrors.toAddress = "Please enter an address.";
    if (!formData.amount) newErrors.amount = "Please enter amount.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSendCoin = async () => {
    if (!validation()) return;
    if (balance < formData.amount) return toast.error("Insufficient balance");

    try {
      setIsLoading(true)

      const res = await sendCoinTransaction({
        coin: {
          ...coinData,
          address: coinBalance.address,
          privateKey: coinBalance.privateKey
        },
        toAddress: formData.toAddress,
        amount: formData.amount,
        mnemonic: active_ids?.wallet?.passPhrase,
        accountIndex: active_ids?.account?.account_index
      });

      if (res?.transaction?.success === false) {
        return toast.error(res?.transaction?.error || "Error while sending coin")
      }

      toast.success(res?.message || 'Coin sent successfully')
      setFormData({
        toAddress: '',
        amount: '',
        usdAmount: '',
      })


      const transaction = {
        ...res.transaction,
        amount: Number(res.transaction.amount) || Number(formData.amount),
        coinId: res.coinId,
        fullName: res.fullName || coinData?.fullName,
        isSent: true
      }

      const activity = {
        coinId: id,
        account_id: active_ids.account_id,
        wallet_id: active_ids.wallet_id,

        coinImage: coinData.coinImageUrl,
        coinName: coinData.fullName,
        shortName: coinData.shortName,

        type: "send",
        status: res.transaction.success ? "success" : "failed",

        from: coinData.address,
        to: formData.toAddress,

        tokenSymbol: res.transaction.tokenSymbol,
        amount: formData.amount,
        chainId: coinData.chainId,
        hash: res.transaction.hash,
      }


      await saveTransactionsToDB(transaction);
      await saveActivity(activity);
      await refreshBalance();
      await handleUpdateBalanceInDB();

      setIsLoading(false)

    } catch (error) {
      toast.error(error?.message || "Error while sending coin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Convert amount → USD
  useEffect(() => {
    if (document.activeElement.name === 'amount') {
      if (!formData.amount || !coinData?.coinValue) {
        setFormData((prev) => ({ ...prev, usdAmount: '' }));
        return;
      }
      const usdValue = (Number(formData.amount) * Number(coinData?.coinValue)).toFixed(2);
      setFormData((prev) => ({ ...prev, usdAmount: usdValue }));
    }
  }, [formData.amount, coinData?.coinValue]);

  // Convert USD → coin amount
  useEffect(() => {
    if (document.activeElement.name === 'usdAmount') {
      if (!formData.usdAmount || !data?.coinData?.coinValue) {
        setFormData((prev) => ({ ...prev, amount: '' }));
        return;
      }
      const coinValue = (Number(formData.usdAmount) / Number(data?.coinData?.coinValue)).toFixed(8);
      setFormData((prev) => ({ ...prev, amount: coinValue }));
    }
  }, [formData.usdAmount, data?.coinData?.coinValue]);


  const handleMaxValue = () => {
    const maxBalance = Number(coinData?.balance || 0);

    if (!maxBalance) return;

    if (!sendMax) {
      setFormData((prev) => ({
        ...prev,
        amount: maxBalance,
        usdAmount: coinData?.coinValue
          ? (maxBalance * Number(coinData.coinValue)).toFixed(2)
          : "",
      }));
      setSendMax(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        amount: "",
        usdAmount: "",
      }));
      setSendMax(false);
    }
  };


  return (
    <>
      <Loader loading={isLoading} />
      <Fade triggerOnce delay={100}>
        <div className=" bg-primaryTheme text-white">
          <div className="max-w-7xl mx-auto md:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M12 4L6 10L12 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="flex items-center justify-between w-full">
                <h1 className="text-xl font-bold">Send</h1>
                <div>
                  {!internalTransfer && (
                    <CustomButton
                      onClick={() => setIsOpenSelectCoin(true)}
                      label="Switch"
                      size="sm"
                      className="px-4"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-2 md:px-6 py-8">
            {internalTransfer && (
              <div className="flex flex-col-reverse sm:flex-row-reverse items-center gap-4 mb-4">
                <div className="flex-1 bg-card-bg border border-white/10 rounded-lg p-4 w-full">
                  <p className="text-xs text-gray-400 mb-1">To</p>
                  <p className="text-sm text-white">
                    {active_ids?.wallet?.wallet_name} - ({active_ids?.account?.acc_name})
                  </p>
                </div>
                <div className="hidden sm:flex text-gray-500 text-lg">
                  →
                </div>
                <div className="w-full flex-1 bg-card-bg border border-white/10 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <p className="text-sm text-white">
                    {internalTransfer?.walletName} - ({internalTransfer?.accountName})
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <Input
                    label='To'
                    placeholder="Address"
                    name='toAddress'
                    value={formData.toAddress}
                    onChange={handleChange}
                    error={errors.toAddress}
                    rightIcon={!internalTransfer && (
                      <FiBookOpen size={20} onClick={() => setIsAddressBookOpen(true)} />
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-zinc-300">Amount</h3>
                    <Toggle
                      label="Send max"
                      checked={sendMax}
                      onChange={handleMaxValue}
                    />
                  </div>

                  <div className="space-y-5">
                    <Input
                      placeholder='0.00'
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      error={errors.amount}
                    // rightIcon={<RxDashboard size={20} />}
                    />

                    <Input
                      placeholder='0.00'
                      name="usdAmount"
                      type="number"
                      disabled={true}
                      value={formData.usdAmount}
                      onChange={handleChange}
                      rightIcon={<AiOutlineDollar size={20} />}
                    />

                    <CustomButton
                      label="Send"
                      onClick={handleSendCoin}
                    />
                  </div>

                  <p className='text-[14px] text-zinc-400'>
                    Available Balance:
                    <span className='text-success ml-2'>
                      {formatToSixDecimals(balance)} {coinData?.shortName}
                    </span>
                  </p>

                </div>
              </div>

              <div className="lg:col-span-1 mt-8">
                <div className='flex items-center gap-3 bg-card-bg p-4 rounded-lg'>
                  <Image
                    src={coinData?.coinImageUrl}
                    alt={coinData?.fullName}
                    className='h-12 w-12'
                  />
                  <h4 className='text-[18px] inline-flex flex-col'>
                    {coinData?.fullName}
                    <span className='text-[14px] text-trans-text'>
                      ({coinData?.shortName})
                    </span>
                  </h4>
                </div>
                <div className="bg-card-bg border border-glass-border p-4 mt-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <LuCircleAlert
                      size={22}
                      className="text-yellow-400 shrink-0 mt-0.5"
                    />
                    <p className="text-[13px] text-trans-text leading-relaxed">
                      Please ensure that the receiving address supports the {coinData?.shortName} network.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* coin modal */}
          <Modal
            isOpen={isOpenSelectCoin}
            onClose={() => setIsOpenSelectCoin(false)}
            title={"Send"}
          >
            <div className='space-y-3'>
              <SearchInput
                placeholder='Search Coin'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
              />
              {coinList
                .filter((coin) => !coin?.isDisable)
                .filter((coin) => {
                  const fullname = coin?.fullName.toLowerCase() || ""
                  const shortName = coin?.shortName.toLowerCase() || ""
                  const s = search.toLowerCase() || ""

                  return fullname.includes(s) || shortName.includes(s)
                })
                .map((coin) => (
                  <div
                    key={coin?.shortName}
                    className="flex justify-between items-center px-3 py-2 cursor-pointer"
                    onClick={() => {
                      setData(coin);
                      setFormData({
                        toAddress: '',
                        amount: '',
                        usdAmount: ''
                      });
                      setIsOpenSelectCoin(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={coin?.coinImageUrl}
                        alt={coin?.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-[15px] text-white">
                          {coin?.fullName}
                        </h4>
                        <p className="text-[14px] text-trans-text">
                          ({coin?.shortName})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-white">{formatToSixDecimals(coin?.balance)}</p>

                      <p className="text-[13px] text-gray-400">
                        ${calculateCoinValue(coin?.balance, coin?.coinValue)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Modal >

          <Modal
            isOpen={isAddressBookOpen}
            onClose={() => setIsAddressBookOpen(false)}
            title={`Address Book (${coinData?.shortName || "-"})`}
          >
            <div className="space-y-3">
              <SearchInput
                placeholder="Search wallet/account/address"
                value={addressBookSearch}
                onChange={(e) => setAddressBookSearch(e.target.value)}
                onClear={() => setAddressBookSearch("")}
              />

              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {addressBookEntries
                  .filter((item) => {
                    const q = addressBookSearch.toLowerCase().trim();
                    if (!q) return true;

                    return (
                      item.walletName?.toLowerCase().includes(q) ||
                      item.accountName?.toLowerCase().includes(q) ||
                      item.address?.toLowerCase().includes(q)
                    );
                  })
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="cursor-pointer rounded-lg border border-borderColor px-3 py-2 hover:bg-card-bg"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, toAddress: entry.address }));
                        setIsAddressBookOpen(false);
                      }}
                    >
                      <p className="text-sm text-white">{entry.walletName} - {entry.accountName}</p>
                      <p className="text-xs text-trans-text break-all">{entry.address}</p>
                    </div>
                  ))}

                {addressBookEntries.length === 0 && (
                  <p className="text-sm text-trans-text">No account address found for selected coin.</p>
                )}
              </div>
            </div>
          </Modal>
        </div >
      </Fade>
    </>
  );
};

export default SendCoin;
