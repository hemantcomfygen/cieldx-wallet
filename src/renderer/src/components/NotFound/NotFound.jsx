import React from "react";
import { LuFileSearch } from "react-icons/lu";

const NotFound = ({ message = "No data yet", iconSize = 64, className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center bg-transparent  p-6 shadow-glass ${className}`}
    >
      <div className="bg-glass-hover p-4 rounded-full mb-3">
        <LuFileSearch size={iconSize} className="text-trans-text opacity-80" />
      </div>
      <p className="text-base text-trans-text font-medium  opacity-75">
        {message}
      </p>
    </div>
  );
};

export default NotFound;
