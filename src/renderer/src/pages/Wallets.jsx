import React, { useEffect, useState } from 'react'
import { CustomButton, SemiRoundButton } from '../components/Buttons/AllButtons'
import { BsPinAngle } from 'react-icons/bs';
import { LuCirclePlus } from 'react-icons/lu';
import { MdOutlineFileDownload } from 'react-icons/md';
import { RiCheckboxMultipleLine } from 'react-icons/ri';
import Loader from '../components/Loader/Loader';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { copyToClipboard, localStorageRemoveItem } from '../utils/GlobalFunction';
import Modal from '../components/Modal/Modal';
import PasswordInput from '../components/Input/PasswordInput';
import { FaRegTrashAlt } from 'react-icons/fa';
import NotFound from '../components/NotFound/NotFound';
import { Fade } from 'react-awesome-reveal';
import { FiEye } from 'react-icons/fi';
import { addDerivedAccount, deleteDerivedAccount, generateWallet, setActiveAccount, updateWallet } from '../blockchain/wallets/Wallet.js';
import { deleteEntireDB, getAllFromIndexDB } from '../utils/indexDB.js';
import { decryptData } from '../utils/encryptionFunction.js';
import { getCoinsFromDB } from '../utils/coins.js';

const passphraseLengths = [12, 15, 18, 21, 24];

