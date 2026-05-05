const LetsCheckYourDevice = ({onStart}) => {
  return (
    <div className="">
      <div className="bg-[#111317] rounded-2xl max-w-3xl w-full mx-auto shadow-lg border border-[#1c2027]">
        <div className="flex flex-col items-center text-center py-10 px-6 space-y-10">
          {/* Top shield icon */}
          <div className="w-16 h-16 rounded-full bg-[#0f1611] border border-success flex items-center justify-center">
            <svg
              className="w-7 h-7 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 4v5c0 4.418-3.582 8-7 8s-7-3.582-7-8V7l7-4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
              />
            </svg>
          </div>

          {/* Title + subtitle */}
          <div className="space-y-2">
            <h2 className="text-3xl font-light text-white">
              Let&apos;s check your device
            </h2>
            <p className="text-sm text-[#a0a4b3]">
              We just want to make sure that your Trezor is legit.
            </p>
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4 text-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181b22] border border-[#252a33] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#e1e4ee]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4l6 2v5c0 3.866-2.686 7-6 7s-6-3.134-6-7V6l6-2z"
                  />
                </svg>
              </div>
              <p className="text-[#d1d4dd] text-center leading-relaxed">
                This check is a must-do step to ensure your device&apos;s
                reliability, integrity, and secure use.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181b22] border border-[#252a33] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#e1e4ee]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <p className="text-[#d1d4dd] text-center leading-relaxed">
                This confirms that the chip inside your hardware wallet is
                genuine and from Trezor.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181b22] border border-[#252a33] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#e1e4ee]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <p className="text-[#d1d4dd] text-center leading-relaxed">
                Once your device has been given a clean bill of health, you&apos;re
                all set to Trezor with confidence.
              </p>
            </div>
          </div>

          {/* Start button */}
          <button onClick={()=>onStart()} className="mt-4 px-10 py-2.5 rounded-full bg-success text-sm font-medium text-black transition-colors">
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default LetsCheckYourDevice;
