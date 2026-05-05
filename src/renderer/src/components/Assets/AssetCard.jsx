import { useNavigate } from "react-router-dom";
import Image from "./Image";
import { calculateCoinValue, formatNumber, formatToSixDecimals } from "../../utils/GlobalFunction";
import defaultIcon from "/coin_default.png"

const AssetCard = ({
  name,
  shortName,
  symbol,
  icon,
  balance,
  amount,
  price,
  change,
  coinId
}) => {
  const isNegative = change < 0;

  const navigate = useNavigate()

  const ownCoinValue = calculateCoinValue(amount, price)

  return (
    <div className="bg-card-bg border border-borderColor rounded-2xl p-5 w-full cursor-pointer"
    // onClick={() => navigate(`/app/coin-detail/${coinId}`)}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
            <Image
              src={icon}
              alt={name}
              fallbackSrc={defaultIcon}
            />
          </div>
          <div>
            <div className="text-md font-medium">{name}</div>
            <div className="text-sm text-zinc-500">{shortName}</div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <div className="text-2xl font-semibold">${ownCoinValue}</div>
        <div className="text-xs text-trans-text">
          {formatToSixDecimals(amount)}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/20 rounded-xl p-4 flex justify-between items-center border border-zinc-800">
        <div className="text-xs space-y-1">
          <div className="text-trans-text">Price</div>
          <div className="text-default-text">${formatNumber(price)}</div>
        </div>

        <div className="text-xs space-y-1 text-right">
          <div className="text-trans-text">7d change</div>
          <div className={isNegative ? "text-red-400" : "text-success"}>
            {isNegative ? "↘" : "↗"} {formatNumber(change)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
