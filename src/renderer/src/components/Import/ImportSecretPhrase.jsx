import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getExistingWallet } from "../../redux/slices/AuthSlice";
import toast from "react-hot-toast";
import {
  localStorageGetItem,
  localStorageSetItem,
} from "../../utils/GlobalFunction";
import Loader from "../Loader/Loader";
import CustomButton from "../Buttons/CustomButton";
import { ArrowLeft } from "lucide-react";
import PassPhraseWordList from "../../constants/PassPhraseWord";
import { USER_ID } from "../../utils/config.js";
import { generateWallet } from "../../blockchain/wallets/Wallet.js";

const ImportSecretPhrase = ({ handleBack, pin }) => {
  const [phraseWords, setPhraseWords] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const user_id = localStorageGetItem("userId");

  // Function to filter suggestions based on input
  const getSuggestions = (text) => {
    if (!text.trim()) return [];
    const filtered = PassPhraseWordList.filter(word =>
      word.toLowerCase().startsWith(text.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
    return filtered;
  };

  const handleTextChange = (text) => {
    if (phraseWords.length >= 24) {
      setInputValue("");
      setSuggestions([]);
      return;
    }

    const words = text.trim().split(/\s+/);

    if (words.length > 1) {
      const remainingSlots = 24 - phraseWords.length;
      const validWords = words.slice(0, remainingSlots);
      setPhraseWords((prev) => [...prev, ...validWords]);
      setInputValue("");
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    } else {
      setInputValue(text);
      // Get suggestions based on current input
      const newSuggestions = getSuggestions(text);
      setSuggestions(newSuggestions);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (phraseWords.length < 24) {
      setPhraseWords((prev) => [...prev, suggestion]);
      setInputValue("");
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    }
    // Enter key
    else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    }
    // Space bar - add current word
    else if (e.key === " " && inputValue.trim()) {
      e.preventDefault();
      const newWord = inputValue.trim();
      if (newWord.length > 0 && phraseWords.length < 24) {
        setPhraseWords((prev) => [...prev, newWord]);
        setInputValue("");
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }
  };

  const handleRemoveWord = (indexToRemove) => {
    setPhraseWords((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const formattedPassPhrase = phraseWords.join(" ");

  

  const handleProceed = async () => {
    setLoading(true);
    try {
      const res = await generateWallet(pin, phraseWords.length, formattedPassPhrase)

      localStorageSetItem("userId", USER_ID);
      sessionStorage.setItem("isUnlocked", "true");

      toast.success(res?.message || "Wallet import successfully!");
      navigate("/app/dashboard");
      // window.location.reload();
    } catch (error) {
      console.error("Error in getExistingWallet  error:", error);
      toast.error(error?.message || error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader loading={loading} />;

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-6">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => handleBack(false, "", 1, "select")}
            className="p-2 rounded-lg hover:bg-white/5 transition"
          >
            <ArrowLeft className="text-success h-6 w-6" />
          </button>
        </div>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h18a1 1 0 011 1v8a1 1 0 01-1 1H3V7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7l13-3v3"
                />
                <circle
                  cx="17"
                  cy="12"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Import Wallet
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Enter your 12 or 24-word secret recovery phrase to restore your wallet securely.
            </p>
          </div>
        </div>
      </div>

      <div className="py-4 px-3 space-y-1 md:space-y-6 relative">
        {/* Input with suggestions above */}
        <div className="relative">
          {/* Suggestions dropdown - positioned above the textarea */}
          {suggestions.length > 0 && inputValue.trim() && (
            <div className="absolute bottom-full left-0 right-0 mb-2  rounded-xl shadow-lg overflow-hidden z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-2 cursor-pointer text-sm transition-colors
                    ${index === selectedSuggestionIndex
                      ? "bg-violet text-white"
                      : "hover:bg-white/10 text-gray-300"
                    }`}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}

          <textarea
            value={inputValue}
            disabled={phraseWords.length >= 24}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tap here to enter your seed phrase (use spaces) or private key."
            className={`w-full p-3 h-24 bg-glass-bg border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 ring-violet transition 
              placeholder:py-2.5 ${phraseWords.length >= 24 ? "opacity-50 cursor-not-allowed" : ""}`}
          />

          {/* Show remaining word count */}
          <div className="absolute top-2 right-3 text-xs text-gray-500">
            {phraseWords.length}/24 words
          </div>
        </div>

        {/* Phrase words grid - BOTTOM section where selected words appear */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-68 overflow-y-auto hide-scrollbar">
          {phraseWords.map((word, index) => (
            <div
              key={index}
              className="bg-glass-bg border border-glass-border rounded-lg px-3 py-2 flex justify-between items-center"
            >
              <span className="text-sm">
                {index + 1}. {word}
              </span>
              <MdClose
                className="text-trans-text hover:text-danger cursor-pointer"
                onClick={() => handleRemoveWord(index)}
              />
            </div>
          ))}
        </div>

        {/* Continue Button - Fixed at bottom */}
        <CustomButton
          onClick={handleProceed}
          label="Continue"
          disabled={phraseWords.length !== 12 && phraseWords.length !== 24}
          className="w-full bg-violet hover:bg-violet-dark text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
};

export default ImportSecretPhrase;