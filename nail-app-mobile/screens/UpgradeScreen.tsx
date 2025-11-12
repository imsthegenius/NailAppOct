import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { PAYWALL_ENABLED } from '../lib/paywall'
import { Alert, Linking, Platform } from 'react-native'
import { getOfferings } from '../lib/revenuecat'
import type { MainStackParamList } from '../navigation/types'

export default function UpgradeScreen() {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Upgrade'>>()

  useEffect(() => {
    let mounted = true
    const present = async () => {
      try {
        if (!PAYWALL_ENABLED) {
          navigation.goBack()
          return
        }
        const offering = await getOfferings()
        if (!offering) {
          // No paywall/offering configured — avoid native crash in RCUI by skipping
          if (Platform.OS === 'ios') {
            const iosUrl = 'itms-apps://apps.apple.com/account/subscriptions'
            const iosFallbackUrl = 'https://apps.apple.com/account/subscriptions'
            const can = await Linking.canOpenURL(iosUrl)
            await Linking.openURL(can ? iosUrl : iosFallbackUrl)
          }
          Alert.alert('Subscriptions unavailable', 'Please try again later or manage your subscription in the App Store.')
          return
        }

        const mod: any = await import('react-native-purchases-ui')
        const RCUI = mod?.default ?? mod
        // Pass the offering identifier explicitly; some versions assert on missing context
        await RCUI.presentPaywall({ offeringIdentifier: offering.identifier })
      } catch {
        // ignore and pop the screen
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
