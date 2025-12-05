# iOS App Store Submission Master Plan

**Created:** 2025-12-05  
**Based on:** All previous audits (Oct 4, Oct 11, Oct 22, Oct 28, Dec 3) + Fresh audit (Dec 5)  
**Objective:** Maximize iOS App Store approval likelihood  
**Estimated Total Effort:** 3-4 hours

---

## Executive Summary

This plan consolidates findings from 9 previous audit documents and a fresh code review conducted on December 5, 2025. It identifies what has been completed, what remains outstanding, and provides a phased implementation approach to ensure nothing breaks during the refactor.

### Key Findings
- **Most critical issues from earlier audits are resolved** (Sign in with Apple, account deletion, theming, permissions)
- **New critical issues identified:** Development-only permissions in `app.json`, unconditional console.log, incomplete privacy manifest
- **Low-risk UX polish items** from Dec 3 plan remain optional but recommended

---

## Audit Status Summary

### ✅ Previously Completed (from earlier audits)

| Item | Status | Source |
|------|--------|--------|
| Sign in with Apple integration | ✅ Done | Oct 11 audit |
| Account deletion edge function | ✅ Done | Oct 28 audit |
| Delete account UI reachable in 2 taps | ✅ Done | Oct 22 audit |
| Manage Subscriptions deep link | ✅ Done | Oct 11 audit |
| Restore Purchases in Profile | ✅ Done | Oct 28 audit |
| Remove Face ID permission | ✅ Done | Oct 4 audit |
| Theming unification (tokens.ts) | ✅ Done | Oct 22 audit |
| Hot pink → brand tokens | ✅ Done | Oct 22 audit |
| Remove backdropFilter from RN | ✅ Done | Oct 22 audit |
| StatusBar/SafeArea standardization | ✅ Done | Oct 22 audit |
| Remove StyleScreen legacy | ✅ Done | Oct 22 audit |
| Brand naming alignment | ✅ Done | Oct 22 audit |
| Onboarding Liquid Glass | ✅ Done | Oct 26 update |
| Auth screen color contrast | ✅ Done | Dec 3 plan |
| Input focus states & keyboard flow | ✅ Done | Dec 3 plan |
| Button haptic feedback | ✅ Done | Dec 3 plan |
| Auth screen gesture navigation | ✅ Done | Dec 3 plan |
| Privacy Policy date updated | ✅ Done | Oct 28 audit |
| CFBundleDisplayName = NailGlow | ✅ Done | Oct 28 audit |
| UIRequiresFullScreen = true | ✅ Done | Oct 28 audit |
| EAS production image pinned | ✅ Done | Oct 28 audit |
| Base64 photos no longer in AsyncStorage | ✅ Done | Oct 11 audit |
| Typed navigation stacks | ✅ Done | Oct 22 audit |
| Cache pruning in FeedScreen | ✅ Done | Oct 22 audit |

### ⚠️ Outstanding Items (Must Fix)

| Item | Priority | Source | Phase |
|------|----------|--------|-------|
| Remove `NSLocalNetworkUsageDescription` | 🔴 Critical | Dec 5 audit | 1 |
| Remove `NSBonjourServices` | 🔴 Critical | Dec 5 audit | 1 |
| Remove duplicate `LSApplicationQueriesSchemes` | 🟡 Medium | Dec 5 audit | 1 |
| Remove duplicate Android permissions | 🟡 Medium | Dec 5 audit | 1 |
| Remove unconditional console.log in FeedScreen | 🔴 Critical | Dec 5 audit | 1 |
| Improve DebugErrorBoundary for production | 🟠 High | Dec 5 audit | 1 |
| Gate ConnectionTestScreen properly | 🟠 High | Dec 5 audit | 1 |
| Privacy manifest collected data types | 🔴 Critical | Oct 28 audit | 2 |
| QA account deletion end-to-end | 🔴 Critical | Oct 28 audit | 3 |
| Verify no unexpected permission prompts | 🟡 Medium | Oct 28 audit | 5 |
| Fresh archive metadata verification | 🟡 Medium | Oct 28 audit | 5 |
| QA paywall flows on TestFlight | 🟡 Medium | Oct 28 audit | 5 |
| App Store Connect metadata | 🟡 Medium | Oct 28 audit | 5 |

### 🟢 Optional UX Polish (from Dec 3 plan)

