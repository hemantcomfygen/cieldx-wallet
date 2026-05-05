import { FiCopy, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { copyToClipboard, shortenAddress } from "../../utils/GlobalFunction";

const TransactionList = ({ transaction, onClick }) => {

  const isSent = transaction?.isSent ?? (transaction?.direction === "out");
  const amount = transaction?.amount || transaction?.value || 0;
  const symbol = transaction?.shortName || transaction?.tokenSymbol || "";

  return (
    <div
      onClick={() => onClick(transaction)}
      className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/5 rounded-2xl transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        {/* ICON */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
          {isSent ? <FiArrowUpRight size={20} /> : <FiArrowDownLeft size={20} />}
        </div>

        {/* LEFT INFO */}
        <div className="flex flex-col">
          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
            {isSent ? "Sent" : "Received"} {symbol}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{shortenAddress(transaction?.hash)}</span>
            {transaction?.hash && (
              <FiCopy
                className="cursor-pointer hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(transaction.hash, "Hash copied");
                }}
              />
            )}
          </div>

          <p
            className={`text-[10px] uppercase font-black mt-1 ${transaction?.status === "success"
              ? "text-green-500"
              : transaction?.status === "pending"
                ? "text-yellow-500"
                : "text-red-500"
              }`}
          >
            {transaction?.status || "pending"}
          </p>
        </div>
      </div>

      {/* RIGHT INFO */}
      <div className="text-right flex flex-col items-end">
        <p className={`text-sm font-bold ${isSent ? "text-white" : "text-white"}`}>
          {isSent ? "-" : "+"} {amount} {symbol}
        </p>

        {transaction?.fee && (
          <p className="text-[10px] text-gray-500 mt-1">
            Fee: {transaction.fee}
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionList;