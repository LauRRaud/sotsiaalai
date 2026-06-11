# SotsiaalAI — CSS-i ja kasutamata koodi audit

Kuupäev: 11.06.2026. Ainult raport — ühtegi projektifaili ei muudetud ega kustutatud.

## Metoodika ja piirangud

- `npm run css:audit` (projekti enda `scripts/audit-css-usage.mjs`) — käivitatud edukalt: 63 CSS-faili, 642 lähtefaili, 1936 klassiselektorit, 49 "ei leitud lähtekoodist" (2,5%).
- `npx knip` ja `npx jscpd` — **ei õnnestunud käivitada**: sandboxi npm-registry blokeerib mõlemad paketid (403). Asendasin omakirjutatud read-only skaneeringutega (impordigraafi saavutatavusanalüüs + postcss-põhine dubleerimisskann + export-kasutuse kontroll). Skriptid jooksid ainult mälus/tmp-is.
- Iga kahtlane leid on grep-iga üle kontrollitud kogu repos (sh dünaamilised mustrid, testid, messages/*.json).
- Varasemad knip-raportid projektis (`knip-report*.txt`, 31.05–01.06) on **aegunud**: kõik seal loetletud 15 kasutamata faili on juba kustutatud ja 8 kasutamata sõltuvust (framer-motion, gsap, mathjs, motion, mammoth, formidable, @tabler/icons-react, react-parallax-tilt) juba eemaldatud. Samuti on seal raporteeritud 4 "kasutamata" eslint devDependency't praegu `eslint.config.mjs`-is reaalselt kasutusel — see leid on vananenud.
- Saladustega faile (.env, production.env, rag.env jt) ei avatud.

---

## KRIITILINE — kohe eemaldatav või parandatav

### K1. Surnud npm-skript ja devDependency: Playwright
- `package.json` → `"test:e2e": "playwright test"` ja devDependency `@playwright/test@^1.56.1`.
- Projektis pole ühtegi `playwright.config.*` ega `*.spec.js/ts` faili; "playwright" ei esine üheski skriptis ega testis. Skript ebaõnnestuks käivitamisel.
- Tegevus: eemalda skript + devDependency (~50 MB node_modules'ist).

### K2. Täiesti surnud funktsioonid/konstandid (eksporditud, aga ei kasutata ei mujal ega oma failis)
Kontrollitud: nimi esineb repos ainult definitsioonireal.

| Fail | Eksport |
|---|---|
| lib/auth/pin-login.js | isDirectPinLoginAllowed |
| lib/documents/server.js | statStoredDocument |
| lib/help/categories.js | seedHelpCategories |
| lib/help/geocoding.js | normalizeGeocodingCandidateText |
| lib/help/mapEntries.js | helpMapActiveListingWhere |
| lib/help/targetGroupData.js | loadTargetGroupSeedEntries |
| lib/research/jobStore.js | getResearchJobPublic, hasActiveResearchJob |
| lib/serviceProviderProfiles.js | SERVICE_MAP_ENTRY_STATUSES, SERVICE_MAP_GEOCODING_STATUSES |
| lib/storageGuardrails.js | wouldExceedStorageQuota |
| lib/transcription/provider.js | cancelTranscriptionJob, getTranscriptionJobStatus |
| lib/wellbeingTools.js | getWellbeingToolByRoute |

### K3. CSS: identne reegel samas failis kahes meedia-päringus (560px on 768px alamhulk → kitsam koopia on üleliigne)
- `app/styles/mobile/service-map.css:73` (max-768) vs `:375` (max-560) — `.service-map-workspace__filters--collapsed .service-map-workspace__filters-shell` (4 deklaratsiooni, identsed)
- `app/styles/mobile/service-map.css:212` vs `:447` — `...__toggle` (15 deklaratsiooni, identsed)
- `app/styles/components/service-map.css:1984` vs `:3363` — baasreegel dubleeritud @media (max-1180) sees; meedia-koopia ei lisa midagi.

---

## TÕENÄOLINE — suure tõenäosusega kasutamata/dubleeritud, vajab ülevaatust

### T1. Kasutamata CSS-klassid (grep ei leia ühtegi viidet JS/JSX/HTML/messages failidest)

| Fail:rida | Klass |
|---|---|
| app/styles/base/animations.css:300 | .glass-content-settle |
| app/styles/base/animations.css:319 (+ theme/hc.css:57) | .defer-fade |
| app/styles/base/animations.css:331 | .defer-from-bottom |
| app/styles/base/animations.css:334 | .delay-2 |
| app/styles/base/backgrounds.css:53, 60 | .sb-grain, .sb-grain-bitmap, .sb-grain-svg |
| app/styles/base/layout.css:37–54 | .site-footer, .site-footer-inner, .site-footer-logo |
| app/styles/base/layout.css:81 | .home-chat-open |
| app/styles/base/typography.css:2 | .headline-bold |
| app/styles/components/glass.css:864 | .register-framework-card |
| app/styles/components/service-map.css:412 | .service-profile-subsection-title |
| app/styles/components/service-map.css:467 | .service-profile-nested-card-header |
| app/styles/components/service-map.css:482 | .service-profile-add-action, .service-profile-empty-action |
| app/styles/components/service-map.css:788–810 (+ mobile/service-map.css:355) | .workspace-feature-inline-stat, __label, __value |
| app/styles/mobile/policy-scroll.css:63 | .policy-scroll-page-content |
| app/styles/theme/hc.css:1359 + theme/mono.css:586 | .glass-policy-back |
| app/styles/theme/hc.css:3 | .skip-link (esineb ainult codex-skills näidis-HTML-is, mitte rakenduses) |

Märkus: kontrollisin, et `service-profile-*` klassid pole template-literal'iga kokku pandud (WorkspaceFeaturePage.jsx kasutab ainult `service-profile-subsection` ja `service-profile-nested-card` täiskujul).

### T2. Üleliigsed `export`-märked (kasutusel ainult oma failis, väljaspool mitte kunagi) — 78 tk
Kood ise on elus; eemaldada võiks ainult `export`-sõna (vähendab avalikku API-pinda). Suuremad kobarad:

- `lib/documents/ragService.js` — 7× RAG_OBSERVABILITY_*_HEADER + getRagBaseUrl
- `lib/wellbeing/*.js` — 18× *_SCHEMA_VERSION / *_SCORING_VERSION (hardCase, interruptions, quickCheck, recovery, roleBoundaries, starterSupport, workBoundaries, workProcesses, workplaceViolence)
- `lib/serviceProviderProfiles.js` — 7 eksporti (normalize*/serialize*/FEE_TYPES/PROFILE_STATUSES)
- `lib/rag/sourceMetadata.js` — 6, `lib/serviceMap/accessPath.js` — 4, `lib/rag/graph/graphSchema.js` — 4, `lib/subscriptionPlans.js` — 5, `lib/usageBudget.js` — 3, `lib/rag/legacyAjakiriCleanup.js` — 3
- Üksikud: lib/admin/rag/kov/service.js (2), lib/documents/server.js (2), lib/help/intents.js, lib/help/mapEntries.js, lib/help/municipalityData.js, lib/help/targetGroupData.js, lib/journey/assistiveDevices.js (2), lib/rag/sourceFreshness.js (2), lib/retention.js, lib/serviceMap/entryTypes.js, lib/serviceMap/ragServiceMapSync.js, lib/serviceProviderServiceLocations.js, lib/storageGuardrails.js, lib/wellbeing/pilotScopes.js, lib/wellbeing/supportDraftText.js, lib/wellbeingTools.js
- Täisnimekiri esinemiskordadega on selle raporti lisas (allpool).