| Item | Priority | Phase |
|------|----------|-------|
| ProcessingScreen animation timing | 🟢 Low | 4 |
| Scanner line range fix | 🟢 Low | 4 |
| Progress exponential decay | 🟢 Low | 4 |
| Onboarding swipe haptic | 🟢 Low | 4 |
| GlassToast duration adjustment | 🟢 Low | 4 |

---

## Phased Implementation Plan

### Phase 0: Pre-Flight Checks (15 min)
*Before making any changes*

#### ~~0.1 Verify Current State~~ ✅ DONE

```bash
cd nail-app-mobile
npx tsc --noEmit   # Pre-existing type errors (not blocking for App Store)
```

> **Note:** 13 pre-existing TypeScript errors found in library type definitions. These are not related to App Store compliance and don't affect runtime.

#### 0.2 Test Core Flows (Manual)

- [ ] Main navigation works: Design ↔ Camera ↔ Feed (swipe + tap)
- [ ] Camera capture flow works
- [ ] Processing → Results flow works

#### ~~0.3 Create Checkpoint~~ ✅ DONE

Checkpoint already created: `git commit -m "changes before app store refactor"`

---

### Phase 1: Critical Production Cleanup (30 min) ✅ COMPLETE
*Remove debug/development artifacts that will cause rejection*

#### ~~1.1 Remove Development-Only Permissions~~ ✅ DONE

**File:** `nail-app-mobile/app.json`

**Changes made:**
- ✅ Removed duplicate `LSApplicationQueriesSchemes` entries
- ✅ Removed `NSLocalNetworkUsageDescription` (dev only)
- ✅ Removed `NSBonjourServices` (dev only)
- ✅ Removed duplicate Android permissions and unused `RECORD_AUDIO`

#### ~~1.2 Remove Unconditional console.log~~ ✅ DONE

**File:** `nail-app-mobile/screens/FeedScreen.tsx` (~line 288)

**Change made:** Wrapped console.log with `__DEV__` check to prevent logging in production.

#### ~~1.3 Improve DebugErrorBoundary for Production~~ ✅ DONE

**File:** `nail-app-mobile/components/DebugErrorBoundary.tsx`

**Changes made:**
- ✅ Error details only shown in `__DEV__` mode
- ✅ Added user-friendly message for production
- ✅ Added "Try Again" button with brand styling
- ✅ Gated console.error with `__DEV__`

#### ~~1.4 Gate ConnectionTestScreen Properly~~ ✅ ALREADY DONE

**File:** `nail-app-mobile/App.tsx`

**Status:** Already properly gated with `__DEV__` check. The `__DEV__` flag is correctly set to `false` in production EAS builds.

#### 1.5 Testing Checklist

- [ ] Build with `eas build --profile preview --platform ios`
- [ ] Verify ConnectionTest is not accessible
- [ ] Verify no console.log output in Metro logs during release
- [ ] Main navigation still works
- [ ] Camera flow still works

#### ~~1.6 Commit~~ ⏳ PENDING

```bash
git add -A
git commit -m "fix(mobile): remove debug artifacts for production build

- Remove NSLocalNetworkUsageDescription (dev only)
- Remove NSBonjourServices (dev only)
- Fix duplicate LSApplicationQueriesSchemes
- Fix duplicate Android permissions
- Gate console.log in FeedScreen
- Improve DebugErrorBoundary for production"
```

---

### Phase 2: Privacy Manifest Completion (45 min) ✅ COMPLETE
*Required for App Store submission since May 2024*

#### ~~2.1 Populate Collected Data Types~~ ✅ DONE

**File:** `nail-app-mobile/ios/nailappmobile/PrivacyInfo.xcprivacy`

**Changes made:**
- ✅ Added Email Address collection declaration
- ✅ Added Photos/Videos collection declaration
- ✅ Added User ID collection declaration

Per the `privacy-manifest-mapping-2025-10-28.md`, added:

```xml
<key>NSPrivacyCollectedDataTypes</key>
<array>
  <!-- Email Address -->
  <dict>
    <key>NSPrivacyCollectedDataType</key>
    <string>NSPrivacyCollectedDataTypeEmailAddress</string>
    <key>NSPrivacyCollectedDataTypeLinked</key>
    <true/>
    <key>NSPrivacyCollectedDataTypeTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypePurposes</key>
    <array>
      <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
    </array>
  </dict>
  
  <!-- Photos or Videos -->
  <dict>
    <key>NSPrivacyCollectedDataType</key>
    <string>NSPrivacyCollectedDataTypePhotosOrVideos</string>
    <key>NSPrivacyCollectedDataTypeLinked</key>
    <true/>
    <key>NSPrivacyCollectedDataTypeTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypePurposes</key>
    <array>
      <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
    </array>
  </dict>
  
  <!-- User ID -->
  <dict>
    <key>NSPrivacyCollectedDataType</key>
    <string>NSPrivacyCollectedDataTypeUserID</string>
    <key>NSPrivacyCollectedDataTypeLinked</key>
    <true/>
    <key>NSPrivacyCollectedDataTypeTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypePurposes</key>
    <array>
      <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      <string>NSPrivacyCollectedDataTypePurposeAnalytics</string>
    </array>
  </dict>
</array>
```

