import { calculateCoinValue } from "../../utils/GlobalFunction";
import AssetCard from "./AssetCard";

const MyAssets = ({ balanceCoin }) => {

  const topAssets = Array.isArray(balanceCoin)
    ? balanceCoin
      .filter(
        (coin) =>
          coin?.balance > 0 &&
          coin?.coinValue > 0
      )
      .sort((a, b) => {
        const aValue = calculateCoinValue(
          a?.balance,
          a?.coinValue
        );

        const bValue = calculateCoinValue(
          b?.balance,
          b?.coinValue
        );

        return bValue - aValue; // descending
      })
      .slice(0, 3)
    : [];

  //   console.log("topAssets", topAssets)

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium">My assets</h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {Array.isArray(topAssets) && topAssets?.map((coin, index) => (
          <AssetCard
            key={index}
            coinId={coin?.id}
            name={coin.fullName}
            shortName={coin.shortName}
            symbol={coin.symbol}
            icon={coin?.coinImageUrl}
            balance={coin.balance}
            amount={coin.balance}
            price={coin?.coinValue}
            change={coin?.coinMarket}
          />
        ))}

      </div>
    </div>
  );
};

export default MyAssets;
