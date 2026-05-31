# Knip Unused Files Audit

Source report: `knip-report-configured.txt`
Audit date: `2026-05-31`

Method used for every file:
- exact import search with `rg`
- component/function name search with `rg`
- dynamic import search with `rg`
- route/page ownership check
- replacement/vestigial check

## Summary

- `safe to remove`: 14
- `likely dead but needs manual confirmation`: 1
- `keep / false positive`: 0

Removed in this batch:
- `components/admin/rag/RagAdminLandingCards.jsx`
- `components/admin/RagAdminPanel.jsx`
- `components/alalehed/chat/view/ChatMobileRailButton.jsx`
- `components/Animations/Magnet/Magnet.jsx`
- `components/PageFooter.jsx`
- `components/TextAnimations/TypedFadeText.jsx`
- `components/ui/Drawer.jsx`
- `components/ui/FancyRadio.jsx`
- `components/ui/icons/EyeIcon.jsx`
- `components/ui/icons/FocusModeToggleIcon.jsx`
- `components/ui/InvitePageShell.jsx`
- `components/ui/PageInfoButton.jsx`
- `components/ui/SegmentedControl.jsx`
- `components/ui/Toggle.jsx`

Left in place for manual confirmation:
- `components/admin/rag/kov/KovFileStatusBadges.jsx`

## File-by-file classification

### `components/admin/rag/kov/KovFileStatusBadges.jsx`
- Classification: `likely dead but needs manual confirmation`
- Exact imports: none
- Name usage: none outside the file
- Dynamic imports: none
- Route/page ownership: none
- Notes: active admin/KOV domain file, but current KOV detail rendering appears inlined inside `components/admin/rag/kov/KovDetailPanel.jsx` and table/status rendering lives elsewhere. This looks vestigial, but I left it because it is close to actively changing admin code and its removal is less obviously isolated than the others.

### `components/admin/rag/RagAdminLandingCards.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: `app/admin/rag/page.jsx` renders `RagAdminLandingWorkspace`, not this file
- Notes: clearly replaced by `components/admin/rag/RagAdminLandingWorkspace.jsx`

### `components/admin/RagAdminPanel.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: old panel wrapper superseded by App Router admin pages

### `components/alalehed/chat/view/ChatMobileRailButton.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: mobile chat navigation now uses `ChatMobileTopNav` and direct event handlers instead

### `components/Animations/Magnet/Magnet.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: standalone animation helper with no call sites

### `components/PageFooter.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: footer behavior is handled elsewhere (`HomeFooter`, inline footer notes, policy footers); this component was not rendered anywhere

### `components/TextAnimations/TypedFadeText.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: isolated text animation helper with no live consumers

### `components/ui/Drawer.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: generic drawer component was not used; active drawer behavior is implemented by `components/alalehed/ConversationDrawer.jsx`

### `components/ui/FancyRadio.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: styled-components radio control with no consumers

### `components/ui/icons/EyeIcon.jsx`
- Classification: `safe to remove`
- Exact imports: only imported by `components/ui/Toggle.jsx`
- Name usage: only self-reference plus `Toggle`
- Dynamic imports: none
- Route/page ownership: none
- Notes: safe as part of the same removal batch because `Toggle.jsx` was also dead

### `components/ui/icons/FocusModeToggleIcon.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: no call sites in chat or workspace UI

### `components/ui/InvitePageShell.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: no page component referenced it; invite flows run through `components/invite/InviteModal.jsx`
- Notes: unused page shell leftover from an earlier invite page approach

### `components/ui/PageInfoButton.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: info-overlay behavior is provided by `components/ui/DashboardInfoOverlay.jsx`; tests explicitly assert some pages do not render `<PageInfoButton>`

### `components/ui/SegmentedControl.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: no active forms use it

### `components/ui/Toggle.jsx`
- Classification: `safe to remove`
- Exact imports: none
- Name usage: only self-reference
- Dynamic imports: none
- Route/page ownership: none
- Notes: dead custom toggle component; active toggles are implemented inline or in other components

## Verification

### `npm run lint`
- Exit code: `0`
- Result: passes with warnings only
- Important caveat: warnings are pre-existing and dominated by generated/non-source files under `Coverage/`, `tmp/`, and vendored assets under `public/vendor/`

### `npm run build`
- Exit code: `0`
- Result: production build succeeds
- Existing warning remains from `next.config.mjs` NFT tracing in the service-map import path

## Follow-up recommendation

Next safe step:
- re-run Knip after this deletion batch
- manually review `components/admin/rag/kov/KovFileStatusBadges.jsx`
- separately exclude generated folders from ESLint if you want `npm run lint` to become a useful signal for source warnings
