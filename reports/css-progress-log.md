# CSS/Tailwind korrastus — progressi-logi (jätka-siit)

**Miks see fail repos on:** sessiooni-mälu (`.claude/…`) on **konto- ja masina-lokaalne** — uus konto / uus mudel ei näe seda ja alustaks nullist. See logi elab **repos** (commititud), nii et iga uus sessioon loeb selle + master-plaani + runbook'i ja **jätkab katkemata**.

**Konventsioon:** iga lõpetatud etapi järel lisa siia dateeritud kirje: commit-hash(id) + mis/miks + kuidas verifitseeritud. Hoia "PRAEGUNE SEIS / JÄRGMINE SAMM" ülal ajakohasena.

## Lugemisjärjekord uuele sessioonile
1. **See logi** — kus oleme, mis tehtud, mis järgmine.
2. `reports/css-tailwind-cleanup-plan.md` — master-plaan (põhiidee, juured, arhitektuur, faasid, tööriistad).
3. `reports/css-cleanup-runbook.md` — samm-sammuline snapshot-väravaga töövoog.
4. `reports/css-struktuuriplaan-2026-06-11.md` §7/§9 — detailne ajalugu + võla-roadmap.

---

## PRAEGUNE SEIS (13.06.2026)
- **Struktuurne restruktuur:** valmis (etapid 0–7 + 6a/b/c).
- **Rail-dedup + orbiit + surnud mask:** valmis (vt allpool).
- **Verifikatsiooni-infra (tööriistad):** valmis ja serveris — snapshot + diff + matched-rules. NB: `[role="tooltip"]` on `null` tühja testikonto kontekstis. `rail-back-hover` nüüd try/catch + `force:true` (ei krahhita enam timeoutist). Targets töötavad.
- **Faas 1 (surnud kood):** käimas — Block 1 + Block 3 border + defer-fade eemaldatud (vt allpool). css:audit = 26 notSeen (kõik false positives/a11y).

## JÄRGMINE SAMM
**Faas 1 surnud kood jätkub.** Praegune seis: −240+ rida selles sessioonis. Järgmised suunad:
- **Veel `body[data-*]` kandideate?** data-platform, data-theme-switching, data-initial-page — kontrollida kas need seatakse ainult html-l vm ka body-l.
- **`-webkit-backface-visibility` (12 tk)** — `backface-visibility` on standard alates 2013, webkit prefix dead. Iga juhum vajab konteksti-kontrovertsi.
- **`glass-policy-back` `:not()`-ahelates** (hc.css, mono.css): keeruline, madal prioriteet.
- **Nupu-konsolideerimine** = järgmine suurem samm (faas 2, kõrgem risk).

---

## Tehtud (krooniline)

### Faas 1 — surnud `body[data-reduce-*]` selektorid 6 failis  [972f7d37]
`data-reduce-motion` ja `data-reduce-transparency` seatakse ainult `<html>`-l (AccessibilityProvider + layout init script). `<body>`-l mitte kunagi. Eemaldati kõik `body[data-reduce-motion]` + `body[data-reduce-transparency]` selektorid: core.css (9 selektor-rida), backgrounds.css (2), chat/shell.css (3), profile/mobile.css (3), glass-subpage.css (1), WorkspacePanel.module.css (1). Kokku −27 rida. Testid: 968/12 baseline.

### Faas 1 — orvud @keyframes animatsioonifailides  [61c51331 → b99a2f51 + f0d5afc4 + 1f6075e2]
`@-webkit-keyframes indicator` + `@keyframes indicator` (animations.css, −28 rida): null referentse. 7 orvust @keyframes animations.css-ist (cardBlurIntro, chat-sources-pulse, skel, topnav-toggle-pulse, chat-enter-clear, pinAltZeroFade, pinAltClearFade, −115 rida). 4 orvust @keyframes teema/feature-failides (home-logo-shine-fade-mobile, profile-orbit-mobile-hub-pulse, profile-orbit-hub-mobile-pulse, hc-orbit-glow-pulse, −68 rida). Kokku −211 rida.

### Faas 1 — HC tooltip Block 3 surnud `border: 1.5px` + snapshot hover fix  [61c51331]
`components/chat/rail.module.css` Block 3 (read 252): `border: 1.5px solid var(--hc-accent, #ffea00)` eemaldatud. Block 2 (sama selektor, spetsiifilisus 0,2,0) on `border: 2px solid !important` — alati võidab normaale. Kaskaadi-tõend deterministlik. Lisaks: `css-snapshot.mjs` hover-samm nüüd try/catch (timeoutist mitte krahhita) + `force:true` tugi. `css-snapshot.targets.json` uuendatud. Testid: 968 pass, 12 fail (baseline, 0 uut).

