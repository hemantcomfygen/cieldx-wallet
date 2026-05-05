import {
  AlertTriangle,
  Cpu,
  ExternalLink,
  Lock,
  Palette,
  Shield,
  Unplug,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";
import CustomButton from "../Buttons/CustomButton";
import Toggle from "../Toggle/Toggle";
import Select from "../Select/Select";

const DeviceTab = () => {
  const [usePassphrase, setUsePassphrase] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [deviceName, setDeviceName] = useState("Trezor");
  const [autoLock, setAutoLock] = useState("1 minute");

  return (
    <div className="space-y-8">
      {/* Wallet Backup Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Wallet size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Wallet backup</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">
                  Multi-share Backup
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  Create multiple 20-word shares (wordlists) to recover your
                  wallet. Set a minimum number of shares required to regain
                  access to your wallet.
                </p>
                <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                  Learn more <ExternalLink size={14} />
                </button>
              </div>
              <CustomButton variant="primary" size="sm">
                Create
              </CustomButton>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">
                  Check wallet backup
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  Perform a simulated recovery to verify your wallet backup.
                </p>
                <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                  Learn more <ExternalLink size={14} />
                </button>
              </div>
              <CustomButton variant="primary" size="sm">
                Check
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {/* Passphrase Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Lock size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Passphrase</h3>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">
                Use Passphrase wallets
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                Add a passphrase to create a separate, extra-secure wallet. Each
                Passphrase wallet is unique and only accessible with its own
                passphrase.
              </p>
              <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                Learn more <ExternalLink size={14} />
              </button>
            </div>
            <Toggle checked={usePassphrase} onChange={setUsePassphrase} />
          </div>
        </div>
      </div>

      {/* Firmware Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Cpu size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Firmware</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Version</label>
              <span className="text-sm text-gray-400">
                Current firmware version - 2.9.4 (up to date)
              </span>
            </div>
            <CustomButton variant="primary" size="sm" >
              Reinstall
            </CustomButton>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">
                Current firmware type
              </label>
              <span className="text-sm text-white flex items-center gap-2">
                Universal <ExternalLink size={14} />
              </span>
            </div>
            <CustomButton variant="primary" size="sm" >
              Switch to Bitcoin-only
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Security</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">PIN</h4>
                <p className="text-sm text-gray-400">
                  Set a strong PIN to help protect your device from unauthorized
                  access and keep your assets safe.
                </p>
              </div>
              <Toggle checked={pinEnabled} onChange={setPinEnabled} />
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">Change PIN</h4>
                <p className="text-sm text-gray-400">
                  Update your PIN if it has been compromised or if you wish to
                  change it for any reason.
                </p>
              </div>
              <CustomButton variant="primary" size="sm">
                Change
              </CustomButton>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">Safety checks</h4>
                <p className="text-sm text-gray-400">
                  Use safety checks to prevent non-standard transactions. You
                  can temporarily disable them if needed.
                </p>
              </div>
              <CustomButton variant="primary" size="sm">
                Change
              </CustomButton>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">Check device</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Verify your Trezor device to ensure its security and confirm
                  the chip's authenticity.
                </p>
                <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                  Learn more <ExternalLink size={14} />
                </button>
              </div>
              <CustomButton variant="primary" size="sm">
                Check device
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Palette size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Customization</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">Device name</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Select a name up to 16 characters, containing letters only
                  from the English alphabet.
                </p>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  maxLength={16}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <CustomButton variant="primary" size="sm">
                Save name
              </CustomButton>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">Homescreen</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Recommended dimensions: 128×64 px. Image must be purely black
                  and white—no grayscale.
                </p>
                <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                  Homescreen editor <ExternalLink size={14} />
                </button>
              </div>
              <div className="flex gap-2">
                <CustomButton variant="primary" size="sm">
                  Upload
                </CustomButton>
                <CustomButton variant="primary" size="sm">
                  Gallery
                </CustomButton>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">Auto-lock</h4>
                <p className="text-sm text-gray-400">
                  Set the time when your device locks automatically.
                </p>
              </div>

              <Select
                value={autoLock}
                onChange={setAutoLock}
                className="max-w-44"
                options={[
                  { value: "1 minute", label: "1 minute" },
                  { value: "2 minute", label: "2 minute" },
                  { value: "3 minute", label: "3 minute" },
                  { value: "4 minute", label: "4 minute" },
                  { value: "5 minute", label: "5 minute" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Device Connection Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Unplug size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">
            Device connection
          </h3>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">
                Forget this device
              </h4>
              <p className="text-sm text-gray-400">
                Remove all device-related data from Trezor Suite.
              </p>
            </div>
            <CustomButton variant="primary" size="sm">
              Forget
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Danger Area Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Danger area</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">Wipe device</h4>
                <p className="text-sm text-gray-400 mb-3">
                  Wiping the device permanently erases all stored data,
                  including your wallet backup and PIN. Without a wallet backup,
                  any funds on the device will be irrecoverable. Make sure you
                  have your wallet backup before wiping the device, as it is
                  essential for restoring access to your funds. Proceed with
                  caution.
                </p>
              </div>
              <CustomButton variant="danger" size="sm">
                Wipe device
              </CustomButton>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">
                  Set up wipe code
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  A wipe code is an advanced feature that lets you create a
                  "self-destruct" code. When entered on your Trezor, this code
                  securely erases the data stored on the device.
                </p>
                <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                  Learn more <ExternalLink size={14} />
                </button>
              </div>
              <CustomButton variant="danger" size="sm">
                Set up
              </CustomButton>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">
                  Install custom firmware
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  Install custom firmware at your own risk—this will erase your
                  device's memory and could render it unusable. Proceed only if
                  you're absolutely sure.
                </p>
                <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                  Learn more <ExternalLink size={14} />
                </button>
              </div>
              <CustomButton variant="danger" size="sm">
                Install
              </CustomButton>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">
                  Turn off device check
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  Device check is a vital security feature that keeps you safe
                  from potentially using a fake or compromised device. We don't
                  recommend turning it off.
                </p>
                <button className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition">
                  Learn more <ExternalLink size={14} />
                </button>
              </div>
              <CustomButton variant="danger" size="sm">
                Turn off
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceTab;
