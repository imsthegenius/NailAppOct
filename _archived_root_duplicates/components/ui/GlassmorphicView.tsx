import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassmorphicViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: 'light' | 'dark' | 'ultraLight';
}

export const GlassmorphicView: React.FC<GlassmorphicViewProps> = ({
  children,
  style,
  intensity = 20,
  variant = 'light'
}) => {
  // Fallback for Android or if blur doesn't work
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.androidFallback, style]}>
        {children}
      </View>
    );
  }

  const tintMap = {
    'light': 'light' as const,
    'dark': 'dark' as const,
    'ultraLight': 'light' as const
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView
        style={StyleSheet.absoluteFillObject}
        intensity={intensity}
        tint={tintMap[variant]}
        experimentalBlurMethod="dimezisBlurView"
      />
      <View style={styles.glassLayer} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // iOS 26 Liquid Glass spec
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  content: {
    zIndex: 1,
  },
  androidFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)', // Will work on some Android devices
  },
});