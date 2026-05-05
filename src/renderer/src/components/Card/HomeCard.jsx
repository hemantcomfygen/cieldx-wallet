import React from "react";

const HomeCard = ({
  image,
  heading,
  description,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[#111418] border border-borderColor rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-success hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-success/5 opacity-0 group-hover:opacity-100 transition duration-300" />

      {/* Content */}
      <div className="relative flex flex-col items-start space-y-5">

        {/* Image */}
        {image && (
          <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-success/10">
            <img
              src={image}
              alt={heading}
              className="w-8 h-8 object-contain"
            />
          </div>
        )}

        {/* Heading */}
        <h3 className="text-xl font-semibold text-white group-hover:text-success transition">
          {heading}
        </h3>

        {/* Description */}
        <p className="text-light-text text-sm leading-relaxed">
          {description}
        </p>

      </div>
    </div>
  );
};

export default HomeCard;