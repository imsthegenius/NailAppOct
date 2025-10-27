import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { PAYWALL_ENABLED } from '../lib/paywall'
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
        const mod: any = await import('react-native-purchases-ui')
        const RCUI = mod?.default ?? mod
        await RCUI.presentPaywall()
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
