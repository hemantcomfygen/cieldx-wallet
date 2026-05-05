import React from "react";

const CoinInfoCardSkeleton = () => {
  return (
    <div className="flex justify-between items-center bg-glass-bg px-2 py-3 rounded-xl border border-borderColor animate-pulse">
      
      {/* Left Side */}
      <div className="flex gap-3 items-center">
        
        {/* Image Skeleton */}
        <div className="h-10 w-10 rounded-full bg-zinc-700"></div>

        <div className="space-y-2">
          {/* Title */}
          <div className="h-4 w-32 bg-zinc-700 rounded"></div>

          {/* Subtitle */}
          <div className="h-3 w-24 bg-zinc-700 rounded"></div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-end space-y-2">
        <div className="h-4 w-20 bg-zinc-700 rounded"></div>
        <div className="h-4 w-24 bg-zinc-700 rounded"></div>
      </div>
    </div>
  );
};

export default CoinInfoCardSkeleton;