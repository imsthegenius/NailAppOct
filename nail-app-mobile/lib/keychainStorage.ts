/**
 * Secure Storage Adapter for Authentication Tokens
 * 
 * Uses expo-secure-store for iOS Keychain storage to meet
 * Apple App Store security requirements.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure Storage Adapter
 * Uses iOS Keychain via expo-secure-store on iOS
 * Falls back to AsyncStorage on Android (until we implement proper encryption)
 * 
 * IMPORTANT: expo-secure-store only works in standalone/development builds,
 * not in Expo Go. For Expo Go, we fallback to AsyncStorage.
 */
const KeychainStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'ios') {
        try {
          // Attempt to use SecureStore for iOS (Keychain)
          const value = await SecureStore.getItemAsync(key);
          
          // If no value in SecureStore, check AsyncStorage for migration
          if (!value) {
            const legacyValue = await AsyncStorage.getItem(key);
            if (legacyValue) {
              // Migrate from AsyncStorage to SecureStore
              try {
                await SecureStore.setItemAsync(key, legacyValue);
                await AsyncStorage.removeItem(key);
              } catch (migrateError) {
                // If migration fails, just return the legacy value
                if (__DEV__) {
                  console.log('Migration to SecureStore failed, continuing with AsyncStorage');
                }
              }
              return legacyValue;
            }
          }
          
          return value;
        } catch (secureStoreError: any) {
          // SecureStore not available (probably in Expo Go)
          if (__DEV__) {
            console.log('SecureStore not available, using AsyncStorage fallback');
          }
          return await AsyncStorage.getItem(key);
        }
      } else {
        // Android: Use AsyncStorage for now
        // TODO: Implement encrypted storage for Android
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Storage getItem error:', error);
      }
      // Final fallback to AsyncStorage
      try {
        return await AsyncStorage.getItem(key);
      } catch (asyncError) {
        if (__DEV__) {
          console.error('AsyncStorage fallback also failed:', asyncError);
        }
        return null;
      }
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        try {
          // Attempt to use SecureStore for iOS (Keychain)
          await SecureStore.setItemAsync(key, value);
        } catch (secureStoreError: any) {
          // SecureStore not available (probably in Expo Go)
          if (__DEV__) {
            console.log('SecureStore not available for setItem, using AsyncStorage fallback');
          }
          await AsyncStorage.setItem(key, value);
        }
      } else {
        // Android: Use AsyncStorage for now
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Storage setItem error:', error);
      }
      // Final fallback to AsyncStorage
      try {
        await AsyncStorage.setItem(key, value);
      } catch (asyncError) {
        if (__DEV__) {
          console.error('AsyncStorage fallback also failed:', asyncError);
        }
        throw asyncError;
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        try {
          // Remove from SecureStore
          await SecureStore.deleteItemAsync(key);
        } catch (secureStoreError) {
          if (__DEV__) {
            console.log('SecureStore not available for removeItem');
          }
        }
      }
      // Always try to remove from AsyncStorage as well (for cleanup)
      await AsyncStorage.removeItem(key);
    } catch (error) {
      if (__DEV__) {
        console.error('Storage removeItem error:', error);
      }
    }
  },
};

export default KeychainStorage;