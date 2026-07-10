// frontend/src/components/ui/Select.jsx
export function Select({
  label,
  options,
  error,
  required = false,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full
          px-4 py-2
          border
          ${error ? 'border-red-500' : 'border-gray-300'}
          rounded-lg
          focus:outline-none
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
          transition-colors
          bg-white
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}