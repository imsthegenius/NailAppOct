import type { PurchasesPackage, CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { PAYWALL_ENABLED } from './paywall';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_API_KEY ?? '';
const RC_ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY ?? '';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID ?? 'premium';

type PurchasesModule = typeof import('react-native-purchases');
type PurchasesApi = PurchasesModule extends { default: infer T } ? (T & PurchasesModule) : PurchasesModule;

let configured = false;
let cachedModule: PurchasesModule | null = null;

function extractApi(module: PurchasesModule): PurchasesApi {
  const maybe = module as unknown as { default?: PurchasesApi };
  return maybe.default ?? (module as unknown as PurchasesApi);
}

async function getPurchasesDependencies(): Promise<{ module: PurchasesModule; api: PurchasesApi } | null> {
  if (!PAYWALL_ENABLED) return null;
  if (cachedModule) {
    return { module: cachedModule, api: extractApi(cachedModule) };
  }
  try {
    cachedModule = await import('react-native-purchases');
    return { module: cachedModule, api: extractApi(cachedModule) };
  } catch (error) {
    if (__DEV__) {
      console.log('RevenueCat module unavailable; skipping paywall enforcement', error);
    }
    cachedModule = null;
    return null;
  }
}

export async function initRevenueCat(userId?: string) {
  if (configured) return;
  if (!PAYWALL_ENABLED) {
    configured = true;
    return;
  }
  if (!RC_IOS_KEY && !RC_ANDROID_KEY) {
    if (__DEV__) console.log('RevenueCat keys missing; skipping configure');
    configured = true;
    return;
  }

  const deps = await getPurchasesDependencies();
  if (!deps) {
    configured = true;
    return;
  }

  const { module, api: Purchases } = deps;
  const LOG_LEVEL = module.LOG_LEVEL;

  if (!Purchases || typeof Purchases.configure !== 'function') {
    if (__DEV__) console.log('RevenueCat API missing configure; skipping');
    configured = true;
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  await Purchases.configure({
    apiKey: Platform.select({ ios: RC_IOS_KEY, android: RC_ANDROID_KEY }) || RC_IOS_KEY || RC_ANDROID_KEY,
    appUserID: undefined,
  });
  configured = true;

  if (userId) {
    try {
      await Purchases.logIn(userId);
    } catch (e) {
      // Non-fatal: user might already be logged in anonymously
    }
  }

  await syncSubscriptionToSupabase(deps);

  Purchases.addCustomerInfoUpdateListener(async () => {
    await syncSubscriptionToSupabase(deps);
  });
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const deps = await getPurchasesDependencies();
  if (!deps) return null;
  try {
    const offerings = await deps.api.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  const deps = await getPurchasesDependencies();
  if (!deps) return null;
  const { api: Purchases } = deps;
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  await syncSubscriptionToSupabase(deps, customerInfo);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  const deps = await getPurchasesDependencies();
  if (!deps) return null;
  const { api: Purchases } = deps;
  const customerInfo = await Purchases.restorePurchases();
  await syncSubscriptionToSupabase(deps, customerInfo);
  return customerInfo;
}

export function isPremium(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
}

function planFromProductId(productId?: string): 'premium_monthly' | 'premium_yearly' | 'free' {
  if (!productId) return 'free';
  const id = productId.toLowerCase();
  if (id.includes('year') || id.includes('annual')) return 'premium_yearly';
  if (id.includes('month')) return 'premium_monthly';
  return 'premium_monthly';
}

async function syncSubscriptionToSupabase(
  deps: { module: PurchasesModule; api: PurchasesApi },
  info?: CustomerInfo | null,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const Purchases = deps.api;
    const customerInfo = info ?? await Purchases.getCustomerInfo();
    const activeEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    const active = !!activeEntitlement;
    const productId = activeEntitlement?.productIdentifier;
    const status = active ? planFromProductId(productId) : 'free';

    await supabase
      .from('users')
      .update({
        subscription_status: status,
        subscription_plan: active ? 'premium' : null,
      })
      .eq('id', user.id);
  } catch (e) {
    // swallow to avoid blocking UX
  }
}
