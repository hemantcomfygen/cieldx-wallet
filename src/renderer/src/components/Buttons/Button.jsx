export const Button = ({ label, variant = "primary" }) => {
  const styles =
    variant === "primary"
      ? "bg-green-500 hover:bg-green-400 text-black"
      : "bg-white/10 hover:bg-white/20 text-gray-300";

  return (
    <button
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${styles}`}
    >
      {label}
    </button>
  );
};