export type MotionCurve = 'spring' | 'easeInOut' | 'easeOut' | 'linear';

export interface LiquidTokens {
  materials: {
    light: { blurIntensity: number; overlayOpacity: number; vibrancy: boolean };
    dark: { blurIntensity: number; overlayOpacity: number; vibrancy: boolean };
  };
  surface: {
    cornerRadius: number;
    borderWidth: number;
    borderColorLight: string;
    borderColorDark: string;
  };
  shadow: { color: string; radius: number; offsetY: number; opacity: number };
  chip: { height: number; hPadding: number; gap: number; minHit: number; selectedTint: string };
  motion: {
    expand: { duration: number; curve: MotionCurve; damping: number; response: number; stagger: number };
    collapse: { duration: number; curve: MotionCurve };
    press: { scale: number; duration: number };
  };
}

export const liquidTokens: LiquidTokens = {
  materials: {
    light: { blurIntensity: 55, overlayOpacity: 0.08, vibrancy: true },
    dark: { blurIntensity: 60, overlayOpacity: 0.12, vibrancy: true },
  },
  surface: {
    cornerRadius: 18,
    borderWidth: 1,
    borderColorLight: 'rgba(255,255,255,0.22)',
    borderColorDark: 'rgba(255,255,255,0.26)',
  },
  shadow: { color: 'rgba(0,0,0,0.25)', radius: 16, offsetY: 8, opacity: 0.18 },
  chip: { height: 36, hPadding: 14, gap: 8, minHit: 44, selectedTint: '#E70A5A' },
  motion: {
    expand: { duration: 320, curve: 'spring', damping: 0.78, response: 0.28, stagger: 40 },
    collapse: { duration: 260, curve: 'easeInOut' },
    press: { scale: 0.98, duration: 120 },
  },
};

