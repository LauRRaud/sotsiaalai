# CSS Audit (Jan 31, 2026)

## Globals entrypoint
- `app/styles/globals.css` is the only CSS imported in `app/layout.js`; it pulls tokens, all three theme sheets, Tailwind layers, base styles, the four component files, and `utilities/helpers.css`
- This makes the entire stylesheet tree predictable: removing an import removes those rules app-wide.

## Tokens (`app/styles/tokens.css`)
- Defines color ramps, spacing tokens, typography scales, shadows, `--glass-*`, `--profile-*`, `--link-*` variables used across components (glass ring, profile layout, login modal, BTN brand links, chat, etc.).
- Keep lower (later) declarations when deduping; group by semantic purpose (e.g., `--glass-*`, `--profile-*`, `--link-*`) before trimming.

## Theme sheets (`theme/light.css`, `theme/dark.css`, `theme/hc.css`)
- Light mode is activated via `document.documentElement.classList.add('theme-light')`; dark is default.
- Each file targets a small set of selectors: `:root.theme-light` toggles `--page-bg`/`--glass-*`; `:root:not(.theme-light)` flips icons/colors; `hc.css` overrides accessible colors.
- These files contain duplicates (`:root.theme-light` vs `:root:not(.theme-light)` toggling `chat-container` color, for example). Merge identical selectors and keep only the theme-specific properties.

## Base styles (core, backgrounds, layout, typography, a11y, animations)
- Core sets `html`, `body`, `.app-root`, `:where(...) cursor` behavior, scrollbar defaults, and reduced-motion fallbacks.
- Backgrounds layer controls the fixed gradient + starfield and reuses `data-bg-layer` containers referenced by `BackgroundLayer` component.
- Layout sets the `main#main`, `.main-content`, `.site-footer`, responsive adjustments; `.modal-open` locking uses same selectors as login modal.
- Typography, a11y, animations still import but appear to hold generic resets.

## Components
- `glass.css`: houses `.glass-box`, `.glass-section`, `.install-section`, `.glass-box a`. Used by `GlassRing`, `ProfileShell`, and other pages that wrap content in glass containers.
- `login-modal.css`: defines `.login-modal-root`, `.login-modal-close`, `.modal-close-btn`, responsive mobile adapter, OTP theming, and `body.login-modal-open` scroll lock (used by `LoginModal.jsx`).
- `chat.css`: targets `.chat-container`, `.glass-box.chat-container`, `.chat-page-shell`, `.chat-inputbar`, scrollbar thumbs/tracks, `:root.theme-light` overrides. The selectors are referenced inside `ChatBody` components, chat layout, and `GlassRing` derivatives.
- `drawer.css`: defines `.conversation-drawer`, `.drawer-*` states used by `ConversationDrawer.jsx` (search for `drawer` in `components/alalehed/chat`).

## Utilities
- `helpers.css` keeps `.sr-only`, `.pin-hidden-input`, `.glass-ring`, `.text-muted`, `.invite-modal` scrollbar resets. These selectors are sprinkled across components (e.g., `.sr-only` appears inside `LoginModal`, `.glass-ring` used by `ProfileShell`).
- Scrollbar rules that affect chat exist here, but some are in `chat.css` as well; choose one file per domain (chat-specific scrollbars belong in `chat.css`).

## Actionable findings so far
1. **Imports are tight** — removing any of the 15 lines in `globals.css` will drop all selectors from that file, so reorganizing is a matter of moving selectors between the imported files and adjusting the import order.
2. **Login modal/Glass split** — `login-modal.css` already owns modal-specific selectors but the close button and body-scroll lock are still not 100% tailwind; we can move them here and keep `glass.css` purely for reusable `.glass-box` styles.
3. **Theme duplication** — combine repeated scans like `:root.theme-light .chat-container` and `:root:not(.theme-light) .chat-container` if their declarations align, and keep lighting logic in the theme files.
4. **Target future tailwind move** — when moving a component (e.g., `OrbitalMenu`) to tailwind, keep heavy gradients and advanced interactions in inline `style` props (or `classNames` with CSS custom properties) but rely on tailwind for layout, spacing, typography, and simple hover/focus states.

## Next steps to finish the audit
- Run a selector usage report (e.g., `rg` per class) to flag unused rules in `components` and `base`. If a file reports zero matches, consider removing or merging it into another file.
- Document the theme selectors that share identical declarations so we can collapse them when reorganizing `theme/*`.
- For each component CSS file, create a TODO list of selectors that could be replaced with tailwind utilities and which ones require custom CSS (e.g., keyframes for `OrbitalMenu`).
