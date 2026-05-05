import { useState } from "react";
import CustomButton from "../components/Buttons/CustomButton";
import Select from "../components/Select/Select";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleQuestionMark,
  ExternalLink,
  Plus,
  Search,
  X,
} from "lucide-react";
import Input from "../components/Input/Input";
import Modal from "../components/Modal/Modal";
import { useNavigate } from "react-router-dom";

const CryptoBuySell = () => {
  const [activeTab, setActiveTab] = useState("buy");
  const [payAmount, setPayAmount] = useState("");
  const [payCurrency, setPayCurrency] = useState("USD");
  const [buyCrypto, setBuyCrypto] = useState("BTC");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [country, setCountry] = useState("India");
  const [isOpenSelectAsset, setIsOpenSelectAsset] = useState(false);
  const [searchAsset, setSearchAsset] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("all");
  const [isOpenReceiveAccount, setIsOpenReceiveAccount] = useState(false);

  const address = "bc1qea0s0d5g9exampleaddresshere";

  const navigate = useNavigate()

  const currencies = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "INR", label: "INR" },
  ];

  const cryptos = [
    {
      value: "BTC",
      label: "₿ Bitcoin (BTC)",
      icon: "₿",
      name: "Bitcoin",
      symbol: "BTC",
    },
    {
      value: "ETH",
      label: "Ξ Ethereum (ETH)",
      icon: "Ξ",
      name: "Ethereum",
      symbol: "ETH",
      networks: ["Arbitrum One", "Optimism"],
    },
    {
      value: "USDT",
      label: "₮ Tether (USDT)",
      icon: "₮",
      name: "Tether",
      symbol: "USDT",
    },
    { value: "BNB", label: "BNB", icon: "🔶", name: "BNB", symbol: "BNB" },
    {
      value: "LTC",
      label: "Litecoin",
      icon: "Ł",
      name: "Litecoin",
      symbol: "LTC",
    },
    {
      value: "ADA",
      label: "Cardano",
      icon: "₳",
      name: "Cardano",
      symbol: "ADA",
    },
    { value: "SOL", label: "Solana", icon: "◎", name: "Solana", symbol: "SOL" },
  ];

  const paymentMethods = [
    { value: "card", label: "💳 Credit/Debit Card" },
    { value: "bank", label: "🏦 Bank Transfer" },
    { value: "upi", label: "📱 UPI" },
    { value: "wallet", label: "👛 Digital Wallet" },
  ];

  const countries = [
    { value: "India", label: "🇮🇳 India" },
    { value: "USA", label: "🇺🇸 United States" },
    { value: "UK", label: "🇬🇧 United Kingdom" },
    { value: "Germany", label: "🇩🇪 Germany" },
  ];

  const networks = [
    { id: "all", label: "All networks (16)", color: "success" },
    { id: "ethereum", label: "Ethereum", color: "purple" },
    { id: "polygon", label: "Polygon PoS", color: "purple" },
    { id: "bnb", label: "BNB Smart Chain", color: "yellow" },
    { id: "arbitrum", label: "Arbitrum One", color: "blue" },
    { id: "base", label: "Base", color: "blue" },
    { id: "optimism", label: "Optimism", color: "red" },
    { id: "avalanche", label: "Avalanche C-Chain", color: "red" },
    { id: "solana", label: "Solana", color: "purple" },
  ];

  const filteredCryptos = cryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchAsset.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchAsset.toLowerCase())
  );

  return (
    <div className="bg-primaryTheme text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-card-bg-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12 4L6 10L12 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex items-center gap-3">Buy & sell</div>
          </div>

          <button className="text-gray-400 hover:text-white transition text-sm md:text-base">
            Trade history
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-card-bg p-1.5 rounded-xl border border-white/6">
          <button
            onClick={() => setActiveTab("buy")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition ${
              activeTab === "buy"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            + Buy
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition ${
              activeTab === "sell"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            − Sell
          </button>
          <button
            onClick={() => setActiveTab("dca")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition ${
              activeTab === "dca"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🔄 DCA
          </button>
        </div>

        {activeTab === "buy" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Section - Form */}
            <div className="space-y-6">
              {/* Form Card */}
              <div className="bg-card-bg border border-white/6 rounded-xl p-5 md:p-6 space-y-6">
                {/* You Pay */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-400">
                      You pay
                    </label>
                    <span className="text-xs text-success">
                      Enter amount in BTC
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="0.00"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                    </div>
                    <div className="w-28">
                      <Select
                        options={currencies}
                        value={payCurrency}
                        onChange={setPayCurrency}
                        placeholder="USD"
                      />
                    </div>
                  </div>
                </div>

                {/* You Buy */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    You buy
                  </label>
                  <button
                    onClick={() => setIsOpenSelectAsset(true)}
                    className="w-full bg-primaryTheme border border-white/10 rounded-xl px-4 py-3.5 text-left text-white focus:outline-none focus:border-success transition-all flex items-center justify-between hover:border-white/20"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">
                        {cryptos.find((c) => c.value === buyCrypto)?.icon}
                      </span>
                      <span>
                        {cryptos.find((c) => c.value === buyCrypto)?.label}
                      </span>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Receive account */}
                <div className="flex items-center justify-between rounded-xl bg-linear-to-b from-[#1a1d1f] to-[#121416] px-4 py-3 text-white">
                  {/* Left */}
                  <div className="text-sm text-gray-300">Receive account</div>

                  {/* Right */}
                  <div
                    className="flex items-center gap-3"
                    onClick={() => setIsOpenReceiveAccount(true)}
                  >
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        Bitcoin #1
                      </div>
                      <div className="text-xs text-gray-400">{address}</div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card-bg border border-white/6 rounded-xl p-5 md:p-6 space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Payment method
                  </label>
                  <Select
                    options={paymentMethods}
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    placeholder="Select payment method"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Country of residence
                  </label>
                  <Select
                    options={countries}
                    value={country}
                    onChange={setCountry}
                    placeholder="Select country"
                  />
                </div>

                {/* Fee Info */}
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span>See how fees are calculated.</span>
                  <button className="text-success hover:text-success-dark transition inline-flex items-center gap-1">
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 3L9 9M9 9V3M9 9H3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section - Order Summary */}
            <div className="bg-card-bg border border-white/6 rounded-xl p-5 md:p-6 h-fit lg:sticky lg:top-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    You get
                  </label>
                  <div className="flex items-center gap-3 text-3xl md:text-4xl font-bold">
                    <span className="text-[#F7931A]">₿</span>
                    <span>0 BTC</span>
                  </div>
                </div>

                <div className="bg-primaryTheme border border-white/6 rounded-xl p-5">
                  <p className="text-gray-400 text-center text-sm leading-relaxed">
                    Select your assets and amount to search for your best offer.
                  </p>
                </div>

                <CustomButton variant="secondary" size="lg" fullWidth disabled>
                  Buy
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sell" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Section - Form */}
            <div className="space-y-6">
              <div className="bg-card-bg border border-white/6 rounded-xl p-5 md:p-6 space-y-6">
                {/* You Sell */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-400">
                      You Sell
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="0.00"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* You Buy */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-400">
                      You Pay
                    </label>
                    <span className="text-xs text-success">
                      Enter amount in USD
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="0.00"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex gap-3">
                    <div className="p-3 max-w-14  text-base rounded-2xl flex justify-center items-center bg-primaryTheme text-light-text">
                      10%
                    </div>
                    <div className="p-3 max-w-14  text-base rounded-2xl flex justify-center items-center bg-primaryTheme text-light-text">
                      25%
                    </div>
                    <div className="p-3 max-w-14  text-base rounded-2xl flex justify-center items-center bg-primaryTheme text-light-text">
                      50%
                    </div>
                    <div className="p-3 max-w-14  text-base rounded-2xl flex justify-center items-center bg-primaryTheme text-light-text">
                      max
                    </div>
                  </div>
                </div>

                {/* Receive account */}
                <div className="flex items-center justify-between rounded-xl bg-linear-to-b from-[#1a1d1f] to-[#121416] px-4 py-3 text-white">
                  {/* Left */}
                  <div className="text-sm text-gray-300 flex gap-2 items-center">
                    Fee <CircleQuestionMark size={14} />
                  </div>

                  {/* Right */}
                  <div
                    className="flex items-center gap-3"
                   
                  >
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        To be calculated
                      </div>
                    </div>

                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card-bg border border-white/6 rounded-xl p-5 md:p-6 space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Payment method
                  </label>
                  <Select
                    options={paymentMethods}
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    placeholder="Select payment method"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Country of residence
                  </label>
                  <Select
                    options={countries}
                    value={country}
                    onChange={setCountry}
                    placeholder="Select country"
                  />
                </div>

                {/* Fee Info */}
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span>See how fees are calculated.</span>
                  <button className="text-success hover:text-success-dark transition inline-flex items-center gap-1">
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 3L9 9M9 9V3M9 9H3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section - Order Summary */}
            <div className="bg-card-bg border border-white/6 rounded-xl p-5 md:p-6 h-fit lg:sticky lg:top-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 text-3xl md:text-4xl font-bold">
                    <span>0 USD</span>
                  </div>
                </div>

                <div className="bg-primaryTheme border border-white/6 rounded-xl p-5">
                  <p className="text-gray-400 text-center text-sm leading-relaxed">
                    Select your assets and amount to search for your best offer.
                  </p>
                </div>

                <CustomButton variant="secondary" size="lg" fullWidth disabled>
                  Sell
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-borderColor pt-10">
          <div className="text-base text-gray-500 text-center space-y-1">
            <p>
              Invity doesn't provide this service. It's governed by provider's
              Terms & Conditions.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button className="text-gray-400 hover:text-white transition">
                Terms of Use
              </button>
              <span className="text-gray-700">|</span>
              <button className="text-gray-400 hover:text-white transition">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isOpenSelectAsset}
        onClose={() => setIsOpenSelectAsset(false)}
        title="Select Assets"
        size="xl"
      >
        <div className="bg-card-bg border border-white/10 rounded-2xl  max-h-[70vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, symbol, network, or contract address"
                value={searchAsset}
                onChange={(e) => setSearchAsset(e.target.value)}
                className="w-full bg-primaryTheme border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-b border-white/10 min-h-32 overflow-x-auto">
            <div className="flex gap-2 flex-wrap">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => setSelectedNetwork(network.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    selectedNetwork === network.id
                      ? network.color === "success"
                        ? "bg-success text-black"
                        : network.color === "purple"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : network.color === "blue"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : network.color === "red"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {network.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {filteredCryptos.map((crypto) => (
                <button
                  key={crypto.value}
                  onClick={() => {
                    setBuyCrypto(crypto.value);
                    setIsOpenSelectAsset(false);
                    setSearchAsset("");
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-primaryTheme hover:bg-white/5 border border-transparent hover:border-white/10 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition">
                    {crypto.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{crypto.name}</div>
                    <div className="text-sm text-gray-400">{crypto.symbol}</div>
                  </div>
                  {crypto.networks && (
                    <div className="flex gap-2">
                      {crypto.networks.map((net, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400"
                        >
                          {net}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isOpenReceiveAccount}
        onClose={() => setIsOpenReceiveAccount(false)}
        title={"Receive account"}
      >
        <div className="w-full max-w-xl rounded-2xl bg-linear-to-b from-[#1a1d1f] to-[#121416] text-white shadow-lg">
          {/* Account Row */}
          <div className="flex items-center justify-between px-4 py-4 hover:bg-[#1f2225] rounded-t-2xl cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7931a] text-black text-sm font-bold">
                ₿
              </div>

              <span className="text-sm font-medium">Bitcoin #1</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">0 BTC</div>
                <div className="text-xs text-gray-400">$0.00</div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Create New Account */}
          <div className="flex items-center gap-3 px-4 py-4 hover:bg-[#1f2225] cursor-pointer">
            <Plus className="h-5 w-5 text-gray-400" />
            <span className="text-sm">Create a new Bitcoin account</span>
          </div>

          <div className="h-px bg-white/10" />

          {/* Use External Account */}
          <div className="flex items-center gap-3 px-4 py-4 hover:bg-[#1f2225] rounded-b-2xl cursor-pointer">
            <ExternalLink className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-300">
              Use an account (Bitcoin) that isn’t in Trezor Suite.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CryptoBuySell;
