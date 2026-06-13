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
- **PROD-CRASH PARANDATUD** — `OrbitStaticGlow` ise-rekursioon (`9e3b1cd9`) → /profiil OOM produktsioonis; fix `d3a92302`, deployitud `8cc8063b`. Vt allpool + `[[css-restructure-progress]]` HOIATUS.
- **Verifikatsiooni-infra:** snapshot + diff + matched-rules + **`css-effective-audit.mjs` (VALMIS & robustne)** — per-leht × 6 teemat × 4vp efektiivne kate, FP-fix + android + known-FP välistus + 2b mount-states + state-tested fix + 4 plain komponendi-CSS katvus. Vt allpool "Effective-audit tööriist".
- **AUTORITEETNE ARTEFAKT:** `reports/css-effective-audit/2026-06-13-authoritative.json` (37 route'i × 6 teemat × 4vp, üks jooks) — **1232 dead / 64 state-no-op / 36 kept-dynamic / 0 high-confidence**. 0 high-confidence = ristvalideeritud lihtsad võidud AMMENDATUD. Universe 3530 selektorit / 69 faili.
- **Faas 1 (surnud kood):** lihtsad võidud tehtud (skip-link + varasem). Jääk = JS-oleku-taga + teema-variant kandidaadid (case-by-case snapshot). **Faas 2 (konsolideerimine) on nüüd Sonneti põhitöö** — vt JÄRGMINE SAMM.

## JÄRGMINE SAMM (kaks rada)

### Rada A — Effective-audit tööriista lõpetamine (üleantav ülesanne)
Tööriist `scripts/css-effective-audit.mjs` TÖÖTAB (täis-crawl robustne), aga toor-väljund on **kandidaadid teadaolevate false-positive ämbritega**, MITTE kustutus-nimekiri. Järjekord (mu soovitus):
1. ~~**skip-link otsus**~~ **TEHTUD** — `.skip-link` (hc.css:3-26) oli surnud (0 markup), kustutatud `4fd78a99`. Test 968/12 (null uut). PÄRIS a11y-lünk (puudub WCAG 2.4.1 skip-to-content link) eraldi flag'itud — ei kuulu CSS-võla alla.
2. **False-positive vähendus** (puhtam signaal): (a) android-pass `a8174e35`; (c) `:has/:not` `a8174e35`; **(uus) known-FP välistuskiht** `scripts/css-effective-audit.ignore.json` `4fd78a99` → 36 püsi-FP (33 Leaflet runtime + 3 documents-dropdown template-literal) diverteeritud `keptDynamic` ämbrisse, EI ole enam dead. **(b) JS-mountitud olekud + (d) dünaamilised route'd = JÄRGMINE TÖÖ** (2b, vt all). NB: handoffi väide "service-map 263 = Leaflet" oli VALE — ainult 33 on Leaflet; ülejäänud ~196 `.service-profile-*` on JS-oleku-taga (2b), MITTE müra.
3. **4-vaateava autoriteetne jooks** — TEHTUD. `2026-06-13-4vp-fpfix.json` (26 lehte) + `2026-06-13-tooheaolu.json` (12 lehte) → merge-skript `css-effective-audit-merge.mjs` → `2026-06-13-merged.json`: **929 dead / 44 state-no-op / 36 kept-dynamic** (38 route'i). Edaspidi EI vaja täis-crawl'i: jooksuta subset + merge.
4. ~~**2b — trigerda JS-mountitud olekud**~~ **TEHTUD** `a37c50da` (mount-states pass, ainult ARIA-popup'id → ohutu) + `de974d2d` (state-tested fix: state-no-op ainult behaviour-passi testitud reeglitele). Tooheaolu lehed +200..230 selektorit/leht popup'idest. Jääk-piir: orbit-open (`/profiil`) pole ARIA-popup → 79 OrbitalMenu dead vajab bespoke orbit-trigerdust (madal prioriteet).
5. **TÖÖRIIST VALMIS — edasi faas 2 (konsolideerimine).** Vt allpool "Faas 2 — primitiivi-inventuur".

### Faas 2 — primitiivi-inventuur (ANDMEPÕHINE töönimekiri)
`npm run css:primitives` (`scripts/css-primitive-scatter.mjs`) — loendab iga klassi file-spread'i (mitmes failis esineb = hajutus = konsolideerimis-võlg). **Mitte intuitsioon — andmed.** Hajutus failide kaupa:

| Primitiiv | file-spread | Kanooniline komponent |
|---|---|---|
| **button** (btn 58 + button 41) | ~99 | ✅ `components/ui/Button.jsx` |
| **modal** | 98 | osaliselt |
| **panel** | 83 | — |
| **card** | 39 | — |
| **input/field** | 32 | — |
| **menu** | 24 | — |
| **dropdown** | 14 | `DocumentsDropdown.jsx` |

**VÄLISTA inventuurist (pole faas-2 primitiivid):** `.theme-light/mid/night/mono` (teema-juured = faas 4), `.homepage-root`/`.chat-page-shell`/`.profile-container` (lehe-shellid), `.is-active` (olek-klass), `.glass-ring/box/subpage-surface` (klaaspinna-süsteem = oma konsolideerimine).

**Soovitatud järjekord:** dropdown (14, väike → ÕPI töövoog) → **button (~99, suurim väärtus + komponent olemas)** → modal → panel → card.

### Faas 2 viilu-runbook (iga primitiivi kohta)
1. `css-matched-rules` AVATUD primitiivilt (vajadusel `--headed`/`steps` et olek lahti) × 6 teemat → näe võitev stiil per teema (`[N/6 states]`)
2. Vali/loo kanooniline komponent (button → `<Button>` olemas)
3. Kirjuta CSS komponendi juurde **teema-tokenitega** (`var(--x)` + `:root.theme-Y { --x: … }`), MITTE `:not(.theme-Y)`-ahel
4. Migreeri kõik pere-variandid kanoonilisele
5. Kustuta hajutatud feature+teema override'd
6. **Snapshot-värav:** `css-snapshot` before/after → `✓ identical` = commit. + `npm test` 968/12. LF mitte CRLF. Üks viil = üks commit.

### Rada B — Faas 1 surnud kood jätkub
- **`panel-surfaces.css` peaaegu täielikult surnud** — selektorid `html[data-layout="mobile"] body[data-layout="mobile"]` kujul; `body` ei saa `data-layout` kunagi. (a) kustuta surnud reeglid (käitumine ei muutu) VÕI (b) paranda `html[data-layout="mobile"] .class` (KÄITUMISMUUTUS, snapshot). Soovituslik (a).
- **`glass-policy-back` `:not()`-ahelates** (hc.css, mono.css): madal prioriteet.
- **Nupu-konsolideerimine** = faas 2, kõrgem risk.
- **Dropdown / select KOMPONENDI-konsolideerimine** = faas 2, kõrge väärtus (Juur-B näidisjuht). Sama UI-primitiiv on **≥5 eraldi CSS-dropdown-peret**, kuigi React-komponent on ainult ÜKS (`components/documents/DocumentsDropdown.jsx`): `documents-dropdown` (stiilitud **8 failis** — `features/documents/{agent,library,mobile,mono,ui}.css` + `features/service-map/desktop.css` + `theme/{hc,mono}.css` = klassikaline scattered theme-override), `documents-agent-dropdown`, `pre-inquiry-dropdown`, `service-profile-glow-dropdown`, `workspace-feature-dropdown`. **Plaan:** tee üks kanooniline `<Dropdown>`/`<Select>` komponent ko-lokeeritud teema-tokenitega → migreeri 5 peret sellele → kustuta scattered feature+theme override'd → snapshot-värav. NB: dropdown-olek (`is-open`) on JS-taga → vajab **2b olekute-passi** et audit võitvat stiili näeks (sama eeltingimus kui chat-viilul).
- **Töölaua paneel-route'd** (tuleviku UX-töö, madal prioriteet) — Abisoovid, Abipakkumised ja Lisa inimene avanevad `/vestlus` sees paneelina (event/query-param), neil puudub eraldi URL. Kõik ülejäänud Töölaua nupud on päris lehed. Ühildamine = UX + arhitektuur-töö (`WorkspacePanel.jsx` → eraldi `/abisoovid`, `/abipakkumised`, invite-page). **Ei blokeeri CSS-auditit** — nende CSS jõuab `/vestlus` crawli kaudu sisse. Teha alles pärast Juur-B `vestlus/` vertikaal-viilu.

---

## Tehtud (krooniline)

### PROD-CRASH — OrbitStaticGlow ise-rekursioon  [d3a92302, deploy 8cc8063b]
`9e3b1cd9` OrbitalMenu-refaktor lõi `const OrbitStaticGlow = () => (<OrbitStaticGlow/>)` = komponent renderdab iseennast → lõputu rekursioon → render-protsessi OOM ("Aw Snap") IGAL /profiil külastusel produktsioonis. Lokaalne vana build (enne `9e3b1cd9`) töötas → segadus. Fix: taastatud `<span className="profile-orbit-static-glow">`. **Diagnoosi võti:** prod jooksis uuemat commitit kui lokaalne build; `git log` deployitud commit + serveri `OrbitStaticGlow` grep. **ÕPPETUND:** JSX-render-dup ekstraheerimine vajab BRAUSERI-renderdust kinnituseks — kontraktitestid ei püüa. Tööriist `scripts/profiil-mem-probe.mjs` (CDP `Performance.getMetrics` üle aja → Nodes/heap kasv = render-loop).

### Effective-audit tööriist  [committed 8cc8063b + 684b5f3a; VIEWPORTS-fix committimata]
**Mis:** `scripts/css-effective-audit.mjs` (+ `css-effective-audit.routes.json`, `npm run css:effective`). Crawlib iga lehe × 6 teemat × N vaateava ja küsib RENDERDATUD DOM-ilt 2 asja mida staatiline `css:audit` ega per-selektor `matched-rules` ei suuda: **(1) olemasolu** — kas selle reegli element üldse renderdub kuskil (querySelector base-selektoriga, dünaamilised pseudod riba'tud); **(2) käitumine** — kas oleku-reegli (`:hover/:focus/:active`) sundimine (`CDP forcePseudoState`) tegelikult muudab arvutatud stiili. Mõõdab EFEKTIIVSET renderit (võitev stiil = spec), MITTE bundle-coverage'i. Ristkontroll staatilise `css:audit`-iga (klass-token-allikas) → high-confidence = mõlemad nõus.

**Seis:** täis-crawl 26 lehte (login E2E-tokeniga) ROBUSTNE — kõik 200, ükski ei crashinud. `/teekond` + `/rooms` kaotasid `light`-teema (5/6, navigeerivad laadimisel; per-teema try/catch käsitles). Raport: `reports/css-effective-audit/2026-06-13-full.json` (+ `.md`). Tulemus (2-vp): 1293 dead-element / 74 state-no-op / 6 high-confidence.

**KRIITILINE — toor-arvud POLE kustutus-nimekiri**, vaid kandidaadid teadaolevate false-positive ämbritega:
- **android-gated 68** — vajab `data-platform="android"` pass (crawl ei sea)
- **Leaflet (service-map 263)** — runtime JS-klassid
- **JS-mountitud olekud** (modaalid/vea/tühi) — ei trigerdatud
- **dünaamilised route'd** (`[id]`, admin/*) — ei külastatud
- **`:has(descendant:focus-within)`** — käitumis-pass sunnib pseudo VALELE elemendile (olek descendant'il `:has()` sees) → **false state-no-op** (chat/shell.css klaster). TÖÖRIISTA PIIR.
- **2-vp breakpoint-auk** — kombineeritud desktop-vahemikud (`min-width:769 and max-width:1440`) ei käivitu 390 ega 1920 juures → false dead. VIEWPORTS uuendatud `{390,1024,1440,1920}` (committimata), 4-vp jooks parandaks.

**Verifitseeritud näide (verify-samm):** 6 high-confidence'ist → `.skip-link` ×3 = PÄRIS (markup'ist puudub), `.documents-dropdown--align-*` ×3 = FALSE (dünaamiline `--align-${align}`, DocumentsDropdown.jsx:129).

**Käitamine:** vajab kohalikku prod-serverit (`next start`) + login (`scripts/tmp-create-login-token.mjs`, E2E-konto `e2e.call.owner@sotsiaal.ai`). **`reducedMotion:reduce` on KOHUSTUSLIK** (kontekstis juba) — muidu raske animeeritud taust crashib headless-renderi. `--max-state-els N` piirab elemente/reegel. LF mitte CRLF.

### Faas 1 — `body[data-reduce-*]` surnud selektorid  [972f7d37]
Atribuut ainult `<html>`-l, mitte `<body>`-l. −27 rida 6 failis. 968/12.

### Faas 1 — 11 orvut @keyframes  [f0d5afc4, 1f6075e2, b99a2f51]
0 referentsi kõikjal. −211 rida animations.css + 4 teema/feature-faili. 968/12.

### Faas 1 — HC tooltip Block 3 `border:1.5px` + snapshot hover  [61c51331]
Block 2 `!important` võidab Block 3 normaalse. −1 rida. Snapshot hover try/catch. 968/12.

### Faas 1 — `.defer-fade` + `@keyframes dfade-in`  [0e52c29c]
0 JSX-referentsi. −35 rida (animations.css + hc.css). 968/12.

### Faas 1 — `body[data-layout]` + `-webkit-backface-visibility`  [c292ddb1]
`data-layout` seatakse ainult `html`-l (mitte `body`-l) → 6 surnud `body[data-layout="mobile"]` osa foundations.css komma-listidest eemaldatud. 12× `-webkit-backface-visibility` eemaldatud (kõik olid paaritud standardse `backface-visibility`-ga). HC `materials-page-shell` 2 plokki (r315+870) liidetud üheks (muutujad ei kattu). Test uuendatud. 968/12.

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
