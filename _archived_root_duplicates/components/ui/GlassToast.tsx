import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface GlassToastProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  message?: string;
  duration?: number;
  onHide?: () => void;
}

export const GlassToast: React.FC<GlassToastProps> = ({
  visible,
  icon = 'checkmark-circle',
  message,
  duration = 1500,
  onHide,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback when showing
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.glassBox}>
        <Ionicons name={icon} size={48} color="white" />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: width / 2 - 60,
    marginTop: -60,
    zIndex: 9999,
  },
  glassBox: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});