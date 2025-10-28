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

const accentPink = '#ffa1ba';

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

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    navigation.navigate('DeleteAccount');
  };

  const handleSettingPress = (setting: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const menuItems = [
    { icon: 'notifications-outline' as const, label: 'Notifications' },
    { icon: 'shield-checkmark-outline' as const, label: 'Privacy' },
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
    } catch {}

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
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
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.userIconWrap}>
              <Ionicons name="person" size={22} color={accentPink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userPrimary}>{userName || userEmail || 'Guest User'}</Text>
              <Text style={styles.userSecondary}>{userEmail ? (isPremium ? 'Premium' : 'Free plan') : 'Not signed in'}</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
                onPress={() => handleSettingPress(item.label)}
                activeOpacity={0.85}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={accentPink} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={accentPink} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.manageSubscriptionCard}>
            <TouchableOpacity style={styles.manageContent} activeOpacity={0.88} onPress={openManageSubscriptions}>
              <View style={styles.manageIconWrap}>
                <Ionicons name="card-outline" size={22} color={accentPink} />
              </View>
              <View style={styles.manageTextWrap}>
                <Text style={styles.manageTitle}>Manage Subscription</Text>
                <Text style={styles.manageSubtitle}>Opens the App Store to update or cancel billing.</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={accentPink} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth & destructive */}
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
              <Text style={styles.signInText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.92}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.92} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F4F0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#111' },
  content: { paddingHorizontal: 20, paddingBottom: 48 },

  userCard: { borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,161,186,0.18)', backgroundColor: 'rgba(255,255,255,0.96)', paddingHorizontal: 18, paddingVertical: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,161,186,0.18)', alignItems: 'center', justifyContent: 'center' },
  userPrimary: { fontSize: 16, fontWeight: '700', color: '#111' },
  userSecondary: { marginTop: 2, fontSize: 13, color: 'rgba(60,60,67,0.6)' },

  section: { marginTop: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
  menuCard: { borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,161,186,0.18)', backgroundColor: 'rgba(255,255,255,0.9)' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,161,186,0.12)' },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,161,186,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuText: { flex: 1, fontSize: 16, color: '#111', fontWeight: '500' },

  manageSubscriptionCard: { borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,161,186,0.18)', backgroundColor: 'rgba(255,255,255,0.9)' },
  manageContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 18 },
  manageIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,161,186,0.28)', alignItems: 'center', justifyContent: 'center' },
  manageTextWrap: { flex: 1, marginLeft: 16 },
  manageTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  manageSubtitle: { fontSize: 13, color: '#444', marginTop: 2 },

  authSection: { marginTop: 32, marginBottom: 24 },
  signInButton: { borderRadius: 32, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: 'rgba(255,161,186,0.18)' },
  signInText: { color: '#111', fontSize: 17, fontWeight: '600' },
  deleteButton: { marginTop: 14, borderRadius: 32, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,161,186,0.38)', backgroundColor: 'rgba(255,255,255,0.92)' },
  deleteButtonText: { color: '#111', fontSize: 16, fontWeight: '600' },
});
