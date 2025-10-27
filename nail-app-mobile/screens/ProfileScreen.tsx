import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import { supabase } from '../lib/supabase';
import { GlassmorphicView } from '../components/ui/GlassmorphicView';
import { screenGradients, surfaceGradients, overlayShapes } from '../theme/gradients';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { MainStackParamList } from '../navigation/types';

const WINDOW_DIMENSIONS = Dimensions.get('window');
const WINDOW_WIDTH = WINDOW_DIMENSIONS.width;
const creamBase = '#F6F4F0';
const accentPink = '#C11961';
const accentPinkLight = '#FF8AB8';

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Profile'>>();
  const { status } = useSubscriptionStatus();
  const isPremium = status !== 'free';
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let unsub: any;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email ?? null);
      setUserName(session?.user?.user_metadata?.full_name ?? null);
      const { data } = supabase.auth.onAuthStateChange((_e, s) => {
        setUserEmail(s?.user?.email ?? null);
        setUserName(s?.user?.user_metadata?.full_name ?? null);
      });
      unsub = data?.subscription;
    };
    load();
    return () => unsub?.unsubscribe?.();
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSettingPress = (setting: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Placeholder for future routing
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    navigation.navigate('DeleteAccount');
  };

  type MenuItem = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
    variant?: 'default' | 'destructive';
  };

  const menuItemsPrimary: MenuItem[] = [
    { icon: 'bookmark-outline', label: 'Saved Collections' },
    { icon: 'color-palette-outline', label: 'Style Preferences' },
    { icon: 'time-outline', label: 'Recently Used Colors' },
    { icon: 'share-social-outline', label: 'Share Profile' },
  ];

  const menuItemsSecondary: MenuItem[] = [
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy' },
    { icon: 'help-circle-outline', label: 'Help & Support' },
    { icon: 'trash-outline', label: 'Delete Account', onPress: handleDeleteAccount, variant: 'destructive' },
  ];

  const openManageSubscriptions = async () => {
    const iosUrl = 'itms-apps://apps.apple.com/account/subscriptions';
    const iosFallbackUrl = 'https://apps.apple.com/account/subscriptions';
    const androidUrl = 'https://play.google.com/store/account/subscriptions';
    const targetUrl = Platform.OS === 'ios' ? iosUrl : androidUrl;

    try {
      const canOpen = await Linking.canOpenURL(targetUrl);
      const urlToOpen = canOpen ? targetUrl : Platform.OS === 'ios' ? iosFallbackUrl : androidUrl;
      await Linking.openURL(urlToOpen);
    } catch (error) {
      if (__DEV__) {
        console.error('Unable to open subscription management:', error);
      }
      Alert.alert(
        'Unable to open',
        'Please manage your subscription directly in the App Store settings.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={screenGradients.profile}
        start={{ x: 0.1, y: 0.9 }}
        end={{ x: 0.9, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.decorLayer}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={26} color={accentPink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => handleSettingPress('settings')}>
          <Ionicons name="settings-outline" size={22} color={accentPink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GlassmorphicView style={styles.profileCard}>
          <View style={styles.profileCardContent}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color={accentPinkLight} />
            </View>
            <View style={styles.avatarGlow} />
          </View>
          <Text style={styles.userName}>{userName || userEmail || 'Guest User'}</Text>
          <Text style={styles.userEmail}>
            {userEmail ? 'Signed in' : 'Sign in to save and sync your looks'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Looks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
          </View>

          {!isPremium && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Upgrade')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={surfaceGradients.buttonPrimary}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          </View>
        </GlassmorphicView>

        <GlassmorphicView style={styles.quickActionCard}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleDeleteAccount}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            accessibilityHint="Opens the delete account confirmation screen"
            activeOpacity={0.85}
          >
            <View style={styles.quickActionIconWrap}>
              <Ionicons name="trash-outline" size={20} color="#BF0F53" />
            </View>
            <View style={styles.quickActionTextWrap}>
              <Text style={styles.quickActionTitle}>Delete Account</Text>
              <Text style={styles.quickActionSubtitle} numberOfLines={2}>
                Permanently remove your profile, saved looks, and billing data.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#F25B8A" />
          </TouchableOpacity>
        </GlassmorphicView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Space</Text>
          <GlassmorphicView style={styles.menuCard}>
            <View style={styles.menuList}>
            {menuItemsPrimary.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === menuItemsPrimary.length - 1 && styles.menuItemLast]}
                onPress={() => handleSettingPress(item.label)}
                activeOpacity={0.85}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={accentPink} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={accentPinkLight} />
              </TouchableOpacity>
            ))}
            </View>
          </GlassmorphicView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <GlassmorphicView style={styles.menuCard}>
            <View style={styles.menuList}>
            {menuItemsSecondary.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === menuItemsSecondary.length - 1 && styles.menuItemLast]}
                onPress={() => (item.onPress ? item.onPress() : handleSettingPress(item.label))}
                activeOpacity={0.85}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.variant === 'destructive' ? '#BF0F53' : accentPink}
                  />
                </View>
                <Text
                  style={[
                    styles.menuText,
                    item.variant === 'destructive' && styles.menuTextDestructive,
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={item.variant === 'destructive' ? '#F25B8A' : accentPinkLight}
                />
              </TouchableOpacity>
            ))}
            </View>
          </GlassmorphicView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <GlassmorphicView style={styles.manageSubscriptionCard}>
            <TouchableOpacity
              style={styles.manageContent}
              activeOpacity={0.88}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await openManageSubscriptions();
              }}
            >
              <View style={styles.manageIconWrap}>
                <Ionicons name="card-outline" size={22} color={accentPink} />
              </View>
              <View style={styles.manageTextWrap}>
                <Text style={styles.manageTitle}>Manage Subscription</Text>
                <Text style={styles.manageSubtitle}>Opens the App Store to update or cancel billing.</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={accentPinkLight} />
            </TouchableOpacity>
          </GlassmorphicView>
        </View>

        <View style={styles.authSection}>
          {userEmail ? (
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.92}
              onPress={async () => {
                try {
                  await supabase.auth.signOut();
                  navigation.navigate('Login');
                } catch {}
              }}
            >
              <LinearGradient
                colors={surfaceGradients.buttonSecondary}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.signInGradient}
              >
                <Text style={styles.signInText}>Sign Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.92}
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient
                colors={surfaceGradients.buttonSecondary}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.signInGradient}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: creamBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: accentPink,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  profileCard: {
    marginTop: 12,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193,25,97,0.18)',
    shadowColor: '#FF6BA6',
    shadowOffset: { width: 0, height: 26 },
    shadowOpacity: 0.24,
    shadowRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  profileCardContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  quickActionCard: {
    marginHorizontal: 16,
    marginBottom: 28,
    borderRadius: 22,
    overflow: 'hidden',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
  quickActionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(191, 15, 83, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTextWrap: {
    flex: 1,
    gap: 4,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BF0F53',
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6A223E',
    lineHeight: 18,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(193,25,97,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    opacity: 0.6,
    alignSelf: 'center',
    top: -15,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: accentPink,
  },
  userEmail: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(193,25,97,0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    marginTop: 28,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: accentPink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(193,25,97,0.6)',
  },
  upgradeButton: {
    marginTop: 26,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#FF6BA6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
  },
  upgradeButtonGradient: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: accentPink,
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193,25,97,0.18)',
    shadowColor: '#FF6BA6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  menuList: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(193,25,97,0.12)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(193,25,97,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: accentPink,
    fontWeight: '500',
  },
  menuTextDestructive: {
    color: '#BF0F53',
  },
  manageSubscriptionCard: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193,25,97,0.18)',
    shadowColor: '#FF6BA6',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  manageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  manageIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(231, 10, 90, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageTextWrap: {
    flex: 1,
    marginLeft: 16,
  },
  manageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: accentPink,
  },
  manageSubtitle: {
    fontSize: 13,
    color: 'rgba(193,25,97,0.7)',
    marginTop: 2,
  },
  authSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  signInButton: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#FF6BA6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
  },
  signInGradient: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  signInText: {
    color: accentPink,
    fontSize: 17,
    fontWeight: '600',
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  decorCircleLarge: {
    position: 'absolute',
    width: WINDOW_WIDTH * 1.25,
    height: WINDOW_WIDTH * 1.25,
    borderRadius: (WINDOW_WIDTH * 1.25) / 2,
    backgroundColor: overlayShapes.highlight,
    top: -WINDOW_WIDTH * 0.55,
    right: -WINDOW_WIDTH * 0.45,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: WINDOW_WIDTH * 0.9,
    height: WINDOW_WIDTH * 0.9,
    borderRadius: (WINDOW_WIDTH * 0.9) / 2,
    backgroundColor: overlayShapes.softer,
    bottom: -WINDOW_WIDTH * 0.45,
    left: -WINDOW_WIDTH * 0.25,
  },
});