#### 2.2 Verify Required-Reason APIs

Check that only actually-used required-reason APIs are declared. Remove System Boot Time if not used.

#### 2.3 Testing Checklist

- [ ] Build archive with `eas build --profile production --platform ios`
- [ ] Verify no Xcode warnings about privacy manifest
- [ ] Privacy manifest aggregation passes

#### 2.4 Commit

```bash
git add -A
git commit -m "fix(ios): complete privacy manifest with collected data types

- Add Email Address collection declaration
- Add Photos/Videos collection declaration  
- Add User ID collection declaration
- Verify required-reason APIs"
```

---

### Phase 3: Account Deletion QA (30 min)
*Apple Guideline 5.1.1 - Must verify end-to-end deletion*

#### 3.1 Test Email/Password Account Deletion

1. Create a test account with email/password
2. Upload at least 2 nail looks with images
3. Navigate to Profile → Delete Account
4. Enter password and type "DELETE"
5. Complete deletion flow

**Verify in Supabase Dashboard:**
- [ ] `saved_looks` rows for user are deleted
- [ ] `storage.objects` (user images) are deleted
- [ ] `auth.users` record is deleted

#### 3.2 Test Apple Sign In Account Deletion

1. Create account via Sign in with Apple
2. Add at least 1 saved look
3. Navigate to Profile → Delete Account
4. Type "DELETE" (no password required for Apple accounts)
5. Complete deletion flow

**Verify:**
- [ ] Deletion completes without password prompt
- [ ] All user data removed from Supabase

#### 3.3 Capture Evidence for App Review

- [ ] Screen recording of deletion flow (both account types)
- [ ] Screenshot of Supabase tables showing data removed
- [ ] Save recordings for App Review notes attachment

#### 3.4 Document

```bash
# Save evidence to docs folder
mkdir -p docs/AppReview
# Add screen recordings and screenshots
git add docs/AppReview/
git commit -m "docs: add account deletion QA evidence for App Review"
```

---

### Phase 4: UX Polish (Optional - 45 min) ✅ COMPLETE
*From ux-polish-implementation-plan-2025-12-03.md - Timing improvements only*

#### ~~4.1 ProcessingScreen Animation Fixes~~ ✅ DONE

**File:** `nail-app-mobile/screens/ProcessingScreen.tsx`

**Status:**
- ✅ Scanner line range already fixed to `height + 100`
- ✅ Progress curve with exponential decay already implemented
- ✅ Scanner animation slowed from 2000ms to 2800ms

#### ~~4.2 Onboarding Swipe Haptic~~ ✅ ALREADY DONE

**File:** `nail-app-mobile/screens/OnboardingScreen.tsx`

**Status:** Already implemented with `prevIndexRef` and `Haptics.selectionAsync()`

#### ~~4.3 GlassToast Duration~~ ✅ ALREADY DONE

**File:** `nail-app-mobile/components/ui/GlassToast.tsx`

**Status:** Already set to `duration = 2000`

---

### Phase 4 Summary

All UX polish items were either already implemented or have been updated:
- ✅ Scanner animation: 2000ms → 2800ms (just updated)
- ✅ Scanner range: Already `height + 100`
- ✅ Progress decay: Already exponential
- ✅ Onboarding haptic: Already implemented
- ✅ GlassToast duration: Already 2000ms

---

### Phase 5: Final Verification (1 hour)

#### 5.1 Build Verification

```bash
cd nail-app-mobile
npm run type-check    # Must pass
npm run lint          # Must pass
eas build --profile production --platform ios
```

#### 5.2 Device Testing Checklist

**Navigation:**
- [ ] Splash → Onboarding → Auth flow works
- [ ] Main tabs: Design ↔ Camera ↔ Feed (swipe + tap)
- [ ] Camera capture → Processing → Results flow
- [ ] Profile accessible from Feed
- [ ] Delete Account accessible from Profile (≤2 taps)

