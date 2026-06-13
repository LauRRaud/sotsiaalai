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

### Faas 1 — `body[data-reduce-*]` surnud selektorid  [972f7d37]
Atribuut ainult `<html>`-l, mitte `<body>`-l. −27 rida 6 failis. 968/12.

### Faas 1 — 11 orvut @keyframes  [f0d5afc4, 1f6075e2, b99a2f51]
0 referentsi kõikjal. −211 rida animations.css + 4 teema/feature-faili. 968/12.

### Faas 1 — HC tooltip Block 3 `border:1.5px` + snapshot hover  [61c51331]
Block 2 `!important` võidab Block 3 normaalse. −1 rida. Snapshot hover try/catch. 968/12.

### Faas 1 — `.defer-fade` + `@keyframes dfade-in`  [0e52c29c]
0 JSX-referentsi. −35 rida (animations.css + hc.css). 968/12.

### Faas 1 — HC tooltip Block 1  [c6c0d387, 992fc096]
Block 2 sama selektor + `!important` → Block 1 alati surnud. −4 rida. 968/12.

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
