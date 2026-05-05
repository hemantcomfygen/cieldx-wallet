import React, { useState } from "react";
import { FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import AssetHeader from "../components/AssetsDetails/AssetHeader";
import AssetTabs from "../components/AssetsDetails/AssetTabs";
import OverviewPanel from "../components/AssetsDetails/OverviewPanel";
import DetailsPanel from "../components/AssetsDetails/DetailsPanel";
import TradeSection from "../components/AssetsDetails/TradeSection";

const AssetsDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8">
      
      <AssetHeader />

      
      <AssetTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "overview" ? <OverviewPanel /> : <DetailsPanel />}

      <TradeSection/>
    </div>
  );
};

export default AssetsDetails;
