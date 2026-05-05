import { FiCopy } from "react-icons/fi";
import { copyToClipboard, formatNumber, formatToSixDecimals, shortenAddress } from "../../utils/GlobalFunction";

const AssetTabs = ({
  coinAmount,
  usdValue,
  shortName,
  address,
  contractAddress,
  isCustom
}) => {
  const showAddress = isCustom ? contractAddress : address
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-semibold">${formatNumber(usdValue) || "0.00"}</div>
          <div className="text-sm text-gray-400">{formatToSixDecimals(coinAmount) || 0} {shortName}</div>
        </div>
        <div className="">
          <p className="text-sm">Coin Address</p>
          <p className="flex items-center gap-4 cursor-pointer">
            {shortenAddress(showAddress)}
            <FiCopy
              onClick={() =>
                copyToClipboard(showAddress, "Address Copied Successfully")
              }
            />
          </p>
        </div>
      </div>
    </>
  );
};

export default AssetTabs;
