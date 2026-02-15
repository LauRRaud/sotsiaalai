# Migration Status (Phase 0)

## Known routes (App Router pages)

- / -> app/page.js
- /admin/analytics -> app/admin/analytics/page.jsx
- /admin/rag -> app/admin/rag/page.jsx
- /join -> app/join/page.jsx
- /kasutusjuhend -> app/kasutusjuhend/page.jsx
- /kasutustingimused -> app/kasutustingimused/page.js
- /privaatsustingimused -> app/privaatsustingimused/page.js
- /profiil -> app/profiil/page.js
- /registreerimine -> app/registreerimine/page.js
- /room/[roomId] -> app/room/[roomId]/page.jsx
- /rooms -> app/rooms/page.js
- /ruum -> app/ruum/page.js
- /taasta-parool/[token] -> app/taasta-parool/[token]/page.jsx
- /tellimus -> app/tellimus/page.js
- /uuenda-epost -> app/uuenda-epost/page.js
- /uuenda-pin -> app/uuenda-pin/page.js
- /vestlus -> app/vestlus/page.js

## Known overlays / modals / drawers

- components/accessibility/AccessibilityModal.jsx
- components/alalehed/ConversationDrawer.jsx
- components/alalehed/LoginModal.jsx
- components/invite/InviteModal.jsx
- components/LoginModal.jsx
- components/ui/ModalConfirm.jsx

## Baseline legacy class counts (top 10)

- btn-base: 40
- sr-only: 26
- card-title: 24
- glass-title: 24
- link-brand: 22
- main-content: 19
- glass-box: 18
- rag-btn: 18
- pin-keypad\_\_button--bounce: 18
- analytics-card: 17

## Phase 0 verification

Commands used:

- `rg --files -g "page.*" app`
- `rg --line-number --no-heading --pcre2 "import\\s+[^;]*\\.css" app components pages`
- `rg --line-number --no-heading "@import" app/styles`
- `rg --files -g "*Modal*.{js,jsx,ts,tsx}" components app`
- `rg --files -g "*Drawer*.{js,jsx,ts,tsx}" components app`

Expected outputs:

- `docs/routes.txt` with URL -> file path mapping for all `app/**/page.*` (excluding backups).
- `docs/css-imports.txt` with JS/JSX CSS imports and CSS `@import` lines from `app/styles/*`.
- `docs/legacy-classes-report.txt` with file+line references for legacy classes.

Suspicious imports (legacy.css, legacy.current.css, pages/\*.css, late-overrides.css):

- app/styles/globals.css:5:@import "./legacy.css";
- app/styles/legacy.css:1:@import "./base/core.css";
- app/styles/legacy.css:2:@import "./base/animations.css";
- app/styles/legacy.css:3:@import "./components/invite.css";
- app/styles/legacy.css:4:@import "./base/typography.css";
- app/styles/legacy.css:5:@import "./pages/home.css";
- app/styles/legacy.css:6:@import "./components/footer.css";
- app/styles/legacy.css:7:@import "./utilities/helpers.css";
- app/styles/legacy.css:8:@import "./components/lists.css";
- app/styles/legacy.css:9:@import "./components/links.css";
- app/styles/legacy.css:10:@import "./components/buttons.css";
- app/styles/legacy.css:11:@import "./components/account-hud.css";
- app/styles/legacy.css:12:@import "./pages/auth.css";
- app/styles/legacy.css:13:@import "./components/forms.css";
- app/styles/legacy.css:14:@import "./components/back-arrow.css";
- app/styles/legacy.css:15:@import "./components/modals.css";
- app/styles/legacy.css:16:@import "./components/nav-meist.css";
- app/styles/legacy.css:17:@import "./components/glass.css";
- app/styles/legacy.css:18:@import "./components/drawer.css";
- app/styles/legacy.css:19:@import "./components/chat.css";
- app/styles/legacy.css:20:@import "./components/notifications.css";
- app/styles/legacy.css:21:@import "./base/a11y.css";
- app/styles/legacy.css:22:@import "./theme/late-overrides.css";
- app/styles/legacy.css:23:@import "./pages/rag-admina.css";
- app/styles/legacy.css:24:@import "./components/tables.css";
- app/styles/legacy.css:25:@import "./pages/rag-adminb.css";
- app/styles/legacy.css:26:@import "./pages/profile.css";
- app/styles/legacy.current.css:1:@import "../globals.css";
