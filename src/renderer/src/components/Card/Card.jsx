const Card = ({ children }) => {
  return (
    <div className="bg-[#1a1d1f] rounded-2xl p-10 w-full max-w-4xl mx-auto shadow-lg">
      {children}
    </div>
  );
};

export default Card;
