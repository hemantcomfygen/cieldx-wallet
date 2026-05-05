import { useEffect, useState } from "react";
// import Select from "react-select";
import { useSwap } from "../../hooks/useSwap";
import { useTokens } from "../../hooks/useTokens";
import { getBridgerQuote } from "../../core/routeEngine";
// import { useWallet } from "../../hooks/useWallet";
import "./swap.css";
// import { useBalance } from "../../hooks/useBalance";
import { getCoinsFromDB, saveCoinsToDB } from "../../utils/coins";
import { getChainType } from "../../adapters/chainAdapter";
import { getAllFromIndexDB } from "../../utils/indexDB";
import { decryptData } from "../../utils/encryptionFunction";
import { calculateCoinValue } from "../../utils/GlobalFunction";

/* ───────── TOKEN SELECT MODAL ───────── */
const TokenModal = ({ isOpen, onClose, tokens, onSelect, selectedToken }) => {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredTokens = tokens.filter(t =>
    t.shortName.toLowerCase().includes(search.toLowerCase()) ||
    t.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select a token</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-search">
          <input
            type="text"
            placeholder="Search by name or symbol"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="modal-tokens space-y-3">
          {filteredTokens.map(token => (
            <div
              key={`${token.chain}-${token.symbol}`}
              className={`modal-token-item ${selectedToken?.symbol === token.symbol ? 'selected' : ''}`}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              <img src={token.coinImageUrl} alt={token.symbol} className="token-logo" />
              <div className="token-info">
                {/* <div className="token-symbol">{token.symbol}</div> */}
                <div className="token-name">{token.fullName || token.symbol}</div>
              </div>
              {/* <div className="token-chain">{token.chain}</div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ───────── MAIN COMPONENT ───────── */
export default function SwapComponent({ id }) {
  const tokens = useTokens();
  const { swap, loading } = useSwap();

  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [modalType, setModalType] = useState(null); // 'from' or 'to'
  const [slippage, setSlippage] = useState(0.3);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [coinsData, setCoinsData] = useState([])
  const [walletData, setWalletData] = useState([])

  // const mnemonic =
  //   "champion lonely high caution fantasy silk accuse exclude nerve right pear exclude tomorrow vocal leaf pen they ask cherry siege sad detect oxygen sister"
  // const { balance } = useBalance({
  //   address: fromAddress,
  //   token: fromToken,
  // });

  const active_wallet = walletData?.wallets?.find((w) => w.is_active === true);

  const mnemonic = active_wallet?.passPhrase

  const handleGetData = async () => {
    try {
      const response = await getAllFromIndexDB('wallets');
      const decrypt = await decryptData(response[0]?.data)
      setWalletData(decrypt)
    } catch (error) {
      console.log("error in get data", error)
    }
  }

  useEffect(() => {
    if (!id || !coinsData.length || fromToken) return;
    handleGetData();

    const selectedCoin = coinsData.find(
      c => c.id === id || c.coinId === id
    );

    if (selectedCoin) {
      setFromToken(selectedCoin);
    }
  }, [id, coinsData]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCoinsFromDB();
        const allCoins = [...res?.default_coins, ...res?.custom_imported_coins];
        setCoinsData(allCoins);
      } catch (err) {
        console.error("error in get coins from db", err);
      }
    };

    fetchData();
  }, []);

  const toWei = (amt, decimals) =>
    (Number(amt) * 10 ** decimals).toString();

  const handleQuote = async () => {
    try {
      setError("");
      setIsQuoteLoading(true);

      // console.log("fromToken", fromToken);
      // console.log("toToken", toToken);
      // console.log("amount", amount);

      if (!fromToken || !toToken || !amount || Number(amount) === 0) {
        setError("Please fill all fields");
        return;
      }

      if (fromToken.id === toToken.id) {
        setError("Cannot swap same token");
        return;
      }


      const q = await getBridgerQuote({
        fromTokenAddress: fromToken?.swapAddress || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        toTokenAddress: toToken?.swapAddress || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeb",
        amount: toWei(amount, fromToken.decimals),
        fromChain: fromToken.chainType,
        toChain: toToken.chainType,
        userAddr: fromToken.address,
      });

      setQuote(q);
    } catch (err) {
      setError(err.message || "Failed to fetch quote");
    } finally {
      setIsQuoteLoading(false);
    }
  };


  const handleSwap = async () => {
    try {
      setError("");
      setSwapSuccess(false);

      if (!quote) {
        setError("Fetch quote first");
        return;
      }

      await swap({
        mnemonic,
        fromToken,
        toToken,
        amount: amount,
        userAddress: toToken.address,
        quote,
        slippage
      });

      setAmount("");
      setQuote(null);
      setSwapSuccess(true);

      setTimeout(() => setSwapSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Swap failed");
    }
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setQuote(null);
    setError("");
  };

  const formatNumber = (num) => {
    if (!num) return "0.00";
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const getExchangeRate = () => {
    if (!quote || !amount || Number(amount) === 0) return null;
    const rate = Number(quote.toTokenAmount) / Number(amount);
    return rate;
  };

  const getPriceImpact = () => {
    if (!quote) return null;
    // Mock price impact calculation
    return (Math.random() * 0.5).toFixed(2);
  };

  return (
    <>
      <div className="swap-container">
        {/* <div className="swap-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div> */}

        <div className="swap-wrapper">
          {/* Header */}
          <div className="swap-header">
            <div className="header-left">
              <h1>Swap</h1>
              <span className="badge">Cross-chain</span>
            </div>
            <div className="header-right">
              <button
                className={`icon-btn ${showAdvanced ? 'active' : ''}`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="advanced-panel">
              <div className="setting-item">
                <label>Slippage Tolerance</label>
                <div className="slippage-buttons">
                  {[0.1, 0.2, 0.3].map(v => (
                    <button
                      key={v}
                      className={`slippage-option ${slippage === v ? 'active' : ''}`}
                      onClick={() => setSlippage(v)}
                    >
                      {v}%
                    </button>
                  ))}
                  <div className="custom-slippage">
                    <input
                      type="number"
                      value={slippage}
                      onChange={e => setSlippage(Number(e.target.value))}
                      step="0.1"
                      min={0.1}
                      placeholder="Custom"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
              <div className="setting-item">
                <label>Transaction Deadline</label>
                <div className="deadline-input">
                  <input type="number" defaultValue={20} />
                  <span>minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* Swap Card */}
          <div className="swap-card">
            {/* From Section */}
            <div className="swap-section">
              <div className="section-header">
                <span>You pay</span>
                <div className="balance-info">
                  <span>
                    Balance: {fromToken?.balance ? Number(fromToken?.balance) : "--"}
                  </span>
                  <button
                    className="max-btn"
                    onClick={() => fromToken?.balance && setAmount(fromToken?.balance)}
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="section-content">
                <button
                  className="token-selector"
                  onClick={() => setModalType('from')}
                >
                  {fromToken ? (
                    <>
                      <img src={fromToken.coinImageUrl} alt={fromToken.symbol} />
                      <span>{fromToken.fullName}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Select token</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </>
                  )}
                </button>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => {
                      setAmount(e.target.value);
                      setQuote(null);
                    }}
                  />
                  {fromToken && (
                    <span className="usd-value">
                      ≈ ${calculateCoinValue(amount, fromToken?.coinValue)}

                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="swap-arrow-container">
              <div className="arrow-line"></div>
              <button className="swap-arrow-button" onClick={handleFlip}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* To Section */}
            <div className="swap-section">
              <div className="section-header">
                <span>You receive</span>
                {quote && (
                  <span className="exchange-rate">
                    1 {fromToken?.symbol} ≈ {getExchangeRate()?.toFixed(6)} {toToken?.symbol}
                  </span>
                )}
              </div>
              <div className="section-content">
                <button
                  className="token-selector"
                  onClick={() => setModalType('to')}
                >
                  {toToken ? (
                    <>
                      <img src={toToken.coinImageUrl} alt={toToken.fullName} />
                      <span>{toToken.fullName}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Select token</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </>
                  )}
                </button>
                <div className="amount-output">
                  <span className="output-value">
                    {quote ? formatNumber(quote.toTokenAmount) : "0.00"}
                  </span>
                  {quote && toToken && (
                    <span className="usd-value">
                      ≈ ${calculateCoinValue(quote.toTokenAmount, toToken?.coinValue)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Details */}
            {quote && (
              <div className="quote-details">
                <div className="detail-row">
                  <span>Expected output</span>
                  <span>{formatNumber(quote.toTokenAmount)} {toToken?.symbol}</span>
                </div>
                <div className="detail-row">
                  <span>Price impact</span>
                  <span className={Number(getPriceImpact()) < 1 ? 'positive' : 'negative'}>
                    {getPriceImpact()}%
                  </span>
                </div>
                <div className="detail-row">
                  <span>Gas fee</span>
                  <span>{quote.chainFee || "~$2.50"}</span>
                </div>
                <div className="detail-row">
                  <span>Minimum received</span>
                  <span>{quote.depositMin ? formatNumber(quote.depositMin) : "—"} {toToken?.symbol}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Route</span>
                  <span className="route-info">
                    {fromToken?.symbol} → {toToken?.symbol}
                    <span className="route-badge">Best price</span>
                  </span>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="error-message text-wrap break-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            {swapSuccess && (
              <div className="success-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Swap completed successfully!
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="quote-button"
                onClick={handleQuote}
                disabled={isQuoteLoading || !fromToken || !toToken || !amount}
              >
                {isQuoteLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  quote ? "Refresh Quote" : "Get Quote"
                )}
              </button>

              <button
                className="swap-button"
                onClick={handleSwap}
                disabled={loading || !quote}
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  `Swap ${fromToken?.symbol || ''} to ${toToken?.symbol || ''}`
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="swap-footer">
              <div className="footer-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>Secure cross-chain</span>
              </div>
              <div className="footer-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6v12M18 12H6" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>Best rates</span>
              </div>
              <div className="footer-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M16 8l-4-4-4 4M12 4v12" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span>0.1% fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Token Modal */}
        <TokenModal
          isOpen={modalType !== null}
          onClose={() => setModalType(null)}
          tokens={coinsData}
          onSelect={async (token) => {
            if (modalType === 'from') {
              setFromToken(token);
              // await connectFrom({
              //   mnemonic: mnemonic,
              //   chain: token?.chain,
              //   coin: token?.symbol,
              // });

            } else {
              // await connectTo({
              //   mnemonic: mnemonic,
              //   chain: token?.chain,
              //   coin: token?.symbol,
              // });
              setToToken(token);
            }
            setQuote(null);
          }}
          selectedToken={modalType === 'from' ? fromToken : toToken}
        />
      </div>
    </>
  );
}