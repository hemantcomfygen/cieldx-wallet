import {
  LayoutDashboard,
  Activity,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WalletHeader from "./WalletHeader";
import WalletHeaderSkeleton from "../Loader/Skeleton/WalletHeaderSkeleton";
import { LuScanSearch } from "react-icons/lu";
import WalletsSidebarSection from "./WalletsSidebarSection";
import { RiUserCommunityLine } from "react-icons/ri";

export default function Sidebar({
  setActivityModalOpen,
  active_wallet,
  active_account,
  totalValue,
  totalValueInBTC,
  allWallets = [],
  onAccountSwitch,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("dashboard")) setActiveTab("dashboard");
    else if (location.pathname.includes("one-missing")) setActiveTab("one-missing");
    else if (location.pathname.includes("community")) setActiveTab("community");
    else if (location.pathname.includes("settings")) setActiveTab("settings");
  }, [location.pathname]);

  return (
    <aside className="w-72 h-full bg-primaryTheme border-r border-borderColor flex flex-col overflow-hidden">
      {/* ── Wallet header (fixed, never scrolls) ── */}
      {!active_wallet ? (
        <WalletHeaderSkeleton />
      ) : (
        <WalletHeader
          active_wallet={active_wallet}
          active_account={active_account}
          totalValue={totalValue}
          totalValueInBTC={totalValueInBTC}
        />
      )}

      {/* ── Navigation (fixed, never scrolls) ── */}
      <div className="p-3 space-y-1 shrink-0">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={activeTab === "dashboard"}
          onClick={() => navigate("/app/dashboard")}
        />
        <SidebarItem
          icon={<LuScanSearch size={18} />}
          label="One Missing"
          active={activeTab === "one-missing"}
          onClick={() => navigate("/app/one-missing")}
        />
        <SidebarItem
          icon={<Activity size={18} />}
          label="Activity"
          active={false}
          onClick={() => setActivityModalOpen(true)}
        />
        <SidebarItem
          icon={<RiUserCommunityLine size={18} />}
          label="Community"
          active={activeTab === "community"}
          onClick={() => navigate("/app/community")}
        />
        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
          active={activeTab === "settings"}
          onClick={() => navigate("/app/settings")}
        />
      </div>

      {/* ── Scrollable wallets section ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll pb-4">
        <WalletsSidebarSection
          allWallets={allWallets}
          onAccountSwitch={onAccountSwitch}
        />
      </div>
    </aside>
  );
}

/* ---------------- Sidebar Item ---------------- */
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition
        ${active
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
