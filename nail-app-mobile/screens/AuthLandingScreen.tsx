import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import * as Haptics from 'expo-haptics'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import * as AppleAuthentication from 'expo-apple-authentication'
import { screenGradients } from '../theme/gradients'
import { isAppleSignInAvailable, signInWithApple } from '../lib/appleSignIn'

// Auth color palette for better contrast on pink gradient backgrounds
const AUTH_COLORS = {
  headline: '#E70A5A',        // Magenta - high contrast on pink
  legal: '#8e8e93',           // iOS system gray
  secondaryButtonText: '#2A0B20', // Dark plum for visibility on glass
}

export default function AuthLandingScreen({ navigation }: any) {
  const [appleAvailable, setAppleAvailable] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)

  // Haptic feedback on button press-in for snappier feel
  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  useEffect(() => {
    isAppleSignInAvailable()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false))
  }, [])

  const handleApple = async () => {
    if (appleLoading) return
    setAppleLoading(true)
    const result = await signInWithApple()
    setAppleLoading(false)
    if (result.success) {
      navigation.replace('Main')
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient colors={screenGradients.auth} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.spacer} />

        {/* Intro headline placed higher, similar to onboarding titles */}
        <Text style={styles.headline}>Let's get started</Text>

        <View style={styles.footer}>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primary}
              onPress={() => navigation.navigate('Signup')}
              onPressIn={handlePressIn}
              accessibilityRole="button"
              accessibilityLabel="Create a NailGlow account"
              accessibilityHint="Opens the sign up form so you can start creating an account."
              activeOpacity={0.75}
            >
              <Text style={styles.primaryText}>Create Account</Text>
            </TouchableOpacity>

            {appleAvailable && (
              <View style={styles.appleWrap}>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                  cornerRadius={24}
                  style={styles.apple}
                  onPress={handleApple}
                  accessibilityLabel="Continue with Apple"
                  accessibilityHint="Use Sign in with Apple to continue without typing your password."
                />
                {appleLoading && (
                  <View style={styles.appleSpinner} pointerEvents="none">
                    <ActivityIndicator color="#000" />
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.secondary}
              onPress={() => navigation.navigate('Login')}
              onPressIn={handlePressIn}
              accessibilityRole="button"
              accessibilityLabel="Log in"
              accessibilityHint="Jump to the login screen to use an existing account."
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryText}>Log In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>
            NailGlow uses secure email sign in. You can manage or delete your account anytime from Profile Settings.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 20 },
  spacer: { flex: 1 },
  footer: { paddingBottom: 12 },
  headline: { color: AUTH_COLORS.headline, textAlign: 'left', fontSize: 36, fontWeight: '800', marginBottom: 24 },
  actions: { gap: 12, marginBottom: 10 },
  primary: { backgroundColor: '#ffffff', borderRadius: 999, height: 56, justifyContent: 'center', alignItems: 'center' },
  primaryText: { color: '#2A0B20', fontWeight: '700', fontSize: 17 },
  appleWrap: { position: 'relative' },
  apple: { width: '100%', height: 56, borderRadius: 28 },
  appleSpinner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  secondary: { borderRadius: 999, height: 56, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(42,11,32,0.3)', backgroundColor: 'rgba(255,255,255,0.85)' },
  secondaryText: { color: AUTH_COLORS.secondaryButtonText, fontWeight: '700', fontSize: 17 },
  legal: { textAlign: 'center', color: AUTH_COLORS.legal, fontSize: 13, marginTop: 16, lineHeight: 18 },
})
