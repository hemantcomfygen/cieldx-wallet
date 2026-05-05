 const WalletCreatedSuccess = ({ onContinue }) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="card">
        <div className="text-center space-y-8 py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-light mb-3">Wallet created successfully</h2>
            <p className="text-light-text max-w-lg mx-auto">
              Now let's create a wallet backup. Your wallet backup is the only way to recover access to your wallet.
            </p>
          </div>
          <button onClick={onContinue} className="btn-primary mt-8 px-12 py-3 text-base">Continue to wallet backup</button>
        </div>
      </div>
      <div className="text-center">
        <button className="btn-secondary px-8 py-2.5 text-sm">Skip wallet backup</button>
      </div>
    </div>
  );
};

export default WalletCreatedSuccess