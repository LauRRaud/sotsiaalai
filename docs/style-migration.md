# Style Migration Process (CSS -> Tailwind)

## Goals
- Keep visuals identical while reducing CSS/JSX conflicts.
- Make it obvious where each effect is maintained.
- Avoid `!important` by using a clear cascade model.

## Ground Rules
- One source of truth per property:
  - Layout/spacing/typography -> JSX Tailwind utilities.
  - Effects/complex visuals (masks, 3D, keyframes, ::before) -> CSS.
- CSS must live in layers:
  - `@layer base` for resets and base typography.
  - `@layer components` for reusable component styles.
  - `@layer utilities` for small utilities.
- Inline styles only for truly dynamic values.

## Global Setup (Must Stay Consistent)
1. Keep font vars in `app/layout.js`:
   - `--font-aino`
   - `--font-aino-headline`
2. Keep base typography in `app/styles/base/typography.css` inside `@layer base`.
3. Add/keep small Tailwind utilities in `app/styles/tailwind.css`.
4. Ensure `globals.css` imports:
   - tokens -> theme -> tailwind -> base -> components -> utilities -> mobile.

## Page/Component Process Template
For each page/component:
1. List CSS classes actually used in JSX.
2. Identify which rules are:
   - Layout/spacing/typography (move to JSX)
   - Effects/animations (keep in CSS)
3. Move layout/spacing/typography to JSX.
4. Remove dead or duplicated CSS.
5. Test visuals on desktop + mobile.

## Home Page (Current Status)
### Files
- `components/HomePage.jsx`
- `components/HomeSections/HomeAboutSection.jsx`
- `components/HomeSections/HomeFooter.jsx`
- `app/styles/components/home.css`

### What Is Tailwind Now
- `HomeAboutSection` layout, spacing, typography.
- `HomeFooter` layout, spacing, logo sizing.
- `HomePage` layout + scroll-cue layout.

### What Stays in CSS
- 3D card flip, masks, `::before` artwork, and keyframes.
- Scroll cue animation and arrow background image.
- Cursor and click-pulse overlay.

### Recent Changes
- `HomeAboutSection` moved layout/typo to Tailwind.
- `HomeFooter` moved layout/typo to Tailwind.
- `HomePage` styles moved to global `app/styles/components/home.css`.
- `components/HomePage.module.css` removed; classes are now global.
- Theme tokens for homepage live in `app/styles/theme/light.css` + `app/styles/theme/dark.css`.
- Modal/overlay scroll-cue visibility moved from `home.css` to `HomePage.jsx` state logic.
- Modal hover/focus suppression moved from `home.css` selectors into JSX Tailwind utility variants.
- `home.css` now keeps effect-only dark edge glow logic.

### Next Steps (Home)
1. Optional: consolidate any future homepage-only animations in `home.css`.
2. Keep Tailwind for layout; CSS for effects only.

## Chat Page (Current Status)
### Files
- `components/alalehed/ChatBody.jsx`
- `components/alalehed/chat/ChatComposer.jsx`
- `components/alalehed/chat/ConversationView.jsx`
- `app/styles/components/chat-focus.css`
- `app/styles/theme/dark.css`
- `app/styles/theme/light.css`

### Approach
- Layout/spacing in JSX where safe.
- Effects/masks/blur/arc in CSS.
- Ring size should not jump; fookus muudab kuju ja sisemisi paddings/offsete.

### Current State (Aligned With `sotsiaalaibackup`)
- Restored `chatVars` inline style in `ChatBody.jsx` to drive focus vars.
- Removed `glass-ring-expandable` from chat container; focus shape is controlled by chat vars + focus CSS.
- Desktop ring size is controlled via `--chat-diameter` / `--chat-diameter-max` and `chat-container--input-focus`.
- Ring border-radius transitions are 400ms (backup parity).
- Chat input row + window transitions are 400ms (backup parity).
- `chat-inputbar` recording styles remain in theme files.

### Latest Chat Fixes (Current Workspace Snapshot)
- Dark mode chat glass ring now uses the same surface strategy as profile:
  - `GlassRing` receives inline dark override (`background: transparent`, `backdrop-filter: none`) in `ChatBody.jsx`.
  - This avoids accidental double darkening from cascade order.
- Right rail positioning tuned on desktop with `--rail-inset`.
- Focus and non-focus message window offsets/spacers are now controlled through chat variables in `ChatBody.jsx`.
- Conversation fade/masking logic currently lives in `ConversationView.jsx` and still needs final visual calibration.

### Notes
- If ring still “jumps”, check for any remaining `--chat-diameter` overrides outside `chatVars`.
- Mobile overrides live in `app/styles/mobile.css` and can override offsets.

## Profile Page (Planned)
### Files
- `components/alalehed/ProfiilBody.jsx`
- `components/alalehed/ProfiilBody.module.css`

### Approach
1. Keep mask/overlay logic and orbit effects in CSS.
2. Move simple layout/spacing to JSX where safe.

