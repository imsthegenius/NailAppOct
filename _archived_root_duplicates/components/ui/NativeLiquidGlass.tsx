import React from 'react';
import {
  requireNativeComponent,
  ViewStyle,
  Platform,
  View,
  StyleSheet,
  NativeModules,
  StyleProp,
} from 'react-native';

// Import expo-blur for all platforms
let BlurView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require('expo-blur').BlurView;
} catch {}

interface NativeLiquidGlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'extraLight' | 'default';
  cornerRadius?: number;
  borderWidth?: number;
}

// Native component for iOS 26
const NativeLiquidGlassView = Platform.OS === 'ios'
  ? requireNativeComponent<NativeLiquidGlassProps>('LiquidGlassView')
  : null;

// Check if native module is available
const isNativeAvailable = () => {
  if (Platform.OS === 'ios' && NativeModules.LiquidGlassModule) {
    return NativeModules.LiquidGlassModule.isAvailable;
  }
  return false;
};

export const NativeLiquidGlass: React.FC<NativeLiquidGlassProps> = ({
  children,
  style,
  intensity = 80,
  tint = 'light',
  cornerRadius = 20,
  borderWidth = 0.5,
}) => {
  // Use native iOS 26 glass effect if available
  if (Platform.OS === 'ios' && NativeLiquidGlassView && isNativeAvailable()) {
    return (
      <View style={[styles.container, style]}>
        <NativeLiquidGlassView
          style={StyleSheet.absoluteFillObject}
          intensity={intensity / 100} // Convert to 0-1 range
          tint={tint}
          cornerRadius={cornerRadius}
          borderWidth={borderWidth}
        />
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  // Fallback when native iOS glass is not available
  // Use expo-blur for all platforms
  return (
    <View style={[styles.container, style, { borderRadius: cornerRadius }]}>
      {BlurView ? (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          intensity={intensity}
          tint={tint}
          experimentalBlurMethod="dimezisBlurView"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      )}
      <View style={[styles.glassOverlay, { borderRadius: cornerRadius }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    zIndex: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
});
