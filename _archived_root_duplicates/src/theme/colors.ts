// Brand Colors for Nail App
export const BRAND_COLORS = {
  // Background
  background: '#f6f4f0',
  
  // Primary Colors
  primary: '#ffa1ba',    // Main brand pink
  primaryDark: '#ff8aa6',
  primaryLight: '#ffc5d6',
  
  // Accent Colors
  accent: '#e70a5a',     // Bright accent pink
  accentDark: '#c3084e',
  accentLight: '#ff3377',
  
  // Text Colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    onDark: '#ffffff',
    onPrimary: '#ffffff',
    onAccent: '#ffffff',
  },
  
  // UI Colors
  ui: {
    card: '#ffffff',
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Status Colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

// Glassmorphism Colors (updated with brand colors)
export const GLASS_COLORS = {
  light: 'rgba(255, 255, 255, 0.1)',
  dark: 'rgba(0, 0, 0, 0.2)',
  border: 'rgba(255, 255, 255, 0.18)',
  primary: 'rgba(255, 161, 186, 0.2)',
  accent: 'rgba(231, 10, 90, 0.2)',
};

// Gradient combinations
export const GRADIENTS = {
  primary: [BRAND_COLORS.primary, BRAND_COLORS.primaryDark],
  accent: [BRAND_COLORS.accent, BRAND_COLORS.accentDark],
  primaryToAccent: [BRAND_COLORS.primary, BRAND_COLORS.accent],
  lightGradient: ['#ffffff', BRAND_COLORS.background],
};

// Default export
export default BRAND_COLORS;