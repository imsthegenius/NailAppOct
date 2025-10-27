/**
 * Secure Storage Adapter for Authentication Tokens
 * 
 * Uses expo-secure-store for iOS Keychain storage to meet
 * Apple App Store security requirements.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_STORE_MAX_ITEM_LENGTH = 2048;
const SECURE_STORE_SAFE_CHUNK_SIZE = Math.floor(SECURE_STORE_MAX_ITEM_LENGTH * 0.88);
const CHUNK_MARKER_PREFIX = '__chunked__:';
const CHUNK_KEY_SUFFIX = '__chunk__';

const makeChunkKey = (key: string, index: number) => `${key}${CHUNK_KEY_SUFFIX}${index}`;

async function readSecureStoreValue(key: string): Promise<string | null> {
  const manifest = await SecureStore.getItemAsync(key);
  if (!manifest) {
    return null;
  }

  if (!manifest.startsWith(CHUNK_MARKER_PREFIX)) {
    return manifest;
  }

  const totalChunks = Number(manifest.slice(CHUNK_MARKER_PREFIX.length));
  if (!Number.isFinite(totalChunks) || totalChunks <= 0) {
    return null;
  }

  const chunks: string[] = [];
  for (let index = 0; index < totalChunks; index += 1) {
    const chunk = await SecureStore.getItemAsync(makeChunkKey(key, index));
    if (typeof chunk !== 'string') {
      return null;
    }
    chunks.push(chunk);
  }

  return chunks.join('');
}

async function clearSecureStoreChunks(key: string, manifest?: string | null) {
  const value = manifest ?? (await SecureStore.getItemAsync(key));
  if (!value || !value.startsWith(CHUNK_MARKER_PREFIX)) {
    return;
  }
  const totalChunks = Number(value.slice(CHUNK_MARKER_PREFIX.length));
  if (!Number.isFinite(totalChunks) || totalChunks <= 0) {
    return;
  }

  await Promise.all(
    Array.from({ length: totalChunks }).map((_, index) =>
      SecureStore.deleteItemAsync(makeChunkKey(key, index)).catch(() => {})
    )
  );
}

async function writeSecureStoreValue(key: string, value: string) {
  const existingManifest = await SecureStore.getItemAsync(key);
  await clearSecureStoreChunks(key, existingManifest);

  if (value.length <= SECURE_STORE_SAFE_CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const chunkSize = SECURE_STORE_SAFE_CHUNK_SIZE;
  const totalChunks = Math.ceil(value.length / chunkSize);

  for (let index = 0; index < totalChunks; index += 1) {
    const chunkValue = value.slice(index * chunkSize, (index + 1) * chunkSize);
    await SecureStore.setItemAsync(makeChunkKey(key, index), chunkValue);
  }

  await SecureStore.setItemAsync(key, `${CHUNK_MARKER_PREFIX}${totalChunks}`);
}

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
          const value = await readSecureStoreValue(key);

          // If no value in SecureStore, check AsyncStorage for migration
          if (!value) {
            const legacyValue = await AsyncStorage.getItem(key);
            if (legacyValue) {
              // Migrate from AsyncStorage to SecureStore
              try {
                await writeSecureStoreValue(key, legacyValue);
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
          if (value.length > SECURE_STORE_MAX_ITEM_LENGTH && __DEV__) {
            console.warn('SecureStore value exceeds safe length; chunking value for storage.');
          }
          await writeSecureStoreValue(key, value);
        } catch (secureStoreError: any) {
          // SecureStore not available (probably in Expo Go)
          if (__DEV__) {
            console.log('SecureStore not available for setItem, using AsyncStorage fallback');
          }
          await clearSecureStoreChunks(key).catch(() => {});
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
          const manifest = await SecureStore.getItemAsync(key);
          await clearSecureStoreChunks(key, manifest);
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
