import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DeleteAccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeleteAccount'>;

type Props = {
  navigation: DeleteAccountScreenNavigationProp;
};

export default function DeleteAccountScreen({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        'Please manage your subscriptions directly from the App Store settings.'
      );
    }
  };

  const handleDeleteAccount = async () => {
    // Validation
    if (!password) {
      Alert.alert('Password Required', 'Please enter your password to confirm account deletion.');
      return;
    }

    if (confirmText !== 'DELETE') {
      Alert.alert('Confirmation Required', 'Please type DELETE to confirm account deletion.');
      return;
    }

    // Final confirmation
    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: performAccountDeletion,
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    setIsDeleting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        Alert.alert('Session Expired', 'Please log in again to delete your account.');
        navigation.navigate('Login' as any);
        setIsDeleting(false);
        return;
      }

      // Re-authenticate user with password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: password,
      });

      if (authError) {
        Alert.alert('Authentication Failed', 'Incorrect password. Please try again.');
        setIsDeleting(false);
        return;
      }

      // Call account deletion function
      const { error: deleteError } = await supabase.rpc('delete_user_account', {
        user_id: session.user.id,
      });

      if (deleteError) {
        if (__DEV__) {
          console.error('Account deletion error:', deleteError);
        }
        
        // If RPC doesn't exist, we'll create a simpler deletion
        if (deleteError.message.includes('function') || deleteError.message.includes('does not exist')) {
          // Delete user data from saved_looks table
          const { error: looksError } = await supabase
            .from('saved_looks')
            .delete()
            .eq('user_id', session.user.id);

          if (looksError) {
            if (__DEV__) {
              console.error('Error deleting user looks:', looksError);
            }
          }
        } else {
          Alert.alert('Error', 'Failed to delete account. Please contact support.');
          setIsDeleting(false);
          return;
        }
      }

      const { data: authDeletionResult, error: authDeletionError } = await supabase.functions.invoke<{
        success: boolean;
      }>('delete-auth-user', {
        body: { userId: session.user.id },
      });

      if (authDeletionError || !authDeletionResult?.success) {
        if (__DEV__) {
          console.error('Auth user deletion error:', authDeletionError || authDeletionResult);
        }
        Alert.alert(
          'Error',
          'We removed your saved data but could not delete your sign-in. Please contact support so we can finish closing your account.'
        );
        setIsDeleting(false);
        return;
      }

      // Sign out and clear local data
      await supabase.auth.signOut();
      await AsyncStorage.clear();

      setPassword('');
      setConfirmText('');
      setIsDeleting(false);

      // Show success message and navigate to login
      Alert.alert(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Delete Account</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Warning Section */}
          <View style={styles.warningSection}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={48} color="#FF3B30" />
            </View>
            
            <Text style={styles.warningTitle}>Delete Your Account?</Text>
            
            <Text style={styles.warningText}>
              This action is permanent and cannot be undone.
            </Text>

            <View style={styles.consequencesList}>
              <Text style={styles.consequenceTitle}>Deleting your account will:</Text>
              <Text style={styles.consequenceItem}>• Remove all your saved nail looks</Text>
              <Text style={styles.consequenceItem}>• Delete all your personal information</Text>
              <Text style={styles.consequenceItem}>• Cancel any active subscriptions</Text>
              <Text style={styles.consequenceItem}>• Remove access to the app</Text>
            </View>
          </View>

          {/* Confirmation Section */}
          <View style={styles.confirmationSection}>
            <Text style={styles.sectionTitle}>Confirm Your Identity</Text>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmation Text */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type "DELETE" to confirm</Text>
              <TextInput
                style={styles.input}
                placeholder="Type DELETE"
                placeholderTextColor="#999"
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Alternative Options */}
          <View style={styles.alternativeSection}>
            <Text style={styles.alternativeTitle}>Before you go...</Text>
            <Text style={styles.alternativeText}>
              If you're having issues with the app, our support team is here to help.
            </Text>
            <TouchableOpacity
              style={styles.manageSubscriptionButton}
              onPress={openManageSubscriptions}
              activeOpacity={0.85}
            >
              <View style={styles.manageIconWrap}>
                <Ionicons name="card-outline" size={20} color="#FF3B30" />
              </View>
              <View style={styles.manageTextGroup}>
                <Text style={styles.manageTitle}>Manage Subscription</Text>
                <Text style={styles.manageSubtitle}>Opens the App Store to update billing.</Text>
              </View>
              <Ionicons name="open-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => Alert.alert('Support', 'Email us at support@nailglow.app')}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              (!password || confirmText !== 'DELETE' || isDeleting) && styles.deleteButtonDisabled
            ]}
            onPress={handleDeleteAccount}
            disabled={!password || confirmText !== 'DELETE' || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete My Account</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  warningSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  warningIcon: {
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  consequencesList: {
    width: '100%',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  consequenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  consequenceItem: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  confirmationSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 5,
  },
  alternativeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  alternativeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  alternativeText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  manageSubscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFB8B3',
    backgroundColor: '#FFF5F5',
    marginBottom: 16,
  },
  manageIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  manageTextGroup: {
    flex: 1,
  },
  manageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  manageSubtitle: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  supportButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  supportButtonText: {
    color: '#FF69B4',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginHorizontal: 20,
    height: 54,
    backgroundColor: '#FF3B30',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FFB0A8',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    marginHorizontal: 20,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
