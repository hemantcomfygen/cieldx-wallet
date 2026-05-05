import { useState } from "react";
import CustomButton from "../Buttons/CustomButton";
import PasswordInput from "../Input/PasswordInput";
import { ArrowLeft } from "lucide-react";

const Password = ({ onComplete, handleBack, pin, setPin, error, setError, handleConfirmChange }) => {
  const [step, setStep] = useState(1);

  // Step 1 PIN input
  const handlePinChange = (value) => {
    setPin(value);
    setError("");

    if (value.length === 6) {
      setTimeout(() => setStep(2), 300);
    }
  };

  const handleBackStep = () => {
    if (step === 1) {
      handleBack(false, '', 1, 'select')
    } else {
      setStep(1)
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        <div className="flex justify-start mb-6">
          <button
            onClick={() => handleBackStep()}
            className="p-2 rounded-lg hover:bg-white/5 transition"
          >
            <ArrowLeft className="text-success h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-8 border border-success/20">
            <svg
              className="w-8 h-8 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4">Set a PIN</h1>

          <p className="text-light-text text-center max-w-md mb-10">
            Set a strong 6-digit PIN to protect your wallet from unauthorized access.
          </p>

          {/* Card */}
          <div className="card w-full flex flex-col items-center py-12">

            {/* Step 1 */}
            {step === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-6 text-center tracking-wide">
                  Create Your 6 Digit PIN
                </h3>

                <PasswordInput
                  length={6}
                  onChange={handlePinChange}
                  className="mt-2"
                />

                <p className="text-sm text-gray-400 mt-6 text-center">
                  This PIN will be required to unlock your wallet.
                </p>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-6 text-center tracking-wide">
                  Confirm Your PIN
                </h3>

                <PasswordInput
                  length={6}
                  onChange={handleConfirmChange}
                  className="mt-2"
                />

                {error && (
                  <p className="text-red-400 text-sm mt-4 text-center">
                    {error}
                  </p>
                )}

                <p className="text-sm text-gray-400 mt-6 text-center">
                  Please re-enter your PIN to confirm.
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Password;