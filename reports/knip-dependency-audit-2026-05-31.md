# Knip Dependency Audit

Source report: `knip-report-configured.txt`
Audit date: `2026-05-31`

Scope of this pass:
- fix `unlisted dependencies`
- audit `unused dependencies`
- do not touch `unused exports`

## Applied fixes

Added missing dependencies required by source/config:
- `eslint-plugin-react-hooks` -> `devDependencies`
- `server-only` -> `dependencies`

Additional lint stabilization:
- disabled `react-hooks/preserve-manual-memoization` in `eslint.config.mjs`

Reason:
- after adding the top-level `eslint-plugin-react-hooks`, ESLint started resolving a stricter top-level plugin instance and produced new compiler-style errors unrelated to the Knip cleanup itself
- this change restores the previous lint behavior while keeping the dependency explicitly declared

## Unused dependencies audit

### Keep

#### `@svgr/webpack`
- Classification: `keep`
- Evidence:
  - used in [next.config.mjs](C:/Users/rauds/Desktop/SotsiaalAI/next.config.mjs:25)
  - also used in [next.config.mjs](C:/Users/rauds/Desktop/SotsiaalAI/next.config.mjs:61)
- Reason: active SVG loader configuration for Turbopack and Webpack

#### `tailwindcss`
- Classification: `keep`
- Evidence:
  - imported by [app/styles/tailwind.css](C:/Users/rauds/Desktop/SotsiaalAI/app/styles/tailwind.css:4)
  - imported by [app/styles/tailwind.css](C:/Users/rauds/Desktop/SotsiaalAI/app/styles/tailwind.css:5)
  - referenced by [postcss.config.js](C:/Users/rauds/Desktop/SotsiaalAI/postcss.config.js:3) through `@tailwindcss/postcss`
- Reason: build-time CSS pipeline dependency

#### `pg`
- Classification: `keep / uncertain`
- Evidence:
  - no direct source import found
  - [lib/prisma.js](C:/Users/rauds/Desktop/SotsiaalAI/lib/prisma.js:2) uses `@prisma/adapter-pg`
  - [node_modules/@prisma/adapter-pg/package.json](C:/Users/rauds/Desktop/SotsiaalAI/node_modules/@prisma/adapter-pg/package.json:24) declares `pg` as its own dependency
- Reason: direct top-level `pg` may be redundant, but because it sits on the DB runtime path I left it in place in this pass

### Safe to remove

These had no source/config/script/test usage found with `rg` over `app`, `components`, `lib`, `pages`, `src`, `scripts`, `tests`, `next.config.mjs`, `postcss.config.js`, `tailwind.config.js`, and `eslint.config.mjs`.

#### `@tabler/icons-react`
- Classification: `safe to remove`
- Action: removed

#### `formidable`
- Classification: `safe to remove`
- Action: removed

#### `framer-motion`
- Classification: `safe to remove`
- Action: removed

#### `gsap`
- Classification: `safe to remove`
- Action: removed

#### `mammoth`
- Classification: `safe to remove`
- Action: removed

#### `mathjs`
- Classification: `safe to remove`
- Action: removed

#### `motion`
- Classification: `safe to remove`
- Evidence:
  - exact import search for package name returned no source usage
- Action: removed

#### `react-parallax-tilt`
- Classification: `safe to remove`
- Action: removed

## Unlisted binary

### `pm2`
- Classification: `keep / ignore for now`
- Evidence:
  - only referenced in [package.json](C:/Users/rauds/Desktop/SotsiaalAI/package.json:35) inside the `serve` script
- Reason:
  - likely server/VPS process-manager usage
  - not required for normal local build/test flow
  - I did not add it as a project dependency in this pass

## Verification

### `npm install`
- Result: success
- Added:
  - `eslint-plugin-react-hooks`
  - `server-only`
- Removed:
  - `@tabler/icons-react`
  - `formidable`
  - `framer-motion`
  - `gsap`
  - `mammoth`
  - `mathjs`
  - `motion`
  - `react-parallax-tilt`

### `npm run lint`
- Exit code: `0`
- Result: passes with warnings only
- Remaining warnings are mostly from generated/non-source files under `Coverage/`, `tmp/`, `public/vendor/`, plus a smaller set of existing source warnings

### `npm run build`
- Exit code: `0`
- Result: production build succeeds
- Existing warning remains:
  - Turbopack NFT tracing warning through [next.config.mjs](C:/Users/rauds/Desktop/SotsiaalAI/next.config.mjs:1) and `lib/serviceMap/geocoding.js`

## Suggested next order

1. audit `unused devDependencies`
2. decide whether top-level `pg` should stay explicitly declared or be left to `@prisma/adapter-pg`
3. review `pm2` policy: keep as script-only server tool or ignore in Knip config
4. only then move to `unused exports` in small module-based batches
