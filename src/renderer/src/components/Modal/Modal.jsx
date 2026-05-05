import { useEffect, useState } from "react";

const Modal = ({ isOpen, onClose, title, children, size = "md", isClose = true }) => {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setTimeout(() => setShow(true), 10); // allow DOM render
      document.body.style.overflow = "hidden";
    } else {
      setShow(false);
      document.body.style.overflow = "unset";
      setTimeout(() => setRender(false), 300); // match animation duration
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!render) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* Modal */}
      <div
        className={`relative bg-[#1A1C1F] rounded-2xl ${sizeClasses[size]} w-full border border-white/10 shadow-2xl 
        transform transition-all duration-300 ${show
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {
            isClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )
          }
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-hidden overflow-y-auto hide-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default Modal;