### T3. CSS-dubleerimine failide vahel (identne selektor + identsed deklaratsioonid)

**Suurim kobar: `components/chat/LeftRail.module.css` ↔ `components/chat/RightRail.module.css` — 15 identset reegligruppi** (.slot, .iconBtn, .iconSvg, .iconRooms, .tooltipAnchor, .mobileRailVisible + 8 erinevat .tooltip teemavarianti). Soovitus: ühine `Rail.shared.module.css` või composes-muster.

Muud:
- `components/covision/CovisionPage.module.css:272` ↔ `components/wellbeing/WellbeingPage.module.css:280` — `.surface.surface`
- `app/styles/components/workspace-help-listings.css:85` ↔ `app/styles/mobile/modal-surfaces.css:140` — sama hc-reegel
- `app/styles/mobile/scroll-panels.css:38,45,53` ↔ `app/styles/utilities/helpers-core.css:853,860,868` — kolm identset `.invite-modal-content--workspace...` reeglit, üks max-768 ja teine min-769 all → kehtivad kokku alati; saaks asendada ühe meedia-vaba reegliga
- `app/styles/mobile/invite-workspace.css:111` ↔ `app/styles/utilities/helpers-core.css:971` — sama lugu (mobiil + desktop paar)

Sarnased deklaratsiooniblokid eri selektoritega (konsolideerimiskandidaadid, 32 gruppi), nt:
- `helpers-core.css:83` (.a11y-modal-shell::before) ↔ `:388` (.glass-ring::before) — 15 identset deklaratsiooni
- `invite-modal.css:26` ↔ `workspace-help-listings.css:116` — 17 identset deklaratsiooni
- `WorkspacePanel.module.css:1113` (.grid) ↔ `WellbeingPage.module.css:1250` (.toolsGrid) — 11 deklaratsiooni
- `theme/hc.css` sisemised kordused (read 639/1921/1929; 1133/1140; 1701/2814/2842)

