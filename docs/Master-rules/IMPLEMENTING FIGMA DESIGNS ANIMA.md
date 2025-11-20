# AI Agent Guide: Implementing Figma Designs from Anima Exports

## ⚠️ CRITICAL: WORKSPACE CONTEXT

**The active codebase is `/nail-app-mobile/`. ALL file edits and commands MUST be executed within this directory.**

- ✅ Correct: `/Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/FeedScreen.tsx`
- ❌ Wrong: `/Users/imraan/Downloads/NailAppNewRepo/screens/FeedScreen.tsx`

The root directory contains an archived duplicate in `_archived_root_duplicates/` that must NEVER be edited. All screen files, components, and assets live inside `nail-app-mobile/`.

---

## 1. Mission Overview

You will receive React web code (Anima export) for specific screens from the Figma team. Your job is to **translate** that code into React Native and apply it to the correct, existing screen files in [nail-app-mobile/screens](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens:0:0-0:0).

**Absolutely do not copy the Anima JSX verbatim.** React Native rejects `<div>`, `className`, Tailwind classes, etc. Treat the export as a visual spec.

> **Documentation layout:** Each screen now has a dedicated subfolder inside [docs/Redesign/](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign:0:0-0:0) (e.g., `docs/Redesign/Camera Screen/`, [docs/Redesign/Feed-redesign/](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Feed-redesign:0:0-0:0), etc.).
> - Each folder contains a canonical `_LAYOUT_GUIDE.md` (hierarchy, stacking order, containers, constraints). **Implement the layout EXACTLY from this guide first.**
> - The same folder also contains component-level exports (header, filter bar, grid, bottom nav). Use these to match visuals only after the base layout matches.
> - Example: Feed layout guide — [docs/Redesign/Feed-redesign/_LAYOUT_GUIDE.md](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Feed-redesign/_LAYOUT_GUIDE.md:0:0-0:0).

---

## 2. Screens We Are Redesigning

| Screen (product name) | React Native file to edit | Figma references you must mirror |
| --- | --- | --- |
| **Camera** | [nail-app-mobile/screens/CameraScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/CameraScreen.tsx:0:0-0:0) | `docs/Redesign/Camera Screen/` + [docs/Redesign/Camera-resdesign.md](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Camera-resdesign.md:0:0-0:0) + `docs/Redesign/Camera Screen/_LAYOUT_GUIDE.md` |
| **Feed** | [nail-app-mobile/screens/FeedScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/FeedScreen.tsx:0:0-0:0) | [docs/Redesign/Feed-redesign/](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Feed-redesign:0:0-0:0) + [docs/Redesign/Feed-redesign.md](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Feed-redesign.md:0:0-0:0) + [docs/Redesign/Feed-redesign/_LAYOUT_GUIDE.md](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Feed-redesign/_LAYOUT_GUIDE.md:0:0-0:0) |
| **Saved Images (“My Looks”)** | [nail-app-mobile/screens/MyLooksScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/MyLooksScreen.tsx:0:0-0:0) | `docs/Redesign/Saved Images/` + [docs/Redesign/saved-image.md](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/saved-image.md:0:0-0:0) + `docs/Redesign/Saved Images/_LAYOUT_GUIDE.md` |
| **Sharing Saved Image (Results Share sheet)** | [nail-app-mobile/screens/ResultsScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/ResultsScreen.tsx:0:0-0:0) | [docs/Redesign/Sharing-saved-image/](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/Sharing-saved-image:0:0-0:0) + [docs/Redesign/saved-image-share.md](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/docs/Redesign/saved-image-share.md:0:0-0:0) + `docs/Redesign/Sharing-saved-image/_LAYOUT_GUIDE.md` |
| **Transformed Image (Results screen main view)** | [nail-app-mobile/screens/ResultsScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/ResultsScreen.tsx:0:0-0:0) | `docs/Redesign/transformed image/` + `docs/Redesign/transformed image/_LAYOUT_GUIDE.md` |

Notes:

