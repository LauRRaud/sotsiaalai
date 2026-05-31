# Knip DevDependency Audit

Source report before this pass: `knip-report-configured.txt`
Audit date: `2026-05-31`

Scope:
- audit only these `unused devDependencies`
  - `@babel/generator`
  - `@babel/parser`
  - `@eslint/eslintrc`
  - `@eslint/js`
- do not touch `unused exports`
- do not touch app logic

## Audit method

Checked:
- [eslint.config.mjs](C:/Users/rauds/Desktop/SotsiaalAI/eslint.config.mjs:1)
- `scripts/`
- `tests/`
- `.agents/`
- `codex-skills/`
- root config files such as `next.config.mjs`, `postcss.config.js`, `tailwind.config.js`

Searches used:
- exact package-name searches with `rg`
- config file inspection
- package-lock inspection to distinguish direct vs transitive dependencies

## Classification

### `@babel/generator`
- Classification: `safe to remove`
- Evidence:
  - no direct usage found in ESLint config
  - no direct usage found in scripts, tests, codemod-like tools, or audit tools
  - remaining occurrences were direct `package.json` / `package-lock.json` entries or transitive dependencies

### `@babel/parser`
- Classification: `safe to remove`
- Evidence:
  - no direct usage found in ESLint config
  - no direct usage found in scripts, tests, codemod-like tools, or audit tools
  - remaining occurrences were direct `package.json` / `package-lock.json` entries or transitive dependencies

### `@eslint/eslintrc`
- Classification: `safe to remove`
- Evidence:
  - not imported in [eslint.config.mjs](C:/Users/rauds/Desktop/SotsiaalAI/eslint.config.mjs:1)
  - no local FlatCompat or legacy ESLint bridge usage found
  - remaining occurrences were transitive ESLint dependencies in `package-lock.json`

### `@eslint/js`
- Classification: `safe to remove`
- Evidence:
  - not imported in [eslint.config.mjs](C:/Users/rauds/Desktop/SotsiaalAI/eslint.config.mjs:1)
  - no local usage found in scripts/tests/tools
  - remaining occurrences were transitive ESLint dependencies in `package-lock.json`

## Changes made

Removed from `devDependencies`:
- `@babel/generator`
- `@babel/parser`
- `@eslint/eslintrc`
- `@eslint/js`

## Verification

### `npm install`
- Exit code: `0`
- Result: success

### `npm run lint`
- Exit code: `0`
- Result: passes with warnings only
- Note: warnings remain dominated by generated/non-source files under `Coverage/`, `tmp/`, and vendored assets

### `npm run build`
- Exit code: `0`
- Result: production build succeeds

### `npx knip`
- Report regenerated into [knip-report-configured.txt](C:/Users/rauds/Desktop/SotsiaalAI/knip-report-configured.txt:1)
- Current top-level results:
  - `Unused files (1)`
  - `Unused dependencies (3)`
  - `Unlisted binaries (1)`
  - `Unused exports (348)`
- `Unused devDependencies` no longer appears in the report

## Current remaining Knip items after this pass

### `Unused files`
- `components/admin/rag/kov/KovFileStatusBadges.jsx`

### `Unused dependencies`
- `@svgr/webpack`
- `pg`
- `tailwindcss`

### `Unlisted binaries`
- `pm2`

## Suggested next step

Keep the next pass narrow:
1. decide whether to leave `@svgr/webpack`, `tailwindcss`, and `pg` as intentional keeps
2. decide whether `pm2` should be ignored in Knip config
3. only after that return to the last unused file or module-scoped export cleanup
