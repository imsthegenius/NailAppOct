# Supabase SQL Execution Order

## Important: Run these SQL files in order in your Supabase SQL Editor

### Initial Setup (Required)
1. `01_schema.sql` - Base tables structure
2. `02_rls_policies.sql` - Row Level Security policies
3. `03_storage_FIXED_v2.sql` - Storage buckets setup (use FIXED_v2, not the others)
4. `04_functions.sql` - Core functions
5. `05_indexes_FIXED.sql` - Database indexes (use FIXED, not the original)

### Data Seeding (Optional - for testing)
6. `06_seed_data_FIXED.sql` - Sample data (use FIXED version)
7. `07_additional_tables.sql` - Extra tables for features
8. `08_expanded_seed_data.sql` - More sample data

### Mobile App Specific (Required)
9. `09_mobile_app_updates.sql` - Mobile app specific updates
10. `10_nail_storage_setup.sql` - Nail image storage configuration
11. `11_enable_anonymous_auth.sql` - Anonymous user support

### Apple Compliance (Required for App Store)
12. `12_account_deletion.sql` - Account deletion functionality (App Store requirement)
13. `13_legal_compliance.sql` - Privacy policy and terms tracking

### User Management (Required)
14. `14_user_auth_setup.sql` - User profiles and authentication
15. `38_onboarding_helpers.sql` - Onboarding completion helper (run after auth setup)
16. `39_color_category_normalization.sql` - Canonical category mapping + QA views
17. `40_color_variants.sql` - Brand-aware color variants + finish expansion

## Notes:
- Run each file completely before moving to the next
- Check for errors after each file
- The FIXED versions correct issues in the original files
- Files 12-14 are NEW and required for App Store compliance

## Post-SQL Setup:
1. Enable Email/Password authentication in Supabase Dashboard
2. Enable Anonymous authentication (optional)
3. Configure email templates for auth
4. Set up storage CORS if needed
5. Enable Realtime for relevant tables (optional)
