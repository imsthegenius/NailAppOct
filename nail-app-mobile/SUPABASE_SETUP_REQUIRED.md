# ⚠️ IMPORTANT: Supabase Setup Required

## Critical SQL Files to Run

Before the app can be fully functional and App Store compliant, you MUST run the following SQL files in your Supabase SQL Editor:

### Location of SQL Files
The SQL files are located in: `/Users/imraan/Downloads/NailApp/nail-app/supabase/`

### Required SQL Files (in order):

1. **Account Deletion** (`12_account_deletion.sql`)
   - ✅ Creates `delete_user_account()` function
   - ✅ Required for App Store compliance
   - ✅ Creates audit logging
   - **Status**: MUST RUN

2. **Legal Compliance** (`13_legal_compliance.sql`)
   - ✅ Creates tables for privacy/terms acceptance tracking
   - ✅ Creates user settings table (auto-save to camera roll)
   - ✅ Creates data export function for GDPR
   - **Status**: MUST RUN

3. **User Auth Setup** (`14_user_auth_setup.sql`)
   - ✅ Creates user profiles table
   - ✅ Sets up proper RLS policies
   - **Status**: MUST RUN

### How to Run:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste each SQL file content
4. Run each file in order
5. Check for any errors

### Post-Setup Configuration:

1. **Enable Authentication Providers:**
   - Email/Password ✅ (required)
   - Anonymous (optional)

2. **Storage Buckets:**
   - Verify `user-uploads` bucket exists
   - Verify `transformed-images` bucket exists

3. **Test the functions:**
   ```sql
   -- Test account deletion (BE CAREFUL - this deletes data!)
   SELECT delete_user_account('your-user-id');
   
   -- Test data export
   SELECT export_user_data('your-user-id');
   ```

## App Features That Depend on These SQL Files:

- ❌ **Account Deletion** - Won't work without `12_account_deletion.sql`
- ❌ **Privacy/Terms Tracking** - Won't work without `13_legal_compliance.sql`
- ❌ **User Settings** - Won't work without `13_legal_compliance.sql`
- ❌ **Data Export** - Won't work without `13_legal_compliance.sql`

## Important Notes:

- The app will still run without these, but will fail App Store review
- Account deletion is MANDATORY for App Store (Guidelines 5.1.1)
- These functions are called from `DeleteAccountScreen.tsx`

## Full SQL Execution Order:

See `/Users/imraan/Downloads/NailApp/nail-app/supabase/00_RUN_ORDER.md` for the complete list of all SQL files and their execution order.

---

**Last Updated**: January 2025
**Critical for**: App Store Submission