// frontend/src/components/ui/Input.jsx
export function Input({
  label,
  error,
  size = 'md',
  required = false,
  ...props
}) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full
          ${sizeStyles[size]}
          border
          ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
          rounded-lg
          focus:outline-none
          focus:ring-2
          ${error ? 'focus:ring-red-200' : 'focus:ring-blue-200'}
          transition-colors
          bg-white
        `}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}