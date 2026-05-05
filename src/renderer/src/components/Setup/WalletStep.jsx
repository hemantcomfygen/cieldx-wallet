import { ArrowLeft } from "lucide-react";

const WalletSelect = ({ onCreateNew, onCreateRecover, onMultiWallet, handleBack }) => {
  return (
    <div className="card md:max-w-3xl w-full mx-auto">
      <button
        className="p-2 rounded-lg hover:bg-white/5 transition"
        onClick={() => handleBack(true, '/')}
      >
        <ArrowLeft className="text-success h-6 w-6" />
      </button>
      <div className="text-center space-y-8 sm:py-8 sm:mx-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-xl md:text-3xl font-light">Create a new wallet or recover one using a wallet backup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
          <button onClick={onCreateNew} className="flex items-center gap-4 p-6 bg-glass-bg border border-glass-border rounded-xl hover:bg-white/10 transition text-left">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-lg font-medium">Create a new wallet</span>
          </button>
          <button onClick={onCreateRecover} className="flex items-center gap-4 p-6 bg-glass-bg border border-glass-border rounded-xl hover:bg-white/10 transition text-left">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-lg font-medium">Recover wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletSelect