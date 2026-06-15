# Orphan CSS candidates (no import/@import references the basename)

> A file whose basename is never imported anywhere. STRONG delete candidate, but
> verify: some bundlers glob-import, and a test loader may reference it (see
> register-node-test-loader.mjs legacyCssBundles). Confirm before deleting.

- `app/styles/base/a11y.css`
- `app/styles/components/chat-focus.css`
- `app/styles/components/documents-mode.css`