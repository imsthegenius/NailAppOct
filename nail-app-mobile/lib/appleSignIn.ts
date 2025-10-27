import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

type AppleAuthError = {
  code?: string;
  message?: string;
};

// Expo SDK 53's `expo-apple-authentication` no longer exports
// `AppleAuthenticationErrorCode`. Accessing it caused a runtime crash.
// Use resilient string codes that cover both legacy and current Expo.
const RECOVERABLE_APPLE_CODES = new Set<string>([
  // Legacy fallback/unknown errors
  'ERR_APPLE_SIGN_IN_UNKNOWN',
  // Current expo-apple-authentication / ExpoModulesCore errors
  'ERR_REQUEST_FAILED',
  'ERR_REQUEST_UNKNOWN',
  'ERR_REQUEST_NOT_HANDLED',
  'ERR_REQUEST_INVALID_RESPONSE',
  'ERR_REQUEST_NOT_INTERACTIVE',
  'ERR_REQUEST_MATCHED_EXCLUDED_CREDENTIAL',
  // In some environments the exception name may be surfaced as the code
  'RequestFailedException',
  'RequestUnknownException',
]);

const APPLE_CANCEL_CODES = new Set<string>([
  // Legacy cancel code
  'ERR_CANCELED',
  // Current expo-apple-authentication cancel code
  'ERR_REQUEST_CANCELED',
  // Possible direct exception name
  'RequestCanceledException',
]);

const APPLE_SCOPES = [
  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
  AppleAuthentication.AppleAuthenticationScope.EMAIL,
] as const;

const randomNonce = async () => {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
};

const normaliseErrorCode = (error: AppleAuthError | undefined) => {
  if (!error?.code) {
    return undefined;
  }
  return error.code;
};

const isCancellation = (error: AppleAuthError | undefined) => {
  const code = normaliseErrorCode(error);
  return code ? APPLE_CANCEL_CODES.has(code) : false;
};

const isRecoverableAppleError = (error: AppleAuthError | undefined) => {
  const code = normaliseErrorCode(error);
  return code ? RECOVERABLE_APPLE_CODES.has(code) : false;
};

export type AppleSignInResult =
  | { success: true }
  | { success: false; reason: 'unavailable' | 'cancelled' | 'error'; message?: string };

export async function isAppleSignInAvailable(): Promise<boolean> {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    if (__DEV__) {
      console.warn('Apple Sign In availability check failed', error);
    }
    return false;
  }
}

type CredentialAttempt =
  | { status: 'cancelled' }
  | { status: 'error'; error: AppleAuthError; recoverable: boolean }
  | {
      status: 'success';
      credential: AppleAuthentication.AppleAuthenticationCredential;
      nonce?: string;
    };

const requestAppleCredential = async (withNonce: boolean): Promise<CredentialAttempt> => {
  const nonce = withNonce ? await randomNonce() : undefined;
  const hashedNonce =
    withNonce && nonce
      ? await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce)
      : undefined;

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: APPLE_SCOPES,
      ...(hashedNonce ? { nonce: hashedNonce } : {}),
    });
    return { status: 'success', credential, nonce };
  } catch (error: any) {
    const appleError: AppleAuthError = {
      code: error?.code ?? error?.errorCode,
      message: error?.message,
    };
    if (isCancellation(appleError)) {
      return { status: 'cancelled' };
    }
    const recoverable = withNonce && isRecoverableAppleError(appleError);
    if (__DEV__) {
      const label = recoverable ? 'Recoverable Apple sign-in error' : 'Apple sign-in error';
      console.warn(label, appleError);
    }
    return { status: 'error', error: appleError, recoverable };
  }
};

const completeSupabaseSignIn = async (
  credential: AppleAuthentication.AppleAuthenticationCredential,
  nonce?: string
): Promise<AppleSignInResult> => {
  if (!credential.identityToken) {
    return { success: false, reason: 'error', message: 'Missing identity token from Apple.' };
  }

  const { error: signInError } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    ...(nonce ? { nonce } : {}),
  });

  if (signInError) {
    if (__DEV__) {
      console.warn('Supabase Apple sign-in failed', signInError);
    }
    return {
      success: false,
      reason: 'error',
      message: signInError.message ?? 'Unable to complete Apple sign in.',
    };
  }

  if (credential.fullName?.givenName || credential.fullName?.familyName) {
    const fullName = `${credential.fullName?.givenName ?? ''} ${credential.fullName?.familyName ?? ''}`.trim();
    if (fullName) {
      await supabase.auth.updateUser({ data: { full_name: fullName } }).catch(() => undefined);
    }
  }

  return { success: true };
};

export async function signInWithApple(): Promise<AppleSignInResult> {
  const available = await isAppleSignInAvailable();
  if (!available) {
    return { success: false, reason: 'unavailable' };
  }

  const firstAttempt = await requestAppleCredential(true);

  if (firstAttempt.status === 'cancelled') {
    return { success: false, reason: 'cancelled' };
  }

  if (firstAttempt.status === 'error') {
    if (!firstAttempt.recoverable) {
      return {
        success: false,
        reason: 'error',
        message: firstAttempt.error?.message ?? 'Unable to complete Apple sign in.',
      };
    }

    const fallbackAttempt = await requestAppleCredential(false);
    if (fallbackAttempt.status === 'cancelled') {
      return { success: false, reason: 'cancelled' };
    }
    if (fallbackAttempt.status === 'error') {
      return {
        success: false,
        reason: 'error',
        message:
          fallbackAttempt.error?.message ??
          firstAttempt.error?.message ??
          'Unable to complete Apple sign in.',
      };
    }

    return completeSupabaseSignIn(fallbackAttempt.credential);
  }

  return completeSupabaseSignIn(firstAttempt.credential, firstAttempt.nonce);
}