### Recent Changes
- Moved profile nav overlay layout to Tailwind (`ProfiilBody.jsx`).
- Moved orbital menu sizing/layout custom properties from `OrbitalMenu.css` to Tailwind utility vars in `ProfiilBody.jsx`.
- Moved `OrbitalMenu` base layout vars and interaction-state layout rules (`--item-*`, `--label-*`, slot transform/opacity, item scale transitions) from `OrbitalMenu.css` into `OrbitalMenu.jsx` Tailwind utility classes.
- Moved orbit label max-width key override (`theme`/`subscription`) from CSS selector override to JSX conditional Tailwind classes.
- Moved orbit label positioning and reveal interactions (`up/down/left/right`, hover/focus transitions) from CSS selectors into `OrbitalMenu.jsx` Tailwind utility classes.
- Moved orbit center button base layout rules (3D/backface/outline/transition/animation hook) from `OrbitalMenu.css` into `OrbitalMenu.jsx` Tailwind utility classes.
- `/tellimus`, `/uuenda-epost`, and `/uuenda-pin` now use shared `glassPageCloseClassName` and no longer rely on `page-back-bottom` helper class for back-button placement.
- `/kasutusjuhend`, `/privaatsustingimused`, and `/kasutustingimused` now use shared `glassPageCloseClassName` and no longer rely on `page-back-bottom` helper class for back-button placement.
- `app/taasta-parool/[token]/ResetPasswordForm.jsx` now uses shared `glassPageCloseClassName` + `glassPageRingCenteredClassName` (`glass-ring--desktop-stable`) for parity with other glass-ring forms.
- `components/alalehed/RegistreerimineBody.jsx` moved static inline CSS custom properties (`--csp-chevron-*`, `--csp-title-top`, fixed CSP scale/opacity vars) into Tailwind utility classes; only dynamic pad vars remain inline.
- `app/error.jsx` now uses shared `glassPageCloseClassName` and `glass-ring--desktop-stable` for cross-page glass behavior parity.
- `components/rooms/RoomsPage.jsx` no longer relies on `page-back-bottom`; it uses the shared `glassPageBackClassName` positioning directly.
- `components/accessibility/AccessibilityModal.jsx` moved static CSP custom properties (`--csp-chevron-*`, fixed CSP scale/opacity vars) from inline styles to Tailwind utility classes; only dynamic scroll pad vars remain inline.
- `components/effects/Components/OrbitalMenu/OrbitalMenu.jsx` now drives simple state styles via Tailwind classes (`slot reveal/hide animation`, mobile row hidden pointer-events, mobile scrim opacity, active mobile label opacity), and corresponding selectors were removed from `OrbitalMenu.css`.
- `components/effects/Components/OrbitalMenu/OrbitalMenu.jsx` now also applies mobile action/label accent styling and mobile list scrollbar hiding via utility classes; redundant mobile color/label/scrollbar selectors were removed from `OrbitalMenu.css`.
- Added shared `components/ui/glassPolicyPageStyles.js` and wired `/kasutusjuhend`, `/privaatsustingimused`, `/kasutustingimused` to it for common expandable glass-ring layout classes (ring/content/scroll/title offsets/toggle), reducing duplicated Tailwind class strings.
- `glassPageCloseClassName` now uses coarse-pointer media conditions so the close (`×`) button shows only on touch/mobile devices, not desktop fine-pointer layouts.
- `glassPageCloseClassName` is now anchored to a shared `glass-mobile-only-close` class, with visibility/position controlled in `app/styles/mobile.css` (hidden on desktop, fixed top-right on mobile).
- Added desktop-specific `glass-policy-scroll` mask profiles in `app/styles/utilities/helpers.css` for `/kasutusjuhend`, `/privaatsustingimused`, `/kasutustingimused` to make top/bottom text fade longer and smoother.
- Added shared `glassPolicyBackButtonClassName` + desktop helper rules so policy-page back buttons fade out/in smoothly when `glass-ring-expandable` toggles open state.

## Checklist (Per Change)
- [ ] No duplicate var definitions in both CSS and JSX.
- [ ] All layout/spacing in JSX unless truly complex.
- [ ] Effects remain in CSS with clear comments.
- [ ] `@layer` used for base/components/utilities.
- [ ] Visual diff passes for desktop + mobile.

## Next Iteration Plan
1. Freeze chat fade model:
   - Keep one top-fade method only (either arc mask or overlay), not both.
   - Keep one bottom-fade method only.
   - Add a short code comment in `ConversationView.jsx` that explains chosen model.
2. Normalize chat ring surface:
   - Keep dark ring surface source-of-truth in one place (`ChatBody.jsx` or theme), remove redundant overrides.
3. Continue Tailwind migration in low-risk order:
   - `home.css` leftovers -> JSX utilities.
   - `profile` remaining layout rules -> JSX utilities (effects remain CSS).
   - Keep `mobile.css` as explicit device-layer override file.
4. Run CSS hygiene pass:
   - `npm run css:audit`
   - prune dead selectors/file imports after each migrated block.
5. Stabilize with quick QA checklist:
   - Desktop dark/light: `/vestlus`, `/profiil`, `/tellimus`, `/uuenda-epost`.
   - Mobile dark/light same routes.
