import Constants from 'expo-constants';

const disableFlag = process.env.EXPO_PUBLIC_DISABLE_PAYWALL === '1';
const isExpoGo = Constants.appOwnership === 'expo';

export const PAYWALL_DISABLED = disableFlag || isExpoGo;
export const PAYWALL_ENABLED = !PAYWALL_DISABLED;
