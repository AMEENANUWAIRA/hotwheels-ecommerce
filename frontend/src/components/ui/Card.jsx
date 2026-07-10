import { COLORS, BUTTON_SIZES, BORDER_RADIUS, TRANSITIONS } from '../../config/design';

// frontend/src/components/ui/Card.jsx
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}