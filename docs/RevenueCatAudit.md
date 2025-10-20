# RevenueCat Integration Audit (NailGlow)

Last updated: 2025-10-06

This document audits the current RevenueCat subscription integration, identifies risks, prescribes non‑destructive diagnostics to run, and outlines the implementation blueprint to reach App Store‑ready status with a great paywall UX.

## TL;DR
- SDK wiring: Present and mostly correct. `react-native-purchases` is installed and initialized on app start and auth changes.
- Paywall screen: Exists with basic offerings/restore flow, but lacks App Store–required disclosures/links and iOS26 glass visuals.
- Gating: Implemented for locked shapes only. Catalog breadth and save quota are not gated yet. No post-first-result prompt.
- Live unlock: App listens to RevenueCat entitlement changes and writes to Supabase, but the UI hook doesn’t subscribe to DB changes, so unlock may not reflect instantly.
- Server of record: No webhook in place yet for renewals/refunds/expirations.
- Database alignment: PROBLEM — `auth.users` has users, but `public.users` has none in production. Client writes to `public.users.subscription_status` will no‑op.

Action items (non-destructive now; implementation later):
1) Run non-destructive diagnostics below and paste results for validation.
2) When ready for implementation, apply the minimal migration to auto‑provision `public.users` and enable Realtime.
3) Update `UpgradeScreen` to meet App Store policies (restore, terms, privacy, manage link, disclosures) and iOS26 visuals.
4) Add Realtime subscription in `useSubscriptionStatus` so paywall unlocks instantly after purchase.
5) Decide additional gates: catalog breadth, save quota, and/or post-first-result interstitial.
6) Optionally implement a RevenueCat webhook (Supabase Edge Function) to keep backend as source of truth.

---

## Ground Truth in Code (Status)
- Initialization
  - `nail-app-mobile/App.tsx:11, 87, 96` initializes RevenueCat on app start and auth changes.
  - `nail-app-mobile/lib/revenuecat.ts` wraps `configure`, `logIn`, `getOfferings`, `purchasePackage`, `restorePurchases`, and writes subscription fields to Supabase.
- Paywall enablement toggle
  - `nail-app-mobile/lib/paywall.ts` disables paywall in Expo Go or via `EXPO_PUBLIC_DISABLE_PAYWALL=1`.
- Upgrade UI and gating
  - `nail-app-mobile/screens/UpgradeScreen.tsx` fetches offerings and provides purchase/restore.
  - Shape locks route to Upgrade: `nail-app-mobile/screens/DesignScreen.tsx:363, 695`.
  - Profile CTA to Upgrade: `nail-app-mobile/screens/ProfileScreen.tsx:91–101`.
- Subscription read path
  - `nail-app-mobile/hooks/useSubscriptionStatus.ts` fetches `public.users.subscription_status` on mount/auth change only (no Realtime).
- iOS project
  - Pods include RevenueCat bundles; capability toggle still needed in Xcode for IAP testing/builds.
- Env placeholders
  - `.env.template` contains `EXPO_PUBLIC_RC_IOS_API_KEY` and `EXPO_PUBLIC_RC_ENTITLEMENT_ID=premium`.

---

## Risks and Gaps
- DB mapping gap (critical): `auth.users` has N users, `public.users` has 0. Client updates to `public.users` silently fail → app remains "free" after purchase.
- UI state freshness: No Realtime subscription → unlock may not reflect instantly when returning from Upgrade.
- Paywall compliance gaps: Missing Terms/Privacy links and “Manage Subscriptions”, and the standard renewal/cancellation/legal disclosures.
- Gating breadth: Only shapes are gated. Catalog breadth and save quota are not gated. No post‑first‑result interstitial.
- Server-of-record: No webhook for renewals/refunds/expirations; client updates only while app is open.

---

## Non‑Destructive Diagnostics (Run Safely Now)
Execute the following SQL snippets in the Supabase SQL editor (service role), then save and share outputs for verification.

1) Columns on `public.users`
```sql
select
  (select exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='subscription_status'
  )) as has_subscription_status,
  (select exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='subscription_plan'
  )) as has_subscription_plan;
```

2) Mapping between auth and app tables
```sql
select
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.users) as app_users,
  (select count(*) from public.users u left join auth.users a on a.id = u.id where a.id is null) as users_without_auth,
  (select count(*) from auth.users a left join public.users u on u.id = a.id where u.id is null) as auth_without_users;
```

3) RLS status and policies on `public.users`
```sql
-- RLS enabled?
select relrowsecurity, relforcerowsecurity
from pg_class
where oid = 'public.users'::regclass;

-- Defined policies
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public' and tablename='users';
```

4) Realtime publication membership
```sql
select exists (
  select 1 from pg_publication_tables
  where pubname='supabase_realtime' and schemaname='public' and tablename='users'
) as users_in_realtime_publication;
```

5) Constraints on `public.users` (to anticipate email format issues)
```sql
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid='public.users'::regclass;
```

6) Optional checks (context only)
```sql
-- Does user_profiles exist and map to auth.users?
select
  (select count(*) from public.user_profiles) as user_profiles,
  (select count(*) from auth.users a left join public.user_profiles p on p.id = a.id where p.id is null) as auth_without_profile;

-- Legal RPCs used in onboarding
select routine_name
from information_schema.routines
where routine_schema='public'
  and routine_name in ('check_legal_acceptance','accept_legal_agreement','get_user_settings');
```

---

## Implementation Blueprint (When Allowed)

### 1) Database: Auto‑Provision `public.users` + Realtime
Minimal migration (idempotent):
- Backfill rows from `auth.users` → `public.users`
- Trigger on `auth.users` insert → insert into `public.users`
- RLS policies: user can select/update own row
- Ensure table is added to `supabase_realtime`

