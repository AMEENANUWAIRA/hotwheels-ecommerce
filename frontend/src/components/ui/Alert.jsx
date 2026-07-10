// frontend/src/components/ui/Alert.jsx
export function Alert({ children, variant = 'info', onClose }) {
  const variants = {
    info: 'bg-blue-50 border-l-4 border-blue-600 text-blue-800',
    success: 'bg-green-50 border-l-4 border-green-600 text-green-800',
    warning: 'bg-amber-50 border-l-4 border-amber-600 text-amber-800',
    error: 'bg-red-50 border-l-4 border-red-600 text-red-800',
  };

  return (
    <div className={`${variants[variant]} p-4 rounded-lg mb-4 flex items-start justify-between`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          ✕
        </button>
      )}
    </div>
  );
}