import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { calculateCoinValue, copyToClipboard, formatDateTime, formatNumber, formatToSixDecimals, localStorageGetItem, localStorageRemoveItem } from '../utils/GlobalFunction';
import { editWalletName, getAddressAndBalanceOfPassphraseV2, getAllWalletList, getPassPhraseOfWallet, getPrivateKeOfWallet, getWalletOfUser, removeWallet } from '../redux/slices/AuthSlice';
import toast from 'react-hot-toast';
import { Fade } from 'react-awesome-reveal';
import { AiOutlineExclamationCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { IoIosArrowBack } from 'react-icons/io';
import Image from '../components/Assets/Image';
import { TbEdit } from 'react-icons/tb';
import { CustomButton, SemiRoundButton } from '../components/Buttons/AllButtons';
import Modal from '../components/Modal/Modal';
import PasswordInput from '../components/Input/PasswordInput';
import SearchInput from '../components/Input/SearchInput';
import { PiWarning } from 'react-icons/pi';
import CryptoQRCode from '../components/QRCode/CryptoQRCode';
import Input from '../components/Input/Input';
import Loader from '../components/Loader/Loader';
import { deleteWalletFromDB, getWalletById, updateWallet } from '../blockchain/wallets/Wallet';
import { deleteEntireDB, getAllFromIndexDB } from '../utils/indexDB';
import { getCoinByIdFromDB, getCoinsFromDB } from '../utils/coins';
import { decryptData } from '../utils/encryptionFunction';

const WalletDetails = () => {

    const [showRemove, setShowRemove] = useState(false);
    const [isOpenEditWallet, setIsOpenEditWallet] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [isOpenPassword, setIsOpenPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const [isShowPassPhrase, setIsShowPassPhrase] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [type, setType] = useState('passPhrase')
    const [coinId, setCoinId] = useState(null)
    const [privateKeyModal, setPrivateKeyModal] = useState({ isOpen: false, item: null })
    const [walletName, setWalletName] = useState('')
    const [isRefresh, setIsRefresh] = useState(false)
    const [walletData, setWalletData] = useState(null)
    const [coinsData, setCoinsData] = useState([])
    const [userData, setUserData] = useState({})

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const user_id = localStorageGetItem("userId")

    const passPhrase = typeof walletData?.passPhrase === "string"
        ? walletData?.passPhrase.trim().split(/\s+/)
        : [];

    const totalValue = coinsData?.reduce((acc, coin) => {
        return acc + (coin?.balance * coin?.coinValue || 0);
    }, 0);

    const btcItem = coinsData.find((btc) => btc?.shortName === "BTC");

    const btcPriceUSD = btcItem?.coinValue || 0

    const totalValueInBTC =
        btcPriceUSD && Number.isFinite(totalValue)
            ? (totalValue / btcPriceUSD).toFixed(5)
            : "0.00";

    const fetchData = async () => {
        try {
            const res = await getCoinsFromDB();
            const allCoins = [...res?.default_coins, ...res?.custom_imported_coins];
            setCoinsData(allCoins);
        } catch (err) {
            console.error("error in get coins from db", err);
        }
    };

    const fetchWallet = async () => {
        try {
            const res = await getWalletById(id)
            setWalletData(res)
        } catch (error) {
            console.log("error in fetch wallet", error)
        }
    }

    const handleGetData = async () => {
        try {
            const response = await getAllFromIndexDB('wallets');
            const decrypt = await decryptData(response[0]?.data)
            setUserData(decrypt)
        } catch (error) {
            console.log("error in get data", error)
        }
    }

    useEffect(() => {
        fetchData();
        fetchWallet();
        handleGetData();
    }, [id, isRefresh])

    // console.log("walletData", walletData)

    const handlePassPhrase = async () => {
        if (userData?.password !== password) {
            toast.error("Invalid Password")
            return
        }
        setIsShowPassPhrase(true)
    }

    const handlePrivateKey = async () => {
        try {   
            if (userData?.password !== password2) {
                toast.error("Invalid Password")
                return
            }

            const coin = await getCoinByIdFromDB(coinId);
            setIsOpenPassword(false)
            setPrivateKeyModal({ isOpen: true, item: coin?.privateKey })
        } catch (error) {
            toast.error(error?.message || error)
        }
    }

    const handleRemoveWallet = async () => {
        try {
            const res = await deleteWalletFromDB(id);

            if (res?.success && res?.isLastWalletDeleted) {
                await new Promise(r => setTimeout(r, 100));
                await deleteEntireDB();

                localStorageRemoveItem("userId");
                window.location.reload();
            }

            toast.success("Wallet deleted successfully");
            navigate("/app/dashboard");
            setShowRemove({ isOpen: false, wallet_id: null });
            setIsRefresh(!isRefresh)


        } catch (error) {
            toast.error(error?.message || "Something went wrong");
        }
    };

    const handleEditWalletName = async () => {
        setIsLoading(true)
        const res = await updateWallet(id, { wallet_name: walletName })
        setIsLoading(false)
        toast.success(res?.data?.message || "Successfully Wallet Name Update")
        setIsRefresh((prev) => !prev)
        setWalletName('')
        setIsOpenEditWallet(false)
    };

    const handlePinChange = async (value) => {
        type === "passPhrase" ? setPassword(value) : setPassword2(value)
    };

    const iconImage = "https://cdn-icons-png.freepik.com/512/6037/6037359.png"

    return (
        <>
            <Loader loading={isLoading} />
            <Fade triggerOnce delay={100}>
                <section className='space-y-6'>
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
                        <h1 className='text-xl font-bold tracking-wide'>Wallet Details</h1>
                    </div>

                    <section className="max-w-7xl mx-auto sm:px-6 md:py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                                    <div className="flex flex-col sm:flex-row items-center justify-between">
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <div className="h-20 w-20 md:w-24 md:h-24 rounded-full bg-green-50 flex items-center justify-center">
                                                <Image
                                                    src={iconImage}
                                                    className="w-14 h-14"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-2xl font-semibold capitalize">
                                                        {walletData?.wallet_name || "N/A"}
                                                    </h2>
                                                    <TbEdit
                                                        size={20}
                                                        className="text-success cursor-pointer"
                                                        onClick={() => setIsOpenEditWallet(true)}
                                                    />
                                                </div>

                                                {/* <div className="flex items-center gap-2">
                                                    <p className="text-zinc-400 text-sm">Total Balance</p>
                                                    <p className="text-lg font-semibold text-success">
                                                        ${formatNumber(totalValue)}
                                                    </p>
                                                </div> */}
                                            </div>
                                        </div>


                                        {!walletData?.is_backup && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                                </span>
                                                <span className="text-xs text-red-400">Backup required</span>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <Row label="Created By" value="Mnemonic Phrase" />
                                    <Row label="Created Time" value={formatDateTime(walletData?.createdAt)} />
                                    <Row label="Security Suffix" value="29K" icon />
                                </div>

                            </div>

                            {/* RIGHT SIDE */}
                            <div className="space-y-6">

                                {/* Actions Card */}
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-lg font-semibold mb-4">Security Actions</h3>

                                    <ActionRow
                                        label="Export Passphrase"
                                        onClick={() => {
                                            setType("passPhrase");
                                            setIsOpenPassword(true);
                                        }}
                                    />

                                    <ActionRow
                                        label="Export Private Key"
                                        onClick={() => {
                                            setType("privateKey");
                                            setIsModalOpen(true)
                                        }}
                                    />
                                </div>


                                <CustomButton
                                    onClick={() => setShowRemove(true)}
                                    variant="danger"
                                    label="Remove Wallet"
                                    size='lg'
                                />
                            </div>

                        </div>
                    </section>
                </section>
            </Fade>

            {/* remove wallet */}
            <Modal
                isOpen={showRemove}
                onClose={() => setShowRemove(false)}
                title="Remove Wallet"
            >
                <>
                    <div className='space-y-5'>
                        <div className="flex justify-center flex-col items-center text-center text-sm">
                            <AiOutlineExclamationCircle size={30} className="mb-2 text-yellow-400" />
                            Your wallet has not been backed. Losing the mnemonic phrase will
                            result in asset loss. We strongly recommend that you back up the
                            mnemonic phrase before deleting wallet
                        </div>
                        <div className='flex items-center gap-4'>
                            <CustomButton
                                label="Cancel"
                                variant="glass"
                                onClick={() => setShowRemove(false)}
                            />
                            <CustomButton
                                onClick={() => handleRemoveWallet()}
                                variant="danger"
                                label="Remove"
                            />
                        </div>
                    </div>
                </>
            </Modal>

            {/* password modal */}
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
                            onClick={type === 'passPhrase' ? handlePassPhrase : handlePrivateKey}
                            label="Confirm"
                        />
                    </div>
                </div>
            </Modal>

            {/* pass phrase modal */}
            <Modal
                isOpen={isShowPassPhrase}
                title="PassPhrase code"
                onClose={() => setIsShowPassPhrase(false)}
            >
                <div className="flex justify-end mb-3" >
                    <SemiRoundButton label="Copy" variant="primary" onClick={() => copyToClipboard(walletData?.passPhrase)} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {passPhrase.map((w, i) => (
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
            </Modal>

            {/* coin list modal  */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Export Private Key"
            >
                <div className='space-y-3'>
                    <SearchInput
                        placeholder='Search Coin'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClear={() => setSearch('')}
                    />
                    {coinsData
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
                                className="flex justify-between items-center px-3 py-2 cursor-pointer border border-borderColor rounded-lg"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setCoinId(coin?.id)
                                    setType('privateKey')
                                    setIsOpenPassword(true)
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
            </Modal>

            {/* private Key Modal */}

            <Modal
                isOpen={privateKeyModal.isOpen}
                title="Private Key"
                onClose={() => setPrivateKeyModal({ isOpen: false, item: null })}
            >
                <>
                    <div className='space-y-3'>
                        <div className="text-yellow-light border border-borderColor p-4 mt-4 bg-card-bg rounded-lg">
                            <div className="flex items-start gap-3">
                                <PiWarning size={22} className=" shrink-0 mt-0.5" />
                                <p className="text-[13px] leading-relaxed">
                                    Never disclose this key. Anyone with your private keys can steal any assets held in your account.
                                </p>
                            </div>
                        </div>

                        <div className='flex flex-col items-center justify-center gap-4 p-5 bg-card-bg rounded-lg'>
                            <div className='bg-white rounded-xl p-1'>
                                <CryptoQRCode
                                    address={privateKeyModal.item}
                                    size={180}
                                />
                            </div>
                            <p className='text-[13px] text-trans-text text-wrap break-all'>{privateKeyModal.item}</p>
                        </div>

                        <div className='flex items-center gap-3 mt-5'>
                            <CustomButton
                                label="Copy Private Key"
                                onClick={() => copyToClipboard(privateKeyModal.item)}
                            />
                        </div>

                        <div className='mt-10 text-sm text-trans-text space-y-2'>
                            <p><span>1.</span> Do not take screenshots of your private key to avoid unauthorized access.</p>
                            <p><span>2.</span> Do not share your private key with anyone to keep your assets secure.</p>
                            <p><span>3.</span> Store your private key in a secure location to prevent loss or theft.</p>
                        </div>
                    </div>
                </>
            </Modal>

            <Modal
                isOpen={isOpenEditWallet}
                title="Edit Wallet"
                onClose={() => { setIsOpenEditWallet(false), setWalletName('') }}
            >
                <>
                    <div className='space-y-5'>
                        <Input
                            placeholder="Enter Wallet Name"
                            name="walletName"
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                        />
                        <CustomButton
                            label="Save"
                            disabled={!walletName}
                            onClick={() => handleEditWalletName()}
                        />

                    </div>
                </>
            </Modal>


        </>
    )
}

export default WalletDetails


const Row = ({ label, value, icon }) => (
    <div className="flex justify-between py-2 border-b border-borderColor last:border-0">
        <p>{label}</p>
        <div className="flex items-center gap-1 text-gray-300">
            {icon && <AiOutlineQuestionCircle size={15} />}
            <p>{value}</p>
        </div>
    </div>
);


const ActionRow = ({ label, right, icon, onClick }) => (
    <div className="flex justify-between items-center py-3 border-b border-borderColor last:border-0 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-1">
            {icon && <AiOutlineQuestionCircle size={15} className="text-gray-400" />}
            <p>{label}</p>
        </div>
        {right || <IoIosArrowBack className="rotate-180 text-gray-400" />}
    </div>
);