# Privacy Manifest Mapping — Draft (28 Oct 2025)

Purpose: Source of truth to populate `ios/nailappmobile/PrivacyInfo.xcprivacy` and keep App Store privacy questionnaire in lockstep.

Data collected by the app (first‑party)
- Contact Info → Email Address
  - Linked to user: yes
  - Used for tracking: no
  - Purposes: App Functionality, Account Management, Analytics

- User Content → Photos or Videos (user‑selected nail photos)
  - Linked to user: yes
  - Used for tracking: no
  - Purposes: App Functionality (core transformation feature)

- Identifiers → User ID (Supabase UID)
  - Linked to user: yes
  - Used for tracking: no
  - Purposes: App Functionality, Account Management, Analytics

- Usage Data → Product Interaction (feature usage, non‑ad analytics)
  - Linked to user: yes (associated with Supabase UID)
  - Used for tracking: no
  - Purposes: Analytics, Product Personalization (optional), App Functionality

Notes
- Ads/third‑party tracking: none.
- Required‑reason APIs currently declared: User Defaults, File Timestamp, Disk Space, System Boot Time. Validate System Boot Time usage; remove if not used.

Example snippet (replace with Apple’s enum constants when editing the plist)

```xml
<!-- Add under <key>NSPrivacyCollectedDataTypes</key> <array> ... </array> -->
<dict>
  <key>NSPrivacyCollectedDataType</key>
  <string>EmailAddress</string>
  <key>NSPrivacyCollectedDataTypeLinked</key>
  <true/>
  <key>NSPrivacyCollectedDataTypeTracking</key>
  <false/>
  <key>NSPrivacyCollectedDataTypePurposes</key>
  <array>
    <string>AppFunctionality</string>
    <string>AccountManagement</string>
    <string>Analytics</string>
  </array>
</dict>
```

Action items
- Confirm final constant names from Apple docs before committing to `PrivacyInfo.xcprivacy`.
- Ensure the App Store privacy questionnaire answers match these exactly.
