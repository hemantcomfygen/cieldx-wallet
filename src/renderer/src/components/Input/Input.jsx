// const Input = ({ 
//   label, 
//   placeholder, 
//   value, 
//   onChange, 
//   type = 'text',
//   rightIcon,
//   rightAction,
//   leftIcon,
//   error,
//   disabled,
//   ...props 
// }) => {
//   return (
//     <div className="w-full">
//       {label && (
//         <label className="block text-md font-medium text-zinc-300 mb-2">
//           {label}
//         </label>
//       )}
//       <div className="relative">
//         {leftIcon && (
//           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
//             {leftIcon}
//           </div>
//         )}
//         <input
//           type={type}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//           disabled={disabled}
//           className={`
//             w-full bg-primaryTheme border border-white/10 rounded-xl px-4 py-3.5
//             text-white placeholder-gray-600
//             focus:outline-none focus:border-success focus:ring-1 focus:ring-success
//             transition-all
//             ${leftIcon ? 'pl-12' : ''}
//             ${rightIcon || rightAction ? 'pr-12' : ''}
//             ${error ? 'border-red-500' : ''}
//             ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
//           `}
//           {...props}
//         />
//         {(rightIcon || rightAction) && (
//           <div className="absolute right-4 top-1/2 -translate-y-1/2">
//             {rightAction ? (
//               <button 
//                 onClick={rightAction}
//                 className="text-gray-400 hover:text-white transition"
//               >
//                 {rightIcon}
//               </button>
//             ) : (
//               <div className="text-gray-500">{rightIcon}</div>
//             )}
//           </div>
//         )}
//       </div>
//       {error && (
//         <p className="text-red-500 text-sm mt-1">{error}</p>
//       )}
//     </div>
//   );
// };

// export default Input









const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  rows = 3, // 👈 for textarea
  rightIcon,
  rightAction,
  leftIcon,
  error,
  disabled,
  ...props
}) => {

  const isTextarea = type === 'textarea';

  const commonClasses = `
    w-full bg-primaryTheme border border-white/10 rounded-xl px-4 py-3.5
    text-white placeholder-gray-600
    focus:outline-none focus:border-success focus:ring-1 focus:ring-success
    transition-all
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon || rightAction ? 'pr-12' : ''}
    ${error ? 'border-red-500' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-md font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {leftIcon}
          </div>
        )}

        {isTextarea ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`${commonClasses} resize-none`}
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={commonClasses}
            {...props}
          />
        )}

        {(rightIcon || rightAction) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightAction ? (
              <button
                type="button"
                onClick={rightAction}
                className="text-gray-400 hover:text-white transition"
              >
                {rightIcon}
              </button>
            ) : (
              <div className="text-gray-500">{rightIcon}</div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;