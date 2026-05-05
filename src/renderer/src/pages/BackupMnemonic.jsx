import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import CustomButton from "../components/Buttons/CustomButton";
import { Fade } from "react-awesome-reveal";
import Header from "../components/header/Header";
import toast from "react-hot-toast";


const BackupMnemonic = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const dummyMnemonic =
    "abandon ability able about above absent absorb abstract absurd abuse access accident";

  const walletData = location?.state?.item || {};

  const item = walletData?.passPhrase || dummyMnemonic;

  useEffect(() => {
    AOS.init({ duration: 420, once: true, easing: "ease-out" });
  }, []);

  const passPhrase1 =
    typeof item === "string" && item.trim().length > 0
      ? item.trim().split(" ")
      : [];

  const handleNext = () => {
    if (passPhrase1.length === 0) return;
    navigate("/app/verify-backup", { state: { walletData } });
  };

  return (
    <>
      <Header isButton={false} />
      <Fade triggerOnce direction="left">
        <div className="max-w-4xl mx-auto my-6">
          <div className="px-4 md:pt-6 bg-primaryTheme text-custom-white">
            <div className="">

              <p className="text-md text-center mb-8">
                Write down your recovery phrase in the correct order.
              </p>

              {/* Phrase Grid */}
              <div className="grid grid-cols-3 gap-2 mb-5" data-aos="fade-up">
                {passPhrase1.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-2 md:px-3 py-2 rounded-lg border border-glass-border hover:bg-white/10 transition"
                    // data-aos="fade-up"
                    // data-aos-delay={index * 40}
                  >
                    <div className="w-4 sm:w-6 text-xs text-trans-text">
                      {index + 1}
                    </div>
                    <div className="text-sm font-medium truncate">
                      {word}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning Section */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-success mt-0.5">✔</div>
                  <div>
                    <div className="text-sm font-medium">Recommended:</div>
                    <p className="text-sm text-trans-text">
                      Write it down on paper and store it securely offline.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-danger mt-0.5">✖</div>
                  <div>
                    <div className="text-sm font-medium">Avoid:</div>
                    <ul className="text-sm text-trans-text list-disc list-inside space-y-1 mt-1">
                      <li>Do not screenshot or copy it.</li>
                      <li>Do not store it online.</li>
                      <li>Do not share it with anyone.</li>
                    </ul>
                  </div>
                </div>

                <button
                  className="text-sm text-violet-light mt-1 underline"
                  onClick={() =>
                    window.open(
                      "https://en.bitcoin.it/wiki/Seed_phrase",
                      "_blank"
                    )
                  }
                >
                  Learn more about recovery phrases.
                </button>
              </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="mt-5">
              <div className="flex items-center gap-3">
                <CustomButton
                  label="Skip"
                  className="w-full py-3 rounded-xl"
                  variant="secondary"
                  onClick={() => {
                    toast.error("You have not backed up your wallet");
                    navigate("/app/dashboard");
                  }}
                />
                <CustomButton
                  label="Next"
                  className="w-full py-3 rounded-xl"
                  variant="primary"
                  onClick={handleNext}
                  disabled={passPhrase1.length === 0}
                />
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </>
  );
};

export default BackupMnemonic;