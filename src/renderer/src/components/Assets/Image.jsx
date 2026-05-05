import errorImg from "/error.png"

const Image = ({
  src,
  alt = "image",
  className = "",
  width = "auto",
  height = "auto",
  fallbackSrc = errorImg,
  loading = "lazy",
  rounded = false,
  onClick,
}) => {

  return (
    <img
      src={src || fallbackSrc}
      alt={alt}
      loading={loading}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallbackSrc
      }}
      onClick={onClick}
      width={width}
      height={height}
      className={`
        ${rounded ? "rounded-full" : "rounded-lg"}
        object-cover
        transition-transform duration-200 hover:scale-105
        ${className}
      `}
    />
  );
};

export default Image;
