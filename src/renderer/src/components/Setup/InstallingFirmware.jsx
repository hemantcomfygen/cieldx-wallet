import { useEffect, useState } from "react";

const InstallingFirmware = ({ onComplete }) => {
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    setShowProgress(true);
  };

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
        
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [showProgress, onComplete]);

  return (
    <div className="card max-w-3xl w-full mx-auto">
      <div className="text-center space-y-8 py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>

        <div>
          <h2 className="text-3xl font-light mb-4">Installing firmware</h2>
          {!showProgress && (
            <p className="text-light-text max-w-xl mx-auto leading-relaxed">
              Your Trezor ships without firmware for security reasons. To start using it safely, install the latest firmware. Bitcoin-only user? We recommend the{" "}
              <a href="#" className="text-default-text underline hover:text-success transition">
                Bitcoin-only firmware
              </a>
              .
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-light-text">Latest version</p>
          <p className="text-sm text-success flex items-center justify-center gap-1">
            Universal 2.9.4 
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </p>
        </div>

        {!showProgress ? (
          <>
            <div className="space-y-4 pt-4 max-w-lg mx-auto">
              <div className="flex items-start gap-3 text-left">
                <svg className="w-5 h-5 text-light-text mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-light-text">
                  This firmware update may take some time to complete.
                </p>
              </div>
              <div className="flex items-start gap-3 text-left">
                <svg className="w-5 h-5 text-light-text mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="text-sm text-light-text">
                  <span className="text-default-text font-medium">Don't close the app</span> during installation. Doing so will corrupt the firmware.
                </p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="btn-primary mt-8 px-12 py-3 text-base"
            >
              Install
            </button>
          </>
        ) : progress < 100 ? (
          <div className="space-y-3 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-light-text">Installing firmware</span>
              <span className="text-default-text font-medium">{progress} %</span>
            </div>
            <div className="w-full h-1.5 bg-glass-bg rounded-full overflow-hidden border border-glass-border">
              <div 
                className="h-full bg-success transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-light-text">Completed</span>
                <span className="text-default-text font-medium">100 %</span>
              </div>
              <div className="w-full h-1.5 bg-glass-bg rounded-full overflow-hidden border border-glass-border">
                <div 
                  className="h-full bg-success"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <button
              onClick={onComplete}
              className="btn-primary mt-8 px-12 py-3 text-base"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InstallingFirmware