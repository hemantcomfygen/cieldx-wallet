const FeeSelector = ({ selected, onSelect }) => {
  const fees = [
    { id: 'low', label: 'Low', time: '~1 hour', rate: '0.16 sat/vB' },
    { id: 'normal', label: 'Normal', time: '~30 minutes', rate: '1.00 sat/vB' },
    { id: 'high', label: 'High', time: '~10 minutes', rate: '4.03 sat/vB' }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {fees.map((fee) => (
        <button
          key={fee.id}
          onClick={() => onSelect(fee.id)}
          className={`
            p-4 rounded-xl border transition-all text-left
            ${selected === fee.id 
              ? 'bg-success/10 border-success relative' 
              : 'bg-primaryTheme border-white/10 hover:border-white/20'
            }
          `}
        >
          {selected === fee.id && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-success rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          <div className="text-white font-medium mb-1">{fee.label}</div>
          <div className="text-gray-500 text-sm">{fee.time}</div>
          <div className="text-gray-400 text-xs mt-1">{fee.rate}</div>
        </button>
      ))}
    </div>
  );
};


export default FeeSelector