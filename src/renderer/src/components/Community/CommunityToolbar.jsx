import React from "react";
import { RefreshCcw, Search } from "lucide-react";
import { CustomButton } from "../Buttons/AllButtons";
import { FiPlus } from "react-icons/fi";

export default function CommunityToolbar({
  query,
  setQuery,
  onSubmit,
  onRefresh,
  onAdd
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div>
        <h1 className="text-white text-2xl font-semibold">Community</h1>
        <p className="text-gray-400 text-sm mt-1">
          Blockchain and crypto news updates.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* <form onSubmit={onSubmit} className="flex-1 sm:min-w-[420px]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or change topic (e.g. bitcoin, ethereum, defi)…"
              className="w-full rounded-xl bg-white/5 border border-borderColor text-white placeholder:text-gray-500 pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
        </form> */}

        {/* <CustomButton 
          label="Refresh"
          isIcon={true}
          variant="glass"
          icon={RefreshCcw}
          onClick={onRefresh}
        />   */}

        <CustomButton
          label="New Post"
          isIcon={true}
          iconSize={16}
          icon={FiPlus}
          onClick={onAdd}
          className="whitespace-nowrap"
        />

      </div>
    </div>
  );
}

