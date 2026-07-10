// frontend/src/config/design.js
// Design system and constants for consistent UI across the app

export const COLORS = {
  // Primary
  primary: '#2563eb', // blue-600
  primaryLight: '#3b82f6', // blue-500
  primaryDark: '#1d4ed8', // blue-700
  
  // Secondary (for accents)
  secondary: '#f59e0b', // amber-500
  secondaryLight: '#fbbf24', // amber-400
  secondaryDark: '#d97706', // amber-600
  
  // Success
  success: '#10b981', // emerald-600
  successLight: '#6ee7b7', // emerald-300
  successDark: '#059669', // emerald-700
  
  // Error
  error: '#ef4444', // red-500
  errorLight: '#fca5a5', // red-300
  errorDark: '#991b1b', // red-900
  
  // Warning
  warning: '#f97316', // orange-500
  warningLight: '#fed7aa', // orange-200
  warningDark: '#9a3412', // orange-900
  
  // Neutral
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
};

export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: '2.25rem', // 36px
    fontWeight: 'bold',
    lineHeight: '2.5rem', // 40px
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.875rem', // 30px
    fontWeight: 'bold',
    lineHeight: '2.25rem', // 36px
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem', // 24px
    fontWeight: 'bold',
    lineHeight: '2rem', // 32px
  },
  h4: {
    fontSize: '1.25rem', // 20px
    fontWeight: '600',
    lineHeight: '1.75rem', // 28px
  },
  
  // Body
  bodyLarge: {
    fontSize: '1.125rem', // 18px
    fontWeight: '400',
    lineHeight: '1.75rem', // 28px
  },
  bodyRegular: {
    fontSize: '1rem', // 16px
    fontWeight: '400',
    lineHeight: '1.5rem', // 24px
  },
  bodySmall: {
    fontSize: '0.875rem', // 14px
    fontWeight: '400',
    lineHeight: '1.25rem', // 20px
  },
  
  // Labels
  labelMedium: {
    fontSize: '0.875rem', // 14px
    fontWeight: '500',
    lineHeight: '1.25rem', // 20px
  },
  labelSmall: {
    fontSize: '0.75rem', // 12px
    fontWeight: '500',
    lineHeight: '1rem', // 16px
    letterSpacing: '0.5px',
  },
};

export const BORDER_RADIUS = {
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  full: '9999px',
};

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const TRANSITIONS = {
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultraWide: '1536px',
};

// Product category configuration
export const PRODUCT_CATEGORIES = [
  { id: 'street_racers', label: 'Street Racers', icon: '🏁' },
  { id: 'hot_trucks', label: 'Hot Trucks', icon: '🚚' },
  { id: 'sports_cars', label: 'Sports Cars', icon: '🏎️' },
  { id: 'classics', label: 'Classics', icon: '🚗' },
  { id: 'exotics', label: 'Exotics', icon: '✨' },
];

// Order status configuration
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: '📦' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✓' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '✕' },
};

// Button sizes
export const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

// Input sizes
export const INPUT_SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-base',
};

export default {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
  BREAKPOINTS,
  PRODUCT_CATEGORIES,
  ORDER_STATUSES,
  BUTTON_SIZES,
  INPUT_SIZES,
};