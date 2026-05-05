import Chart from "react-apexcharts";
import { useState } from "react";

const PortfolioChart = () => {
  const [range, setRange] = useState("ALL");

  const series = [
    {
      name: "Incoming",
      data: [200, 18000, 500, 12000, 3000, 0, 0, 0],
    },
    {
      name: "Outgoing",
      data: [100, 16000, 300, 8000, 2500, 0, 0, 0],
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
      background: "transparent",
      
    },
    plotOptions: {
      bar: {
        columnWidth: "28%",
        barGap: "25%",
        borderRadius: 3,
      },
    },
    colors: ["#3ad38a", "#f26c6c"],
    dataLabels: { enabled: false },
    stroke: { show: false },
    grid: {
      borderColor: "rgba(255,255,255,0.06)",
      strokeDashArray: 4,
      
    },
    xaxis: {
      categories: [
        "May 2025",
        "Jun 2025",
        "Jul 2025",
        "Aug 2025",
        "Sep 2025",
        "Oct 2025",
        "Nov 2025",
        "Dec 2025",
      ],
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
      },
    },
    yaxis: {
      labels: {
        formatter: (v) => `$${v}`,
        style: { colors: "#9ca3af", fontSize: "11px" },
      },
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
    },
  };

  return (
    <div className="bg-card-bg border border-borderColor rounded-xl p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-sm font-medium">Portfolio</h2>
          <p className="text-xs text-trans-text">
            Solana, XRP Ledger, Stellar and all token amounts are included in the
            portfolio balance, but aren't currently supported in graph view.
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          {["1D", "1W", "1M", "1Y", "ALL"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded ${
                range === r
                  ? "bg-white/10 text-white"
                  : "text-trans-text hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Balance */}
      <div className="text-2xl font-semibold mb-2">$70.55</div>

      {/* Chart */}
      <Chart options={options} series={series} type="bar" height={280} />
    </div>
  );
};

export default PortfolioChart;
