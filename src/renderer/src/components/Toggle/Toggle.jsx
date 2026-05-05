const Toggle = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      {label && <span className="text-gray-300 text-md">{label}</span>}
      <div
        onClick={() => onChange(!checked)}
        className={`
          relative w-12 h-6 rounded-full transition-colors cursor-pointer
          ${checked ? 'bg-success' : 'bg-white/10'}
        `}
      >
        <div
          className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </div>
    </label>
  );
};

export default Toggle