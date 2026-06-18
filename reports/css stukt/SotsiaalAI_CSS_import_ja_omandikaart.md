# SotsiaalAI CSS-i import- ja omandikaart

Koostatud ZIP-is oleva Next.js lähtekoodi staatilisest importgraafist. Arvestatud on JS/JSX/TS/TSX staatilisi ja dünaamilisi import-lauseid, CSS `@import` ahelaid ning CSS Module’i `composes from` seoseid.

## Esimene tulemus

- Kaardistatud **42 route’i** ja **95 CSS-faili**.
- Kõigi route’ide ühisesse sõltuvusgraafi jõuab **51 CSS-faili / 389.7 KB** toor-CSS-i.
- Route’i näidatud maht on lähtekoodi toor-CSS, mitte Next.js buildi gzip/brotli tulemus. See sobib omandi ja suhtelise koormuse võrdlemiseks.
- `max-width: 768px` ahela failid on märgitud mobiililisaks; neid ei liideta desktopi rakenduva CSS-i hulka.

## Route’ide CSS-koormus

| Route | CSS-faile | Desktop | Mobiili lisakiht | Kokku |
|---|---:|---:|---:|---:|
| `/vestlus` | 83 | 820.6 KB | 106.2 KB | 926.7 KB |
| `/eelpoordumised` | 67 | 632.1 KB | 89.4 KB | 721.6 KB |
| `/teenusekaart` | 66 | 616.9 KB | 89.4 KB | 706.3 KB |
| `/teenuseprofiil` | 66 | 616.9 KB | 89.4 KB | 706.3 KB |
| `/dokreziim` | 64 | 510.5 KB | 89.4 KB | 599.9 KB |
| `/kovisioon` | 58 | 410.5 KB | 89.4 KB | 500.0 KB |
| `/profiil` | 57 | 385.2 KB | 106.2 KB | 491.4 KB |
| `/documents` | 58 | 389.3 KB | 89.4 KB | 478.7 KB |
| `/tooheaolu/[tool]` | 54 | 385.5 KB | 89.4 KB | 474.9 KB |
| `/tooheaolu` | 54 | 385.5 KB | 89.4 KB | 474.9 KB |
| `/admin/analytics` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/admin/framework-acceptances` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/admin/rag/documents` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/admin/rag/ingest` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/admin/rag/kov` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/admin/rag/organizations` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/admin/rag` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/admin/rag/source-packages` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/documents/artifacts/[id]` | 56 | 375.8 KB | 89.4 KB | 465.2 KB |
| `/kasutusjuhend` | 55 | 332.2 KB | 95.3 KB | 427.5 KB |
| `/kasutustingimused` | 55 | 332.2 KB | 95.3 KB | 427.5 KB |
| `/privaatsustingimused` | 55 | 332.2 KB | 95.3 KB | 427.5 KB |
| `/` | 56 | 334.9 KB | 89.4 KB | 424.4 KB |
| `/ruum` | 54 | 321.8 KB | 89.4 KB | 411.3 KB |
| `/materjalid` | 52 | 306.1 KB | 89.4 KB | 395.6 KB |
| `/teekond/[id]` | 52 | 306.1 KB | 89.4 KB | 395.6 KB |
| `/admin/wellbeing` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/autorilt` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/hinnastus` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/join` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/registreerimine` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/room/[roomId]` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/rooms` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/taasta-parool/[token]` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/taasta-parool` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/teekond` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/tellimus` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/tooalase-kasutuse-raamistik` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/tooheaolu/piloot` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/uuenda-epost` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/uuenda-pin` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |
| `/voimalused` | 51 | 300.2 KB | 89.4 KB | 389.7 KB |

## Kõige raskemad route’id: otsesed CSS-entrypoint’id

