const ActionButton = ({ label, variant }) => {
  const base =
    "px-4 py-1.5 rounded-full text-sm font-medium transition";

  const styles =
    variant === "green"
      ? "bg-green-500 text-black hover:bg-green-400"
      : "bg-white/10 text-white hover:bg-white/20";

  return <button className={`${base} ${styles}`}>{label}</button>;
};

export default ActionButton