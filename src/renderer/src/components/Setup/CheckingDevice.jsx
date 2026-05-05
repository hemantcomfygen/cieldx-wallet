import { useEffect } from "react";

const CheckingDevice = ({startCheck}) => {

  useEffect(
    ()=>{
      startCheck()
    },[]
  )

  return (
    <div className="card max-w-3xl w-full mx-auto">
      <div className="text-center space-y-8 py-8">
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-card-bg border border-borderColor px-4 py-2 rounded-lg text-sm text-light-text whitespace-nowrap">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin text-success" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirm on Trezor
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-light mb-3">Checking your device</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 text-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center">
              <svg className="w-5 h-5 text-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-light-text text-center leading-relaxed">
              This check is a must-do step to ensure your device's reliability, integrity, and secure use.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center">
              <svg className="w-5 h-5 text-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <p className="text-light-text text-center leading-relaxed">
              This confirms that the chip inside your hardware wallet is genuine and from Trezor.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center">
              <svg className="w-5 h-5 text-light-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-light-text text-center leading-relaxed">
              Once your device has been given a clean bill of health, you're all set to Trezor with confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default CheckingDevice