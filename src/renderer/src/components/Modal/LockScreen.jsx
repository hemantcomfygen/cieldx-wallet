import React, { useState, useEffect } from "react";
import PasswordInput from "../Input/PasswordInput";
import { decryptData } from "../../utils/encryptionFunction";
import { getFromIndexDB, deleteEntireDB } from "../../utils/indexDB";
import { USER_ID } from "../../utils/config";
import toast from "react-hot-toast";
import Modal from "./Modal";
import CustomButton from "../Buttons/CustomButton";
import Loader from "../Loader/Loader";

const LockScreen = ({ onUnlock }) => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [storedPassword, setStoredPassword] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const fetchPassword = async () => {
            try {
                const userData = await getFromIndexDB("wallets", USER_ID);
                if (userData && userData.data) {
                    const decrypted = decryptData(userData.data);
                    setStoredPassword(decrypted.password);
                }
            } catch (err) {
                console.error("Error fetching password:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPassword();
    }, []);

    const handlePinChange = (value) => {
        setPin(value);
        setError(false);
        if (value.length === 6) {
            if (value === storedPassword) {
                sessionStorage.setItem("isUnlocked", "true");
                onUnlock();
                toast.success("Wallet Unlocked");
            } else {
                setError(true);
                setPin("");
                toast.error("Incorrect PIN");
            }
        }
    };

    const handleResetWallet = async () => {
        setIsResetting(true);
        try {

            setPin("");
            setStoredPassword(null);
            setError(false);
            setIsResetModalOpen(false);

            localStorage.clear();
            sessionStorage.clear();

            await deleteEntireDB();

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (error) {
            console.error("Error during reset:", error);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/";
        }
    };

    if (isLoading) return null;

    return (
        <>
            <Loader loading={isResetting} />
            <div className="fixed inset-0 z-[9999] bg-primaryTheme flex flex-col items-center justify-center p-4">
                <div className={`w-full max-w-md flex flex-col items-center ${error ? "animate-shake" : "animate-in fade-in zoom-in duration-300"}`}>
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-8 border border-success/20">
                        <svg
                            className="w-10 h-10 text-success"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
                    <p className="text-light-text text-center mb-10">
                        Enter your 6-digit PIN to unlock your wallet.
                    </p>

                    <div className="card w-full py-12 px-6 flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-8 text-white tracking-wide">
                            Enter PIN
                        </h3>

                        <PasswordInput
                            length={6}
                            onChange={handlePinChange}
                            className="mt-2"
                            value={pin}
                        />

                        {error && (
                            <p className="text-red-500 text-sm mt-6 font-medium">
                                Wrong PIN. Please try again.
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => setIsResetModalOpen(true)}
                        className="mt-8 text-gray-500 hover:text-white transition text-sm"
                    >
                        Reset Wallet?
                    </button>
                </div>

                <Modal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    title="Reset Wallet"
                    size="sm"
                >
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Are you sure?</h3>
                                <p className="text-gray-400 text-sm">
                                    This action will permanently remove all your wallets and data from this device.
                                    <span className="text-red-400 font-medium block mt-2">This cannot be undone.</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <CustomButton
                                label="Cancel"
                                onClick={() => setIsResetModalOpen(false)}
                                variant="secondary"
                            />

                            <CustomButton
                                label="Reset Everything"
                                onClick={handleResetWallet}
                                variant="danger"
                            />
                        </div>
                    </div>
                </Modal>

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
            </div>
        </>
    );
};

export default LockScreen;
