const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "bg-red-700 text-white hover:bg-red-800",
  success: "btn-success",
  warning: "btn-warning",
  transparent: `bg-zinc-800 text-white hover:bg-zinc-700`,
  glass: "btn-glass",
};

const SIZES = {
  sm: "px-2 py-1.5 text-md",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-md",
};

const ALIGNMENTS = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const CustomButton = ({
  label,
  variant = "primary",
  size = "md",
  width = "w-full",
  isIcon = false,
  icon: Icon,
  iconPosition = "left",
  contentAlign = "center",
  onClick,
  disabled = false,
  className = "",
  iconSize = 18
}) => {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  const alignClass = ALIGNMENTS[contentAlign] || ALIGNMENTS.center;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center ${alignClass} gap-3 rounded-lg font-medium 
        transition-all ease-in-out duration-200 active:scale-95 cursor-pointer
        ${variantClass} ${sizeClass} ${width} ${className}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      {isIcon && Icon && iconPosition === "left" && <Icon size={iconSize} />}

      {label && <span className="capitalize">{label}</span>}

      {isIcon && Icon && iconPosition === "right" && <Icon size={18} />}
    </button>
  );
};


const RoundedButton = ({ icon: Icon, label, onClick, variant = "glass" }) => {
  const variantClass = VARIANTS[variant] || VARIANTS.glass;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2   
        cursor-pointer active:scale-95 transition-all duration-200`}
    >
      <div className={`text-2xl px-3 py-3 rounded-full ${variantClass}`}>{Icon}</div>

      {label && (
        <p className="text-[13px] tracking-wide capitalize whitespace-nowrap">{label}</p>
      )}
    </button>
  );
};

const SemiRoundButton = ({ label, onClick, variant = "glass", className, isIcon, icon: Icon, iconPosition = "left", iconSize }) => {
  const variantClass = VARIANTS[variant] || VARIANTS.glass;
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-1 cursor-pointer active:scale-95 transition-all duration-200 text-center ${variantClass} ${className} text-[13px] font-medium flex gap-2 items-center`}
    >

      {isIcon && Icon && iconPosition === "left" && <Icon size={iconSize} />}

      {label}

      {isIcon && Icon && iconPosition === "right" && <Icon size={iconSize} />}

    </button>
  );
}

export { CustomButton, RoundedButton, SemiRoundButton };
