import React, { useState } from 'react'
import CryptoQRCode from '../QRCode/CryptoQRCode'
import Image from '../Assets/Image'
import { CustomButton } from '../Buttons/AllButtons'
import { LuCircleAlert } from 'react-icons/lu'
import Modal from '../Modal/Modal'
import { FiCopy } from 'react-icons/fi'
import { copyToClipboard, formatToSixDecimals, shortenAddress } from '../../utils/GlobalFunction'
import { useInternalAddresses } from '../../hooks/useInternalTransfer'
import { useNavigate } from 'react-router-dom'
import { GoArrowDown } from "react-icons/go";
import defaultIcon from "/coin_default.png"

const ReceiveModal = ({
    isOpen,
    onClose,
    title = "Receive",
    coinName,
    coinShortName,
    coinImageUrl,
    coinAddress,
    contractAddress,
    isCustom,
    coinData
}) => {

    const navigate = useNavigate();
    const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);

    const showAddress = isCustom ? contractAddress : coinAddress

    const { internalAddresses, hasInternalTransfer } = useInternalAddresses(coinData);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={title}
            >
                <>
                    <div className="py-2">
                        <div className="flex flex-col gap-3 md:gap-6">

                            <div className="flex items-center gap-4 mb-4">
                                <Image
                                    src={coinImageUrl}
                                    alt={coinName}
                                    fallbackSrc={defaultIcon}
                                    className="h-10 w-10 md:w-12 md:h-12 rounded-full"
                                />

                                <div>
                                    <h5 className="text-lg font-semibold text-white">
                                        {coinName}
                                    </h5>
                                    <p className="text-sm text-trans-text">
                                        {coinShortName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center w-full md:w-auto">
                                <div className="bg-white rounded-xl p-2 md:p-3 shadow-sm">
                                    <CryptoQRCode
                                        address={showAddress}
                                        size={180}
                                    />
                                </div>
                            </div>

                            <p className="flex md:items-center justify-center gap-4 cursor-pointer text-zinc-400 text-sm text-wrap break-all">
                                {showAddress}
                                <FiCopy size={18}
                                    onClick={() =>
                                        copyToClipboard(showAddress, "Address Copied Successfully")
                                    }
                                />
                            </p>
                        </div>

                        {/* Warning Box */}
                        <div className="border border-glass-border p-4 mt-3 md:mt-8 rounded-lg">
                            <div className="flex items-start gap-3">
                                <LuCircleAlert
                                    size={20}
                                    className="text-yellow-300 shrink-0 mt-1"
                                />
                                <p className="text-sm text-trans-text leading-relaxed">
                                    This address can only accept assets on{" "}
                                    <span className="text-white font-medium">
                                        {coinName}
                                    </span>.
                                    Sending any other types of tokens to this address may result in permanent loss.
                                </p>
                            </div>
                        </div>

                        {hasInternalTransfer && (
                            <div className="mt-4 flex justify-center">
                                <CustomButton
                                    isIcon={true}
                                    icon={GoArrowDown}
                                    label="Deposit from another wallet"
                                    onClick={() => setIsInternalModalOpen(true)}
                                    className="px-4 py-2"
                                />
                            </div>
                        )}
                    </div>
                </>
            </Modal>

            <Modal
                isOpen={isInternalModalOpen}
                onClose={() => setIsInternalModalOpen(false)}
                title="Select Wallet"
            >
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {internalAddresses.length === 0 ? (
                        <p className="text-center text-sm text-gray-400">
                            No internal wallets found
                        </p>
                    ) : (
                        internalAddresses
                            .sort((a, b) => Number(b.hasBalance) - Number(a.hasBalance))
                            .map((item) => (
                                <div
                                    key={item.address}
                                    onClick={() => {
                                        setIsInternalModalOpen(false);

                                        navigate(`/app/send-coin/${coinData.id}`, {
                                            state: { item: item },
                                        });
                                    }}
                                    className="cursor-pointer rounded-lg border border-white/10 p-3 hover:bg-white/5 transition"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-white">
                                                {item.walletName} - {item.accountName}
                                            </p>

                                            <p className="text-xs text-gray-400 break-all">
                                                {shortenAddress(item.address)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p
                                                className={`text-sm ${item.hasBalance
                                                    ? "text-green-400"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {formatToSixDecimals(item.balance)} {coinShortName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </Modal>
        </>
    )
}

export default ReceiveModal