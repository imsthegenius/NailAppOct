# Repository Guidelines

## Project Focus & Structure
The production codebase lives entirely inside `nail-app-mobile/`. The legacy Next.js web prototype (`nail-app/`) has been retired—do not create or modify files there. Day-to-day work happens in `nail-app-mobile/src`, `screens/`, `components/`, `navigation/`, and `theme/`, with shared state in `lib/`. Keep root CSV catalogs current whenever Supabase seed data moves.

## Build & Development Commands
From `nail-app-mobile/`: `npm install`, then `npm run start` for Expo + QR codes, `npm run ios` or `npm run android` for device builds, and `npm run web` for quick layout checks. The postinstall hook (`node scripts/patch-expo-file-system.js`) must succeed after dependency updates—rerun it manually if bundling fails. Touch the legacy web client only to regenerate assets via `npm run build` or `npm run type-check` when cross-linked tooling requires it.

## Design Direction
All UI/UX choices target the internal “iOS26” vision: futuristic Apple glass surfaces, reduced chrome, and gesture-first flows. Use the Liquid Glass primitives—`components/ui/LiquidGlassTabBar`, `GlassmorphicView`, and `NativeLiquidGlass`—instead of recreating glassmorphism. Check screens at 390 px and 428 px and mirror the Figma tokens before committing.

## Coding Standards
Run `npm run format` (Prettier: 2 spaces, single quotes, no semicolons) and `npm run lint` (Expo/React Native rules) before pushing. Components stay PascalCase, hooks use `useName`, Zustand stores sit in `lib/`, and shared types live in `src/types`. Keep TypeScript strict by declaring return types on async functions and navigation helpers.

## Testing & Device Checks
No formal suite ships yet, so treat `npm run lint`, `npm run type-check`, and a physical device smoke test as mandatory. The camera flow depends on a 50 ms delay before navigation (`setTimeout(..., 50)` inside `screens/CameraScreen.tsx`) to let `CameraView` initialise without crashing—preserve or update that delay explicitly whenever you touch the capture logic. Validate UI on iOS simulators and a recent Android device for parity.

## Commits & PR Workflow
Follow conventional commits (`feat(mobile): soft glass header`, `fix(sql): reapply categories`). Keep PRs small, describe testing steps, attach screenshots or screen recordings for UI, and call out new env vars or Supabase migrations. Reference Jira or Linear IDs when available so downstream agents can trace context.

## Security & Environment
Clone `.env.template` into `.env` locally, store Gemini and Supabase secrets there, and never commit them. Update `SUPABASE_SETUP.md` and related runbooks whenever connection strings or auth policies change to keep onboarding friction low.