**Core Features:**
- [ ] Camera permission prompt shows with correct message
- [ ] Photo library picker works
- [ ] AI transformation completes successfully
- [ ] Save to Feed works
- [ ] Share functionality works

**Payments:**
- [ ] Upgrade screen loads RevenueCat offerings
- [ ] Restore Purchases works
- [ ] Manage Subscriptions opens App Store

**Account:**
- [ ] Sign in with Apple works
- [ ] Email/password login works
- [ ] Account deletion completes fully

**No Debug Artifacts:**
- [ ] No console.log output visible in release
- [ ] No debug screens accessible
- [ ] Error boundary shows generic message (not raw error)
- [ ] No development permission prompts

#### 5.3 App Store Connect Preparation

- [ ] Privacy questionnaire matches privacy manifest exactly
- [ ] EU DSA trader info entered (if applicable)
- [ ] Support email/URL configured
- [ ] Age rating questionnaire completed
- [ ] Screenshots updated to reflect current UI
- [ ] App description accurate
- [ ] Export compliance questions answered

#### 5.4 App Review Notes

Prepare notes for the App Review team:

```
Account Deletion:
- Navigate to Feed tab → Profile icon → Delete Account
- For email/password accounts: enter password + type "DELETE"
- For Apple Sign In accounts: type "DELETE" only (no password required)
- All user data including images is permanently removed

Test Account (if needed):
- Email: [test@example.com]
- Password: [testpassword]

In-App Purchases:
- Subscription management: Profile → Subscription → Manage
- Restore purchases: Profile → Subscription → Restore
```

#### 5.5 Final Commit

```bash
git add -A
git commit -m "chore: final verification for App Store submission"
git push
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Debug screen accessible in production | Medium | High (rejection) | Phase 1.4 - proper gating |
| Privacy manifest incomplete | High | High (rejection) | Phase 2 - complete manifest |
| Account deletion incomplete | Low | High (rejection) | Phase 3 - QA verification |
| Console.log in production | Medium | Medium (unprofessional) | Phase 1.2 - remove/gate |
| Unused permissions questioned | Low | Medium (delay) | Phase 1.1 - remove |

---

## Rollback Plan

If any phase breaks the app:

```bash
# Revert last commit
git revert HEAD

# Or revert to checkpoint
git reset --hard <checkpoint-commit-hash>

# Force push if needed (careful!)
git push --force-with-lease
```

**Per-phase rollback:**
- Phase 1 issues → Revert `app.json` and affected screen files
- Phase 2 issues → Revert `PrivacyInfo.xcprivacy`
- Phase 4 issues → Revert animation files only

---

## Files Modified Summary

| File | Phase | Changes |
|------|-------|---------|
| `app.json` | 1 | Remove dev permissions, fix duplicates |
| `screens/FeedScreen.tsx` | 1 | Gate console.log |
| `components/DebugErrorBoundary.tsx` | 1 | Production-safe error display |
| `App.tsx` | 1 | Gate/remove ConnectionTestScreen |
| `ios/.../PrivacyInfo.xcprivacy` | 2 | Add collected data types |
| `screens/ProcessingScreen.tsx` | 4 | Animation timing (optional) |
| `screens/OnboardingScreen.tsx` | 4 | Swipe haptic (optional) |
| `components/ui/GlassToast.tsx` | 4 | Duration adjustment (optional) |

---

## DO NOT MODIFY

These files/patterns are critical and must not be changed:

- `navigation/MainNavigator.tsx` - Tab swipe flow
- `MainTabs` component
- `navigation.jumpTo()` calls in main tabs
- `transitionFrom` parameter system
- `cardStyleInterpolator` configurations
- Camera 50ms delay in `CameraScreen.tsx`
- `onLayout` + `hasLaidOut` gate in CameraScreen
- `shouldRenderCamera` focus check

---

## References

- Previous audits: `docs/Audits/`
- Privacy manifest mapping: `docs/Audits/privacy-manifest-mapping-2025-10-28.md`
- UX polish plan: `docs/Audits/ux-polish-implementation-plan-2025-12-03.md`
- Onboarding UX plan: `docs/Audits/onboarding-ux-improvement-plan-2025-12-03.md`
- Theme tokens: `nail-app-mobile/src/theme/tokens.ts`
- Navigation types: `nail-app-mobile/navigation/types.ts`

---

*Document created: 2025-12-05*  
*Next review: After Phase 5 completion*
