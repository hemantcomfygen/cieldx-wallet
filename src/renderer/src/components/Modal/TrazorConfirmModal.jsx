import { useEffect } from "react";
import deviceImg from "/trazor_device.png"

const TrezorConfirmModal = ({
  isOpen = true,
  onClose = () => {},
  title = "Confirm on Trezor",
  instructionText = "Follow the instructions on your Trezor's screen",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
        aria-label="Close modal"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md">
        {/* Floating Pill Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#1A1C1F] backdrop-blur-md border border-white/10 flex items-center gap-3 rounded-full px-5 py-3 shadow-2xl">
            {/* Trezor Icon */}
            <div className="w-5 h-5 rounded bg-linear-to-br from-white/20 to-white/5 flex items-center justify-center">
              <div className="w-3 h-3 bg-white/40 rounded-sm" />
            </div>
            <span className="text-sm font-medium text-white">{title}</span>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white/80 transition-all ml-2"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card/95 backdrop-blur-xl border border-white/8 rounded-3xl p-8 shadow-2xl">
          {/* Device illustration */}
          <div className="flex flex-col items-center gap-8">
            <div className="flex justify-center">
              <img
                src={deviceImg}
                alt="Trezor Device"
                className="w-52 h-72 object-contain"
              />
            </div>

            {/* Instruction Text */}
            <div className="text-center px-4">
              <p className="text-white text-xl font-medium leading-relaxed">
                {instructionText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TrezorConfirmModal
