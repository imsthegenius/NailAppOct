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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeLiquidGlass } from './NativeLiquidGlass';
import { useThemeColors } from '../../hooks/useColorScheme';

const { width } = Dimensions.get('window');

interface Tab {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

interface LiquidGlassTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (route: string) => void;
  collapsed?: boolean;
  autoHide?: boolean;
}

export const LiquidGlassTabBar: React.FC<LiquidGlassTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  collapsed = false,
  autoHide = true,
}) => {
  const theme = useThemeColors();
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animatedTranslateY = useRef(new Animated.Value(0)).current;

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

  const handleTabPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress(route);
  };

  // Fallback for Android
  if (Platform.OS === 'android') {
    return (
      <Animated.View 
        style={[
          styles.container,
          styles.androidContainer,
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
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.route;
              return (
                <TouchableOpacity
                  key={tab.route}
                  style={styles.tab}
                  onPress={() => handleTabPress(tab.route)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tab.icon}
                    size={24}
                    color={isActive ? theme.accent : theme.textSecondary}
                  />
                  <Text style={[styles.tabLabel, { color: isActive ? theme.accent : theme.textSecondary }, isActive && styles.activeTabLabel]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Animated.View>
    );
  }

  // iOS with native liquid glass effect
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
      <NativeLiquidGlass
        style={StyleSheet.absoluteFillObject}
        intensity={Math.max(20, (theme.glassIntensity || 50) - 10)}
        tint={theme.glassTint}
        cornerRadius={30}
        borderWidth={0.75}
      >
        {!collapsed && (
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.route;
              return (
                <TouchableOpacity
                  key={tab.route}
                  style={styles.tab}
                  onPress={() => handleTabPress(tab.route)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tab.icon}
                    size={24}
                    color={isActive ? theme.accent : theme.textSecondary}
                  />
                  <Text style={[styles.tabLabel, { color: isActive ? theme.accent : theme.textSecondary }, isActive && styles.activeTabLabel]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </NativeLiquidGlass>
      {/* Subtle liquid-glass highlight overlay (does not block touches) */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)', 'transparent']}
        locations={[0, 0.25, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.highlightOverlay}
      />
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
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 30,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '600',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
});
