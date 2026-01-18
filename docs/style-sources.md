# Style Sources (Phase 2 Step 1)

Scope:

- Buttons: /tellimus primary buttons (dark + light).
- Inputs (standard): /uuenda-epost and /uuenda-pin (dark + light).
- Excluded: ChatComposer send input (no analysis).

## Buttons (primary) - /tellimus

DOM usage (primary buttons on /tellimus):

- File: `components/alalehed/TellimusBody.jsx`
- Elements:
  - `<Link className="btn-base min-w-[9.5rem]">` (subscription active state)
  - `<button className="btn-base min-w-[9.5rem]">` (subscription inactive state)

Legacy CSS selectors and file sources:

- `app/styles/components/buttons.css`
  - `.btn-base`
  - `:root .btn-base:focus-visible`
  - `:root .btn-base:disabled`, `:root .btn-base[aria-disabled="true"]`
  - `:root:not(.theme-light) .btn-base`
  - `:root:not(.theme-light) .btn-base:hover`, `:root:not(.theme-light) .btn-base:focus-visible`
  - `:root:not(.theme-light) .btn-base:active`
  - `:root.theme-light .btn-base`
  - `:root.theme-light .btn-base:hover`, `:root.theme-light .btn-base:focus-visible`
  - `:root.theme-light .btn-base:active`
- `app/styles/tokens.css`
  - `--btn-base-bg-dark` (used by `.btn-base` dark background)

Key properties (dark mode):

- Background: `background: var(--btn-base-bg-dark)` (from `app/styles/components/buttons.css` + `app/styles/tokens.css`)
- Border: `border: 0` (dark override); base uses `border: var(--btn-border-w, var(--pin-border-w, 1.45px)) solid transparent` with `--btn-border-w: 1px`
- Text color: `color: rgba(248,252,255,0.96)`
- Shadow/glow:
  - Base: `box-shadow: 0 6px 16px rgba(0,0,0,0.26), 0 12px 18px -14px rgba(var(--glow-rgb), 0.60), 0 24px 30px -24px rgba(var(--glow-rgb), 0.32)`
  - Hover/focus: `0 10px 22px rgba(0,0,0,0.28)` + same glow
  - Active: `0 5px 12px rgba(0,0,0,0.24)` + same glow (lower alpha)
- Radius: `border-radius: 0.95rem` (from `.btn-base`)
- Focus ring: `box-shadow: ... , 0 0 0 3px rgba(225,160,160,0.28)` on `:focus-visible`
- Hover: background gradient `linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(185,210,240,0.10) 100%)`, translateY(-1px)
- Active: background gradient `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(150,175,210,0.05) 100%)`, translateY(1px)
- Disabled: `opacity: 0.6; transform: none; cursor: not-allowed;` (via `:root .btn-base:disabled` and `[aria-disabled="true"]`)

Key properties (light mode):

- Background: `background: rgba(255,255,255,0.62)`; hover/active `background: #ffffff`
- Border: `border-color: rgba(148,163,184,0.38)`; hover `rgba(148,163,184,0.46)`; active `rgba(148,163,184,0.40)`
- Text color: `color: rgba(31,41,55,0.92)`
- Shadow:
  - Base: `0 8px 18px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.7)`
  - Hover/focus: `0 12px 22px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.82)`
  - Active: `0 6px 14px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.7)`
- Radius: `border-radius: 0.95rem` (from `.btn-base`)
- Focus ring: `box-shadow: ... , 0 0 0 3px rgba(197,113,113,0.24)` on `:focus-visible`
- Hover: translateY(-1px)
- Active: translateY(1px)
- Disabled: same as dark (shared `:root .btn-base:disabled`)

## Inputs (standard) - /uuenda-epost and /uuenda-pin

DOM usage (standard inputs on /uuenda-epost + /uuenda-pin):

- File: `components/alalehed/UuendaEpostiBody.jsx`
  - `<input className="invite-classic__input" ...>` (current email, new email, PIN)
- File: `components/alalehed/UnustasinParooliBody.jsx`
  - `<input className="invite-classic__input" ...>` (email)

Legacy CSS selectors and file sources:

- `app/styles/components/invite.css`
  - `.invite-classic__input`
  - `.invite-classic__input::placeholder`
  - `:root:not(.theme-light) .invite-classic__input`
  - `:root:not(.theme-light) .invite-classic__input:hover`, `:root:not(.theme-light) .invite-classic__input:focus`, `:root:not(.theme-light) .invite-classic__input:focus-visible`
  - `:root:not(.theme-light) .invite-classic__input::placeholder`
  - `:root.theme-light .invite-classic__input`
  - `:root.theme-light .invite-classic__input:hover`
  - `:root.theme-light .invite-classic__input:focus`, `:root.theme-light .invite-classic__input:focus-visible`
  - `:root.theme-light .invite-classic__input::placeholder`
