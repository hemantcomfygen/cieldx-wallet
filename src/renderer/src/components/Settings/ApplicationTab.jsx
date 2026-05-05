import { ExternalLink, Flag, Lock, Shield, Tag, Fingerprint, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import Select from "../Select/Select";
import Toggle from "../Toggle/Toggle";
import CustomButton from "../Buttons/CustomButton";
import Experimental from "./Experimental";
import ChangePinModal from "../Modal/ChangePinModal";
import { getFromIndexDB } from "../../utils/indexDB";
import { USER_ID } from "../../utils/config";
import { decryptData } from "../../utils/encryptionFunction";

const ApplicationTab = () => {
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("******");

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const userData = await getFromIndexDB("wallets", USER_ID);
        if (userData && userData.data) {
          const decrypted = decryptData(userData.data);
          setCurrentPin(decrypted.password);
        }
      } catch (err) {
        console.error("Error fetching PIN:", err);
      }
    };
    fetchPin();
  }, [isChangePinOpen]);


  return (
    <div className="space-y-12 pb-6">
      {/* Security & Privacy Section */}
      <div className="bg-[#1A1B1C] rounded-3xl p-4 md:p-8 border border-white/5 shadow-2xl">
        <div className="flex md:items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center border border-success/20">
            <Lock size={24} className="text-success" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Security & Privacy</h3>
            <p className="text-gray-500">Manage your wallet protection and privacy protocols</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="group relative overflow-hidden flex flex-col md:flex-row gap-3 items-center justify-between p-4 md:p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between md:justify-start w-full gap-3 mb-2">
                <h4 className="text-lg font-semibold text-white">Wallet PIN</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-success/20 text-success font-bold uppercase tracking-widest border border-success/30">Active Protection</span>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                Your 6-digit PIN is required to unlock your wallet.
                Current: <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded ml-1 tracking-wider">{showPin ? currentPin : "••••••"}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPin(!showPin)}
                className="p-3 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white group-hover:scale-110"
                title={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <CustomButton
                variant="primary"
                size="sm"
                onClick={() => setIsChangePinOpen(true)}
                className="shadow-lg shadow-success/20 hover:scale-105 transition-transform"
              >
                Change PIN
              </CustomButton>
            </div>
          </div>

        </div>
      </div>

      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
      />
    </div>
  );
};

export default ApplicationTab;
