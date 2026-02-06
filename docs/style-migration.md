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

### Next Steps (Home)
1. Optional: consolidate any future homepage-only animations in `home.css`.
2. Keep Tailwind for layout; CSS for effects only.

## Chat Page (Current Status)
### Files
- `components/alalehed/ChatBody.jsx`
- `components/alalehed/chat/ChatComposer.jsx`
- `components/alalehed/chat/ConversationView.jsx`
- `app/styles/components/chat.css`
- `app/styles/theme/dark.css`
- `app/styles/theme/light.css`

### Approach
- Layout/spacing in JSX where safe.
- Effects/masks/blur/arc in CSS.
- Ring size should not jump; fookus muudab kuju ja sisemisi paddings/offsete.

### Current State (Aligned With `sotsiaalaibackup`)
- Restored `chatVars` inline style in `ChatBody.jsx` to drive focus vars.
- Removed `glass-ring-expandable` from chat container; fookuse kuju muutub `chat.css` reeglitega.
- Desktop ring size locked to `--chat-diameter` in `chat.css` (no size jump).
- Ring border-radius transitions restored to 400ms (backup parity).
- Chat input row + window transitions set to 400ms (backup parity).
- `chat-inputbar` recording styles remain in theme files.

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

## Checklist (Per Change)
- [ ] No duplicate var definitions in both CSS and JSX.
- [ ] All layout/spacing in JSX unless truly complex.
- [ ] Effects remain in CSS with clear comments.
- [ ] `@layer` used for base/components/utilities.
- [ ] Visual diff passes for desktop + mobile.