- `app/styles/components/invite.css` (theme-scoped variables used by inputs)
  - `:root.theme-light .invite-modal` defines `--form-surface-light`, `--form-surface-hover-light`, `--form-surface-active-light`, `--form-shadow-light`
  - `:root:not(.theme-light) .invite-modal` defines `--form-surface`, `--form-surface-hover`, `--form-surface-active`, `--invite-under-glow`

Key properties (dark mode):

- Background: `background: var(--form-surface)` (default), `background: var(--form-surface-hover)` on hover/focus
- Border: base `border: 1px solid rgba(148, 163, 184, 0.28)`, overridden to `border: 2px solid transparent` in dark theme
- Text color: `color: var(--pt-150)`; caret `caret-color: var(--pt-150)`
- Placeholder: `color: rgba(236, 240, 245, 0.75)` (dark override)
- Shadow/glow: `box-shadow: 0 6px 16px rgba(0,0,0,0.22), var(--invite-under-glow)` (same on hover/focus)
- Radius: base `border-radius: 0.95rem`, overridden to `border-radius: 1.2em` in dark theme
- Focus ring: none; focus/hover use same background + shadow; `outline: none` set in focus rules
- Disabled: no explicit `:disabled` or `[aria-disabled]` styling found for `.invite-classic__input` in legacy CSS

Key properties (light mode):

- Background: `background: var(--form-surface-light)`; hover `var(--form-surface-hover-light)`; focus `var(--form-surface-active-light)`
- Border: `border-color: transparent` (light override)
- Text color: `color: #1f2937`
- Placeholder: `color: #6b7280`
- Shadow: `box-shadow: var(--form-shadow-light)` (same for hover/focus)
- Radius: base `border-radius: 0.95rem` (no light override)
- Focus ring: none; focus/hover use same background + shadow; `outline: none` set in focus rules
- Disabled: no explicit `:disabled` or `[aria-disabled]` styling found for `.invite-classic__input` in legacy CSS

## Where theme differences come from

- Theme differences are defined by legacy selectors that key off `.theme-light` on the root:
  - Buttons: `app/styles/components/buttons.css` uses `:root:not(.theme-light)` vs `:root.theme-light` blocks.
  - Inputs: `app/styles/components/invite.css` uses `:root:not(.theme-light)` vs `:root.theme-light` blocks, and defines theme-specific input variables on `.invite-modal` within those blocks.
- The dark button background relies on a token: `--btn-base-bg-dark` from `app/styles/tokens.css`.
- There is no `light:` Tailwind variant involved in legacy CSS for these elements; it is pure CSS selectors against `.theme-light`.
- HC (high-contrast) overrides for `.invite-classic__input` exist in `app/styles/theme/late-overrides.css` (not part of dark/light requirements).

Notes:

- No textarea fields were found on /uuenda-epost or /uuenda-pin. If a textarea is introduced for these flows, it should reuse the same `.invite-classic__input` token values.
- ChatComposer send input is intentionally excluded per instruction.
- Input disabled styling is not defined in legacy CSS; the primitive will use a minimal system default (opacity + not-allowed cursor).

## Invite Modal / Lisa inimesi (Grupivestlus)

Component + DOM classes:

- File: `components/invite/InviteModal.jsx`
- Root/backdrop: `<div className="invite-modal-backdrop">`
- Modal surface: `<div className="invite-modal invite-modal--classic invite-modal--chat-glass">`
- Header/title: `<header className="invite-modal__header invite-classic__header">`
  - Title: `<h2 className="invite-classic__title glass-title invite-classic__title--hero">`
- Close button: `<button className="invite-modal__close invite-classic__close modal-close-btn">`
- Inputs: `<input className="invite-classic__input">` (room title + email)
- Segmented/radio group: `.invite-choice-group` with `.invite-choice-card` labels containing `input[type="radio"]`
- Primary CTA: `<button className="btn-base invite-classic__submit">` ("SAADA KUTSE")
- Secondary panel ("Kutsed"): `.invite-list.invite-classic__list`, header `.invite-classic__list-header`, refresh button `.btn-base.invite-classic__refresh`

Legacy CSS selectors and file sources:

