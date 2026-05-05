import React from "react";

const CardSkeleton = ({ loading }) => {
  const shimmer = "animate-pulse bg-glass-bg rounded-lg";

  if (!loading) return null;

  return (
    <div className="space-y-4 w-full h-full overflow-y-hidden relative">

      {/* Rectangular sections */}
      <div className="space-y-3 mt-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={`h-48 w-full ${shimmer}`} />
        ))}
      </div>
    </div>
  );
};

export default CardSkeleton;
