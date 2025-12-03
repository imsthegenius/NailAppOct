import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { PAYWALL_ENABLED } from '../lib/paywall'
import { Alert, Linking, Platform } from 'react-native'
import { getOfferings, initRevenueCat, invalidateRevenueCatConfiguration } from '../lib/revenuecat'
import type { MainStackParamList } from '../navigation/types'

export default function UpgradeScreen() {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Upgrade'>>()

  useEffect(() => {
    let mounted = true
    const openSystemSubscriptions = async () => {
      const iosUrl = 'itms-apps://apps.apple.com/account/subscriptions'
      const iosFallbackUrl = 'https://apps.apple.com/account/subscriptions'
      const androidUrl = 'https://play.google.com/store/account/subscriptions'

      const targetUrl = Platform.OS === 'ios' ? iosUrl : androidUrl
      const fallbackUrl = Platform.OS === 'ios' ? iosFallbackUrl : androidUrl

      try {
        const canOpen = await Linking.canOpenURL(targetUrl)
        await Linking.openURL(canOpen ? targetUrl : fallbackUrl)
        return true
      } catch (error) {
        if (__DEV__) {
          console.warn('Unable to open system subscriptions screen', error)
        }
        return false
      }
    }

    const showUnavailableAlert = () => {
      Alert.alert(
        'Subscriptions unavailable',
        'Please try again later or manage your subscription in the App Store.'
      )
    }

    const present = async () => {
      try {
        if (!PAYWALL_ENABLED) {
          navigation.goBack()
          return
        }
        const mod: any = await import('react-native-purchases-ui')
        const RCUI = mod?.default ?? mod

        let presented = false
        let offering = await getOfferings()
        let retryAfterReconfigure = false
        while (!presented && offering) {
          try {
            const paywallOptions = offering.identifier ? { offeringIdentifier: offering.identifier } : undefined
            await RCUI.presentPaywall(paywallOptions)
            presented = true
          } catch (error: any) {
            const code = error?.code ?? error?.userInfo?.code
            const configurationError = code === 23 || code === 'RCErrorCodeConfigurationError'
            if (configurationError && !retryAfterReconfigure) {
              retryAfterReconfigure = true
              invalidateRevenueCatConfiguration()
              await initRevenueCat()
              offering = await getOfferings()
              continue
            }
            if (__DEV__) {
              console.warn('RevenueCat paywall presentation failed, attempting fallback', error)
            }
            break
          }
        }

        if (!presented) {
          const opened = await openSystemSubscriptions()
          if (!opened) {
            showUnavailableAlert()
          }
        }
      } catch (error) {
        const opened = await openSystemSubscriptions()
        if (!opened) {
          showUnavailableAlert()
        }
        if (__DEV__) {
          console.warn('UpgradeScreen: unexpected error while presenting paywall', error)
        }
      } finally {
        if (mounted) navigation.goBack()
      }
    }
    void present()
    return () => {
      mounted = false
    }
  }, [navigation])

  // Render nothing so there’s no visible loader while the modal is shown or dismissed
  return null
}
