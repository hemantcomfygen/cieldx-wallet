import { useEffect } from "react";

 const CreatingWallet = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="card max-w-2xl w-full mx-auto relative mt-16 ">
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-card-bg border border-borderColor px-4 py-2.5 rounded-lg text-sm text-light-text whitespace-nowrap flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin text-success" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Confirm on Trezor
        </div>
      </div>
      <div className="text-center space-y-8 py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light mb-3">Create a new wallet</h2>
          <p className="text-light-text">Trezor will create your wallet based on the selected wallet backup type.</p>
        </div>
      </div>
    </div>
  );
};

export default CreatingWallet