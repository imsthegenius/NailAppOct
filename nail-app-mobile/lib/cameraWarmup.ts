import type { MutableRefObject } from 'react';

export type WarmupListener = (enabled: boolean) => void;

const listeners = new Set<WarmupListener>();
let warmupEnabled = true;

const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener(warmupEnabled);
    } catch (error) {
      if (__DEV__) {
        console.warn('[cameraWarmup] listener error', error);
      }
    }
  });
};

export const subscribeToCameraWarmup = (listener: WarmupListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const isCameraWarmupEnabled = () => warmupEnabled;

export const setCameraWarmupEnabled = (enabled: boolean) => {
  if (warmupEnabled === enabled) {
    return;
  }
  warmupEnabled = enabled;
  notify();
};
