import { useColorScheme as useNativeColorScheme } from 'react-native';
import { getThemeForScheme, themeVariants } from '../src/theme/tokens';

export type ThemeColorMode = keyof typeof themeVariants;

export function useColorScheme(): ThemeColorMode {
  const colorScheme = useNativeColorScheme();
  return (colorScheme === 'dark' ? 'dark' : 'light') as ThemeColorMode;
}

export function useIsDarkMode() {
  return useColorScheme() === 'dark';
}

export const themeColors = themeVariants;

export function useThemeColors() {
  const scheme = useNativeColorScheme();
  return getThemeForScheme(scheme);
}
