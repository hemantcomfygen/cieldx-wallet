import { useNavigate } from "react-router-dom";
import CustomButton from "../Buttons/CustomButton";
import { Fade } from "react-awesome-reveal";
import heroImage from "/heroImage.png"

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 py-4 md:py-16 bg-primaryTheme">

            {/* Left Content */}
            <Fade duration={800} direction="left" triggerOnce>
                <div className="flex-1 space-y-8">

                    {/* Small Tag */}
                    <p className="text-success text-sm tracking-[0.3em] uppercase">
                        Decentralized • Secure • Private
                    </p>

                    {/* Glass Heading */}
                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight font-sans">
                        <span className="relative inline-block">
                            <span className="absolute inset-0  backdrop-blur-xl rounded-xl"></span>
                            <span className="relative  py-2 text-white">
                                Own Your Wealth.
                            </span>
                        </span>
                        <br />
                        <span className="text-success">
                            Without Compromise.
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-light-text max-w-xl text-lg leading-relaxed">
                        Experience true financial sovereignty.
                        Create, restore, and manage your digital assets with complete
                        control over your private keys — no banks, no intermediaries,
                        no limits.
                    </p>

                    <div className="flex gap-4 pt-6">
                        <CustomButton
                            label="Create Wallet"
                            onClick={() => navigate("/setup")}
                            className="px-8 py-3"
                        />
                    </div>

                </div>
            </Fade>

            {/* Right Image */}
            <Fade duration={800} direction="right" triggerOnce>
                <div className="flex-1 flex justify-center lg:mr-20">
                    <div className="relative">

                        <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full" />

                        <img
                            src={heroImage}
                            alt="Crypto Wallet"
                            className="relative min-w-80 w-80 lg:w-120 drop-shadow-2xl shrink-0"
                        />
                    </div>
                </div>
            </Fade>

        </section>
    );
};

export default HeroSection;