### `/vestlus` — 926.7 KB
- `app/styles/components/invite-modal.css`
- `app/styles/components/selected-listing.css`
- `app/styles/components/workspace-help-listings.css`
- `app/styles/features/chat/focus.css`
- `app/styles/features/chat/index.css`
- `app/styles/features/documents/agent.css`
- `app/styles/features/documents/index.css`
- `app/styles/features/documents/library.css`
- `app/styles/features/profile/index.css`
- `app/styles/features/service-map/index.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/chat/LeftRail.module.css`
- `components/chat/RightRail.module.css`
- `components/chat/WorkspacePanel.module.css`
- `components/covision/CovisionPage.module.css`
- `components/effects/Components/OrbitalMenu/OrbitalMenu.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`
- `components/ui/SotsiaalAILoader.module.css`

### `/eelpoordumised` — 721.6 KB
- `app/styles/features/chat/index.css`
- `app/styles/features/documents/agent.css`
- `app/styles/features/documents/index.css`
- `app/styles/features/service-map/index.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`

### `/teenusekaart` — 706.3 KB
- `app/styles/features/chat/index.css`
- `app/styles/features/documents/index.css`
- `app/styles/features/service-map/index.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`

### `/teenuseprofiil` — 706.3 KB
- `app/styles/features/chat/index.css`
- `app/styles/features/documents/index.css`
- `app/styles/features/service-map/index.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`

### `/dokreziim` — 599.9 KB
- `app/styles/features/chat/index.css`
- `app/styles/features/documents/agent.css`
- `app/styles/features/documents/index.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`

### `/kovisioon` — 500.0 KB
- `app/styles/features/documents/index.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/covision/CovisionPage.module.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`

### `/profiil` — 491.4 KB
- `app/styles/features/profile/index.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/effects/Components/OrbitalMenu/OrbitalMenu.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`

### `/documents` — 478.7 KB
- `app/styles/features/documents/index.css`
- `app/styles/features/documents/library.css`
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`

### `/tooheaolu/[tool]` — 474.9 KB
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/chat/WorkspacePanel.module.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`
- `components/wellbeing/WellbeingPage.module.css`

### `/tooheaolu` — 474.9 KB
- `app/styles/globals.css`
- `components/CenteredScrollPicker.css`
- `components/backgrounds/ColorBends.css`
- `components/chat/WorkspacePanel.module.css`
- `components/ui/BorderGlow.module.css`
- `components/ui/PageInfoButton.module.css`
- `components/wellbeing/WellbeingPage.module.css`

## Globaalne mobiilikiht

Need failid jõuavad praeguse `globals.css → mobile/index.css → mobile.css` ahela kaudu igale route’ile mobiilivaates. See ei tähenda, et kõik tuleks eemaldada; see näitab, millised omanikud tuleb esimesena üle kontrollida.

| Fail | Maht | Soovitatud omanik |
|---|---:|---|
| `app/styles/mobile/subpage-title-system.css` | 12.9 KB | shared-mobile |
| `app/styles/mobile/scroll-panels.css` | 11.2 KB | shared-mobile |
| `app/styles/features/home/background.css` | 9.6 KB | home |
| `app/styles/mobile/modal-surfaces.css` | 8.7 KB | shared-mobile |
| `app/styles/mobile/foundations.css` | 8.4 KB | shared-mobile |
| `app/styles/features/accessibility/touch.css` | 8.1 KB | accessibility |
| `app/styles/features/profile/android-mobile.css` | 7.7 KB | profile |
| `app/styles/features/invite/mobile.css` | 7.4 KB | invite |
| `app/styles/mobile/touch-controls.css` | 5.2 KB | shared-mobile |
| `app/styles/mobile/panel-surfaces.css` | 3.7 KB | shared-mobile |
| `app/styles/features/home/home-scroll.css` | 1.8 KB | home |
| `app/styles/features/policy/android-mobile.css` | 1.0 KB | policy |
| `app/styles/features/login/mobile.css` | 0.9 KB | login |
| `app/styles/mobile.css` | 0.8 KB | entrypoint |
| `app/styles/features/login/otp-close.css` | 0.7 KB | login |
| `app/styles/features/register/mobile.css` | 0.6 KB | register |
| `app/styles/mobile/platform-android.css` | 0.4 KB | shared-mobile |
| `app/styles/features/accessibility/fields.css` | 0.3 KB | accessibility |
| `app/styles/mobile/motion.css` | 0.1 KB | shared-mobile |
| `app/styles/mobile/index.css` | 0.0 KB | shared-mobile |

