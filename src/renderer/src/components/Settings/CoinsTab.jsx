import { Check, Circle, CircleCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { getCoinsFromDB, updateCoinInDB } from '../../utils/coins.js';
import Image from '../Assets/Image';
import { IoAddCircleOutline } from 'react-icons/io5';
import Modal from '../Modal/Modal';
import { CustomButton } from '../Buttons/AllButtons';

const CoinsTab = () => {
  const [isRefresh, setIsRefresh] = useState(false)
  const [mainCoins, setMainCoins] = useState([])
  const [tokens, setTokens] = useState([])
  const [modal, setModal] = useState({ isOpen: false, modalType: "coin", item: null })
  const [selectedCoin, setSelectedCoin] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCoinsFromDB();
        const allCoins = [...res?.default_coins, ...res?.custom_imported_coins];
        setMainCoins(res?.default_coins);
        setTokens(res?.custom_imported_coins);
      } catch (err) {
        console.error("error in get coins from db", err);
      }
    };

    fetchData();
  }, [isRefresh]);

  const handleToggleCoin = async () => {
    if (!modal.item) return;

    try {
      await updateCoinInDB(modal.item.id, {
        isDisable: !modal.item.isDisable,
      });

      setModal({ isOpen: false, modalType: "", item: null });

      setIsRefresh((prev) => !prev);
    } catch (err) {
      console.error("toggle failed", err);
    }
  };


  return (
    <>
      <div className="space-y-8">
        {/* Coins Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-semibold text-white">Coins</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3">
            {mainCoins.map((coin) => (
              <button
                key={coin.fullName}
                onClick={() =>
                  setModal({
                    isOpen: true,
                    modalType: coin?.isDisable ? "enable" : "disable",
                    item: coin,
                  })
                }
                className="flex items-center justify-between gap-3 p-3 rounded-xl transition bg-white/5 border border-white/10"
              >
                <div className='flex items-center gap-4'>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <Image src={coin.coinImageUrl} alt={coin.fullName} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${coin?.isDisable ? 'text-white/50' : 'text-white'
                      }`}>
                      {coin.fullName}
                    </p>
                  </div>
                </div>

                {!coin?.isDisable ? (
                  <CircleCheck className='w-5 h-5 text-success' />
                ) : (
                  <IoAddCircleOutline className='h-6 w-6 text-white/70 hover:text-white' />
                )}

              </button>
            ))}
          </div>
        </div>

        {/* Tokens Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-semibold text-white">Tokens</h3>
            <button className="text-gray-400 hover:text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 6V8M8 10H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-3">
            {tokens.map((coin) => (
              <button
                key={coin.fullName}
                onClick={() =>
                  setModal({
                    isOpen: true,
                    modalType: coin?.isDisable ? "enable" : "disable",
                    item: coin,
                  })
                }
                className="flex items-center justify-between gap-3 p-3 rounded-xl transition bg-white/5 border border-white/10"
              >
                <div className='flex items-center gap-4'>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <Image src={coin.coinImageUrl} alt={coin.fullName} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{coin.fullName}</p>
                  </div>
                </div>

                {!coin?.isDisable ? (
                  <CircleCheck className='w-5 h-5 text-success' />
                ) : (
                  <IoAddCircleOutline className='h-6 w-6 text-white/70 hover:text-white' />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, modalType: "", item: null })}
        title={
          modal.modalType === "enable"
            ? "Enable Coin"
            : "Disable Coin"
        }
      >
        <div className="space-y-6 text-center">

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12">
              <Image
                src={modal?.item?.coinImageUrl}
                alt={modal?.item?.fullName}
              />
            </div>

            <p className="text-white font-medium">
              {modal?.item?.fullName}
            </p>
          </div>

          <p className="text-sm text-white/70">
            {modal.modalType === "enable"
              ? "Do you want to enable this coin?"
              : "Do you want to disable this coin?"}
          </p>

          <div className="flex gap-3">
            {/* <button
              onClick={() =>
                setModal({ isOpen: false, modalType: "", item: null })
              }
              className="flex-1 py-2 rounded-lg bg-white/10 text-white"
            >
              Cancel
            </button> */}

            {/* <button
              onClick={handleToggleCoin}
              className={`flex-1 py-2 rounded-lg ${modal.modalType === "enable"
                ? "bg-success text-white"
                : "bg-danger text-white"
                }`}
            >
              {modal.modalType === "enable" ? "Enable" : "Disable"}
            </button> */}

            <CustomButton
              onClick={() =>
                setModal({ isOpen: false, modalType: "", item: null })
              }
              variant='glass'
              label={"Cancel"}
            />
            
            <CustomButton
              onClick={handleToggleCoin}
              variant={`${modal.modalType === "enable" ? "primary" : "danger"}`}
              label={modal.modalType === "enable" ? "Enable" : "Disable"}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CoinsTab