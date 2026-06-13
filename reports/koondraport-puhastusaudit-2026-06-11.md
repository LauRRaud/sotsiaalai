# SotsiaalAI — koondraport: CSS ja kasutamata koodi puhastusaudit

Kuupäev: 11.06.2026. Ainult raport — faile ei muudetud ega kustutatud. Saladustega faile ei avatud.

## Miks knip ja jscpd ei käivitunud (täpne põhjus)

Mõlemad on nüüd `package.json`-is ja `node_modules`-is olemas (knip 6.16.1, jscpd 5.0.7), aga minu Linuxi-sandboxis on need käivitamatud kahel sõltumatul põhjusel:

1. **Platvormipõhised native-binaarid.** Windowsi `npm install` paigaldas Windowsi binaarid. jscpd 5.x on Rust-põhine ja nõuab Linuxis paketti `cpd-linux-x64-gnu` (käivitamisel ütleb seda otse); knip vajab `oxc-resolver`-i Linuxi bindingut. Kumbagi ei saa juurde laadida — sandboxi npm-registry blokeerib need paketid (403 Forbidden: testitud `knip`, `jscpd`, `cpd-linux-x64-gnu`).
2. **Failisünkroonimise viga sandboxi.** Värskelt installitud failid jõuavad sandboxi osaliselt katki: nt `node_modules/knip/dist/index.js` lõpeb nullbaitidega, `node_modules/knip/package.json` on poolik (20+ katkist faili ainuüksi knipi kaustas). Sinu arvutis on failid terved — viga on ainult minu sandboxi vaates.

Märkus: sinu enda varasem Windowsi knip-katse (`knip-report-configured.txt`) kukkus samuti — `oxc-resolver` native binding blokeeriti Windowsi App Control policy poolt. Kui tahad knipi ise jooksutada, on see takistus vaja IT-poliitikas lahendada.

