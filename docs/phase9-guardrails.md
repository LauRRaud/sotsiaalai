# Phase 9 Guardrails (Legacy CSS)

Purpose
- New UI must be Tailwind utilities with existing tokens (`var(--...)`).
- app/styles/** should only shrink or stay flat.

Rules
- New UI = Tailwind utilities + tokens.
- No new app/styles/pages/* without explicit approval.
- Theme differences belong in tokens/theme, not new page CSS.
- Legacy CSS is allowed only for glass, complex animations, theme/HC gates, or DOM-dependent selectors.

How guardrails work
- `npm run css:guard` compares current CSS metrics against a baseline.
- It fails if:
  - A new file appears under `app/styles/pages/*`.
  - Total CSS bytes increase above baseline.
  - Total CSS rules increase above baseline.

Updating the baseline (intentional only)
1. Run: `npm run css:audit`
2. Replace `scripts/legacy-css-baseline.json` with the new output.
3. Open a dedicated PR titled: `chore(css): update legacy css baseline`.

Notes
- Keep baseline updates separate from UI work.
- If you need new styling, do it in JSX with Tailwind utilities and existing tokens.
