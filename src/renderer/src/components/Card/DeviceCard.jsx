import { useNavigate } from "react-router-dom";
import CustomButton from "../Buttons/CustomButton";
import deviceImg from "/trazor_device.png"

export default function DeviceCard() {
  const navigate = useNavigate();

  return (
    <div className="card flex gap-8 items-start">

      {/* Image */}
      <div className="w-44 h-60 bg-black/30 rounded-xl flex items-center justify-center">
        <div className="w-28 h-44 bg-white/5 rounded-lg text-xs text-trans-text flex items-center justify-center">
          <img src={deviceImg} alt="Crypto Wallet App" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h2 className="text-2xl font-semibold text-success mt-1">
          Create Your Crypto Wallet
        </h2>

        <div className="h-px bg-borderColor my-6" />

        <h3 className="text-sm font-medium mb-3">
          Secure Wallet Setup
        </h3>

        <ul className="space-y-3 text-sm text-light-text">
          <li>✔ Generate a secure private key</li>
          <li>✔ Backup your 12/24-word recovery phrase</li>
          <li>✔ Set a strong password</li>
          <li>✔ Full control of your assets</li>
        </ul>

        <div className="flex gap-4 mt-8">
          <CustomButton
            variant="primary"
            size="md"
            onClick={() => navigate('/setup')}
          >
            Setup
          </CustomButton>
        </div>
      </div>
    </div>
  );
}