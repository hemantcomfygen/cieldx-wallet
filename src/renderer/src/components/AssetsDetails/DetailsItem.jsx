const DetailsItem = ({
  title,
  description,
  value,
  action,
  button,
}) => {
  return (
    <div className="p-6 flex justify-between gap-6">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-gray-400 max-w-xl">{description}</p>

        {action && !button && (
          <button className="text-xs text-gray-400 hover:text-white">
            {action} →
          </button>
        )}
      </div>

      <div className="flex items-center">
        {value && (
          <span className="text-sm text-gray-300 whitespace-nowrap">
            {value}
          </span>
        )}

        {button && (
          <button className="btn-secondary whitespace-nowrap">
            {action}
          </button>
        )}
      </div>
    </div>
  );
};


export default DetailsItem