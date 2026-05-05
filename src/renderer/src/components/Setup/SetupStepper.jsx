const SetupStepper = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Wallet" },
    { num: 2, label: "PIN" },
    { num: 3, label: "Backup" },
    // { num: 4, label: "Coins" },
  ];

  return (
    <div className="px-6 py-8 w-full flex justify-center">
      <div className="max-w-4xl w-full flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.num === currentStep;
          const isDone = step.num < currentStep;

          return (
            <div key={step.num} className="flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center min-w-15">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${
                    isDone
                      ? "bg-success text-black"
                      : isActive
                      ? "bg-white text-black"
                      : "bg-card-bg border border-borderColor text-trans-text"
                  }`}
                >
                  {isDone ? "✓" : step.num}
                </div>

                <span
                  className={`mt-2.5 text-xs font-medium ${
                    isActive || isDone
                      ? "text-default-text"
                      : "text-trans-text"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={`w-48 h-px mx-4 ${
                    isDone ? "bg-success/30" : "bg-borderColor"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SetupStepper;
