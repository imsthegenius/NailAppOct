import React, { useEffect, useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Dimensions,
  Platform,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeLiquidGlass } from './NativeLiquidGlass';
import { useThemeColors } from '../../hooks/useColorScheme';

const { width } = Dimensions.get('window');

interface LiquidGlassTabBarProps {
  // Fixed tabs per Figma: Design and Feed
  activeTab: 'Design' | 'Feed' | '';
  onTabPress: (route: 'Design' | 'Feed') => void;
  onCameraPress?: () => void;
  collapsed?: boolean;
  autoHide?: boolean;
}

export const LiquidGlassTabBar: React.FC<LiquidGlassTabBarProps> = ({
  activeTab,
  onTabPress,
  onCameraPress,
  collapsed = false,
  autoHide = true,
}) => {
  const theme = useThemeColors();
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animatedTranslateY = useRef(new Animated.Value(0)).current;
  // No selection indicator in original spec

  useEffect(() => {
    if (collapsed) {
      // Shrink and move down
      Animated.parallel([
        Animated.spring(animatedScale, {
          toValue: 0.9,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Expand and move up
      Animated.parallel([
        Animated.spring(animatedScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [collapsed]);

  // No indicator positioning logic

  const handleTabPress = (route: 'Design' | 'Feed') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress(route);
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: animatedOpacity,
          transform: [
            { translateY: animatedTranslateY },
            { scaleY: animatedScale }
          ],
        }
      ]}
      
    >
      {!collapsed && (
        <View style={styles.row}>
          {/* Left block: Design / Feed */}
          <View style={styles.leftBlockWrapper}>
            <NativeLiquidGlass
              style={styles.leftBlock}
              intensity={Math.max(20, (theme.glassIntensity || 50))}
              tint={theme.glassTint}
              cornerRadius={30}
              borderWidth={0.75}
            >
              <View style={styles.leftTabs}>
                {(['Design','Feed'] as const).map((label) => {
                  const isActive = activeTab === label
                  const icon: keyof typeof Ionicons.glyphMap = label === 'Design' ? 'expand' : 'heart'
                  return (
                    <TouchableOpacity
                      key={label}
                      style={styles.miniTab}
                      onPress={() => handleTabPress(label)}
                      activeOpacity={0.8}
                    >
                      {isActive && <View style={styles.selectionPlate} />}
                      <Ionicons name={icon} size={20} color={isActive ? theme.accent : theme.textSecondary} />
                      <Text style={[styles.miniTabLabel, isActive ? styles.miniTabLabelActive : styles.miniTabLabelInactive]}>{label}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </NativeLiquidGlass>
          </View>

          {/* Right circular camera */}
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCameraPress && onCameraPress(); }} activeOpacity={0.85} style={styles.cameraButton}>
            <NativeLiquidGlass
              style={StyleSheet.absoluteFillObject}
              intensity={Math.max(20, (theme.glassIntensity || 50))}
              tint={theme.glassTint}
              cornerRadius={28}
              borderWidth={0.75}
            />
            <Ionicons name="camera" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    // iOS 26 Liquid Glass shadows
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  row: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftBlockWrapper: { flexShrink: 1 },
  leftBlock: { width: undefined, minWidth: 220, height: 60, borderRadius: 30, paddingHorizontal: 10, justifyContent: 'center' },
  leftTabs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  miniTab: { width: 102, height: 50, alignItems: 'center', justifyContent: 'center' },
  selectionPlate: { position: 'absolute', top: 4, bottom: 4, left: 8, right: 8, backgroundColor: '#ededed', borderRadius: 100 },
  miniTabLabel: { fontSize: 10, marginTop: 2, fontWeight: '600' },
  miniTabLabelActive: { color: '#E11D48' },
  miniTabLabelInactive: { color: '#999999', fontWeight: '500' },
  cameraButton: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
