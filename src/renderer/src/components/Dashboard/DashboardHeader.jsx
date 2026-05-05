import { useNavigate } from "react-router-dom";

const DashboardHeader = ({ setIsCoinModal, setIsTokenModal }) => {

  const navigate = useNavigate()

  return (
    <div className="mb-6 space-y-4">
      {/* Top Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Dashboard
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* <button className="btn-secondary text-sm" onClick={() => navigate("/app/cryptoBuySell")}>Buy & sell</button>
          <button className="btn-secondary text-sm" onClick={() => navigate("/app/swap")}>Swap</button>
          <button className="btn-primary text-sm" onClick={() => navigate("/app/send-coin")}>Send</button>
          <button className="btn-primary text-sm" onClick={() => navigate("/app/receive-coin")}>Receive</button>
           */}

          {/* <button className="btn-secondary text-sm" onClick={() => setIsCoinModal({ isOpen: true, type: "buy" })}>Buy & sell</button> */}
          <button className="btn-primary text-sm" onClick={() => setIsCoinModal({ isOpen: true, type: "swap" })}>Swap</button>
          <button className="btn-primary text-sm" onClick={() => setIsCoinModal({ isOpen: true, type: "send" })}>Send</button>
          <button className="btn-primary text-sm" onClick={() => setIsCoinModal({ isOpen: true, type: "receive" })}>Receive</button>
          <button className="btn-primary text-sm" onClick={() => setIsTokenModal(true)}>Import Token</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
