import { ArrowLeft } from "lucide-react";
import CustomButton from "../Buttons/CustomButton";

const PinStep = ({ onComplete, handleBack }) => {
  return (
    <div className="flex flex-col items-center justify-center  animate-in fade-in duration-500">
      
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-8 border border-success/20">
        <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-4">Set a PIN</h1>
      <p className="text-light-text text-center max-w-md mb-10">
        Set a strong PIN to keep your Trezor safe from unauthorized access.
      </p>

      <div className="card w-full max-w-2xl flex flex-col items-center py-12">
        {/* <button onClick={onComplete} className="btn-primary px-12 py-3 text-lg">
          Set PIN
        </button> */}
        <CustomButton
          onClick={onComplete}
          size="lg"
        >
          Set PIN
        </CustomButton>
      </div>
    </div>
  );
};

export default PinStep;