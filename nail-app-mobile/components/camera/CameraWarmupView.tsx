import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Platform, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { isCameraWarmupEnabled, subscribeToCameraWarmup } from '../../lib/cameraWarmup';

export default function CameraWarmupView() {
  if (!__DEV__) {
    return null;
  }
  const [permission, requestPermission] = useCameraPermissions();
  const [enabled, setEnabled] = useState(() => isCameraWarmupEnabled());
  const [appActive, setAppActive] = useState(true);

  useEffect(() => {
    if (!permission) {
      requestPermission().catch(() => { });
      return;
    }
    if (!permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => { });
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const unsubscribe = subscribeToCameraWarmup(setEnabled);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handler = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
    });
    return () => handler.remove();
  }, []);

  const shouldRender = useMemo(() => {
    if (!permission?.granted) return false;
    if (!enabled) return false;
    if (!appActive) return false;
    // iOS simulators struggle with multiple cameras; keep warmup for physical devices only.
    if (Platform.OS === 'ios' && !Platform.isTV && Platform.constants?.isTesting) {
      return false;
    }
    return true;
  }, [permission?.granted, enabled, appActive]);

  if (!shouldRender) {
    return null;
  }

  return (
    <CameraView
      style={styles.hidden}
      facing="back"
      active
      mute
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    top: -1000,
    left: -1000,
    opacity: 0,
    pointerEvents: 'none',
  },
});
