const BackupComplete = ({ onContinue }) => {
  return (
    <div className="card max-w-2xl w-full mx-auto">
      <div className="text-center space-y-8 py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-light mb-3">Wallet backup complete</h2>
          <p className="text-light-text max-w-lg mx-auto">
            Your Trezor is nearly ready. Just make sure your wallet backup is
            written down and stored safely—without it, your funds can't be
            recovered.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="btn-primary mt-8 px-12 py-3 text-base"
        >
          Continue to PIN
        </button>
      </div>
    </div>
  );
};

export default BackupComplete;