Note: If `public.users.email` has a strict format constraint, use fallback `user-<uuid>@noemail.invalid`. If that fails, relax the constraint to allow NULL or broaden the regex.

### 2) Live Unlock: Realtime in `useSubscriptionStatus`
- Subscribe to `postgres_changes` on `public.users` filtered by `id = auth.uid()`.
- On UPDATE payload, set local `status` to `payload.new.subscription_status` and re-render.
- Keep initial fetch + auth change re-fetch for robustness.

### 3) Paywall Screen: App Store Compliance + iOS26 Visuals
Add to `screens/UpgradeScreen.tsx`:
- Actions/links
  - Restore Purchases (keep existing)
  - Terms of Use → `TermsOfServiceScreen`
  - Privacy Policy → `PrivacyPolicyScreen`
  - Manage Subscriptions (iOS): open `itms-apps://apps.apple.com/account/subscriptions`
- Disclosures (copy to display under plans)
  - “Recurring billing. Subscription renews automatically unless canceled at least 24 hours before the end of the current period. Payment is charged to your Apple ID account. Manage or cancel in iOS Settings > Subscriptions after purchase.”
  - “No free trial.” (adjust if you add a free trial)
  - “Prices may vary by region and are shown at checkout.”
- Visuals
  - Wrap sheet/cards in `NativeLiquidGlass` and align with iOS26 glass tokens used elsewhere.

### 4) Gating Strategy (UX)
- Keep: Shape locks.
- Add (recommended):
  - Catalog breadth: free users see Trending + a curated subset; premium unlocks full catalog/brands.
  - Save quota: allow N (e.g., 3) saves free; prompt paywall when limit reached.
  - Post‑first‑result interstitial: show paywall after the first transformation to capitalize on value moment.

### 5) Webhook (Recommended, Later)
- Supabase Edge Function endpoint verifying RevenueCat HMAC with `REVENUECAT_WEBHOOK_SECRET`.
- Map `product_id` → `premium_monthly`/`premium_yearly`; else `free`.
- Update `public.users.subscription_status` server‑side for renewals/refunds/expirations.

### 6) Store + RC Setup Checklist
- App Store Connect
  - Subscription Group created; products `com.nailglow.premium.monthly` and `com.nailglow.premium.yearly` attached to bundle id `com.nailglow.app`; Sandbox tester ready.
- RevenueCat
  - Entitlement `premium`; Current offering contains monthly + yearly; iOS Public SDK Key in `.env`.
- Build
  - IAP capability enabled in Xcode target; build dev client/TestFlight (`eas build --profile payments --platform ios`).

---

## QA Plan (Sandbox)
1) Install dev client/TestFlight build on device signed into a Sandbox tester Apple ID.
2) Launch app; perform onboarding; complete one transformation to verify value.
3) Open Upgrade (from locked shape or interstitial), verify products/prices load.
4) Purchase monthly; app unlocks instantly (verify Realtime reflects change without restart). `public.users.subscription_status = 'premium_monthly'`.
5) Restore purchases flow works after reinstall.
6) Switch plan or cancel in Settings > Subscriptions; verify webhook (when implemented) updates DB on renewal/expiration.

---

## Appendix A: Proposed Migration (Apply Later)

The following is the minimal, idempotent migration to fix the `public.users` gap and enable Realtime + RLS. Do NOT run until approved for changes.

```sql
-- Columns (no-op if present)
alter table public.users
  add column if not exists subscription_status text default 'free',
  add column if not exists subscription_plan text;

-- Backfill from auth.users
insert into public.users (id, email, created_at, updated_at)
select a.id,
       coalesce(a.email, 'user-' || a.id || '@noemail.invalid'),
       now(),
       now()
from auth.users a
on conflict (id) do nothing;

-- Auto-provision trigger
create or replace function public.ensure_public_user()
returns trigger
language plpgsql security definer as $$
begin
  insert into public.users (id, email, created_at, updated_at)
  values (new.id, coalesce(new.email, 'user-' || new.id || '@noemail.invalid'), now(), now())
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created_public_users on auth.users;
create trigger on_auth_user_created_public_users
after insert on auth.users
for each row execute function public.ensure_public_user();

-- RLS (ensure present)
alter table public.users enable row level security;
create policy if not exists "Users update own subscription fields" on public.users
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
create policy if not exists "Users can read own profile" on public.users
  for select to authenticated
  using (auth.uid() = id);
create policy if not exists "Users can insert own profile" on public.users
  for insert to authenticated
  with check (auth.uid() = id);

-- Realtime publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='users'
  ) then
    execute 'alter publication supabase_realtime add table public.users';
  end if;
end$$;
```

---

## Appendix B: Minimal Hook Update (Illustrative)

Pseudo-diff for `hooks/useSubscriptionStatus.ts` to add Realtime without changing existing behavior:

```ts
// after initial fetch and onAuthStateChange wiring
const channel = supabase.channel('subscription-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'users',
    filter: `id=eq.${user.id}`,
  }, (payload) => {
    const next = (payload as any).new?.subscription_status;
    if (next) setStatus(next as SubscriptionStatus);
  })
  .subscribe();

return () => {
  channel.unsubscribe();
};
```

This ensures the UI unlocks within the same session as soon as RevenueCat → Supabase sync completes.

---

## Decision Log
- Keep client sync now; add webhook later for renewals/refunds.
- Preferred UX: present paywall after first transformation + keep shape locks; optionally gate full catalog and saving beyond quota.
- Use custom Upgrade screen now; consider RC Paywalls later.

*** End of Document ***