### Faas 1 — .defer-fade + @keyframes dfade-in (surnud kood)  [0e52c29c]
`app/styles/base/animations.css` `.defer-fade` klass (12 rida) + `@keyframes dfade-in` (16 rida) eemaldatud. `app/styles/theme/hc.css` reduce-motion valvur (6 rida) eemaldatud. Kokku −35 rida. Verifikatsioon: grep 0 osumeid JSX/HTML-is; testid 12/12 baseline. Kaskaad-ohutu (ükski element ei vastanud selektorile).

### Faas 1 — HC tooltip Block 1 (surnud kood)  [c6c0d387, 992fc096]
`components/chat/rail.module.css` HC tooltip Block 1 eemaldatud: `html[data-contrast="hc"] .tooltip { border: 2px solid var(--rail-tooltip-border,...); background-clip: padding-box; }` — 100% surnud kood, mida Block 2 (sama selektor, !important) alati üle kirjutas. Testid: 12 baseline, 0 uut. Kaskaadi-analüüs deterministlik (snapshot-element null tühja konto kontekstis — vt JÄRGMINE SAMM). Paigaldati Playwright browserid serverile; genereeriti tmp-create-login-token.mjs serverile.

### Etapp 6c — kaskaadi-konsolideerimine (night)  [5b6485ef, c345cf40, 344fc51d]
dark.css `:not()`-ahela baidi-identsed night-koopiad konsolideeritud: login-otp ×3 (dup 1388→1381), framework-page-shell. Testid = 12 baseline; brauseris arvutatud stiilid identsed. dark.css `:not()`-ahel ammendatud baidi-identsete osas.

### LeftRail ↔ RightRail jagatud moodul (composes)  [ee049156, 9670cfc4, 85783459, 8854718f, 1549c158]
Loodud `components/chat/rail.module.css`; kõik küljest sõltumatu (slot/item/iconBtn/ikoonid/tooltip + kõik teema-variandid + konteiner + modal-open) jagatud CSS-mooduli `composes` kaudu (esimene composes repos — TÖÖTAB). jscpd rail-dup **249 → 9 rida**. Kõik 34 rail/orbiit kontraktitesti läbivad. Side-spetsiifiline jääb lokaalseks. **Tagasinupu tooltip-summutus = eelnev JSX-disain, mitte CSS.**

### OrbitalMenu  [9e3b1cd9]
CSS oli juba puhas (css:audit 0 kasutamata 42-st, 0 CSS-klooni). "531 dup" = fantoom (vs safety_snapshots backup). JSX-render-dup ekstraheeritud: `ORBIT_GLOW_BTN_CLASS` + `OrbitStaticGlow`.

### CenteredScrollPicker surnud scroll-mask  [c56715f3]
~30-realine gradient mask-image oli `mask-image:none !important`-iga välja lülitatud (surnud); kustutatud (−55 rida). `none`-valvur (testiga jõustatud) jäeti. **Õppetund:** `none !important` on tihti tahtlik VALVUR; surnud on see, mida ta üle kirjutab.

### Verifikatsiooni-tööriistad + plaanid  [c0d8adc5 … 666b8d7d]
- `scripts/css-snapshot.mjs` — Playwright golden-master (computed styles × 6 teemat × vaateavad; teema läbi PÄRIS mehhanismi; steps; liikumise-külmutus; helded-lõplikud timeout'id; `--keep-open`). Valideeritud (rail-ikooni stroke vastab päris teemavärvidele).
- `scripts/css-snapshot-diff.mjs` — before/after diff (identne = ohutu).
- `scripts/css-matched-rules.mjs` — CDP matched-rules inventuur (per selektor kõik reeglid + `[N/6 states]`). Valideeritud `body`-l.
- `reports/css-tailwind-cleanup-plan.md` (master), `css-cleanup-runbook.md`, `css-struktuuriplaan §9`.

## Avatud küsimused / teadaolevad lõksud
- Dev-server sureb korduvatel reload'idel → kasuta production-buildi snapshot'imisel.
- matched-rules vajab auth-taga elementide jaoks tervet serverit + renderdatud elementi; asukoht = kompileeritud chunk (grep selektorit lähtekoodist).
- Committimata `lib/rag/*` WIP (teise konto, lõhub 2 testi) — MITTE puutuda.
- `safety_snapshots/` = tahtlik git-trackimata backup — MITTE kustutada.
- Baseline: `npm test` = 12 teadaolevat kukkumist (+ 2 RAG-WIP). Null UUT.
