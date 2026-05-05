import React, { useState } from "react";
import { Fade, Slide } from "react-awesome-reveal";

import ApplicationTab from "../components/Settings/ApplicationTab";
import DeviceTab from "../components/Settings/DeviceTab";
import CoinsTab from "../components/Settings/CoinsTab";
import ConnectedAppsTab from "../components/Settings/ConnectedAppsTab";
import { useNavigate } from "react-router-dom";

const Setting = () => {
  const [activeTab, setActiveTab] = useState("application");

  const navigate = useNavigate();

  const tabs = [
    { id: "application", label: "Application" },
    { id: "coins", label: "Coins" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "application":
        return <ApplicationTab />;
      case "coins":
        return <CoinsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#0F1011] text-white p-2 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title */}

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 4L6 10L12 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>

        {/* Tabs */}
        <Fade duration={400} delay={100} triggerOnce>
          <div className="flex gap-6 mb-8 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  pb-4 px-2 text-sm font-medium transition relative
                  ${activeTab === tab.id
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
            ))}
          </div>
        </Fade>

        {/* Tab Content */}
        <Fade
          key={activeTab}
          duration={450}
          damping={0.15}
        >
          <div className="pb-8">
            {renderTabContent()}
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default Setting;