**Asendus:** kasutasin samaväärseid omakirjutatud read-only analüüse + projekti `npm run css:audit` tulemusi: (a) impordigraafi saavutatavusanalüüs (912 faili, 311 entry-punkti, toetab `@/` aliast, dynamic import'i, require'i); (b) postcss-põhine CSS-duplikaatide skann; (c) jscpd-laadne normaliseeritud reaakende duplikaadiskann JS/JSX-il (721 faili, 12-realine aken); (d) export-kasutuse skann. Iga leid on grep-iga üle kontrollitud, sh dünaamilised className-mustrid (template-literal'id, `classList.add/toggle`), testid, messages/*.json ja public/ HTML.

---

## 1. Kindlalt eemaldatav CSS

Verifitseeritud: klassinime ei esine kusagil JS/JSX/HTML/JSON-is, ei täiskujul ega prefiks+template-literal kombinatsioonina; pole `classList`-manipulatsiooni; pole teemafailide baasklassi.

| Fail:rida | Klass | Põhjendus |
|---|---|---|
| app/styles/base/animations.css:300 | .glass-content-settle | 0 viidet repos |
| app/styles/base/animations.css:331 | .defer-from-bottom | 0 viidet |
| app/styles/base/animations.css:334 | .delay-2 | 0 viidet (ka mitte `delay-${n}` mustrit) |
| app/styles/base/backgrounds.css:53,60 | .sb-grain, .sb-grain-bitmap, .sb-grain-svg | 0 viidet |
| app/styles/base/layout.css:37,48,54 | .site-footer, .site-footer-inner, .site-footer-logo | 0 viidet; PageFooter.jsx kustutati varem |
| app/styles/base/layout.css:81 | .home-chat-open | 0 viidet |
| app/styles/base/typography.css:2 | .headline-bold | 0 viidet (ka messages/*.json-is mitte) |
| app/styles/components/glass.css:864 | .register-framework-card | 0 viidet |
| app/styles/components/service-map.css:412 | .service-profile-subsection-title | JSX kasutab ainult `service-profile-subsection` täiskujul (WorkspaceFeaturePage.jsx:4244, kontrollitud — pole template-komposiitsiooni) |
| app/styles/components/service-map.css:467 | .service-profile-nested-card-header | sama: ainult `service-profile-nested-card` on kasutusel (:4247) |
| app/styles/components/service-map.css:482 | .service-profile-add-action, .service-profile-empty-action | 0 viidet |
| app/styles/components/service-map.css:788,801,810 + app/styles/mobile/service-map.css:355 | .workspace-feature-inline-stat, \_\_label, \_\_value | 0 viidet üheski vaates (desktop + mobiil) |
| app/styles/mobile/policy-scroll.css:63 | .policy-scroll-page-content | 0 viidet |
| app/styles/theme/hc.css:1359 + theme/mono.css:586 | .glass-policy-back | teemaülekirjutused klassile, mida ükski komponent ei kasuta — surnud koos baasiga |
| app/styles/theme/hc.css:57 | .defer-fade (hc-ülekirjutus) | baasklass animations.css:319 samuti kasutuseta (vt p 2 hoiatust) |

Samuti kindlalt parandatav (duplikaat, mitte klass):
- `app/styles/mobile/service-map.css:375` ja `:447` — identsed reeglid ridadega 73 ja 212, aga kitsamas meedia-päringus (max-560 ⊂ max-768) → kitsamad koopiad on üleliigsed.
- `app/styles/components/service-map.css:3363` — baasreegli (rida 1984) identne koopia @media (max-1180) sees.

## 2. CSS, mida EI tohi veel puutuda

| Klassid | Miks |
|---|---|
| Kõik `leaflet-*` (service-map.css read 2545–3236; mobile/service-map.css 268–323) | Leafleti teek genereerib need DOM-i runtime'is (ServiceMapLeaflet.jsx); css:audit ei näe neid kunagi lähtekoodis. MITTE kustutada. |
| .documents-dropdown--align-start / --align-end / --open-up | Pannakse kokku dünaamiliselt: DocumentsDropdown.jsx:129 (`documents-dropdown--${...}`) |
| .theme-dark (glass.css:81, home.css:56) | Kasutusel TooalaseRaamistikuBody.jsx:59; teemaklass, mis käib `<html>`/`<body>` peal |
| .help-listings-empty (helpers-core.css:988) | Viidatud testis tests/workspace/helpListingsLayout.test.js:48 — eemaldamine murrab testi; kontrolli enne, kas komponent loob seda tingimuslikult (tühi seisund = harva renderduv UI) |
| .skip-link (hc.css:3) | A11y-standardmuster; praegu rakenduses viidet pole (ainult codex-skills näidises), aga kui plaanis on skip-link layout'i lisada, hoia alles. Kustutamine on ohutu alles pärast teadlikku otsust. |
| .defer-fade | Nimi viitab lazy-load mustrile; kontrolli enne käsitsi mobiilis + aeglase võrguga, et ükski inline-skript seda ei lisa. Tehniliselt 0 viidet, aga animatsiooniklassid on tüüpiline valenegatiivide koht. |
| Teemafailide (dark/hc/mono/night/mid/light) reeglid üldiselt | Need rakenduvad ainult vastavas režiimis — css:audit "not seen" ei tähenda siin midagi, kuna selektor viitab klassidele, mis on nähtavad ainult režiimi sees. Kõik minu p 1 leiud on selle suhtes kontrollitud (baasklass puudub kõikjal). |

## 3. CSS-dubleerimised, mida saab ühendada

1. **LeftRail.module.css ↔ RightRail.module.css — 15 identset reegligruppi** (.slot, .iconBtn, .iconSvg, .iconRooms, .tooltipAnchor, .mobileRailVisible + 8 tooltip'i teemavarianti, sh hc/night/light/mid/mono ja @supports fallback). JSX-pool on samuti suuresti dubleeritud (LeftRail.jsx ↔ RightRail.jsx, 20 duplikaadiakent). Soovitus: ühine `Rail.shared.module.css` + ühine alamkomponent.
2. **mobile/scroll-panels.css:38,45,53 ↔ utilities/helpers-core.css:853,860,868** — kolm identset `.invite-modal-content--workspace...` reeglit; üks max-768, teine min-769 all → koos katavad kõik laiused; asendatav ühe meedia-vaba reegliga. Sama paar: mobile/invite-workspace.css:111 ↔ helpers-core.css:971.
3. **workspace-help-listings.css:85 ↔ mobile/modal-surfaces.css:140** — identne hc-modaali reegel.
4. **invite-modal.css:26 ↔ workspace-help-listings.css:116** — 17 identset deklaratsiooni eri modaaliklassidel → kandidaat ühiseks modaali-baasklassiks.
5. **helpers-core.css:83 (.a11y-modal-shell::before) ↔ :388 (.glass-ring::before)** — 15 identset deklaratsiooni.
6. **hc.css sisemised kordused** — read 639/1921/1929, 1133/1140, 1701/2814/2842; samuti chat-shell.css:868 ↔ hc.css:1720.
7. CSS Modules paarid: WorkspacePanel.module.css:1113 (.grid) ↔ WellbeingPage.module.css:1250 (.toolsGrid) — 11 deklaratsiooni; CovisionPage ↔ WellbeingPage `.surface.surface`.

## 4. Kasutamata failid / komponendid / exportid

**Kasutamata faile ei ole.** Impordigraafi BFS (entry'd: kõik app-route'id, pages/, scripts/, auth.js, proxy.js, configid, prisma, testid) ei leidnud ühtegi saavutamatut faili app/, components/, lib/, src/ kaustades. 31.05 knip-raporti 15 kasutamata faili on kõik juba kustutatud.

**Täiesti surnud exportid (13)** — nime ei kasutata isegi oma failis, ainult definitsioon (kontrollitud ka juurfailide auth.js/proxy.js/configide vastu):

| Fail | Eksport |
|---|---|
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

**Üleliigsed export-märked (78)** — funktsioon/konstant on oma failis kasutusel, aga väljastpoolt ei impordita kunagi; eemaldada võiks ainult sõna `export`. Suurimad kobarad: lib/wellbeing/*.js 18× \*_SCHEMA_VERSION/\*_SCORING_VERSION; lib/documents/ragService.js 8 (RAG_OBSERVABILITY_* päised + getRagBaseUrl); lib/serviceProviderProfiles.js 7; lib/rag/sourceMetadata.js 6; lib/subscriptionPlans.js 5; lib/serviceMap/accessPath.js ja lib/rag/graph/graphSchema.js 4. (Täisnimekiri esinemiskordadega: eelmine raport / küsi eraldi failina.)

**JS-koodi dubleerimine** (jscpd asendusskann, ≥12 sisulist identset rida):
- lib/help/offers.js ↔ lib/help/requests.js — suurim paar (21 akent, nt 123–141 ↔ 124–142): abisoovid/abipakkumised on peegelkoopiad → ühine moodul parameetriga
- app/api/admin/analytics/payment-alerts/dispatch/route.js ↔ summary/route.js (15 akent)
- lib/wellbeing/supportDraftText.js ↔ supportDrafts.js (13)
- lib/help/chatWorkflow.js:342+ ↔ lib/help/workflowExtraction.js:12+ (12) — ekstraheerimisloogika koopia
- app/api/invites/* — 5 route'i jagavad identset valideerimis/algusplokki (route.js, sponsored/init, [id]/accept, [id]/resend, [id]/revoke)
- app/api/rooms/.../recording/{consent,decline,withdraw}/route.js — identne päis (read 16–36)
- scripts/cleanup-legacy-ajakiri-rag-docs.mjs ↔ delete-ajakiri-rag-docs.mjs (9)
- Failisisesed: lib/admin/rag/kov/service.js (1129–1150 ≈ 1260–1281), components/admin/AnalyticsDashboard.jsx (2136+ ≈ 2716+), lib/serviceProviderProfiles.js, lib/documents/generation.js, lib/chat/workflowBranchHandlers.js (3 kohta)

## 5. Kasutamata dependency'd

| Pakett | Hinnang |
|---|---|
| **@playwright/test** (devDep) | **Ainus päriselt üleliigne.** Pole ühtegi playwright.config.*, *.spec.* faili ega viidet; `test:e2e` skript kukuks. Eemalda koos skriptiga — VÄLJA ARVATUD juhul, kui e2e testid on alles plaanis. |
| typescript (devDep, uus) | Vajalik knipi/tsx tüübianalüüsiks — jäta alles, kuna knip on nüüd devDep |
| knip, jscpd (devDep, uued) | Tööriistad ise — alles |
| pg | Ei impordita otse, aga @prisma/adapter-pg peer — õigustatud (knip.json-is juba ignore's) |
| tailwindcss | Kasutusel @tailwindcss/postcss kaudu — õigustatud (ignore's) |
| @svgr/webpack | next.config.mjs:26,62 — kasutusel |
| autoprefixer, postcss, postcss-safe-parser | postcss.config.js + scripts/audit-css-usage.mjs — kasutusel |
| styled-components | Kasutusel ainult components/ui/FancyCheckbox.jsx — mitte kasutamata, aga 1 komponent ei õigusta rasket runtime'i; kaalu CSS-iga asendamist |
| three | Kasutusel ainult components/backgrounds/ColorBends.jsx — sama kaalutlus (~600 KB) |
| Kõik ülejäänud | Kinnitatult kasutusel (impordigraaf + npm-skriptide binaarid: cross-env, dotenv-cli, prettier, prisma, tsx, eslint + 4 eslint-pluginat eslint.config.mjs-is) |

## 6. Kõige turvalisem esimene puhastusetapp

Soovitatud järjekord (iga samm eraldi commit, järjest kasvava riskiga):

1. **Vanad auditiartefaktid**: kustuta/arhiveeri `knip-report.txt`, `knip-report-all.txt`, `knip-report-configured.txt` (kõik aegunud, eksitavad) ning juurkausta failid `{` ja `CON` (Windowsi reserveeritud nimi). Risk: null — ei ole kood.
2. **@playwright/test + test:e2e skript** package.json-ist. Risk: null (skript on praegu katki nagunii). Kontroll: `npm run build`.
3. **Punkti 1 CSS-klassid** — alusta neist, mis on baasfailides ja millel pole teemavasteid: .sb-grain*, .site-footer*, .headline-bold, .glass-content-settle, .defer-from-bottom, .delay-2, .home-chat-open, .register-framework-card, .policy-scroll-page-content. Jäta esimesest ringist VÄLJA .skip-link, .defer-fade ja .help-listings-empty (vt p 2). Kontroll: `npm run css:audit` enne/pärast + visuaalne kontroll mobiilis, dark- ja hc-režiimis (eriti avaleht, poliitika-lehed, teenusekaart).
4. **service-map.css meedia-duplikaatide eemaldamine** (read 375, 447, 3363) — identsed deklaratsioonid, käitumine ei muutu definitsiooni järgi. Kontroll: teenusekaardi vaade mobiilis 560px ja 768px laiusel.
5. **14 surnud exporti** — kustuta funktsioonid/konstandid. Risk: madal; `npm run lint && npm run build && npm test` katavad. NB: ära puuduta samas commitis 78 "export-only" märget — need on eraldi, veel madalama prioriteediga samm.
6. Alles seejärel suuremad refaktorid (LeftRail/RightRail ühendamine, offers/requests ühismoodul, invites route'ide ühine helper) — need muudavad käitumiskriitilist koodi ja vajavad teste.

Mitte üheski etapis: ära puuduta leaflet-* klasse, documents-dropdown-- modifikaatoreid, teemafailide reegleid, mille baasklass on kasutusel, ega midagi `generated/`, `public/vendor/` kaustadest.

---

## Lisa (täiendus, 11.06): ametliku jscpd tulemused

jscpd õnnestus lõpuks kahel viisil: kasutaja Windowsi-käivituse JSON-raport (jscpd 5) + jscpd@4.2.5 minu sandboxis (puhas-JS versioon, mille kasutaja installis). Mõlemad kinnitavad samu mustreid.

**Kogupilt:** 1376 klooni, 17 427 dubleeritud rida (7,7% ridadest; 8,7% tokenitest), 886 failis. Jaotus: JavaScript 10 036 rida, CSS 5 175, JSX 3 592. Müra (vendor/coverage) raportis ei olnud.

**TOP failipaarid dubleeritud ridade järgi** (kõik üle kontrollitud, read viitavad jscpd raportile):

| Read | Kloone | Paar | Märkus |
|---|---|---|---|
| 607 | 62 | theme/hc.css (failisisene) | suurim CSS-rikkuja; nt 1595–1623 kordub 1633– ja 1646– plokkides; 1490–1514 ≈ 2001–2025 |
| 531 | 46 | OrbitalMenu.css (failisisene) | uus leid — nt 832–891 = 918–977 (60 rida); 505–528 = 623–646 |
| 394 | 33 | AnalyticsDashboard.jsx (failisisene) | kinnitab varasemat leidu |
| 351+323 | 17+15 | LeftRail ↔ RightRail (.jsx + .module.css) | kinnitab — kokku ~670 rida; tugevaim refaktorikandidaat |
| 321 | 13 | lib/help/offers.js ↔ requests.js | kinnitab — peegelkoopiad |
| 296 | 16 | lib/wellbeing/records.js (failisisene) | uus leid — iga create<Tool>RecordForUser kordab sama prisma.create plokki (170–196 ≈ 202–228 ≈ 234–260 ≈ 266–292…); generiline factory kaotaks ~300 rida |
| 248 | 8 | api/invites/route.js ↔ sponsored/init/route.js | kinnitab |
| 205 | 12 | chat-shell.css ↔ theme/hc.css | hc-ülekirjutused dubleerivad komponendifaili |
| 203 | 14 | lib/help/chatWorkflow.js ↔ workflowExtraction.js | kinnitab |
| 201 | 23 | glass.css (failisisene) | uus leid |
| 187 | 11 | lib/admin/rag/kov/service.js (failisisene) | kinnitab |
| 183 | 5 | documents-ui.shared.css ↔ theme/hc.css | uus leid — 81-realine plokk (660–740) on hc.css-is KAKS korda (1051–1117 ja 1518–1584) → kolmekordne koopia |
| 143 | 4 | supportDraftText.js ↔ supportDrafts.js | kinnitab |
| 134 | 10 | AccessibilityModal.jsx ↔ RegistreerimineBody.jsx | uus leid |
| 128 | 1 | api/admin/analytics/payment-alerts/dispatch ↔ summary | üksainus 128-realine järjestikune kloon (106–233 ↔ 456–583) — lihtsaim võit JS-poolel |
| 122 | 6 | api/documents/artifacts/generate ↔ artifacts/route.js | uus leid |
| 89 | 7 | UuendaEpostiBody.jsx ↔ UuendaPinBody.jsx | uus leid |

**Mõju punktile 3 (ühendatavad CSS-dubleerimised):** lisanduvad hc.css failisisesed plokid, OrbitalMenu.css sisemine kordus ja documents-ui.shared.css ploki kolmekordne koopia hc.css-is. Teemafailide (hc/mono/dark) failisisesed kordused on tüüpiliselt copy-paste teemaülekirjutused — neid saab koondada ühisteks selektorigruppideks, aga iga muudatus vajab visuaalset kontrolli hc-režiimis.

**Mõju punktile 6 (turvaline järjekord):** JS-poolel on lihtsaim esimene samm analytics dispatch↔summary 128-realise ploki ühine helper (üks kloon, selged piirid), seejärel records.js factory. CSS-poolel jääb soovitus samaks; hc.css koondamine on suurem eraldi ettevõtmine.

---

## Lisa (täiendus, 11.06): ametliku knip tulemused

Knip jooksis kasutaja Windowsi-masinas edukalt. Tulemused kinnitavad selle raporti järeldusi:

- **Kasutamata faile: 0** — kinnitab impordigraafi analüüsi.
- **Kasutamata dependency'sid: 0** (runtime). Ainus kasutamata devDependency knipi järgi on `jscpd` ise — sest ükski npm-skript seda ei viita. Lahendus: lisa skript nt `"dup:check": "jscpd . --pattern ..."` või knip.json ignoreDependencies'sse.
- **Kasutamata exporte: 91** — kattub minu 92-ga ~85% ulatuses. Mõlema tööriista union on lõplik nimekiri.

**Knipi uued leiud, mida mu skann ei tabanud:**

| Leid | Selgitus |
|---|---|
| lib/help/intents.js: HELP_CHAT_INTENTS | päriselt export-üleliigne; mu skann luges valesti kasutatuks, sest subscriptionGate.js-is on sarnane nimi FREE_HELP_CHAT_INTENTS (substring-kattuvus) |
| lib/materials/server.js:13: sanitizeTextFilename (re-export) | kõik tarbijad impordivad @/lib/documents/server kaudu; materials/server.js re-export on kasutuseta |
| lib/retention.js: PAYMENT_RETENTION_DAYS, PAYMENT_RAW_RETENTION_DAYS, LOG_RETENTION_DAYS | export-üleliigsed (kasutusel oma failis) |
| lib/rag/sourceMetadata.js: RAG_SOURCE_TYPE_SET | export-üleliigne |
| lib/serviceProviderProfiles.js:8: SERVICE_MAP_ENTRY_TYPES (re-export) | re-export kasutuseta |
| lib/wellbeing/supportDrafts.js + supportDraftText.js: WELLBEING_OUTPUT_TYPES, WELLBEING_RECIPIENT_TYPES | mõlemas failis export-üleliigsed — ühtlasi p 4 dubleerimise (supportDrafts ↔ supportDraftText) sümptom |
| Duplicate exports (3) | lib/prisma.js (prisma + default — kahjutu muster), lib/help/matches.js (createHelpMatchAndRoom = createHelpMatch alias), lib/admin/rag/sourcePackages/formsContactsAudit.js (buildFormsContactsAudit = buildJogevaFormsContactsAudit alias) — aliase-exportid, mille võiks ühtlustada |
| Unlisted binaries: systemctl (2 skripti) | serveripoolsed ingest-skriptid — OK, lisa soovi korral knip.json ignoreBinaries'sse |

**Vale häire, mida tasub teada:** knip märgib `runRetentionCleanup` (lib/retention.js:90) kasutamatuks. Funktsioon ise TÖÖTAB — seda kutsub samas failis `maybeRunRetentionCleanup` (rida 456), mida omakorda käivitavad chat-route'id (`runRetentionCleanup: true` optsioon routeServerUtils-is on sama nimega boolean, mitte see funktsioon). Üleliigne on ainult `export`-märge, mitte kood. Andmete kustutusrutiin EI ole katki.

**Parandus selle raporti p 4-s:** `isDirectPinLoginAllowed` (lib/auth/pin-login.js) oli ekslikult surnud-nimekirjas — see on kasutusel juurfailis auth.js:11,41, mida mu export-skann ei katnud. Knip seda õigesti ei märkinud. Surnud exporte on seega 13, mitte 14; ülejäänud 13 on juurfailide vastu üle kontrollitud ja jäävad jõusse.

**@playwright/test nüanss:** knip EI märgi seda kasutamatuks, sest npm-skript `test:e2e` viitab playwright-binaarile. Funktsionaalselt on see siiski surnud (repos pole ühtegi playwright.config'i ega *.spec faili) — soovitus p 5-s jääb kehtima.