- The bottom navigation is anchored by our existing `LiquidGlassTabBar`. Its structure, hit areas, and behaviour must stay intact. Apply only the styling tweaks that are explicitly documented in that screen’s folder.
- The Design screen already shows the intended visual treatment for the LiquidGlass tab bar—treat that screen as the canonical reference, even if you swap icons per design.
- All glassmorphic surfaces must use the existing primitives (`GlassmorphicView`, `NativeLiquidGlass`, `LiquidGlassTabBar`). Do not recreate glass effects from scratch.

---

## 3. Translation Rules (Non‑Negotiable)

1. **No direct Anima JSX.** Convert everything manually from web HTML into React Native.
   - `<div>` / `<section>` → `<View>`
   - `<p>` / headings → `<Text>`
   - `<button>` → `<TouchableOpacity>` / `<Pressable>`
   - `<img>` → `<Image>`
2. **Inline Tailwind/CSS → `StyleSheet.create`.** Match colors, spacing, typography, borders, and shadows exactly.
3. **Respect existing layout logic.** For example, on [CameraScreen](cci:1://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/CameraScreen.tsx:36:0-468:1) the `onLayout`/`hasLaidOut` gate and delayed navigation must remain intact to avoid native crashes.
4. **Work one component at a time.** Implement a single visual element, run `npm run type-check`, then move on.
5. **Preserve safe areas and gestures.** Keep `useSafeAreaInsets`, pinch zoom, navigation delays, etc.
6. **Read before editing.** Study the current screen implementation and the docs folder before planning the minimum set of changes needed.

---

## 4. What to Deliver per Screen
 - Start from the screen’s `_LAYOUT_GUIDE.md` and implement the container/stacking structure first.
 - Only after the base layout matches, apply visual tweaks from the component exports.

### Camera ([CameraScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/CameraScreen.tsx:0:0-0:0))
- Full-bleed preview honoring safe areas.
- Glass close + flip buttons, zoom chip (`1x / 2x`) styled precisely.
- Pinch-to-zoom wired to `CameraView`’s `zoom` prop.
- Corner framing guides overlay.

### Feed ([FeedScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/FeedScreen.tsx:0:0-0:0))
- Gradient “Feed” header + profile glyph per spec.
- Category filter ribbon and grid layout matching the exported components.
- Bottom tab bar reuses `LiquidGlassTabBar` with updated styling only.

> **Feed colour filters:** The current app does **not** yet support filtering looks by colour categories. When implementing the redesign, add logic to derive available colour categories from the user’s saved looks (same data source used by [MyLooksScreen](cci:1://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/MyLooksScreen.tsx:55:0-397:1)). Store the selected category in screen state, filter the feed list client-side, and fall back to “All” when no filter is chosen. Do not block the UI if the user has no saved categories—show the chips in their unselected state.

### Saved Images ([MyLooksScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/MyLooksScreen.tsx:0:0-0:0))
- Replace gallery chrome with the liquid/glass stack from the docs exports.
- Bottom action chips (Design / Feed / main CTA) styled per spec.
- Top glass info bar showing colour / brand / category.

### Transformed Image ([ResultsScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/ResultsScreen.tsx:0:0-0:0) main view)
- Choice overlay, back button, and save CTA styled exactly per the `transformed image` folder.
- Ensure existing save logic remains functional.

### Sharing Saved Image ([ResultsScreen.tsx](cci:7://file:///Users/imraan/Downloads/NailAppNewRepo/nail-app-mobile/screens/ResultsScreen.tsx:0:0-0:0) share sheet)
- Implement the share modal layout (contacts row, app icons, actions list) using the provided component exports.
- Retain current share functionality while updating visuals.

---

## 5. Definition of Done

- UI matches the Figma exports at 390 px and 428 px widths.
- `npm run type-check`, `npm run lint`, and `npm run ios` all pass.
- No new files unless explicitly approved; keep edits inside the existing screen files.
- Document follow-up notes or gaps in the pull request, referencing this guide.

Stick to this rulebook and the redesign will land without regressions.