- Backdrop + modal surface + header/title + close button + inputs + choice group + list panel:
  - `app/styles/components/invite.css`
    - `.invite-modal-backdrop`
    - `.invite-modal`, `:root.theme-light .invite-modal`, `:root:not(.theme-light) .invite-modal`
    - `.invite-modal--chat-glass`, `.invite-modal--chat-glass::before`, `.invite-modal--chat-glass > :not(.invite-modal__header)`
    - `.invite-modal__header`, `.invite-classic__title`, `:root:not(.theme-light) .invite-modal .invite-classic__title`, `:root.theme-light .invite-modal .invite-classic__title`
    - `.invite-modal__close.modal-close-btn`, `:root.theme-light .invite-modal__close.modal-close-btn`, `:root:not(.theme-light) .invite-modal__close.modal-close-btn`
    - `.invite-classic__input` + theme variants (see Inputs section above)
    - `.invite-choice-group`, `.invite-choice-card`, `.invite-choice-card.is-checked`, `:root:not(.theme-light) ...`, `:root.theme-light ...`
    - `.invite-choice-card input[type="radio"]` + `::before` + states
    - `.invite-list`, `:root.theme-light .invite-list`, `.invite-classic__list-header`, `.invite-classic__list-title`, `.invite-classic__empty`
- Close button base behavior:
  - `app/styles/components/account-hud.css`
    - `.modal-close-btn`, `.modal-close-btn::before`, hover/focus/active transforms
- Title typography + light theme title shadow:
  - `app/styles/base/typography.css` for `.glass-title` font family/weight
  - `app/styles/theme/late-overrides.css` for `:root.theme-light .glass-title` color + text-shadow
- Primary CTA button styling:
  - `app/styles/components/buttons.css` for `.btn-base` (see Buttons section above)
  - `app/styles/components/invite.css` for `.invite-classic__actions .btn-base { min-width: 9.5rem; }`

Dim/blur source (glass family, not a separate overlay):

- `.invite-modal-backdrop` is transparent and explicitly has `background: transparent; backdrop-filter: none;` so it does not add tint or blur.
- `.invite-modal--chat-glass::before` has `content: none`, so it does not create an extra overlay layer.
- The visible blur/dim comes from the glass system itself:
  - The modal surface uses `background: var(--glass-surface-bg, rgba(0, 0, 0, 0.25))` with `backdrop-filter: blur(var(--glass-blur-radius, 1rem))` on `.invite-modal` / `.invite-modal--chat-glass`.
  - The underlying page glass ring/background (chat/profile glass containers) provides the dimmed backdrop behind the modal; there is no dedicated modal overlay tint in CSS.

Key properties (dark mode):

- Backdrop (overlay): `.invite-modal-backdrop` is transparent (no tint, no blur); `background: transparent; backdrop-filter: none;` with `position: fixed; inset: 0; display: flex; align-items:center; justify-content:center; z-index: 60; padding: 1.25rem;`
- Modal surface (glass): `.invite-modal` + `.invite-modal--chat-glass`
  - `background: var(--glass-surface-bg, rgba(0, 0, 0, 0.25));`
  - `backdrop-filter: blur(var(--glass-blur-radius, 1rem));`
  - `border-radius: 1.5rem; border: none; box-shadow: none;`
  - `color: var(--glass-surface-text, #f2f2f2);`
  - padding: `2.4rem 2rem 2rem`; width/max-width per `invite.css`
- Title typography + color:
  - Typography: `.glass-title` from `base/typography.css` (Aino headline font, weight 400)
  - Color override: `:root:not(.theme-light) .invite-modal .invite-classic__title { color: #c57171; }`
- Close icon button:
  - Base: `.modal-close-btn` (size 2.65rem, transparent bg, no border, "x" via `::before`, hover translateY(-1px), active translateY(1px))
  - Color: `:root:not(.theme-light) .invite-modal__close.modal-close-btn { color: var(--brand-primary); }`
  - Position: `.invite-modal__close.modal-close-btn { position: absolute; top: 0.35rem; right: 0.35rem; }`
  - Chat-glass tweak: `.invite-modal--chat-glass .invite-modal__close.modal-close-btn { top: 0.2rem; right: 0.2rem; }`
- Inputs:
  - `.invite-classic__input` uses the same dark styles documented in "Inputs (standard)" above (form-surface background, under-glow shadow, radius 1.2em, placeholder rgba(236,240,245,0.75)).
