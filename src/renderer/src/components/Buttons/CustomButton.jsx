const CustomButton = ({ label, children, variant = 'primary', size = 'md', disabled, onClick, fullWidth, icon }) => {
  const variants = {
    primary: 'bg-[#5ED49C] text-black hover:bg-[#3EBE84]',
    secondary: 'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/5',
    danger: 'bg-red-700 text-white hover:bg-red-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-semibold rounded-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2 text-md cursor-pointer tracking-wide
      `}
    >
      {icon && <span>{icon}</span>}
      {label || children}
    </button>
  );
};


export default CustomButton