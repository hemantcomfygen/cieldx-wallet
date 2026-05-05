import { Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function WalletHeader({ active_wallet, active_account, totalValue, totalValueInBTC }) {

  const navigate = useNavigate();
  return (
    <div className="p-4 border-b border-borderColor">
      <div className="bg-card-bg rounded-xl overflow-hidden border border-borderColor">
        {/* Header */}
        <button
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-success" />
            <div className="text-left">
              {/* <div className="flex items-center gap-2"> */}
              <p className="text-sm text-white capitalize">{active_wallet?.wallet_name || "N/A"}</p>
              <p className="text-xs text-success">
                Active: {active_account?.acc_name || "Account 1"}
              </p>


              {!active_wallet?.is_backup && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  <span className="text-xs text-red-400">Backup required</span>
                </div>
              )}

            </div>
          </div>
        </button>

        {/* Expanded Content */}
        <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="border-l-2 border-success pl-3">
            <p className="text-xs text-gray-400">Wallet Balance</p>
            <p className="text-2xl font-semibold text-white">${totalValue ? totalValue?.toFixed(2) : "0"}</p>
            <p className="text-xs mt-1">BTC {totalValueInBTC || "0"}</p>
          </div>

          <button
            onClick={() => navigate("/app/wallets")}
            className="w-full text-xs text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg py-2">
            Manage Wallet
          </button>
        </div>
      </div>
    </div>
  );
}


export default WalletHeader