### T4. Vananenud auditiartefaktid juurkaustas
`knip-report.txt`, `knip-report-all.txt`, `knip-report-configured.txt` — sisu on aegunud (vt metoodika) ja `knip-report-configured.txt` on Windowsi veatõmmis. Eksitavad tulevasi audite; väärivad kustutamist või uuendamist. Lisaks on juurkaustas fail nimega `{` ja `CON` (Windowsi reserveeritud nimi — võib tekitada tööriistadel probleeme).

---

## EBATÕENÄOLINE / ETTEVAATUST — ära eemalda ilma põhjaliku kontrollita

### E1. CSS-auditi valepositiivsed (kinnitatud kasutusel või dünaamilised)
- **leaflet-* klassid (16 tk)** `service-map.css` ja `mobile/service-map.css` — Leaflet'i teek genereerib need runtime'is (`components/workspace/ServiceMapLeaflet.jsx`). MITTE eemaldada.
- `.documents-dropdown--align-start/--align-end/--open-up` — pannakse kokku dünaamiliselt (`components/documents/DocumentsDropdown.jsx:129`).
- `.theme-dark` (glass.css:81, home.css:56) — kasutusel `components/alalehed/TooalaseRaamistikuBody.jsx:59`.
- `.help-listings-empty` (helpers-core.css:988) — viidatud testis `tests/workspace/helpListingsLayout.test.js:48`; eemaldamine murraks testi.
- `.skip-link` ja `.defer-fade` liigituvad T1 alla, aga olge eriti ettevaatlik: mõlemad on mustrid, mida võidakse lisada skriptiga (skip-link on a11y-standard).

### E2. Kasutamata faile ei leitud
Impordigraafi analüüs (912 faili, 311 entry-punkti: app-route'id, pages, scripts, auth/proxy/configid, testid; toetab `@/` aliast, dynamic import'i ja require'i): **0 saavutamatut faili** kaustades app/, components/, lib/, src/. Repo on 31.05 knip-koristuse järel puhas. (Heuristika piirang: täiesti stringipõhiseid dünaamilisi importe `import(muutuja)` ei tuvasta — projektis neid grep-iga silma ei jäänud.)

### E3. Sõltuvused, mis näivad kasutamata, aga on õigustatud
- `pg` — @prisma/adapter-pg peer-sõltuvus (knip.json-is teadlikult ignoreeritud)
- `tailwindcss` — kasutusel @tailwindcss/postcss kaudu (postcss.config.js)
- `@svgr/webpack` — next.config.mjs:26,62 (turbopack + webpack loader)
- `autoprefixer`, `postcss`, `postcss-safe-parser` — postcss.config.js + scripts/audit-css-usage.mjs
- `server-only`, `sharp`, `styled-components` (ainult components/ui/FancyCheckbox.jsx), `three` (ainult components/backgrounds/ColorBends.jsx), `ogl` (ainult components/backgrounds/Particles.jsx) — kasutusel. Märkus: `three` ja `styled-components` on rasked sõltuvused ühe komponendi jaoks — kaalumiskoht, mitte viga.
- Kõik ülejäänud dependencies/devDependencies on kinnitatult kasutusel. Ainus päriselt üleliigne on K1 (@playwright/test).

---

## Lisa: kasutatud kontrollid
1. `npm run css:audit` (+ `--top 49` täisnimekirjaks)
2. Omakirjutatud impordigraafi-skann (entry-mustrid knip.json-i eeskujul; BFS-saavutatavus; eraldi testidest-saavutatavus)
3. Omakirjutatud postcss-dubleerimisskann (täpsed duplikaadid ≥3 deklaratsiooniga; sama-deklaratsioonid-eri-selektor ≥5 deklaratsiooniga)
4. Export-kasutuse skann (named-exportide token-otsing kõigis app/components/lib/pages/scripts/tests failides) + oma-failis-kasutuse loendus
5. Iga KRIITILINE/TÕENÄOLINE leid grep-verifitseeritud

Täielik 92 ekspordi nimekiri esinemiskordadega: küsi, kui soovid eraldi failina.
