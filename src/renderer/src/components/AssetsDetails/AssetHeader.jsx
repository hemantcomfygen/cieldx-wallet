import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import CustomButton from "../Buttons/CustomButton";
import { useNavigate } from "react-router-dom";
import Image from "../Assets/Image";
import defaultIcon from "/coin_default.png"

const AssetHeader = ({ coinId, coinImage, coinName, shortName, setIsOpenQrModal }) => {

  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-2">
          <Image
            src={coinImage}
            alt="Bitcoin"
            fallbackSrc={defaultIcon}
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-lg md:text-2xl font-bold">{coinName || "Coin"} <span className="text-sm text-zinc-600">({shortName || "CN"})</span></h1>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {/* <CustomButton
          onClick={() => navigate("/app/cryptoBuySell")}
          variant={"secondary"}
        >
          Buy & sell
        </CustomButton> */}

        <CustomButton
          onClick={() => navigate(`/app/swap/${coinId}`)}
          variant="secondary"
        >
          Swap
        </CustomButton>

        <CustomButton
          onClick={() => navigate(`/app/send-coin/${coinId}`)}
          icon={<FiArrowUpRight />}
        >
          Send
        </CustomButton>

        <CustomButton
          // onClick={() => navigate(`/app/receive-coin/${coinId}`)}
          onClick={() => setIsOpenQrModal(true)}
          icon={<FiArrowDownLeft />}
        >
          Receive
        </CustomButton>
      </div>
    </div>
  );
};


export default AssetHeader