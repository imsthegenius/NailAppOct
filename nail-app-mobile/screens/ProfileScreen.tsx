import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import { supabase } from '../lib/supabase';
import type { MainStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useThemeColors } from '../hooks/useColorScheme';
import { tokens } from '../src/theme/tokens';

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Profile'>>();
  const theme = useThemeColors();
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

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    navigation.navigate('DeleteAccount');
  };

  const handleSettingPress = (setting: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (setting === 'Privacy') {
      navigation.navigate('PrivacyPolicy');
      return;
    }
    if (setting === 'Terms of Service') {
      navigation.navigate('TermsOfService');
      return;
    }
    if (setting === 'Help & Support') {
      Linking.openURL('mailto:support@nailglow.app');
      return;
    }
  };

  const menuItems = [
    { icon: 'shield-checkmark-outline' as const, label: 'Privacy' },
    { icon: 'document-text-outline' as const, label: 'Terms of Service' },
    { icon: 'help-circle-outline' as const, label: 'Help & Support' },
  ];

  const openManageSubscriptions = async () => {
    try {
      const mod: any = await import('react-native-purchases');
      const Purchases = mod?.default ?? mod;
      if (Purchases && typeof Purchases.showManageSubscriptions === 'function') {
        await Purchases.showManageSubscriptions();
        return;
      }
    } catch { }

    const iosUrl = 'itms-apps://apps.apple.com/account/subscriptions';
    const iosFallbackUrl = 'https://apps.apple.com/account/subscriptions';
    const androidUrl = 'https://play.google.com/store/account/subscriptions';
    const targetUrl = Platform.OS === 'ios' ? iosUrl : androidUrl;
    try {
      const canOpen = await Linking.canOpenURL(targetUrl);
      const urlToOpen = canOpen ? targetUrl : Platform.OS === 'ios' ? iosFallbackUrl : androidUrl;
      await Linking.openURL(urlToOpen);
    } catch (error) {
      if (__DEV__) console.error('Unable to open subscription management:', error);
      Alert.alert('Unable to open', Platform.OS === 'ios' ? 'Open Settings ▸ Apple ID ▸ Subscriptions to manage your subscription.' : 'Open Play Store ▸ Payments & subscriptions to manage your subscription.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientMiddle, theme.gradientEnd]}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} activeOpacity={0.8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={theme.accent} />
        </TouchableOpacity>

        <MaskedView
          maskElement={
            <Text style={[styles.headerTitle, styles.headerTitleMask]}>Profile</Text>
          }
        >
          <LinearGradient
            colors={['rgba(255,161,186,1)', 'rgba(231,10,90,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.headerTitle, styles.headerTitleGhost]}>Profile</Text>
          </LinearGradient>
        </MaskedView>

        <View style={{ width: 44 }} />
        {/* Spacer to balance the header since we removed the right icon or can put something else */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* User card - Manual Glass Style */}
        <View style={styles.glassCard}>
          <View style={styles.userRow}>
            <View style={[styles.userIconWrap, { backgroundColor: 'rgba(255,161,186,0.15)' }]}>
              <Ionicons name="person" size={22} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userPrimary, { color: theme.text }]}>{userName || userEmail || 'Guest User'}</Text>
              <Text style={[styles.userSecondary, { color: theme.textSecondary }]}>{userEmail ? (isPremium ? 'Premium' : 'Free plan') : 'Not signed in'}</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          <View style={styles.glassCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
                onPress={() => handleSettingPress(item.label)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(255,161,186,0.1)' }]}>
                  <Ionicons name={item.icon} size={20} color={theme.accent} />
                </View>
                <Text style={[styles.menuText, { color: theme.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Subscription</Text>
          <View style={styles.glassCard}>
            <TouchableOpacity style={styles.manageContent} activeOpacity={0.7} onPress={openManageSubscriptions}>
              <View style={[styles.manageIconWrap, { backgroundColor: 'rgba(255,161,186,0.2)' }]}>
                <Ionicons name="card-outline" size={22} color={theme.accent} />
              </View>
              <View style={styles.manageTextWrap}>
                <Text style={[styles.manageTitle, { color: theme.text }]}>Manage Subscription</Text>
                <Text style={[styles.manageSubtitle, { color: theme.textSecondary }]}>Opens the App Store to update or cancel billing.</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.glassCard, { marginTop: 12 }]}>
            <TouchableOpacity
              style={styles.manageContent}
              activeOpacity={0.7}
              onPress={async () => {
                try {
                  const mod: any = await import('../lib/revenuecat');
                  const rc = mod?.restorePurchases ?? null;
                  if (rc) {
                    await rc();
                    Alert.alert('Restored', 'Your purchases were refreshed.');
                  } else {
                    Alert.alert('Unavailable', 'Restore Purchases is not available.');
                  }
                } catch (e) {
                  if (__DEV__) console.warn('Restore purchases failed', e);
                  Alert.alert('Error', 'We could not restore purchases right now.');
                }
              }}
            >
              <View style={[styles.manageIconWrap, { backgroundColor: 'rgba(255,161,186,0.2)' }]}>
                <Ionicons name="refresh-outline" size={22} color={theme.accent} />
              </View>
              <View style={styles.manageTextWrap}>
                <Text style={[styles.manageTitle, { color: theme.text }]}>Restore Purchases</Text>
                <Text style={[styles.manageSubtitle, { color: theme.textSecondary }]}>Re-activates your premium access on this device.</Text>
              </View>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth & destructive */}
        <View style={styles.authSection}>
          {userEmail ? (
            <TouchableOpacity
              style={styles.glassButton}
              activeOpacity={0.8}
              onPress={async () => {
                try {
                  await supabase.auth.signOut();
                  navigation.navigate('Login');
                } catch { }
              }}
            >
              <Text style={[styles.signInText, { color: theme.text }]}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.glassButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.signInText, { color: theme.text }]}>Sign In</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.glassButton, styles.deleteButton]} activeOpacity={0.8} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.page,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.md
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center'
  },
  headerTitleMask: {
    backgroundColor: 'transparent',
  },
  headerTitleGhost: {
    opacity: 0,
  },
  content: {
    paddingHorizontal: tokens.spacing.page,
    paddingBottom: 48
  },

  // Manual Glass Card Style - conforming to new design
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.75)',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },

  userRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md, padding: 18 },
  userIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  userPrimary: { fontSize: 17, fontWeight: '700' },
  userSecondary: { marginTop: 2, fontSize: 14 },

  section: { marginTop: tokens.spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: tokens.spacing.sm, marginLeft: tokens.spacing.xxs },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: tokens.spacing.md },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500' },

  manageContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 18 },
  manageIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  manageTextWrap: { flex: 1, marginLeft: tokens.spacing.md },
  manageTitle: { fontSize: 16, fontWeight: '600' },
  manageSubtitle: { fontSize: 13, marginTop: 3, paddingRight: 8 },

  authSection: { marginTop: tokens.spacing.xl, marginBottom: tokens.spacing.lg },
  glassButton: {
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  signInText: { fontSize: 17, fontWeight: '600' },
  deleteButton: { marginTop: 14, backgroundColor: 'rgba(255,255,255,0.5)', borderColor: 'rgba(231,10,90,0.3)' },
  deleteButtonText: { color: '#E70A5A', fontSize: 16, fontWeight: '600' },
});