- Segmented/radio pill group:
  - Container: `.invite-choice-group` grid with `gap: 0.65rem`
  - Item base: `.invite-choice-card` (padding 0.72rem 0.9rem, border-radius 1rem, border 1px solid rgba(148,163,184,0.22), background rgba(255,255,255,0.05), font-size 1.03rem)
  - Dark override: `:root:not(.theme-light) .invite-choice-card` uses `background: var(--form-surface); border: 1.5px solid transparent; border-radius: 0.95em; color: var(--pt-150); box-shadow: 0 6px 16px rgba(0,0,0,0.22), var(--invite-under-glow);`
  - Hover/focus (dark): `background: var(--form-surface-hover); color: var(--pt-80); box-shadow: 0 0.5rem 1.125rem rgba(6,8,16,0.35), var(--invite-under-glow); border-color: transparent; transform: none;`
  - Selected (dark): `.invite-choice-card.is-checked` uses `background: var(--form-surface-active); color: var(--pt-50); box-shadow: 0 0.5rem 1.125rem rgba(6,8,16,0.35), var(--invite-under-glow); border-color: transparent;`
  - Radio control (dark): `input[type="radio"]` base appearance none, size 18px, border 2px solid rgba(210,220,235,0.5), background rgba(24,30,42,0.45); dark override uses `border-color: transparent; background: rgba(12,18,30,0.65); box-shadow: inset 0 0 0 1px rgba(248,253,255,0.16);`
  - Radio dot (dark): `::before` uses `background: var(--form-accent); box-shadow: 0 0 8px rgba(248,253,255,0.28);`
- Primary CTA:
  - `.btn-base` primary styles (see Buttons section above), with min-width 9.5rem via `.invite-classic__actions .btn-base`
- Secondary panel ("Kutsed"):
  - `.invite-list` background `rgba(255,255,255,0.05)`, border `1px solid rgba(148, 163, 184, 0.18)`, radius `1.1rem`, padding `1rem`
  - Header typography: `.invite-classic__list-title` font-weight 650, letter-spacing 0.02em, font-size 1.05rem
  - Refresh button uses `.btn-base invite-classic__refresh` (no additional styling beyond `btn-base`)

Key properties (light mode):

- Backdrop (overlay): same as dark; `.invite-modal-backdrop` remains transparent.
- Modal surface:
  - `:root.theme-light .invite-modal` keeps `box-shadow: none; color: var(--glass-surface-text);` (background still `var(--glass-surface-bg)` from tokens)
- Title typography + color:
  - `:root.theme-light .invite-modal .invite-classic__title { color: var(--title-color) !important; }`
  - `:root.theme-light .glass-title` adds `text-shadow: 0 0.28rem 0.38rem rgba(0, 0, 0, 0.24)` from `theme/late-overrides.css`
- Close icon button:
  - `:root.theme-light .invite-modal__close.modal-close-btn { color: #7A3A38; }`
  - Base `.modal-close-btn` behaviors remain (transparent bg, hover translateY(-1px))
- Inputs:
  - `.invite-classic__input` uses the same light styles documented in "Inputs (standard)" above (form-surface-light background, form-shadow-light, radius 0.95rem, placeholder #6b7280).
- Segmented/radio pill group:
  - Light override on cards: `:root.theme-light .invite-choice-card` uses `background: var(--form-surface-light); border-color: transparent; box-shadow: var(--form-shadow-light); color: var(--text-strong);`
  - Selected (light): `background: var(--form-surface-active-light); color: color-mix(in srgb, var(--text-strong) 80%, var(--form-accent-light) 20%); box-shadow: var(--form-shadow-light);`
  - Hover (light): `background: var(--form-surface-hover-light); box-shadow: var(--form-shadow-light);`
  - Radio control (light): `border: 2px solid transparent; background: rgba(255,255,255,0.22); box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);`
  - Radio dot (light): `::before` uses `background: var(--form-accent-light)`; within invite modal: `:root.theme-light .invite-modal .invite-choice-card input[type="radio"]::before { background: #7A3A38; }`
- Primary CTA:
  - `.btn-base` light styles from `buttons.css` (see Buttons section above)
- Secondary panel ("Kutsed"):
  - `:root.theme-light .invite-list` background `rgba(255,255,255,0.78)`, border-color `rgba(190, 196, 208, 0.55)`, box-shadow `0 14px 28px rgba(0,0,0,0.10)`

Notes:

- The modal close "x" glyph comes from `.modal-close-btn::before { content: "\00D7"; }` in `app/styles/components/account-hud.css`.
- The primary CTA and refresh buttons are `btn-base` and therefore must continue to match the `/tellimus` button styling (see Buttons section above).
