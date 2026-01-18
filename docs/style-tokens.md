# Style Tokens (Phase 2 Step 2)

This file maps the new token variables to the legacy selectors and properties captured in `docs/style-sources.md`.

## Button (primary)

Legacy source:

- `app/styles/components/buttons.css`
  - `:root:not(.theme-light) .btn-base`
  - `:root:not(.theme-light) .btn-base:hover`, `:root:not(.theme-light) .btn-base:focus-visible`
  - `:root:not(.theme-light) .btn-base:active`
  - `:root.theme-light .btn-base`
  - `:root.theme-light .btn-base:hover`, `:root.theme-light .btn-base:focus-visible`
  - `:root.theme-light .btn-base:active`
- `app/styles/tokens.css` for `--btn-base-bg-dark`

Token map:

- `--btn-primary-bg` <- `.btn-base` background (dark uses `--btn-base-bg-dark`, light uses `rgba(255,255,255,0.62)`)
- `--btn-primary-bg-hover` <- `.btn-base:hover` / `.btn-base:focus-visible` background
- `--btn-primary-bg-active` <- `.btn-base:active` background
- `--btn-primary-text` <- `.btn-base` text color
- `--btn-primary-border` <- `.btn-base` border (dark: 0, light: 1px solid rgba(148,163,184,0.38))
- `--btn-primary-border-hover` <- light hover border color (rgba(148,163,184,0.46))
- `--btn-primary-border-active` <- light active border color (rgba(148,163,184,0.40))
- `--btn-primary-shadow` <- `.btn-base` box-shadow
- `--btn-primary-shadow-hover` <- `.btn-base:hover` box-shadow
- `--btn-primary-shadow-active` <- `.btn-base:active` box-shadow
- `--btn-primary-focus-ring-color` <- `.btn-base:focus-visible` focus ring color
- `--btn-primary-shadow-focus` <- `.btn-base:focus-visible` full box-shadow stack (includes focus ring)
- `--btn-primary-radius` <- `.btn-base` border-radius (0.95rem)

## Input / Textarea (standard)

Legacy source:

- `app/styles/components/invite.css`
  - `.invite-classic__input`
  - `:root:not(.theme-light) .invite-classic__input` (+ hover/focus)
  - `:root.theme-light .invite-classic__input` (+ hover/focus)
  - `:root:not(.theme-light) .invite-modal` variables for dark surfaces and glow
  - `:root.theme-light .invite-modal` variables for light surfaces and shadow

Token map:

- `--input-bg` <- `.invite-classic__input` background (dark `--form-surface`, light `--form-surface-light`)
- `--input-bg-hover` <- `.invite-classic__input:hover` background (dark `--form-surface-hover`, light `--form-surface-hover-light`)
- `--input-bg-focus` <- `.invite-classic__input:focus` background (dark `--form-surface-hover`, light `--form-surface-active-light`)
- `--input-text` <- `.invite-classic__input` text color (dark `var(--pt-150)`, light `#1f2937`)
- `--input-caret` <- `.invite-classic__input` caret color
- `--input-border` <- `.invite-classic__input` border (dark `2px solid transparent`, light `1px solid transparent`)
- `--input-placeholder` <- `.invite-classic__input::placeholder` color
- `--input-shadow` <- `.invite-classic__input` box-shadow (dark includes `--invite-under-glow`, light uses `--form-shadow-light`)
- `--input-radius` <- `.invite-classic__input` border-radius (dark `1.2em`, light base `0.95rem`)
- `--input-disabled-opacity` <- system default (not defined in legacy CSS; added as minimal disabled behavior)

HC notes:

- No direct legacy HC values for these tokens were defined in the token files; primitives inherit dark defaults under HC unless explicit HC overrides are added later.
