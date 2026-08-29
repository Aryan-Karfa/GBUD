export const colors = {
  background: {
    primary: '#09090b',
    secondary: '#121214',
    tertiary: '#18181b',
  },
  surfaces: {
    card: '#18181b',
    cardBorder: '#27272a',
    cardHover: '#222226',
  },
  brand: {
    emerald: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#34d399',
    cyan: '#06b6d4',
    amber: '#f59e0b',
  },
  text: {
    primary: '#fafafa',
    secondary: '#a1a1aa',
    muted: '#71717a',
    inverse: '#09090b',
  },
  status: {
    success: '#10b981',
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.12)',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  borders: {
    border: '#27272a',
    borderFocus: '#10b981',
  },
} as const;

export type Colors = typeof colors;
