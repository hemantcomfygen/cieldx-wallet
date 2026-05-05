import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Fade } from "react-awesome-reveal";
import { SemiRoundButton } from "../components/Buttons/AllButtons";
import CustomButton from "../components/Buttons/CustomButton";
import { ArrowLeft } from "lucide-react";
import Header from "../components/header/Header";
import { useDispatch } from "react-redux";
import { walletBackup } from "../redux/slices/AuthSlice";
import { localStorageGetItem } from "../utils/GlobalFunction";
import { updateWallet } from "../blockchain/wallets/Wallet.js";

const VerifyWallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const walletData = location?.state?.walletData || {};

  // Fix: Properly split the passphrase string into words
  const words = walletData?.passPhrase
    ? (typeof walletData.passPhrase === 'string'
      ? walletData.passPhrase.split(' ')
      : walletData.passPhrase)
    : [];

  const user_id = localStorageGetItem("userId");
  const wallet_id = walletData?.id

  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize dynamically based on words length - only once
  useEffect(() => {
    if (words.length > 0 && !isInitialized) {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setSelectedWords(Array(words.length).fill(null));
      setIsInitialized(true);
    }
  }, [words, isInitialized]);

  const handleSelect = useCallback((word, index) => {
    setSelectedWords(prevSelected => {
      const firstEmptyIndex = prevSelected.indexOf(null);
      if (firstEmptyIndex === -1) return prevSelected;

      const updatedSelected = [...prevSelected];
      updatedSelected[firstEmptyIndex] = word;
      return updatedSelected;
    });

    setAvailableWords(prevAvailable => {
      const updatedAvailable = [...prevAvailable];
      updatedAvailable[index] = null;
      return updatedAvailable;
    });
  }, []);

  const handleDeselect = useCallback((word, index) => {
    setSelectedWords(prevSelected => {
      const updatedSelected = [...prevSelected];
      updatedSelected[index] = null;
      return updatedSelected;
    });

    setAvailableWords(prevAvailable => {
      const updatedAvailable = [...prevAvailable];
      const firstEmptyIndex = updatedAvailable.indexOf(null);
      if (firstEmptyIndex !== -1) {
        updatedAvailable[firstEmptyIndex] = word;
      }
      return updatedAvailable;
    });
  }, []);

  // Verify phrase match
  useEffect(() => {
    if (words.length === 0 || selectedWords.length === 0) return;

    const matched =
      selectedWords.length === words.length &&
      selectedWords.every((word, index) => word === words[index]);

    setIsCorrect(matched);
  }, [selectedWords, words]);

  const handleVerify = async () => {
    if (!isCorrect) {
      toast.error("Mnemonic phrase does not match");
      return;
    }

    try {
      // const res = await dispatch(walletBackup({ user_id: user_id, wallet_id: wallet_id })).unwrap();

      const res = await updateWallet(wallet_id, { is_backup: true });
      if (!res) {
        toast.error("Something went wrong!");
        return;
      }
      toast.success("Verification Successful");
      navigate("/app/dashboard");
    } catch (error) {
      toast.error(error?.message || "Something went wrong!");
    }
  };

  const clearAll = useCallback(() => {
    setSelectedWords(Array(words.length).fill(null));
    const reshuffled = [...words].sort(() => Math.random() - 0.5);
    setAvailableWords(reshuffled);
  }, [words]);

  return (
    <>
      <Header isButton={false} />
      <Fade triggerOnce direction="left">
        <div className="max-w-4xl mx-auto px-3 my-4 md:my-10">
          <div className="flex item-center justify-start gap-3 md:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/5 transition"
            >
              <ArrowLeft className="text-success h-6 w-6" />
            </button>
            <h3 className="text-lg mt-1 font-semibold">Verify Mnemonic</h3>
          </div>
          <div>
            <p className="text-sm text-center mb-3">
              Select the words in the correct order
            </p>

            {/* Selected Words */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 border-b pb-6 border-glass-border">
              {selectedWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => word && handleDeselect(word, idx)}
                  className="border border-gray-600 rounded-lg py-2 text-sm text-center"
                >
                  {word || idx + 1}
                </button>
              ))}
            </div>

            {/* Clear Button */}
            {selectedWords.some((word) => word !== null) && (
              <div className="flex justify-end mb-4">
                <SemiRoundButton
                  label="Clear"
                  variant="transparent"
                  className="hover:border-success"
                  onClick={clearAll}
                />
              </div>
            )}

            {/* Available Words */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {availableWords.map(
                (word, i) =>
                  word && (
                    <button
                      key={i}
                      onClick={() => handleSelect(word, i)}
                      className="bg-glass-bg border border-glass-border hover:bg-glass-border rounded-lg py-2 text-sm"
                    >
                      {word}
                    </button>
                  )
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CustomButton
              label="Skip"
              className="w-full py-3 rounded-xl"
              variant="secondary"
              onClick={() => {
                toast.error("You have not backed up your wallet");
                navigate("/app/dashboard");
              }}
            />

            <CustomButton
              label="Verify"
              onClick={handleVerify}
              className="w-full py-3 rounded-lg text-center text-white mt-2"
            />
          </div>
        </div>
      </Fade>
    </>
  );
};

export default VerifyWallet;