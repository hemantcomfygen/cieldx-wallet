import { useEffect, useState } from "react";
import { Fade } from "react-awesome-reveal";
import SetupStepper from "../components/Setup/SetupStepper";
import WalletSelect from "../components/Setup/WalletStep";
import PinStep from "../components/Setup/PinStep";
import CoinsStep from "../components/Setup/CoinStep";
import { useNavigate } from "react-router-dom";
import Password from "../components/Setup/Password";
import BackupTypeSelect from "../components/Setup/BackupTypeSelect";
import { localStorageSetItem } from "../utils/GlobalFunction";
import { generatePassphrase, getExistingWallet } from "../redux/slices/AuthSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Header from "../components/header/Header";
import Loader from "../components/Loader/Loader";
import ImportSecretPhrase from "../components/Import/ImportSecretPhrase";
import Modal from "../components/Modal/Modal";
import { generateWallet } from "../blockchain/wallets/Wallet";


const passphraseLengths = [12, 15, 18, 21, 24];

const SetupFlow = () => {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [walletStyle, setWalletStyle] = useState('new')
  const [walletStage, setWalletStage] = useState("select");
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [passPhrase, setPassPhrase] = useState(null)

  const navigate = useNavigate()
  const dispatch = useDispatch();

  const handleWalletFlow = (stage, type, walletStyle = "") => {
    setStep(2);
    setWalletStage(type);
    setWalletStyle(walletStyle)
  };


  const handlePinComplete = (step, type) => {
    setStep(step);
    setWalletStage(type)
  }

  const handleBack = (isNavigate, path, step, type) => {
    if (isNavigate === true) {
      navigate(path)
    } else {
      setStep(step);
      setWalletStage(type);
    }
  }

  const handleGeneratePassphrase = async (pin, passPhraseLength = 12) => {
    setLoading(true);
    try {

      const res = await generateWallet(pin, passPhraseLength)

      const walletData = res?.wallet;

      localStorageSetItem("userId", res?.userId)
      sessionStorage.setItem("isUnlocked", "true")
      setPassPhrase(walletData)
      setIsModalOpen(false)
      handlePinComplete(3, "backup-type");
      toast.success(res?.message || "Wallet created successfully!");
      setPin('')
    } catch (error) {
      console.error("Passphrase generation error:", error);
      toast.error(error?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = async (value) => {
    setConfirmPin(value);
    if (value.length === 6) {
      if (value !== pin) {
        setError("Passwords do not match");
        return;
      }
      setError("");

      switch (walletStyle) {
        case "new":
          // await handleGeneratePassphrase(pin);
          setIsModalOpen(true)
          break;
        case "existing":
          setStep(5);
          setWalletStyle("existing");
          break;
        default:
          break;
      }
    } else {
      setError("");
    }
  };

  const handleSelectPassPhrase = async (length) => {
    await handleGeneratePassphrase(pin, length)
  }



  return (

    <>
      <Loader loading={loading} />
      <div>
        <Header isButton={false} />
        <div className="space-y-6 px-3 py-10">
          <div className="hidden sm:flex">
            {!(walletStyle === "existing" && step === 5) && (
              <SetupStepper currentStep={step} />
            )}
          </div>

          {step === 1 && walletStage === "select" && (
            <Fade triggerOnce direction="up">
              <WalletSelect
                onCreateNew={() => handleWalletFlow("backup-type", "password", "new")}
                onCreateRecover={() => handleWalletFlow("recover-wallet", "password", 'existing')}
                onMultiWallet={() => navigate("#",)}
                handleBack={handleBack}
              />
            </Fade>
          )}

          {step === 2 && walletStage === "password" && (
            <Fade triggerOnce direction="up" duration={800}>
              <Password
                onComplete={() => handlePinComplete(3, 'backup-type')}
                handleBack={handleBack}
                pin={pin}
                setPin={setPin}
                error={error}
                setError={setError}
                handleConfirmChange={handleConfirmChange}
              />
            </Fade>
          )}

          {(step === 5 && walletStyle === "existing") && (
            <Fade triggerOnce direction="up" duration={800}>
              <ImportSecretPhrase
                handleBack={handleBack}
                pin={pin}
                setStep={setStep}
                setWalletStage={setWalletStage}
              />
            </Fade>
          )}

          {step === 3 && walletStage === "backup-type" && (
            <Fade triggerOnce direction="up" duration={800}>
              <BackupTypeSelect
                setStep={setStep}
                setWalletStage={setWalletStage}
                item={passPhrase}
              />
            </Fade>
          )}

          {/* --- STEP 4: COINS --- */}
          {step === 4 && walletStage === "coins" && (
            <Fade triggerOnce direction="up" duration={800}>
              <CoinsStep onComplete={() => navigate("/app/dashboard")} />
            </Fade>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        title="Select Passphrase Length"
      >
        <div className="grid grid-cols-2 gap-3 mt-4">
          {passphraseLengths.map((length) => (
            <button
              key={length}
              onClick={() => handleSelectPassPhrase(length)}
              className="border border-zinc-700 rounded-2xl py-3 text-center hover:bg-zinc-800 transition"
            >
              {length} Words
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default SetupFlow;