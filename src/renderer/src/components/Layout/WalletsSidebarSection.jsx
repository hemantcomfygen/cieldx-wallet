import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Wallet, User } from "lucide-react";
import { getCoinsFromDB } from "../../utils/coins.js";
import { setActiveAccount } from "../../blockchain/wallets/Wallet.js";
import toast from "react-hot-toast";

async function buildBalanceMap(wallets) {
  const coinsRes = await getCoinsFromDB();
  const allCoins = [
    ...(coinsRes?.default_coins || []),
    ...(coinsRes?.custom_imported_coins || []),
  ].filter((c) => !c?.isDisable);

  const balanceMap = {};

  for (const wallet of wallets || []) {
    for (const acc of wallet?.accounts || []) {
      if (!acc?.is_deleted) {
        balanceMap[`${wallet.id}-${acc.id}`] = 0;
      }
    }
  }

  for (const coin of allCoins) {
    if (coin?.accountBalances) {
      for (const [accId, accData] of Object.entries(coin.accountBalances)) {
        const key = `${accData.wallet_id}-${accId}`;
        if (key in balanceMap) {
          balanceMap[key] =
            (balanceMap[key] || 0) +
            Number(accData.balance || 0) * Number(coin?.coinValue || 0);
        }
      }
    } else if (coin?.wallet_id && coin?.account_id) {
      const key = `${coin.wallet_id}-${coin.account_id}`;
      if (key in balanceMap) {
        balanceMap[key] =
          (balanceMap[key] || 0) +
          Number(coin?.balance || 0) * Number(coin?.coinValue || 0);
      }
    }
  }

  return balanceMap;
}

export default function WalletsSidebarSection({ allWallets = [], onAccountSwitch }) {
  const navigate = useNavigate();
  const [balanceMap, setBalanceMap] = useState({});
  const [expandedWallets, setExpandedWallets] = useState({});
  const [switching, setSwitching] = useState(null);

  useEffect(() => {
    const activeWallet = allWallets.find(
      (w) => w?.is_active || (w?.accounts || []).some((a) => a?.is_active)
    );
    if (activeWallet) {
      setExpandedWallets((prev) => ({ ...prev, [activeWallet.id]: true }));
    }
  }, [allWallets]);


  useEffect(() => {
    if (!allWallets?.length) return;
    buildBalanceMap(allWallets)
      .then(setBalanceMap)
      .catch((e) => console.error("sidebar balance error", e));
  }, [allWallets]);

  useEffect(() => {
    const refresh = () =>
      buildBalanceMap(allWallets).then(setBalanceMap).catch(console.error);
    window.addEventListener("coins-updated", refresh);
    window.addEventListener("wallets-updated", refresh);
    return () => {
      window.removeEventListener("coins-updated", refresh);
      window.removeEventListener("wallets-updated", refresh);
    };
  }, [allWallets]);

  const toggleWallet = (walletId) =>
    setExpandedWallets((prev) => ({ ...prev, [walletId]: !prev[walletId] }));

  const walletTotal = (wallet) =>
    (wallet?.accounts || [])
      .filter((a) => !a?.is_deleted)
      .reduce((sum, a) => sum + (balanceMap[`${wallet.id}-${a.id}`] || 0), 0);

  const handleSwitchAccount = async (wallet, account) => {
    try {
      setSwitching(`${wallet.id}-${account.id}`);
      await setActiveAccount(wallet.id, account.id);
      toast.success("Account switched");
      onAccountSwitch?.();
      navigate("/app/dashboard");
    } catch (err) {
      toast.error(err?.message || "Switch failed");
    } finally {
      setSwitching(null);
    }
  };

  if (!allWallets?.length) return null;

  return (
    <div className="px-3 pt-3 border-t border-borderColor">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-zinc-400 font-semibold">
          All Wallets
        </p>
        <button
          onClick={() => navigate("/app/wallets")}
          className="text-xs text-success hover:text-success/80 transition cursor-pointer"
        >
          Manage →
        </button>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto sidebar-scroll pr-1 pb-6">
        {allWallets.map((wallet) => {
          const accounts = (wallet?.accounts || []).filter(
            (a) => !a?.is_deleted
          );
          const isOpen = !!expandedWallets[wallet.id];
          const total = walletTotal(wallet);
          const isActive =
            wallet?.is_active || accounts.some((a) => a?.is_active);
          const activeAccId = wallet?.active_account_id;

          return (
            <div key={wallet.id} className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleWallet(wallet.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition group
                  ${isActive
                    ? "border border-success/40 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className="text-gray-500 group-hover:text-gray-300 transition shrink-0">
                  {isOpen ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                </span>

                <span
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                    ${isActive ? "bg-success/20" : "bg-white/10"}`}
                >
                  <Wallet size={12} className={isActive ? "text-success" : "text-gray-400"} />
                </span>

                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium truncate leading-tight">
                    {wallet?.wallet_name}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <span
                  className={`text-[11px] font-semibold shrink-0 ${isActive ? "text-success" : "text-gray-400"
                    }`}
                >
                  ${total.toFixed(2)}
                </span>
              </button>

              {isOpen && accounts.length > 0 && (
                <div className="ml-4 mt-0.5 space-y-1 border-l border-borderColor pl-2">
                  {accounts.map((acc) => {
                    const key = `${wallet.id}-${acc.id}`;
                    const accBal = balanceMap[key] || 0;
                    const isAccActive =
                      isActive && acc.id === activeAccId;
                    const isSwitching = switching === key;

                    return (
                      <button
                        key={acc.id}
                        onClick={() => handleSwitchAccount(wallet, acc)}
                        disabled={isSwitching || isAccActive}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 mt-2 rounded-md transition text-left
                          ${isAccActive
                            ? "border border-success/20 text-success cursor-default"
                            : "text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer"
                          }`}
                      >
                        <span
                          className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                            ${isAccActive ? "bg-success/20" : "bg-white/5"}`}
                        >
                          <User size={10} className={isAccActive ? "text-success" : "text-gray-500"} />
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate leading-tight">
                            {acc?.acc_name}
                          </p>
                        </div>

                        <span
                          className={`text-[10px] shrink-0 font-medium ${isAccActive ? "text-success" : "text-gray-500"
                            }`}
                        >
                          {isSwitching ? "…" : `$${accBal.toFixed(2)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
