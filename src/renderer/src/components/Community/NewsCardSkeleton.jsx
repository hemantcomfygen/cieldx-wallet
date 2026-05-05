import React from "react";

export default function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-borderColor bg-white/5 overflow-hidden">
      <div className="h-40 bg-white/10 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
          <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

