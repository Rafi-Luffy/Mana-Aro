/**
 * Mana Aarogyam Design System
 * 
 * Health-first, field-optimized design system for rural healthcare workers
 * Built for low-spec devices, offline-first functionality, and minimal cognitive load
 */

// Color System
export const colors = {
  primary: {
    main: '#0D9488', // Soft Medical Blue-Green
    light: '#14B8A6',
    dark: '#0F766E',
    lightest: '#CCFBF1',
  },
  secondary: {
    main: '#059669', // Calming Green
    light: '#10B981',
    dark: '#047857',
    lightest: '#D1FAE5',
  },
  alert: {
    error: '#DC2626', // Muted Red
    warning: '#D97706', // Amber
    success: '#16A34A', // Green
    info: '#0284C7', // Blue
  },
  neutral: {
    bg: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: '#1F2937',
    textMuted: '#6B7280',
    textDisabled: '#9CA3AF',
  },
}

// Typography System
export const typography = {
  headings: {
    h1: {
      fontSize: '32px', // 2xl
      fontWeight: 700,
      lineHeight: '1.2',
    },
    h2: {
      fontSize: '28px', // xl
      fontWeight: 700,
      lineHeight: '1.3',
    },
    h3: {
      fontSize: '20px', // lg
      fontWeight: 600,
      lineHeight: '1.4',
    },
    h4: {
      fontSize: '18px', // base + bold
      fontWeight: 600,
      lineHeight: '1.5',
    },
  },
  body: {
    large: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '1.5',
    },
    base: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.5',
    },
    small: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '1.4',
    },
    xsmall: {
      fontSize: '11px',
      fontWeight: 400,
      lineHeight: '1.4',
    },
  },
  labels: {
    h: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '1.5',
    },
    m: {
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '1.4',
    },
    s: {
      fontSize: '11px',
      fontWeight: 600,
      lineHeight: '1.4',
    },
  },
}

// Spacing System
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
}

// Component Sizing
export const componentSizes = {
  button: {
    sm: {
      padding: '8px 12px',
      minHeight: '32px',
      fontSize: '12px',
    },
    md: {
      padding: '10px 16px',
      minHeight: '40px',
      fontSize: '14px',
    },
    lg: {
      padding: '12px 24px',
      minHeight: '48px',
      fontSize: '16px',
    },
  },
  input: {
    height: '40px',
    padding: '10px 12px',
    fontSize: '14px',
  },
  card: {
    padding: '16px',
    borderRadius: '8px',
  },
}

// Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
}

// Shadows (Light, subtle)
export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
}

// Animation Tokens (Subtle for low-spec devices)
export const animation = {
  duration: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
  },
  easing: {
    ease: 'easing(ease)',
    easeIn: 'easing(ease-in)',
    easeOut: 'easing(ease-out)',
    easeInOut: 'easing(ease-in-out)',
  },
}

// Accessibility
export const a11y = {
  focusRing: '0 0 0 2px rgba(13, 148, 136, 0.5)',
  minTouchTarget: '44px', // iOS standard
}

// Healthcare-Specific Tokens
export const healthcare = {
  riskLevels: {
    low: colors.secondary.main,
    medium: colors.alert.warning,
    high: colors.alert.error,
  },
  status: {
    synced: colors.secondary.main,
    syncing: colors.alert.info,
    offline: colors.alert.warning,
    error: colors.alert.error,
  },
  vitalsNormal: {
    bp: '120/80',
    pulse: '60-100 bpm',
    temp: '98.6°F',
  },
}

// Usage Examples in Components
export const designGuidelines = {
  icons: {
    minSize: '16px', // Never go below
    preferredSizes: ['20px', '24px', '32px'],
    color: 'inherit',
  },
  buttons: {
    minHeight: '44px', // Touch target on mobile
    maxWidth: '100%',
    spacing: '8px between', // Between buttons
  },
  forms: {
    inputMinHeight: '44px',
    inputFontSize: '16px', // Prevents zoom on iOS
    labelFontSize: '14px',
    spacing: '12px between fields',
  },
  cards: {
    padding: '16px',
    spacing: '12px between cards', // Grid gap
    cornerRadius: '8px',
  },
  lists: {
    itemMinHeight: '48px',
    spacing: '8px between',
    padding: '12px',
  },
}

export default {
  colors,
  typography,
  spacing,
  componentSizes,
  breakpoints,
  shadows,
  animation,
  a11y,
  healthcare,
  designGuidelines,
}
