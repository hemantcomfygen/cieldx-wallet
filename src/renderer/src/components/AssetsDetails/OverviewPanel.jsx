import { FiArrowUpRight } from "react-icons/fi";
import ActionButton from "../Buttons/ActionButton";
import CustomButton from "../Buttons/CustomButton";
import { useNavigate } from "react-router-dom";

const OverviewPanel = ({ coinId, shortName }) => {

  const navigate = useNavigate()

  return (
    <div className="bg-card-bg border border-white/6 rounded-xl p-10 text-center space-y-6">
      <div className="w-14 h-14 mx-auto rounded-full bg-white/6 flex items-center justify-center">
        <FiArrowUpRight className="text-gray-400" size={24} />
      </div>

      <div>
        <h3 className="text-lg font-medium">No transactions</h3>
        <p className="text-sm text-gray-400">
          Get started by receiving or buying {shortName}.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <CustomButton onClick={() => navigate(`/app/receive-coin/${coinId}`)} >Receive {shortName}</CustomButton>
        <CustomButton onClick={() => navigate("/app/cryptoBuySell")}>Buy {shortName}</CustomButton>
      </div>
    </div>
  );
};


export default OverviewPanel