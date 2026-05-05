import { useState } from "react";
import { FiAlertTriangle, FiExternalLink } from "react-icons/fi";
import Select from "../Select/Select";
import Toggle from "../Toggle/Toggle";
import CustomButton from "../Buttons/CustomButton";
import { ExpandIcon } from "lucide-react";

const Experimental = () => {
  const [experimentalEnabled, setExperimentalEnabled] = useState(false);

  return (
    <div className="space-y-4">
      {/* Left Section */}
      <div className="w-56 flex items-start gap-3 text-gray-200">
        {/* <span className="text-xl">🧪</span> */}
        <ExpandIcon size={20} className="text-gray-400" />
        <h3 className="text-lg font-medium">Experimental</h3>
      </div>

      {/* Right Card */}
      <div className="flex-1 bg-card-bg border border-white/6 rounded-xl p-5 md:p-6 space-y-6">
        
        {/* Early Access */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">
              Early Access Program
            </h4>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              Test the latest product features before they’re released to all Trezor users.
            </p>
          </div>

          <button className="px-4 py-2 cursor-pointer rounded-lg bg-success text-black text-sm font-medium hover:bg-success-light transition">
            Opt in
          </button>
        </div>

        <hr className="border-white/6" />

        {/* Experimental Features */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h4 className="text-white font-medium">
              Experimental features
            </h4>

            <div className="mt-3 flex gap-3 items-start mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-300">
              <FiAlertTriangle className="mt-0.5 shrink-0" />
              <p>
                For experienced users only. Use at your own risk. These features are in
                testing, may be unstable, and might not have long-term support.
              </p>
            </div>

            <CustomButton  icon={<FiExternalLink size={14} />}>
              Learn more 
            </CustomButton>
          </div>

        
          <Toggle
          checked={experimentalEnabled}
          onChange={()=>setExperimentalEnabled(!experimentalEnabled)}
          />
        </div>
      </div>
    </div>
  );
};

export default Experimental;
