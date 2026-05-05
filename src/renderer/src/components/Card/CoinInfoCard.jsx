import React from 'react'
import Image from '../Assets/Image'
import { calculateCoinValue, formatNumber, formatToSixDecimals } from '../../utils/GlobalFunction'
import defaultIcon from "/coin_default.png"

const CoinInfoCard = ({ imgSrc, coinName = 'Coin', coinShortName = "CN", coinValue = '0', profitLoss = 0, numberOfOwnCoin = 0, numberOfOwnCoinValue = 0, onClick, address }) => {
     const ownCoinValue = calculateCoinValue(numberOfOwnCoinValue, coinValue )

    return (
        <>
            <div className='flex justify-between items-center bg-glass-bg px-2 py-3 rounded-xl border border-borderColor hover:bg-borderColor cursor-pointer' onClick={onClick}>
                <div className='flex gap-3 items-center'>
                    <Image src={imgSrc} alt={coinName} fallbackSrc={defaultIcon} className='h-10' />
                    <div className=''>
                        <h3 className='text-[14px] font-medium flex-wrap'>{coinName} ({coinShortName})</h3>
                        <p className='text-[13px] text-light-text'>${(formatNumber(coinValue))} <span className={`${profitLoss > 0 ? 'text-success' : 'text-danger-light'}`}>{profitLoss > 0 ? '+' : ''}${Number(formatNumber(profitLoss)).toFixed(2)}%</span></p>
                    </div>
                </div>
                <div className='flex flex-col items-end'>
                    <p className='text-[15px]'>{formatToSixDecimals(numberOfOwnCoin)}</p>
                    <p className='text-[15px]'>≈ ${ownCoinValue}</p>
                </div>
            </div>
        </>
    )
}

export default CoinInfoCard