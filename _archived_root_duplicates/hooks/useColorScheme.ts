import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
  const colorScheme = useNativeColorScheme();
  return colorScheme || 'light';
}

export function useIsDarkMode() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark';
}

// Theme colors
export const colors = {
  light: {
    background: '#f6f4f0', // New brand background
    backgroundSecondary: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: 'rgba(0, 0, 0, 0.1)',
    glassTint: 'light' as const,
    glassIntensity: 50,
    gradientStart: '#f6f4f0', // New brand background
    gradientMiddle: '#FFFFFF',
    gradientEnd: '#f6f4f0', // New brand background
    primary: '#ffa1ba', // Brand pink
    accent: '#e70a5a', // Brand accent
  },
  dark: {
    background: '#1a1814', // Darker version of brand background
    backgroundSecondary: '#252320',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.1)',
    glassTint: 'dark' as const,
    glassIntensity: 55,
    gradientStart: '#1a1814',
    gradientMiddle: '#252320',
    gradientEnd: '#1a1814',
    primary: '#ffa1ba', // Brand pink
    accent: '#e70a5a', // Brand accent
  },
};

export function useThemeColors() {
  const isDark = useIsDarkMode();
  return isDark ? colors.dark : colors.light;
}