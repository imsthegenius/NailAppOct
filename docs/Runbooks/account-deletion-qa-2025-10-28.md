# Account Deletion QA — Runbook (28 Oct 2025)

Goal: Prove end‑to‑end deletion (Guideline 5.1.1) including storage purge, and capture evidence for App Review.

Steps
- Create a fresh test account (use Sign in with Apple and email/password separately).
- Upload at least 2 looks (original + transformed images) and confirm rows in `saved_looks`.
- Verify storage objects exist in buckets: `user-uploads` and `transformed-images` under `<userId>/...`.
- Trigger deletion via Profile → Delete Account.
- Backend checks (production DB):
  - `SELECT COUNT(*) FROM saved_looks WHERE user_id = '<userId>';` → 0
  - `SELECT COUNT(*) FROM user_profiles WHERE id = '<userId>';` → 0
  - `SELECT * FROM audit_logs WHERE user_id = '<userId>' AND action = 'account_deleted';` → 1 row
- Storage checks:
  - Confirm objects removed from both buckets at prefix `<userId>/`.
  - If RLS prevents direct check, use an admin tool or service function logs.
- Auth deletion:
  - Confirm user removed from Supabase Auth (via Admin UI or logs of `delete-auth-user` function).
- Evidence to collect:
  - Screen recording of the full flow (start at Profile → Delete Account).
  - Timestamped DB/Edge Function logs showing the purge.

Preconditions
- `12_account_deletion.sql` is applied in production.
- Service‑role function handles storage deletion (do not rely on client credentials).

Notes
- Apple SSO users should not be prompted for a password (we use current session or Apple re‑auth).
- Keep the “type DELETE” confirmation as a guardrail.
