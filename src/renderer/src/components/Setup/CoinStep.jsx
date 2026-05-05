import { useState } from "react";

const COINS = [
  { id: "btc", name: "Bitcoin", icon: "₿" },
  { id: "eth", name: "Ethereum", icon: "Ξ", sub: "Incl. tokens & staking" },
  { id: "poly", name: "Polygon PoS", icon: "⬡", sub: "Including tokens" },
  { id: "bnb", name: "BNB Smart Chain", icon: "◎", sub: "Including tokens" },
  { id: "arb", name: "Arbitrum One", icon: "A", sub: "Including tokens" },
  { id: "base", name: "Base", icon: "B", sub: "Including tokens" },
  { id: "op", name: "Optimism", icon: "OP", sub: "Including tokens" },
  { id: "sol", name: "Solana", icon: "S", sub: "Incl. tokens & staking" },
  { id: "ada", name: "Cardano", icon: "₳", sub: "Incl. tokens & staking" },
  { id: "etc", name: "Ethereum Classic", icon: "◇", sub: "Including tokens" },
  { id: "xrp", name: "XRP Ledger", icon: "X" },
  { id: "xlm", name: "Stellar", icon: "✦", sub: "Including tokens" },
  { id: "ltc", name: "Litecoin", icon: "Ł" },
  { id: "bch", name: "Bitcoin Cash", icon: "Ƀ" },
  { id: "doge", name: "Dogecoin", icon: "Ð" },
  { id: "zec", name: "Zcash", icon: "Z" },
];

const CoinsStep = ({ onComplete }) => {
  const [selected, setSelected] = useState(["btc", "eth"]);
  const [showTestnets, setShowTestnets] = useState(false);

  const toggleCoin = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-24">
      {/* Header */}
      <div className="text-center mt-6 mb-10">
        <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-success text-xl">≡</span>
        </div>
        <h1 className="text-3xl font-semibold mb-2">Activate coins</h1>
        <p className="text-sm text-light-text">
          Select which coins to show in Trezor Suite. You can change this anytime.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-card-bg border border-borderColor rounded-2xl p-8">
        {/* Coins */}
        <div className="flex flex-wrap gap-3 mb-8">
          {COINS.map((coin) => (
            <button
              key={coin.id}
              onClick={() => toggleCoin(coin.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all
                ${
                  selected.includes(coin.id)
                    ? "bg-success/10 border-success text-success"
                    : "bg-white/5 border-borderColor text-default-text hover:bg-white/10"
                }
              `}
            >
              <div className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[11px]">
                {coin.icon}
              </div>

              <div className="leading-tight text-left">
                <div className="text-xs font-medium">{coin.name}</div>
                {coin.sub && (
                  <div className="text-[9px] text-trans-text">
                    {coin.sub}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Testnet */}
        <div className="border border-borderColor rounded-xl mb-4 overflow-hidden">
          <button
            onClick={() => setShowTestnets(!showTestnets)}
            className="w-full flex justify-between items-center px-5 py-4 hover:bg-white/5 transition"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              Testnet
              <span className="w-4 h-4 rounded-full border border-borderColor text-[10px] flex items-center justify-center text-trans-text">
                ?
              </span>
            </span>
            <span
              className={`transition-transform ${
                showTestnets ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {showTestnets && (
            <div className="px-5 pb-4 border-t border-borderColor">
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  "Bitcoin Testnet",
                  "Ethereum Sepolia",
                  "Ethereum Hoodi",
                  "Solana Devnet",
                  "XRP Testnet",
                  "Stellar Testnet",
                ].map((t) => (
                  <div
                    key={t}
                    className="px-3 py-2 rounded-full bg-white/5 border border-borderColor"
                  >
                    <div className="text-[11px] text-default-text">{t}</div>
                    <div className="text-[9px] uppercase text-trans-text">
                      Test coin
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tor */}
        <div className="border border-borderColor rounded-xl px-5 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              Tor
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-trans-text uppercase">
                Advanced
              </span>
            </span>
            <input type="checkbox" className="toggle toggle-success" />
          </div>

          <p className="text-xs text-trans-text max-w-xl">
            Route all of Trezor Suite’s traffic through the Tor network,
            increasing your privacy and security. It may take some time for Tor
            to load and establish a connection.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={onComplete}
          className="btn-primary px-12 py-3"
        >
          Complete setup
        </button>
      </div>
    </div>
  );
};

export default CoinsStep;
