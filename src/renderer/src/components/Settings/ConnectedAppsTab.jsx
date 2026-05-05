import { Lock, Shield } from "lucide-react";
import React, { useState } from "react";
import CustomButton from "../Buttons/CustomButton";
import Modal from "../Modal/Modal";

const ConnectedAppsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [connectionString, setConnectionString] = useState("");
  return (
    <>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex items-center gap-4 mb-8">
          <button className="px-4 py-2 bg-white/10 text-white rounded-lg flex items-center gap-2">
            <Shield size={18} />
            WalletConnect
          </button>
          <button className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg flex items-center gap-2">
            <Lock size={18} />
            Trezor Connect
          </button>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">
            No connected apps
          </h3>
          <p className="text-gray-400">
            Use your Trezor with third-party apps and wallets to manage your
            assets.
          </p>
        </div>

        <CustomButton
          variant="primary"
          onClick={() => setShowModal(true)}
          icon={<span>+</span>}
        >
          Add with WalletConnect
        </CustomButton>
      </div>

      {/* Add Connection Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add connection"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-400">
            Paste the connection string from WalletConnect.
          </p>

          <input
            type="text"
            placeholder="WalletConnect string"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5ED49C]/50"
          />

          <div className="flex gap-3">
            <CustomButton
              variant="secondary"
              fullWidth
              onClick={() => setShowModal(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              fullWidth
              disabled={!connectionString}
            >
              Connect
            </CustomButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConnectedAppsTab;
