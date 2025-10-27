import { glass, gradients, palette } from './tokens';

export const BRAND_COLORS = {
  background: palette.background,
  backgroundElevated: palette.backgroundElevated,
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryLight: palette.primaryLight,
  accent: palette.accent,
  accentDark: palette.accentDark,
  accentLight: palette.accentLight,
  text: {
    primary: palette.textPrimary,
    secondary: palette.textSecondary,
    light: palette.textTertiary,
    onDark: '#ffffff',
    onPrimary: '#ffffff',
    onAccent: '#ffffff',
  },
  ui: {
    card: palette.backgroundElevated,
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
};

export const GLASS_COLORS = {
  light: glass.layers.base,
  dark: 'rgba(0, 0, 0, 0.32)',
  border: glass.border,
  highlight: glass.highlight,
};

export const GRADIENTS = {
  primary: gradients.surfaces.buttonPrimary,
  accent: gradients.onboarding.preview,
  primaryToAccent: [palette.primary, palette.accent] as const,
  lightGradient: ['#ffffff', palette.background] as const,
};

export default BRAND_COLORS;
