import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import * as AppleAuthentication from 'expo-apple-authentication'
import { screenGradients } from '../theme/gradients'
import { isAppleSignInAvailable, signInWithApple } from '../lib/appleSignIn'

export default function AuthLandingScreen({ navigation }: any) {
  const [appleAvailable, setAppleAvailable] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)

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
            <TouchableOpacity style={styles.primary} onPress={() => navigation.replace('Signup')} accessibilityRole="button">
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
                />
                {appleLoading && (
                  <View style={styles.appleSpinner} pointerEvents="none">
                    <ActivityIndicator color="#000" />
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.secondary} onPress={() => navigation.replace('Login')} accessibilityRole="button">
              <Text style={styles.secondaryText}>Log In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>
            NailGlow uses secure email sign in. You can manage or delete your account anytime from Profile settings.
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
  headline: { color: '#fff', textAlign: 'left', fontSize: 36, fontWeight: '800', marginBottom: 24 },
  actions: { gap: 12, marginBottom: 10 },
  primary: { backgroundColor: '#ffffff', borderRadius: 999, paddingVertical: 18, alignItems: 'center' },
  primaryText: { color: '#2A0B20', fontWeight: '700', fontSize: 17 },
  appleWrap: { position: 'relative' },
  apple: { width: '100%', height: 48, borderRadius: 24 },
  appleSpinner: { ...StyleSheet.absoluteFillObject as any, alignItems: 'center', justifyContent: 'center' },
  secondary: { borderRadius: 999, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.12)' },
  secondaryText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  legal: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 13 },
})
