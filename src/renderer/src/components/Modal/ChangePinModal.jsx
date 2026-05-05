import React, { useState } from "react";
import Modal from "./Modal";
import PasswordInput from "../Input/PasswordInput";
import CustomButton from "../Buttons/CustomButton";
import { updateUserPassword } from "../../blockchain/wallets/Wallet";
import toast from "react-hot-toast";

const ChangePinModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Old PIN, 2: New PIN, 3: Confirm New PIN
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const resetState = () => {
        setStep(1);
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        setError("");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleOldPinComplete = (value) => {
        setOldPin(value);
        if (value.length === 6) {
            setStep(2);
        }
    };

    const handleNewPinComplete = (value) => {
        setNewPin(value);
        if (value.length === 6) {
            setStep(3);
        }
    };

    const handleConfirmPinComplete = async (value) => {
        setConfirmPin(value);
        if (value.length === 6) {
            if (value !== newPin) {
                setError("PINs do not match");
                toast.error("PINs do not match");
                setConfirmPin("");
                return;
            }
            
            setLoading(true);
            try {
                await updateUserPassword(oldPin, newPin);
                toast.success("PIN updated successfully");
                handleClose();
            } catch (err) {
                setError(err.message || "Failed to update PIN");
                toast.error(err.message || "Failed to update PIN");
                setStep(1);
                setOldPin("");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Change PIN"
            size="sm"
        >
            <div className="space-y-6 py-4">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                        {step === 1 && "Enter Current PIN"}
                        {step === 2 && "Enter New PIN"}
                        {step === 3 && "Confirm New PIN"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {step === 1 && "Verify your identity by entering your current 6-digit PIN."}
                        {step === 2 && "Choose a new 6-digit PIN for your wallet."}
                        {step === 3 && "Re-enter your new PIN to confirm."}
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    {step === 1 && (
                        <PasswordInput
                            value={oldPin}
                            onChange={handleOldPinComplete}
                            length={6}
                        />
                    )}
                    {step === 2 && (
                        <PasswordInput
                            value={newPin}
                            onChange={handleNewPinComplete}
                            length={6}
                        />
                    )}
                    {step === 3 && (
                        <PasswordInput
                            value={confirmPin}
                            onChange={handleConfirmPinComplete}
                            length={6}
                        />
                    )}

                    {error && (
                        <p className="text-red-500 text-sm mt-4 font-medium animate-shake">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-center gap-3 pt-4">
                    <CustomButton
                        label="Cancel"
                        onClick={handleClose}
                        variant="secondary"
                        className="w-full"
                    />
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </Modal>
    );
};

export default ChangePinModal;
