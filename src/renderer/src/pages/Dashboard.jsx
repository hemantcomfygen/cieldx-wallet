import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import HeroSection from "../components/Banners/HeroSection";
import HomeCard from "../components/Card/HomeCard";
import { Fade } from "react-awesome-reveal";
import { useDispatch, useSelector } from "react-redux";
import { getCoinList } from "../redux/slices/AuthSlice";
import { initializeCoins } from "../utils/initApp.js";

const icon1 = "https://cdn-icons-png.freepik.com/512/6037/6037359.png"
const icon2 = "https://icons.veryicon.com/png/o/transport/logistics-multi-color-icon/recovery.png"
const icon3 = "https://cdn-icons-png.flaticon.com/512/9730/9730435.png"
const icon4 = "https://cdn-icons-png.flaticon.com/512/3014/3014084.png"

export default function Dashboard() {
  const [showWarningBanner, setShowWarningBanner] = useState(true);

  const dispatch = useDispatch();
  const selector = useSelector((state) => state?.auth);

  // const coinData = selector?.getCoinListData?.data?.data?.list || []

  // console.log("Data", coinData)

  // useEffect(() => {
  //   dispatch(getCoinList());
  // }, [dispatch]); 
  // 

  useEffect(() => {
    initializeCoins(dispatch);
  }, []);





  return (
    <div className="bg-primaryTheme pb-10 md:px-16">
      <Header />
      <div className="px-5 md:px-20 space-y-4 md:space-y-8">
        <HeroSection />

        <Fade duration={800} direction="up" triggerOnce>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <HomeCard
              image={icon1}
              heading="Create Secure Wallet"
              description="Generate a new self-custodial wallet with a secure private key and 24-word recovery phrase."
            // onClick={() => navigate("/setup")}
            />

            <HomeCard
              image={icon2}
              heading="Import Recovery Phrase"
              description="Restore your existing wallet using your 12 or 24-word mnemonic phrase securely."
            // onClick={() => navigate("/import")}
            />

            <HomeCard
              image={icon3}
              heading="Manage Digital Assets"
              description="Send, receive, and track your crypto holdings across multiple supported blockchains."
            // onClick={() => navigate("/wallet")}
            />

            <HomeCard
              image={icon4}
              heading="Advanced Security"
              description="Update your PIN, manage backups, and configure enhanced wallet protection settings."
            // onClick={() => navigate("/security")}
            />

          </div>
        </Fade>
      </div>
    </div>
  );
}