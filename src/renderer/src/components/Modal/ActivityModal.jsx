import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Activity, AlertTriangle, Info } from "lucide-react";
import {
  getActivities,
  markActivityAsRead,
  markAllAsRead,
} from "../../utils/activity";
import { getAllFromIndexDB } from "../../utils/indexDB";
import { decryptData } from "../../utils/encryptionFunction";

const ActivityModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [activities, setActivities] = useState([]);
  const [walletsData, setWalletsData] = useState([]);


  const formatActivity = (tx) => {
    const dateObj = new Date(tx.timestamp);

    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let title = "";
    let description = "";

    if (tx.type === "send") {
      title = `Sent ${tx.amount} ${tx.shortName}`;
      description = `To: ${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}`;
    } else if (tx.type === "receive") {
      title = `Received ${tx.amount} ${tx.shortName}`;
      description = `From: ${tx.from?.slice(0, 6)}...${tx.from?.slice(-4)}`;
    } else if (tx.type === "swap") {
      title = `Swapped ${tx.amount}`;
      description = tx.shortName;
    }

    return {
      ...tx,
      title,
      description,
      date,
      time,
    };
  };

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getAllFromIndexDB("wallets");
        const decrypted = await decryptData(response?.[0]?.data);
        setWalletsData(decrypted?.wallets || []);
      } catch (error) {
        console.log("error in fetching wallets", error);
      }
    };

    fetchWallets();
  }, []);

  const fetchAllActivity = async () => {
    try {
      const res = await getActivities();
      const formatted = res.map(formatActivity);
      setActivities(formatted);
    } catch (error) {
      console.log("error in getActivities", error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAllActivity();
  }, [isOpen]);


  const activeWallet = walletsData.find((wallet) => wallet.is_active);

  const activeAccountId =
    activeWallet?.active_account_id ||
    activeWallet?.accounts?.[0]?.id;

  const filteredActivities = activities.filter(
    (item) =>
      item.wallet_id === activeWallet?.id &&
      item.account_id === activeAccountId
  );

  const notifications = filteredActivities.filter(
    (item) => !item.is_read
  );

  const readActivities = filteredActivities.filter(
    (item) => item.is_read
  );

  const handleMarkAsRead = async (id) => {
    await markActivityAsRead(id);

    setActivities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!activeWallet || !activeAccountId) return;

    await markAllAsRead(activeWallet.id, activeAccountId);

    setActivities((prev) =>
      prev.map((item) =>
        item.wallet_id === activeWallet.id &&
          item.account_id === activeAccountId
          ? { ...item, is_read: true }
          : item
      )
    );
  };

  const renderActivityItem = (item) => (
    <div
      key={item.id}
      className="flex items-start gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
    >

      <div className="mt-1">
        {item.status === "failed" ? (
          <AlertTriangle size={20} className="text-red-500" />
        ) : item.type === "send" ? (
          <Activity size={20} className="text-yellow-400" />
        ) : (
          <Info size={20} className="text-blue-400" />
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm text-white mb-1">{item.title}</p>

        <p className="text-xs text-gray-400 mb-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {item.date} • {item.time}
          </p>

          <div className="flex items-center gap-2">
            {!item.is_read && (
              <button
                onClick={() => handleMarkAsRead(item.id)}
                className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              >
                Mark read
              </button>
            )}

            <span
              className={`text-[10px] px-2 py-1 rounded ${item.status === "success"
                  ? "bg-green-500/20 text-green-400"
                  : item.status === "failed"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
            >
              {item.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activity" size="lg">
      <div className="flex justify-end">
        <button
          onClick={handleMarkAllAsRead}
          className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 text-sm font-medium transition relative ${activeTab === "notifications"
              ? "text-white"
              : "text-gray-400 hover:text-gray-300"
            }`}
        >
          Notifications
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium transition relative ${activeTab === "all"
              ? "text-white"
              : "text-gray-400 hover:text-gray-300"
            }`}
        >
          All activity
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto sidebar-scroll">
        {activeTab === "notifications" && (
          <>
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No new notifications
              </p>
            ) : (
              notifications.map(renderActivityItem)
            )}
          </>
        )}

        {activeTab === "all" && (
          <>
            {readActivities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No activity found
              </p>
            ) : (
              readActivities.map(renderActivityItem)
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default ActivityModal;