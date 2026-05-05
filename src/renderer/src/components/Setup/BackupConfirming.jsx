import { useEffect } from "react";

 const BackupConfirming = ({ onComplete }) => {
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light mb-3">Create wallet backup</h2>
          <p className="text-light-text max-w-lg mx-auto">
            Your Trezor will display the words of your wallet backup. Write them down accurately and store securely. It's the only way to fully recover your funds.
          </p>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 w-40 h-24 bg-card-bg border border-borderColor rounded-lg overflow-hidden">
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <div className="w-2 h-2 bg-success rounded-full"></div>
          </div>
          <div className="text-xs text-light-text">Recovery seed</div>
        </div>
      </div>
    </div>
  );
};

export default BackupConfirming