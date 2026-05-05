import { IoSearch, IoClose } from "react-icons/io5";

const SearchInput = ({
  label,
  placeholder = "Search...",
  value,
  onChange,
  onClear,
  className = "",
  inputClassName  = "",
  isPaste = false
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Label (optional) */}
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left search icon */}
        <IoSearch className="absolute left-3 text-gray-400 text-lg" />

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-glass-bg text-default-text placeholder-zinc-400 
                     rounded-xl py-2.5 pl-10 pr-10 outline-none
                     border border-glass-border focus:border-violet-light 
                     transition-all duration-200 ${inputClassName}`}
        />

        {/* Right clear icon (only visible if input has text) */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-gray-400 hover:text-gray-200 cursor-pointer"
          >
            <IoClose className="text-lg" />
          </button>
        )}

        {
          isPaste && (
            <p className="text-success absolute right-3 cursor-pointer">Paste</p>
          )
        }
      </div>
    </div>
  );
};

export default SearchInput;
