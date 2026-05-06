import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import SetupFlow from "./pages/SetupFlow";
import { Toaster } from "react-hot-toast";
import MainDashboard from "./pages/MainDashboard";
import SendCoin from "./pages/SendCoin";
import Receive from "./pages/Receive";
import CryptoBuySell from "./pages/CryptoBuySell";
import Swap from "./pages/Swap";
import AssetsDetails from "./pages/AssetsDetails";
import Setting from "./pages/Setting";
import BackupMnemonic from "./pages/BackupMnemonic";
import VerifyWallet from "./pages/VerifyWallet";
import { localStorageGetItem } from "./utils/GlobalFunction.js";
import Aos from "aos";
import Wallets from "./pages/Wallets";
import CoinDetails from "./pages/CoinDetails";
import ExistingWallet from "./pages/ExistingWallet";
import WalletDetails from "./pages/WalletDetails";
import MultiImport from "./pages/MultiImport";
import OneMissing from "./pages/OneMissing.jsx";
import LockScreen from "./components/Modal/LockScreen";
import Community from "./pages/Community.jsx";
import { requestNotificationPermission } from "./services/firebaseConfig";
import { useBlockchainNotification } from "./hooks/useBlockchainNotification";
import UpdatePopup from "./components/UpdatePopup.jsx";


const App = () => {
  const [balanceRefresh, setBalanceRefresh] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(sessionStorage.getItem("isUnlocked") === "true");

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (!window.api) return;

    const handleUpdateAvailable = () => {
      console.log("Update available");
      setUpdateAvailable(true);
      setUpdateProgress(0);
      setShowUpdatePrompt(true);
    };

    const handleProgress = (percent) => {
      setUpdateProgress(percent);
    };

    const handleDownloaded = () => {
      setUpdateReady(true);
    };

    window.api.onUpdateAvailable(handleUpdateAvailable);
    window.api.onUpdateProgress(handleProgress);
    window.api.onUpdateDownloaded(handleDownloaded);

    return () => {
      window.api.removeAllUpdateListeners?.();
    };
  }, []);

  // Initialize blockchain monitoring
  useBlockchainNotification();

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
  };


  const navigate = useNavigate();
  const PrivateRoute = ({ children }) => {
    const userId = localStorageGetItem("userId");
    return userId ? children : <Navigate to="/" replace />;
  };

  const PublicRoute = ({ children }) => {
    const userId = localStorageGetItem("userId");
    return userId ? <Navigate to="/app/dashboard" replace /> : children;
  };

  useEffect(() => {
    Aos.init({
      duration: 600,
      offset: 80,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  // useEffect(() => {
  //   if (location.pathname === "/") {
  //     const userId = localStorageGetItem("userId");

  //     navigate(userId ? "/app/dashboard" : "/");
  //   }
  // }, []);

  // update comment
  useEffect(() => {
    const hashPath = window.location.hash.replace("#", "") || "/";
    const userId = localStorageGetItem("userId");
    if (hashPath === "/") {
      navigate(userId ? "/app/dashboard" : "/");
    }
  }, []);


  const userId = localStorageGetItem("userId");
  const isSessionUnlocked = sessionStorage.getItem("isUnlocked") === "true";

  return (
    <div className="bg-primaryTheme min-h-screen">

      <UpdatePopup
        updateAvailable={updateAvailable}
        updateProgress={updateProgress}
        updateReady={updateReady}
        showUpdatePrompt={showUpdatePrompt}
        onUpdateNow={() => {
          setShowUpdatePrompt(false);
          setUpdateProgress(0);

          window.api?.startUpdateDownload?.();
        }}
        onLater={() => {
          setUpdateAvailable(false);
          setShowUpdatePrompt(false);
        }}
        onInstall={() => window.api?.installUpdate?.()}
      />

      {userId && !isSessionUnlocked && !isUnlocked ? (
        <LockScreen onUnlock={handleUnlock} />
      ) : (
        <Routes>
          {/* APP LAYOUT */}
          <Route path="/" element={
            <PublicRoute>
              <Dashboard />
            </PublicRoute>
          } />
          <Route path="/setup" element={
            // <PublicRoute>
            <SetupFlow />
            // </PublicRoute>
          } />
          <Route path="/app/backup" element={
            // <PublicRoute>
            <BackupMnemonic />
            // </PublicRoute>
          } />
          <Route path="/app/verify-backup" element={
            // <PublicRoute>
            <VerifyWallet />
            // </PublicRoute>
          } />


          <Route
            path="/"
            element={<PrivateRoute> <Layout balanceRefresh={balanceRefresh} /> </PrivateRoute>}
          >
            <Route path="app/dashboard"
              element={
                <MainDashboard
                  setBalanceRefresh={setBalanceRefresh}
                />
              }
            />
            <Route path="app/send-coin/:id" element={<SendCoin />} />
            <Route path="app/assets/:id" element={<AssetsDetails />} />
            <Route path="app/receive-coin/:id" element={<Receive />} />
            <Route path="app/cryptoBuySell" element={<CryptoBuySell />} />
            <Route path="app/settings" element={<Setting />} />
            <Route path="app/swap/:id" element={<Swap />} />
            <Route path="app/wallets" element={<Wallets />} />
            <Route path="app/coin-detail/:id" element={<CoinDetails />} />
            <Route path="app/existing-wallet" element={<ExistingWallet />} />
            <Route path="app/wallet-details/:id" element={<WalletDetails />} />
            <Route path="app/bulk-import" element={<MultiImport />} />
            <Route path="app/one-missing" element={<OneMissing />} />
            <Route path="app/community" element={<Community />} />
          </Route>

          {/* Example login route */}
          {/* <Route path="/login" element={<Dashboard />} /> */}
        </Routes>
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default App;