const Wallets = () => {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [isPassModal, setIsPassModal] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenPassword, setIsOpenPassword] = useState(false)
  const [wallet_id, setWallet_id] = useState(null)
  const [isRefresh, setIsRefresh] = useState(false)
  const [isShowPassPhrase, setIsShowPassPhrase] = useState(false)
  const [password2, setPassword2] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accountBalances, setAccountBalances] = useState({})

  const [walletsData, setWalletsData] = useState([])

  // console.log("walletsData", walletsData)

  const walletImage = 'https://cdn-icons-png.freepik.com/512/6037/6037359.png'
  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/2331/2331941.png'

  const navigate = useNavigate();
  const allWallets = walletsData?.wallets

  const handleGetData = async () => {
    try {
      const response = await getAllFromIndexDB('wallets');
      const decrypt = await decryptData(response[0]?.data)
      setWalletsData(decrypt)
    } catch (error) {
      console.log("error in get data", error)
    }
  }

  useEffect(() => {
    handleGetData()
  }, [isRefresh])

  useEffect(() => {
    const onWalletsUpdated = () => setIsRefresh((prev) => !prev);
    const onCoinsUpdated = () => setIsRefresh((prev) => !prev);

    window.addEventListener("wallets-updated", onWalletsUpdated);
    window.addEventListener("coins-updated", onCoinsUpdated);

    return () => {
      window.removeEventListener("wallets-updated", onWalletsUpdated);
      window.removeEventListener("coins-updated", onCoinsUpdated);
    };
  }, []);

  const rawPassPhrase = wallet_id?.passPhrase

  const passPhrase = typeof rawPassPhrase === "string"
    ? rawPassPhrase.trim().split(/\s+/)
    : [];

  const handleGeneratePassphrase = async (pin, length) => {
    setLoading(true);
    try {
      const res = await generateWallet(pin, length)

      const walletData = res?.wallet;

      toast.success(res?.message || "Wallet created successfully!");
      navigate("/app/backup", { state: { item: walletData } });

    } catch (error) {
      console.error("Passphrase generation error:", error);
      toast.error(error?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = async (wallet, account) => {
    try {
      setLoading(true);

      await setActiveAccount(wallet?.id, account?.id);
      setIsRefresh((prev) => !prev);
      toast.success("Account switched successfully");
      navigate("/app/dashboard");

    } catch (error) {
      toast.error(error?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setIsPassModal(true)
  }


  const handleDeleteAccount = async (wallet, account) => {
    try {
      setLoading(true);
      const res = await deleteDerivedAccount(wallet?.id, account?.id);

      if (res?.success && res?.isLastWalletDeleted) {
        toast.success("Last wallet removed. Resetting app...");
        await new Promise(r => setTimeout(r, 1000));
        await deleteEntireDB();
        localStorageRemoveItem("userId");
        window.location.reload();
        return;
      }

      toast.success("Account deleted successfully");
      setIsRefresh(!isRefresh);
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // const downloadSampleSheet = () => {
  //   const filePath = "/sample_bulk_wallet_import.xlsx";

  //   const link = document.createElement("a");
  //   link.href = filePath;
  //   link.setAttribute("download", "sample-wallet.xlsx");
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const handlePassPhrase = async () => {
    try {
      if (walletsData?.password !== password2) {
        toast.error("Invalid Password")
        return;
      }
      setIsOpenPassword(false)
      setIsShowPassPhrase(true)
    } catch (error) {
      toast.error(error?.message || error)
    }
  }

  const handleWalletBackup = async () => {
    try {

      const res = await updateWallet(wallet_id?.id, { is_backup: true })

      toast.success(res?.data?.message || "Wallet Backup Successfully")
      setWallet_id(null)
      setIsOpenPassword(false)
      setIsShowPassPhrase(false)
      setIsRefresh(!isRefresh);
    } catch (error) {
      toast.error(error?.message || error)
    }
  }

  const handlePinChange = async (value) => {
    setPassword2(value)
  };

  const handleAddAccount = async (wallet) => {
    try {
      setLoading(true);
      const res = await addDerivedAccount(wallet?.id);
      toast.success(`${res?.acc_name || "Account"} created`);
      setIsRefresh(!isRefresh);
      navigate("/app/dashboard");
    } catch (error) {
      toast.error(error?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPassPhrase = async (length) => {
    await handleGeneratePassphrase("", length)
  }

  useEffect(() => {
    const fetchAccountBalances = async () => {
      try {
        const coinsRes = await getCoinsFromDB();
        const allCoins = [
          ...(coinsRes?.default_coins || []),
          ...(coinsRes?.custom_imported_coins || []),
        ].filter((coin) => !coin?.isDisable);

        if (!allCoins.length || !Array.isArray(allWallets)) {
          setAccountBalances({});
          return;
        }

        const balances = {};
        for (const wallet of allWallets) {
          const accounts = (wallet?.accounts || []).filter((acc) => !acc?.is_deleted);
          for (const account of accounts) {
            balances[`${wallet.id}-${account.id}`] = 0;
          }
        }

        for (const coin of allCoins) {
          if (!coin?.accountBalances) {
            if (coin?.wallet_id && coin?.account_id) {
              const key = `${coin.wallet_id}-${coin.account_id}`;
              const coinUsd = Number(coin?.balance || 0) * Number(coin?.coinValue || 0);
              balances[key] = (balances[key] || 0) + coinUsd;
            }
            continue;
          }

          for (const [accId, accData] of Object.entries(coin.accountBalances)) {
            const key = `${accData.wallet_id}-${accId}`;
            const coinUsd = Number(accData.balance || 0) * Number(coin?.coinValue || 0);
            balances[key] = (balances[key] || 0) + coinUsd;
          }
        }

        setAccountBalances(balances);
      } catch (error) {
        console.log("error in account balances", error);
      }
    };

    fetchAccountBalances();
  }, [allWallets]);

  return (
    <Fade triggerOnce delay={100}>
      <Loader loading={loading || isLoading} />
      <section className='space-y-4 md:space-y-8'>
        <div className='flex flex-wrap justify-between items-center gap-3 w-full'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
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
            <h1 className='text-xl font-bold'>All Wallets List</h1>
          </div>
          <div className='flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto'>
            <CustomButton
              label="Create New Wallet"
              className="whitespace-nowrap"
              onClick={() => setIsModalOpen(true)}
              isIcon={true}
              icon={LuCirclePlus}
            />
            <CustomButton
              label="Import Wallet"
              className="whitespace-nowrap"
              isIcon={true}
              icon={MdOutlineFileDownload}
              onClick={handleOpenPasswordModal}
            />
            <CustomButton
              label="Import Multi Wallets"
              className="whitespace-nowrap"
              isIcon={true}
              icon={RiCheckboxMultipleLine}
              onClick={() => navigate("/app/bulk-import")}
            />
            {/* <CustomButton
              label="Import Excel Sample"
              className="whitespace-nowrap"
              isIcon={true}
              icon={LuFileSpreadsheet}
              onClick={downloadSampleSheet}
            /> */}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 md:gap-6'>
          <div className='sm:col-span-2'>
            {/* <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wallet..."
              onClear={() => setSearch("")}
            /> */}
            <div className="mt-4">
              <div className="mb-6">
                <p className="text-sm text-gray-300 mb-2">Software Wallet</p>
                {Array.isArray(allWallets) &&
                  (allWallets.length > 0 ? (
                    allWallets
                      .filter((wallet) => {
                        const walletName = wallet?.wallet_name.toLowerCase() || "";
                        const s = search.toLowerCase()
                        return walletName.includes(s);
                      })
                      .map((wallet, i) => {
                        const accounts = (wallet?.accounts || []).filter((acc) => !acc?.is_deleted);
                        const activeAccount = accounts.find((acc) => acc?.id === wallet?.active_account_id)
                          || accounts.find((acc) => acc?.is_active)
                          || null;

                        return (
                          <div
                            key={i}
                            className={`mb-4 p-2 rounded-xl border ${wallet.is_active ? "border-success/30" : "border-borderColor"} bg-primaryTheme/30`}
                          >
                            <div className="flex items-center justify-between px-2 md:px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                  <img
                                    src={walletImage}
                                    className="h-7 w-7"
                                    alt='image'
                                  />
                                </div>

                                <div className="space-y-1">
                                  <p className="text-sm md:text-[16px] font-medium">
                                    {wallet?.wallet_name}
                                  </p>
                                  <p className="text-xs text-trans-text">
                                    {accounts?.length || 0} Accounts
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 cursor-pointer" >

                                {!wallet?.is_backup && (
                                  <SemiRoundButton
                                    label="Not Backup"
                                    variant='danger'
                                    onClick={() => {
                                      {
                                        setWallet_id(wallet),
                                          setIsOpenPassword(true)
                                      }
                                    }}
                                  />
                                )}

                                <FiEye
                                  className="text-xl text-gray-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/app/wallet-details/${wallet?.id}`);
                                  }}
                                />

                              </div>
                            </div>

                            <div className="px-3 py-5 space-y-4">
                              {accounts.length === 0 ? (
                                <p className="text-xs text-trans-text px-2">No accounts found.</p>
                              ) : (
                                accounts.map((account) => {
                                  const isActiveAccount = wallet.is_active && (account?.id === activeAccount?.id);
                                  const usdBalance = Number(accountBalances[`${wallet.id}-${account.id}`] || 0);
                                  return (
                                    <div
                                      key={account?.id}
                                      className={`flex items-center justify-between px-3 py-2  rounded-lg border ${isActiveAccount ? "border-success/20 bg-success/5" : "border-borderColor hover:bg-card-bg"}`}
                                    >
                                      <div className="flex flex-col gap-1">
                                        <p className="text-sm text-white">{account?.acc_name}</p>
                                        <p className="text-xs text-trans-text">
                                          ${usdBalance.toFixed(2)}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <BsPinAngle
                                          className={`cursor-pointer ${isActiveAccount ? "text-success" : "text-white"}`}
                                          size={18}
                                          onClick={() => handleSelectAccount(wallet, account)}
                                        />
                                        <FaRegTrashAlt
                                          className="text-red-500 cursor-pointer"
                                          size={16}
                                          onClick={() => handleDeleteAccount(wallet, account)}
                                        />
                                      </div>
                                    </div>
                                  );
                                })
                              )}

                              <span
                                className="w-full text-left text-sm text-success px-3 py-2 rounded-lg border border-dashed border-borderColor hover:bg-card-bg cursor-pointer"
                                onClick={() => handleAddAccount(wallet)}
                              >
                                + Add account
                              </span>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <NotFound />
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-borderColor rounded-2xl p-6 flex flex-col items-center text-center space-y-4 max-h-64 md:mt-10">
            <img
              src={defaultImage}
              alt="wallet"
              className="w-24 h-24 opacity-80"
            />

            <h2 className="text-lg font-semibold">Manage Your Wallets</h2>

            <p className="text-sm text-gray-400">
              Create, import, and manage multiple wallets securely in one place.
            </p>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        title="Select Passphrase Length"
      >
        <div className="grid grid-cols-2 gap-3 mt-4">
          {passphraseLengths.map((length) => (
            <button
              key={length}
              onClick={() => handleSelectPassPhrase(length)}
              className="border border-zinc-700 rounded-2xl py-3 text-center hover:bg-zinc-800 transition"
            >
              {length} Words
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={isOpenPassword}
        title="Enter Password?"
        onClose={() => setIsOpenPassword(false)}
      // onConfirm={type === 'passPhrase' ? handlePassPhrase : handlePrivateKey}
      >

        <div className='space-y-4'>
          <PasswordInput length={6} onChange={handlePinChange} />
          <div className='flex items-center gap-4'>
            <CustomButton
              label="Cancel"
              variant="glass"
              onClick={() => setIsOpenPassword(false)}
            />
            <CustomButton
              onClick={handlePassPhrase}
              label="Confirm"
            />
          </div>
        </div>
      </Modal>

      {/* pass phrase modal */}
      <Modal
        isOpen={isShowPassPhrase}
        title="PassPhrase code"
        // onClose={() => setIsShowPassPhrase(false)}
        isClose={false}
      >
        <div className="flex justify-end mb-3" >
          <SemiRoundButton label="Copy" variant="primary" onClick={() => copyToClipboard(rawPassPhrase)} />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {passPhrase?.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2! py-1! bg-card-bg rounded-lg border border-glass-border"
              data-aos="fade-up"
              data-aos-delay={i * 40}
            >
              <div className="w-2 h-7 rounded-md flex items-center justify-center text-xs text-trans-text">
                {i + 1}
              </div>
              <div className="text-sm font-medium text-custom-white truncate">{w}</div>
            </div>
          ))}
        </div>
        <CustomButton
          label="Complete Backup"
          onClick={() => handleWalletBackup()}
        />
      </Modal>


      {/* import wallet password modal */}

      <Modal
        isOpen={isPassModal}
        onClose={() => { setIsPassModal(false), setPassword('') }}
        title="Enter Password"
      >
        <div className='space-y-5'>
          <PasswordInput
            onChange={(e) => setPassword(e)}
            value={password}
          />

          <div className='flex items-center gap-4'>
            <CustomButton
              label="Cancel"
              variant='glass'
              onClick={() => { setIsPassModal(false), setPassword('') }}
            />
            <CustomButton
              label="Next"
              className=""
              disabled={password.length < 6}
              onClick={() => navigate('/app/existing-wallet', { state: { pin: password } })}
            />
          </div>
        </div>
      </Modal>

    </Fade>
  )
}

export default Wallets