## Omandirikkumiste kandidaadid

| Fail | Põhjus | Maht |
|---|---|---:|
| `app/styles/features/home/background.css` | Feature CSS jõuab globaalselt kõigile route’idele | 9.6 KB |
| `app/styles/features/accessibility/touch.css` | Feature CSS jõuab globaalselt kõigile route’idele | 8.1 KB |
| `app/styles/features/profile/android-mobile.css` | Feature CSS jõuab globaalselt kõigile route’idele | 7.7 KB |
| `app/styles/features/invite/mobile.css` | Feature CSS jõuab globaalselt kõigile route’idele | 7.4 KB |
| `app/styles/features/home/home-scroll.css` | Feature CSS jõuab globaalselt kõigile route’idele | 1.8 KB |
| `app/styles/features/policy/android-mobile.css` | Feature CSS jõuab globaalselt kõigile route’idele | 1.0 KB |
| `app/styles/features/login/mobile.css` | Feature CSS jõuab globaalselt kõigile route’idele | 0.9 KB |
| `app/styles/features/login/otp-close.css` | Feature CSS jõuab globaalselt kõigile route’idele | 0.7 KB |
| `app/styles/features/register/mobile.css` | Feature CSS jõuab globaalselt kõigile route’idele | 0.6 KB |
| `app/styles/components/chat-focus.css` | Runtime importgraafist laadimata; kontrolli teste/compatibility-viiteid | 0.3 KB |
| `app/styles/features/accessibility/fields.css` | Feature CSS jõuab globaalselt kõigile route’idele | 0.3 KB |
| `app/styles/components/documents-mode.css` | Runtime importgraafist laadimata; kontrolli teste/compatibility-viiteid | 0.2 KB |

## Esimene parandusetapp

### 1. Ära kustuta compatibility-faile pimesi

`app/styles/components/chat-focus.css` ja `app/styles/components/documents-mode.css` ei ole runtime-graafis aktiivsed, kuid testid loevad neid otse failisüsteemist. Seega on õige esimene muudatus **testide ümberviimine päris omanike failidele**, alles seejärel tombstone-failide eemaldamine.

### 2. Esimene turvaline runtime-parandus

`app/styles/tokens/base.css` on tühi ja globaalne import. Selle eemaldamine `globals.css`-ist ei muuda CSS-kaskaadi. Faili enda võib jätta ajutiselt migratsioonimärkuseks või kustutada koos README viite korrigeerimisega.

### 3. Esimene sisuline omandiparandus

`app/styles/mobile/platform-android.css` impordib globaalselt nii policy kui profile Androidi CSS-i. Need tuleb viia vastavate feature-entrypoint’ide alla, säilitades sama `max-width` ja Androidi selektorid. See vähendab globaalse mobiilikaskaadi ulatust, kuid vajab enne route-teste `/profiil`, `/vestlus`, `/kasutustingimused`, `/privaatsustingimused` ja `/kasutusjuhend`.

## Failide omandikaart

