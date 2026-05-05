import React, { useEffect, useState } from "react";
import Modal from "../components/Modal/Modal";
import { wallets } from "../constants";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmOnTrezorOverlay from "../components/Modal/TrazorConfirmModal";
import TrezorConfirmModal from "../components/Modal/TrazorConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { calculateCoinValue, copyToClipboard, formatToSixDecimals, localStorageGetItem } from "../utils/GlobalFunction";
import { getAllWalletList, getCoinListOfWallet } from "../redux/slices/AuthSlice";
import Image from "../components/Assets/Image";
import { CustomButton } from "../components/Buttons/AllButtons";
import SearchInput from "../components/Input/SearchInput";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import CryptoQRCode from "../components/QRCode/CryptoQRCode";
import { LuCircleAlert } from "react-icons/lu";
import { Fade } from "react-awesome-reveal";
import { getCoinByIdFromDB, getCoinsFromDB } from "../utils/coins.js";
import defaultIcon from "/coin_default.png"

const Receive = () => {
  const [isOpenSelectCoin, setIsOpenSelectCoin] = useState(false);

  const navigate = useNavigate();

  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [coinData, setCoinData] = useState({})
  const [coinList, setCoinList] = useState([])

  const { id } = useParams();
  const dispatch = useDispatch()
  const selector = useSelector((state) => state?.auth)

  const walletsData = selector?.getAllWalletListData?.data?.data?.list?.wallets;
  const coinDataList = selector?.getCoinListOfWalletData?.data?.data?.list
  const userId = localStorageGetItem("userId");
  const active_wallet = walletsData?.find((w) => w.is_active === true);

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

  // useEffect(() => {
  //   dispatch(getAllWalletList({ user_id: userId }))
  // }, [dispatch, userId, active_wallet?._id]);

  // useEffect(() => {
  //   dispatch(getCoinListOfWallet({ id: active_wallet?._id }))
  // }, [dispatch, active_wallet?._id])

  useEffect(() => {
    if (coinDataList && id) {
      const coinDetails = coinDataList.find((coin) => coin?.blockchains?.coinId === id);
      setData(coinDetails || null);
    }
  }, [coinDataList, id]);

  return (
    <>
      <Fade delay={100} triggerOnce>
        <div className="bg-primaryTheme">
          <div className=" bg-card-bg-50 backdrop-blur-sm max-w-7xl mx-auto px-6 flex items-center gap-4">
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
            <div className="flex items-center justify-between gap-3 w-full">
              <h1>Receive</h1>
              <div>
                <CustomButton
                  onClick={() => setIsOpenSelectCoin(true)}
                  label="Switch"
                  size="sm"
                  className="px-4"
                />
              </div>
            </div>
          </div>
          <div className="my-4 max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row-reverse items-center md:items-start justify-between gap-10">
              <div className="flex flex-col items-center justify-center w-full md:w-auto">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <CryptoQRCode
                    address={coinData?.address}
                    size={150}
                  />
                </div>
              </div>

              <div className="flex-1 w-full max-w-xl">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={coinData?.coinImageUrl}
                    alt={coinData?.fullName}
                    fallbackSrc={defaultIcon}
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <h5 className="text-lg font-semibold text-white">
                      {coinData?.fullName}
                    </h5>
                    <p className="text-sm text-trans-text">
                      {coinData?.shortName}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <p className="text-sm text-trans-text break-all leading-relaxed">
                  {coinData?.address}
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <CustomButton
                    label="Share"
                    variant="transparent"
                  />
                  <CustomButton
                    label="Copy"
                    onClick={() => copyToClipboard(coinData?.address)}
                  />
                </div>
              </div>
            </div>

            {/* Warning Box */}
            <div className="border border-glass-border p-4 mt-8 rounded-lg">
              <div className="flex items-start gap-3">
                <LuCircleAlert
                  size={20}
                  className="text-yellow-300 shrink-0 mt-1"
                />
                <p className="text-sm text-trans-text leading-relaxed">
                  This address can only accept assets on{" "}
                  <span className="text-white font-medium">
                    {coinData?.fullName}
                  </span>.
                  Sending any other types of tokens to this address may result in permanent loss.
                </p>
              </div>
            </div>
          </div>


          <Modal
            isOpen={isOpenSelectCoin}
            onClose={() => setIsOpenSelectCoin(false)}
            title={"Receive"}
          >
            <div className='space-y-3'>
              <SearchInput
                placeholder='Search Coin'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
              />
              {coinList
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
                      setIsOpenSelectCoin(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={coin?.coinImageUrl || defaultIcon}
                        fallbackSrc={defaultIcon}
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

        </div>
      </Fade>
    </>
  );
};

export default Receive;
