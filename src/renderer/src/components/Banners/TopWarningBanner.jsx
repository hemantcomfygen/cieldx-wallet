import { AlertTriangle, X } from "lucide-react";

export default function TopWarningBanner({ onClose }) {
  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between gap-4
        bg-yellow/10 border border-yellow/30
        text-yellow-light
        px-5 py-3 rounded-xl"
      >
        {/* Left Content */}
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-yellow" />
          <p className="text-sm leading-relaxed">
            <span className="font-medium text-yellow">
              Never share your recovery phrase.
            </span>{" "}
            Our app will never ask for your 12/24-word backup after setup.
            Anyone with your recovery phrase can access your funds.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-yellow-light hover:text-yellow transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}