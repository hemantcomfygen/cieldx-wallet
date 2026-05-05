const KnowYourTrezor = ({ onSkip }) => {
  return (
    <div className="relative mt-16">
      {/* Continue on Trezor tooltip */}
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-card-bg border border-borderColor px-4 py-2.5 rounded-lg text-sm text-light-text whitespace-nowrap flex items-center gap-2">
          <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Continue on Trezor
        </div>
      </div>

      <div className="card max-w-2xl w-full mx-auto">
        <div className="text-center space-y-8 py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>

          <div>
            <h2 className="text-3xl font-light mb-3">Know your Trezor</h2>
            <p className="text-light-text">
              Learn how to use your device with a short tutorial.
            </p>
          </div>

          <button
            onClick={onSkip}
            className="btn-secondary mt-8 px-12 py-3 text-base"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Video preview in bottom right */}
      <div className="fixed bottom-6 right-6 w-32 h-20 bg-card-bg border border-borderColor rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};


export default KnowYourTrezor