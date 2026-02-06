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

## Chat Page (Planned)
### Files
- `components/alalehed/ChatBody.jsx`
- `components/alalehed/chat/ConversationView.jsx`
- `app/styles/components/chat.css`

### Approach
1. Choose source of truth for spacing vars (likely CSS).
2. Remove duplicated var definitions.
3. Keep masks/fades/blur effects in CSS.
4. Keep layout and simple spacing in JSX.

### Recent Changes
- Moved `chat-page-shell` layout to Tailwind classes in `ChatBody.jsx`.
- Removed debug-only padding override from `chat.css` (`.chat-window__scroll`).
- Moved `chat-nav-overlay`, `chat-back-button`, `chat-close-button` layout to Tailwind in `ChatBody.jsx`.
- Moved chat error banner layout (centering/width) to Tailwind in `ChatBody.jsx`.
- Consolidated chat window padding vars to CSS (removed inline overrides in `ChatBody.jsx`).
- Moved chat container + focus state CSS vars from inline styles to `chat.css`.
- Moved `chat-container` layout (position/z-index/min-height) to Tailwind classes.
- Removed unused `glass-box chat-container` selectors and redundant `chat-page-shell` media padding.
- Moved `chat-window` layout (margin/max-height) and scrollbar hiding from JSX to `chat.css`.
- Removed duplicate `chat-inputbar` transition rules from `chat.css` (kept Tailwind transitions in JSX).
- Moved `chat-input-row` transform + transition from `chat.css` to JSX (ChatComposer).
- Removed unused chat CSS vars (`--chat-inputbar-h`, `--chat-input-row-gap`, `--chat-expanded-delta`, etc.).
- Moved `--chat-input-max-w` from inline style to `chat.css` (base + focus states).
- Moved chat container focus border-radius to Tailwind (`ChatBody.jsx`).
- Moved `chat-window` transition to Tailwind (`ConversationView.jsx`).
- Moved `conversation-view` margin/transform to Tailwind (via `ChatBody.jsx` prop).
- Removed recording-state button styles from `chat.css` (kept in light/dark theme files).
- Moved chat button SVG stroke/opacity rules out of `chat.css` (using SVG classes instead).
- Moved inputbar/attach left offset from CSS vars to Tailwind (desktop/mobile split).
- Removed `chat-send-loader` transform override from `chat.css` (no-op).
- Removed `chat-input-field` scrollbar track rule (textarea doesn't render a visible scrollbar here).
- Moved desktop chat container sizing/transition/border-radius to Tailwind (`ChatBody.jsx`), left only variable overrides in CSS.
- Chat CSS cleanup: merged duplicate light theme block and removed unused container scrollbar rules.

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