| CSS-fail | Ulatus | Route’e | Importijad | Pakutud omanik | `!important` |
|---|---|---:|---|---|---:|
| `app/styles/components/chat-focus.css` | laadimata | 0 | — | shared-ui / compatibility | 0 |
| `app/styles/components/documents-mode.css` | laadimata | 0 | — | shared-ui / compatibility | 0 |
| `app/styles/theme/hc.css` | globaalne | 42 | `app/styles/globals.css` | theme tokens / feature adapters | 16 |
| `app/styles/theme/mono.css` | globaalne | 42 | `app/styles/globals.css` | theme tokens / feature adapters | 24 |
| `app/styles/shared/ui-glow.css` | globaalne | 42 | `app/styles/components/glass.css` | shared-ui / compatibility | 118 |
| `app/styles/theme/mid.css` | globaalne | 42 | `app/styles/globals.css` | theme tokens / feature adapters | 3 |
| `app/styles/shared/glass-subpage.css` | globaalne | 42 | `app/styles/utilities/helpers-core.css` | shared-ui / compatibility | 18 |
| `app/styles/tokens.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 0 |
| `app/styles/theme/light.css` | globaalne | 42 | `app/styles/globals.css` | theme tokens / feature adapters | 2 |
| `components/ui/BorderGlow.module.css` | globaalne | 42 | `components/ui/BorderGlow.jsx` | ui | 62 |
| `app/styles/theme/dark.css` | globaalne | 42 | `app/styles/globals.css` | theme tokens / feature adapters | 14 |
| `app/styles/mobile/subpage-title-system.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 21 |
| `app/styles/mobile/scroll-panels.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 15 |
| `app/styles/shared/register.css` | globaalne | 42 | `app/styles/components/glass.css` | shared-ui / compatibility | 7 |
| `app/styles/theme/night.css` | globaalne | 42 | `app/styles/globals.css` | theme tokens / feature adapters | 3 |
| `app/styles/features/home/background.css` | globaalne | 42 | `app/styles/mobile.css` | home | 7 |
| `app/styles/mobile/modal-surfaces.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 6 |
| `app/styles/shared/workspace-guide.css` | globaalne | 42 | `app/styles/utilities/helpers-core.css` | shared-ui / compatibility | 33 |
| `app/styles/shared/login-a11y.css` | globaalne | 42 | `app/styles/utilities/helpers-core.css` | shared-ui / compatibility | 1 |
| `app/styles/mobile/foundations.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 11 |
| `app/styles/features/accessibility/touch.css` | globaalne | 42 | `app/styles/mobile.css` | accessibility | 3 |
| `components/CenteredScrollPicker.css` | globaalne | 42 | `components/accessibility/AccessibilityModal.jsx`, `components/alalehed/RegistreerimineBody.jsx`, `components/rooms/RoomsPage.jsx` | CenteredScrollPicker.css | 19 |
| `app/styles/features/profile/android-mobile.css` | globaalne | 42 | `app/styles/mobile/platform-android.css` | profile | 85 |
| `app/styles/features/invite/mobile.css` | globaalne | 42 | `app/styles/mobile.css` | invite | 63 |
| `app/styles/base/core.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 2 |
| `app/styles/shared/glass-core.css` | globaalne | 42 | `app/styles/components/glass.css` | shared-ui / compatibility | 3 |
| `app/styles/mobile/touch-controls.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 25 |
| `app/styles/base/backgrounds.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 2 |
| `app/styles/mobile/panel-surfaces.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 23 |
| `app/styles/components/journey.css` | globaalne | 42 | `app/styles/globals.css` | shared-ui / compatibility | 4 |
| `app/styles/base/animations.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 0 |
| `app/styles/features/home/home-scroll.css` | globaalne | 42 | `app/styles/mobile.css` | home | 3 |
| `app/styles/tailwind.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 0 |
| `app/styles/base/typography.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 0 |
| `app/styles/base/layout.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 0 |
| `app/styles/utilities/glass-ring-stable.shared.css` | globaalne | 42 | `app/styles/utilities/helpers.css` | shared-ui / compatibility | 1 |
| `app/styles/features/policy/android-mobile.css` | globaalne | 42 | `app/styles/mobile/platform-android.css` | policy | 8 |
| `app/styles/globals.css` | globaalne | 42 | `app/layout.js` | entrypoint | 0 |
| `app/styles/features/login/mobile.css` | globaalne | 42 | `app/styles/mobile.css` | login | 0 |
| `app/styles/mobile.css` | globaalne | 42 | `app/styles/mobile/index.css` | entrypoint | 0 |
| `app/styles/features/login/otp-close.css` | globaalne | 42 | `app/styles/mobile.css` | login | 0 |
| `app/styles/features/register/mobile.css` | globaalne | 42 | `app/styles/mobile.css` | register | 0 |
| `app/styles/mobile/chat-bootstrap.css` | globaalne | 42 | `app/styles/globals.css` | shared-mobile | 2 |
| `app/styles/mobile/platform-android.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 5 |
| `app/styles/features/accessibility/fields.css` | globaalne | 42 | `app/styles/mobile.css` | accessibility | 0 |
| `app/styles/utilities/helpers-core.css` | globaalne | 42 | `app/styles/utilities/helpers.css` | shared-ui / compatibility | 0 |
| `app/styles/components/glass.css` | globaalne | 42 | `app/styles/globals.css` | shared-ui / compatibility | 0 |
| `app/styles/tokens/base.css` | globaalne | 42 | `app/styles/globals.css` | global-foundation | 0 |
| `app/styles/mobile/motion.css` | globaalne | 42 | `app/styles/mobile.css` | shared-mobile | 0 |
| `app/styles/utilities/helpers.css` | globaalne | 42 | `app/styles/globals.css` | shared-ui / compatibility | 0 |
| `components/backgrounds/ColorBends.css` | globaalne | 42 | `components/backgrounds/ColorBends.jsx` | backgrounds | 0 |
| `app/styles/utilities/helpers-invite-scrollbar.css` | globaalne | 42 | `app/styles/utilities/helpers.css` | shared-ui / compatibility | 0 |
| `app/styles/mobile/index.css` | globaalne | 42 | `app/styles/globals.css` | shared-mobile | 0 |
| `app/styles/features/service-map/desktop.css` | feature | 4 | `app/styles/features/service-map/index.css` | service-map | 104 |
| `components/effects/Components/OrbitalMenu/OrbitalMenu.css` | kitsas | 2 | `components/effects/Components/OrbitalMenu/OrbitalMenu.jsx`, `components/journey/JourneyDashboard.jsx` | effects | 155 |
| `components/wellbeing/WellbeingPage.module.css` | kitsas | 2 | `components/wellbeing/HardCaseWorkflow.jsx`, `components/wellbeing/InterruptionsWorkflow.jsx`, `components/wellbeing/OverviewWorkflow.jsx` +11 | wellbeing | 90 |
| `components/chat/WorkspacePanel.module.css` | feature | 3 | `components/chat/WorkspacePanel.jsx`, `components/wellbeing/WellbeingPage.jsx` | chat | 163 |
| `app/styles/features/chat/shell.css` | feature | 5 | `app/styles/components/chat-focus.css`, `app/styles/features/chat/index.css` | chat | 56 |
| `app/styles/features/documents/workspace.css` | lai | 16 | `app/styles/features/documents/index.css` | documents | 3 |
| `components/covision/CovisionPage.module.css` | kitsas | 2 | `components/covision/CovisionPage.jsx` | covision | 163 |
| `app/styles/features/chat/themes.css` | feature | 5 | `app/styles/features/chat/index.css` | chat | 86 |
| `app/styles/features/documents/ui.css` | lai | 16 | `app/styles/features/documents/index.css` | documents | 13 |
| `app/styles/features/chat/hc.css` | feature | 5 | `app/styles/features/chat/index.css` | chat | 29 |
| `app/styles/features/service-map/mobile.css` | feature | 4 | `app/styles/features/service-map/index.css` | service-map | 77 |
| `app/styles/features/policy/pages.css` | feature | 3 | `app/styles/features/policy/index.css` | policy | 38 |
| `app/styles/features/home/desktop.css` | kitsas | 1 | `app/styles/features/home/index.css` | home | 49 |
| `app/styles/features/profile/mobile.css` | kitsas | 2 | `app/styles/features/profile/index.css` | profile | 10 |
| `app/styles/features/documents/agent.css` | feature | 3 | `app/dokreziim/page.js`, `app/eelpoordumised/page.jsx`, `app/vestlus/page.js` | documents | 10 |
| `app/styles/features/chat/mono.css` | feature | 6 | `app/ruum/page.js`, `app/styles/features/chat/index.css` | chat | 20 |
| `app/styles/features/policy/responsive.css` | feature | 3 | `app/styles/features/policy/index.css` | policy | 62 |
| `app/styles/features/chat/mobile.css` | feature | 5 | `app/styles/features/chat/index.css` | chat | 14 |
| `app/styles/features/profile/hc.css` | kitsas | 2 | `app/styles/features/profile/index.css` | profile | 28 |
| `components/chat/rail.module.css` | kitsas | 1 | `components/chat/LeftRail.module.css`, `components/chat/RightRail.module.css` | chat | 10 |
| `app/styles/features/home/mobile.css` | kitsas | 1 | `app/styles/features/home/index.css` | home | 4 |
| `app/styles/features/documents/library.css` | kitsas | 2 | `app/documents/page.js`, `app/vestlus/page.js` | documents | 5 |
| `app/styles/features/documents/mobile.css` | lai | 16 | `app/styles/features/documents/index.css` | documents | 9 |
| `components/chat/LeftRail.module.css` | kitsas | 1 | `components/chat/LeftRail.jsx` | chat | 55 |
| `components/chat/RightRail.module.css` | kitsas | 1 | `components/chat/RightRail.jsx` | chat | 75 |
| `app/styles/features/home/themes.css` | kitsas | 1 | `app/styles/features/home/index.css` | home | 6 |
| `app/styles/features/documents/mono.css` | lai | 16 | `app/styles/features/documents/index.css` | documents | 0 |
| `components/ui/PageInfoButton.module.css` | lai | 13 | `components/ui/DashboardInfoOverlay.jsx` | ui | 4 |
| `app/styles/features/policy/mobile.css` | feature | 3 | `app/styles/features/policy/index.css` | policy | 15 |
| `app/styles/components/workspace-help-listings.css` | kitsas | 1 | `app/styles/components/chat-focus.css`, `app/vestlus/page.js` | shared-ui / compatibility | 26 |
| `app/styles/features/profile/mono.css` | kitsas | 2 | `app/styles/features/profile/index.css` | profile | 2 |
| `app/styles/components/selected-listing.css` | kitsas | 1 | `app/styles/components/chat-focus.css`, `app/vestlus/page.js` | shared-ui / compatibility | 1 |
| `components/TextAnimations/CircularText/CircularText.css` | kitsas | 1 | `components/TextAnimations/CircularText/CircularText.jsx` | TextAnimations | 0 |
| `app/styles/components/invite-modal.css` | kitsas | 2 | `app/ruum/page.js`, `app/styles/components/chat-focus.css`, `app/vestlus/page.js` | shared-ui / compatibility | 0 |
| `components/ui/SotsiaalAILoader.module.css` | kitsas | 1 | `components/ui/SotsiaalAILoader.jsx` | ui | 0 |
| `app/styles/features/chat/index.css` | feature | 5 | `app/dokreziim/page.js`, `app/eelpoordumised/page.jsx`, `app/teenusekaart/page.jsx` +2 | chat | 0 |
| `app/styles/features/documents/index.css` | lai | 16 | `app/admin/analytics/page.jsx`, `app/admin/framework-acceptances/page.jsx`, `app/admin/rag/documents/page.jsx` +13 | documents | 0 |
| `app/styles/features/policy/index.css` | feature | 3 | `app/kasutusjuhend/page.jsx`, `app/kasutustingimused/page.js`, `app/privaatsustingimused/page.js` | policy | 0 |
| `app/styles/features/home/index.css` | kitsas | 1 | `app/page.js` | home | 0 |
| `app/styles/features/profile/index.css` | kitsas | 2 | `app/profiil/page.js`, `app/vestlus/page.js` | profile | 0 |
| `app/styles/features/chat/focus.css` | kitsas | 1 | `app/styles/components/chat-focus.css`, `app/vestlus/page.js` | chat | 1 |
| `app/styles/features/service-map/index.css` | feature | 4 | `app/eelpoordumised/page.jsx`, `app/teenusekaart/page.jsx`, `app/teenuseprofiil/page.jsx` +1 | service-map | 0 |

## Piirangud

- Tingimuslik renderdus ei pruugi staatilises graafis eristuda: kui route impordib komponendi, loetakse selle CSS sõltuvuseks ka siis, kui komponent avaneb alles kasutaja tegevuse järel.
- Next.js võib tootmisbuildis CSS-i tükeldada ja deduplikeerida; raport kirjeldab lähtekoodi omandit ning potentsiaalset kaskaadi, mitte võrgus allalaetava faili täpset gzip-mahtu.
- Visuaalne kinnitamine on vältimatu teemade, PWA safe-area ja `!important`-põhiste override’ide puhul.
