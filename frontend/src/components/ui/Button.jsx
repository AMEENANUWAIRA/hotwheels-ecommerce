// frontend/src/components/ui/Button.jsx
import { COLORS, BUTTON_SIZES, BORDER_RADIUS, TRANSITIONS } from '../../config/design';
import { Spinner } from './Spinner';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon = null,
  ...props
}) {
  const baseStyles = `
    font-medium
    rounded-${BORDER_RADIUS.lg}
    transition-${TRANSITIONS.fast}
    cursor-pointer
    inline-flex
    items-center
    justify-center
    gap-2
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const variants = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 ${!disabled && !loading ? 'shadow-md hover:shadow-lg' : ''}`,
    secondary: `bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400`,
    danger: `bg-red-600 text-white hover:bg-red-700 active:bg-red-800`,
    success: `bg-green-600 text-white hover:bg-green-700 active:bg-green-800`,
    outline: `border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100`,
    ghost: `text-blue-600 hover:bg-blue-50 active:bg-blue-100`,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${BUTTON_SIZES[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}