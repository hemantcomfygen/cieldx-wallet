import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { CustomButton } from "../Buttons/AllButtons";
import CoinInfoCard from "../Card/CoinInfoCard";
import SearchInput from "../Input/SearchInput";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotFound from "../NotFound/NotFound";

const StakingPage = ({ coinListData }) => {
  const [search, setSearch] = useState("");
  const [coinActive, setCoinActive] = useState(null);
  const navigate = useNavigate();

  const handleCoinDetail = (coin) => {
    navigate(`/app/coin-detail/${coin?.id}`, { state: { coin }, })
  }

  return (
    <div className="space-y-5">


      <div className="flex items-center gap-4">
        <SearchInput
          placeholder="Type coin name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {coinListData.length > 0 ? (
          coinListData
            .filter((coin) => !coin?.isDisable || coin?._id === coinActive)
            .filter((coin) => {
              const name = coin?.fullName?.toLowerCase() || "";
              const short = coin?.shortName?.toLowerCase() || "";
              const s = search?.toLowerCase() || "";

              return name.includes(s) || short.includes(s);
            })
            .map((coin) => (
              <CoinInfoCard
                key={coin?.id}
                imgSrc={coin?.coinImageUrl}
                coinName={coin?.fullName}
                coinShortName={coin?.shortName}
                coinValue={coin?.coinValue}
                profitLoss={coin?.coinMarket}
                numberOfOwnCoin={coin?.balance}
                numberOfOwnCoinValue={coin?.balance}
                // onClick={() =>
                //   navigate(`/app/coin-detail/${coin?._id}`, {
                //     state: { coin },
                //   })
                // }
                onClick={() => handleCoinDetail(coin)}
                address={coin?.address}
              />
            ))
        ) : (
          <NotFound />
        )}
      </div>
    </div>
  );
};

export default StakingPage;