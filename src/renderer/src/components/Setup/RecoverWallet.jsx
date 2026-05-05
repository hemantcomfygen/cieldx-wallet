import React, { useState } from "react";

const RecoverWallet = ({ onBack, onRecover }) => {
  const [words, setWords] = useState([]);
  const [input, setInput] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase();

    // Split by space or newline
    const parts = value.split(/\s+/).filter(Boolean);

    if (parts.length > 1) {
      setWords((prev) => {
        const merged = [...prev, ...parts];
        return merged.slice(0, 24);
      });
      setInput("");
    } else {
      setInput(value);
    }
  };

  const removeWord = (index) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const isValid = words.length === 12 || words.length === 24;

  return (
    <div className="max-w-xl mx-auto bg-card-bg border border-borderColor rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm text-trans-text hover:text-white"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold">Recover Wallet</h2>
      </div>

      <p className="text-sm text-trans-text">
        Enter your 12 or 24-word recovery phrase. Words will be added
        automatically.
      </p>

      {/* Input */}
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Paste or type your recovery phrase here"
        rows={3}
        className="w-full bg-transparent border border-borderColor rounded-lg p-3 text-sm outline-none focus:border-white/20 resize-none"
      />

      {/* Words */}
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white/5 border border-white/10"
          >
            <span className="text-white">{index + 1}.</span>
            <span>{word}</span>
            <button
              onClick={() => removeWord(index)}
              className="text-trans-text hover:text-red-400"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Count */}
      <div className="text-xs text-trans-text">
        {words.length} / 12 or 24 words
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          disabled={!isValid}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            isValid
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-white/5 text-trans-text cursor-not-allowed"
          }`}
          onClick={onRecover}
        >
          Recover Wallet
        </button>

        <button
          onClick={() => {
            setWords([]);
            setInput("");
          }}
          className="px-4 py-2 rounded-lg text-sm text-trans-text hover:text-white border border-borderColor"
        >
          Clear
        </button>
      </div>

      {/* Warning */}
      <div className="text-xs text-yellow-400 bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
        Never share your recovery phrase with anyone. Anyone with this phrase
        can access your wallet.
      </div>
    </div>
  );
};

export default RecoverWallet;
