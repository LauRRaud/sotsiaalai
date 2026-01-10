# Legacy CSS Retirement

Goal: stop `app/styles/**` from growing and steadily delete unused legacy CSS.

Rules
- No new `app/styles/pages/*` without explicit approval.
- New UI = Tailwind utilities + tokens.
- Legacy CSS allowed only for:
  - glass / complex visual effects
  - complex animations
  - theme / HC gates
  - DOM-dependent selectors

How to delete CSS safely (checklist)
1) Pick ONE CSS file.
2) Identify unused selectors via repo search (JS/JSX/MDX + runtime).
3) If unsure, keep the selector.
4) Delete only clearly unused blocks.
5) Run `npm run build`.
6) Smoke test affected pages in:
   - dark (default)
   - light (`html.theme-light`)
   - dark + HC (`html[data-contrast="hc"]`)
7) Commit with a clear message and note what was removed.

Legacy CSS audit helper
Run:
```
node scripts/legacy-css-audit.mjs
```

Output includes file size, estimated rule count, and a `near-empty` flag
to help prioritize deletion candidates.
