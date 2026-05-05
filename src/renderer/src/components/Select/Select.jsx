import { useState, useRef, useEffect } from "react";

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}

      {/* Selected */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full bg-primaryTheme border border-white/10 rounded-xl px-4 py-3.5 text-left text-white focus:outline-none focus:border-success transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.image && (
            <img
              src={selectedOption.image}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          )}

          <span className={selectedOption ? "text-white" : "text-gray-600"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Arrow */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1A1C1F] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">

          {options.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No options available
            </div>
          )}

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-2 text-gray-300 hover:text-white"
            >
              {option.image && (
                <img
                  src={option.image}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
              )}

              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;