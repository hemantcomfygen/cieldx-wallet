import deviceImg from "/trazor_device.png"
 
const IntroBanner = ({ onClose }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-borderColor bg-linear-to-r from-[#1b1d1f] to-[#242628] p-6 flex items-center justify-between">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold mb-1">
          Introducing Trezor Safe 7
        </h2>

        <p className="text-sm text-trans-text mb-4">
          Radically transparent, fully wireless, and quantum-ready.
        </p>

        <button className="px-4 py-2 rounded-lg bg-success text-black text-sm font-medium hover:opacity-90 transition">
          Learn more
        </button>
      </div>

      <div className="relative hidden md:block">
        <img
          src={deviceImg}
          alt="Trezor Safe 7"
          className="w-56 object-contain translate-x-6 mr-20"
        />
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-trans-text"
      >
        ✕
      </button>
    </div>
  );
};

export default IntroBanner;
