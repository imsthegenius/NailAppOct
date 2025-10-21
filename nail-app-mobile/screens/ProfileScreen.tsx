import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
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

  const menuItemsPrimary = [
    { icon: 'bookmark-outline', label: 'Saved Collections' },
    { icon: 'color-palette-outline', label: 'Style Preferences' },
    { icon: 'time-outline', label: 'Recently Used Colors' },
    { icon: 'share-social-outline', label: 'Share Profile' },
  ];

  const menuItemsSecondary = [
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy' },
    { icon: 'help-circle-outline', label: 'Help & Support' },
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
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2A0B20', '#E70A5A']}
        start={{ x: 0.1, y: 0.9 }}
        end={{ x: 0.9, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => handleSettingPress('settings')}>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color="rgba(255,255,255,0.7)" />
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
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Space</Text>
          <View style={styles.menuCard}>
            {menuItemsPrimary.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === menuItemsPrimary.length - 1 && styles.menuItemLast]}
                onPress={() => handleSettingPress(item.label)}
                activeOpacity={0.85}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color="#fff" />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            {menuItemsSecondary.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === menuItemsSecondary.length - 1 && styles.menuItemLast]}
                onPress={() => handleSettingPress(item.label)}
                activeOpacity={0.85}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color="#fff" />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <TouchableOpacity
            style={styles.manageSubscriptionCard}
            activeOpacity={0.88}
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await openManageSubscriptions();
            }}
          >
            <View style={styles.manageIconWrap}>
              <Ionicons name="card-outline" size={22} color="#fff" />
            </View>
            <View style={styles.manageTextWrap}>
              <Text style={styles.manageTitle}>Manage Subscription</Text>
              <Text style={styles.manageSubtitle}>Open the App Store to update or cancel billing.</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  profileCard: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    opacity: 0.5,
    alignSelf: 'center',
    top: -15,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  upgradeButton: {
    marginTop: 26,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  upgradeText: {
    color: '#2A0B20',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  manageSubscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: '#fff',
  },
  manageSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  authSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  signInText: {
    color: '#2A0B20',
    fontSize: 17,
    fontWeight: '600',
  },
});
