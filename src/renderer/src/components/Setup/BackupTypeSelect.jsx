import { useNavigate } from "react-router-dom";
import CustomButton from "../Buttons/CustomButton";
import { ArrowLeft } from "lucide-react";
import logo from "../../../public/logoDWM.png"


const BackupTypeSelect = ({ setStep, setWalletStage, item }) => {
  const navigate = useNavigate();


  const onBackup = () => {
    navigate("/app/backup", { state: { item } });
  };

  const onSkip = () => {
    // setStep(4);
    // setWalletStage("coins");
    navigate("/app/dashboard");
  };

  return (
    <div className="flex flex-col items-center h-full md:px-6">
      <div className="w-full md:max-w-4xl">
        <div className="card flex flex-col justify-center items-center text-center py-12 px-6 space-y-4">
          {/* <div className="bg-white rounded-2xl flex justify-center items-center h-16 mb-8 w-36">
            <h2 className="text-xl font-semibold text-green-600">
              Trazor Wallet
            </h2>
          </div> */}

          <div className="bg-white p-2 rounded-lg">
            <img src={logo} alt="logo" className="h-6" />
          </div>

          <h1 className="text-2xl font-semibold mb-3">
            Your Wallet is Ready!
          </h1>

          <p className="text-sm text-custom-white leading-relaxed max-w-sm mb-10">
            Secure your wallet by saving your recovery phrase.
            This unique set of words is your only way to restore access.
            We do not store or recover it for you.
          </p>

          <div className="w-full max-w-sm flex flex-col gap-4">
            <CustomButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onBackup}
              label="Back Up Now"
            />

            <CustomButton
              variant="transparent"
              size="lg"
              className="w-full"
              onClick={onSkip}
              label="Skip Backup"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default BackupTypeSelect;