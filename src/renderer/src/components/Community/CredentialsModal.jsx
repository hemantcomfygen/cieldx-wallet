import React, { useMemo, useState } from "react";
import Modal from "../Modal/Modal.jsx";
import CustomButton from "../Buttons/CustomButton.jsx";

export default function CredentialsModal({
  isOpen,
  onClose,
  onSave,
  loading = false,
  error = "",
}) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = useMemo(() => {
    return userName.trim().length >= 3 && password.trim().length >= 4 && !loading;
  }, [userName, password, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onSave({ userName: userName.trim(), password: password.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => { } : onClose}
      title="Set your Community profile"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-gray-400">
          You need a username and password to publish posts.
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Username</label>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. satoshi_01"
            className="w-full rounded-xl bg-white/5 border border-borderColor text-white placeholder:text-gray-500 px-3 py-2.5 outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Choose a password"
            className="w-full rounded-xl bg-white/5 border border-borderColor text-white placeholder:text-gray-500 px-3 py-2.5 outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <CustomButton
            label="Cancel"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            type="button"
          />
          <CustomButton
            label={loading ? "Saving..." : "Save"}
            variant="primary"
            type="submit"
            disabled={!canSubmit}
          />
        </div>
      </form>
    </Modal>
  );
}

