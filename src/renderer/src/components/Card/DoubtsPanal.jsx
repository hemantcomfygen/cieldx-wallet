import { AlertTriangle, Hand, MessageCircle, ArrowLeft } from "lucide-react";
import deviceImg from "/trazor_device.png"

export default function DoubtsSafeCard({ onBack }) {
  return (
    <div className="card flex gap-8 items-start ">

      {/* Left – Device Image */}
      <div className="relative w-44 h-60 rounded-xl bg-black/40 flex items-center justify-center">

        {/* Device placeholder */}
        <div className="w-28 h-44 rounded-lg bg-white/5 flex items-center justify-center text-xs text-trans-text">
         <img src={deviceImg}>
         </img>
        </div>

        {/* Warning Badges */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-danger flex items-center justify-center">
          <AlertTriangle size={16} className="text-white" />
        </div>

        <div className="absolute bottom-6 left-4 w-8 h-8 rounded-full bg-danger flex items-center justify-center">
          <AlertTriangle size={16} className="text-white" />
        </div>
      </div>

      {/* Right – Content */}
      <div className="flex-1 space-y-6">

        {/* Title */}
        <h2 className="text-xl font-semibold mb-2">
          Let’s play it safe
        </h2>

        <p className="text-sm text-light-text leading-relaxed mb-6">
          We want to be sure that your device is in tip-top shape before you
          start using it. Reach out to Trezor Support to find out what to do
          next.
        </p>

        {/* Divider */}
        <div className="h-px bg-borderColor mb-5" />

        {/* Instructions */}
        <ul className="space-y-4 text-sm text-light-text">

          <li className="flex gap-3 items-start">
            <Hand size={18} className="text-trans-text mt-0.5" />
            <span>
              Avoid using this device or sending any funds to it.
            </span>
          </li>

          <li className="flex gap-3 items-start">
            <MessageCircle size={18} className="text-trans-text mt-0.5" />
            <span>
              Click below and use the <b>Chat</b> option on the next page.
            </span>
          </li>

        </ul>

        {/* Actions */}
        <div className="flex gap-4 mt-8">

          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button className="btn-primary  justify-center">
            Contact Trezor Support
          </button>

        </div>
      </div>
    </div>
  );
}
