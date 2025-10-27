import { ColorSchemeName } from 'react-native';

export const palette = {
  background: '#f6f4f0',
  backgroundElevated: '#ffffff',
  backgroundMuted: '#f2ecff',
  primary: '#ffa1ba',
  primaryDark: '#ff8aa6',
  primaryLight: '#ffc5d6',
  accent: '#e70a5a',
  accentDark: '#c3084e',
  accentLight: '#ff3377',
  neutral900: '#1a1814',
  neutral800: '#252320',
  neutral700: '#3c3831',
  neutral100: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  glassHighlight: 'rgba(255, 255, 255, 0.18)',
  glassBorder: 'rgba(255, 255, 255, 0.24)',
};

type ThemeVariant = {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  glassTint: 'light' | 'dark';
  glassIntensity: number;
  primary: string;
  accent: string;
  overlay: {
    highlight: string;
    softer: string;
    glow: string;
  };
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
};

export const themeVariants: Record<'light' | 'dark', ThemeVariant> = {
  light: {
    background: palette.background,
    backgroundSecondary: palette.backgroundElevated,
    surface: palette.backgroundElevated,
    surfaceMuted: 'rgba(255,255,255,0.65)',
    text: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    glassTint: 'light',
    glassIntensity: 48,
    primary: palette.primary,
    accent: palette.accent,
    overlay: {
      highlight: 'rgba(255, 255, 255, 0.28)',
      softer: 'rgba(255, 255, 255, 0.16)',
      glow: 'rgba(255, 255, 255, 0.08)',
    },
    gradientStart: palette.background,
    gradientMiddle: palette.backgroundElevated,
    gradientEnd: palette.background,
  },
  dark: {
    background: palette.neutral900,
    backgroundSecondary: palette.neutral800,
    surface: 'rgba(37, 35, 32, 0.82)',
    surfaceMuted: 'rgba(37, 35, 32, 0.64)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    glassTint: 'dark',
    glassIntensity: 55,
    primary: palette.primary,
    accent: palette.accentLight,
    overlay: {
      highlight: 'rgba(255, 255, 255, 0.18)',
      softer: 'rgba(255, 255, 255, 0.12)',
      glow: 'rgba(255, 255, 255, 0.08)',
    },
    gradientStart: palette.neutral900,
    gradientMiddle: palette.neutral800,
    gradientEnd: palette.neutral900,
  },
};

export const gradients = {
  onboarding: {
    // Soft vertical pinks to match design refs (00/01.png)
    // Use same gradient for all onboarding slides to ensure consistency
    preview: ['#F7AFC3', '#FFEFF3'] as const,
    customise: ['#F7AFC3', '#FFEFF3'] as const,
    cta: ['#F7AFC3', '#FFEFF3'] as const,
  },
  surfaces: {
    card: ['rgba(255, 255, 255, 0.28)', 'rgba(255, 255, 255, 0.08)'] as const,
    buttonPrimary: [palette.primary, palette.accent] as const,
    buttonSecondary: ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.85)'] as const,
  },
  screens: {
    profile: [palette.background, palette.background, palette.background] as const,
    // Login/Signup soft gradient to mirror reference (02.png)
    auth: ['#F7AFC3', '#FFEFF3'] as const,
  },
};

export const glass = {
  layers: {
    base: 'rgba(255, 255, 255, 0.14)',
    elevated: 'rgba(255, 255, 255, 0.22)',
  },
  border: palette.glassBorder,
  highlight: palette.glassHighlight,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const },
  heading: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

export const tokens = {
  palette,
  themeVariants,
  gradients,
  glass,
  spacing,
  radii,
  typography,
};

export type ThemeTokens = typeof tokens;
export type ThemeMode = keyof typeof themeVariants;
export type ThemeColors = ThemeVariant;

export const getThemeForScheme = (scheme: ColorSchemeName | undefined): ThemeVariant => {
  if (scheme === 'dark') {
    return themeVariants.dark;
  }
  return themeVariants.light;
};

export default tokens;
