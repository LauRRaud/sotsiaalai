# CSS/Tailwind korrastus — progressi-logi (jätka-siit)

**Miks see fail repos on:** sessiooni-mälu (`.claude/…`) on **konto- ja masina-lokaalne** — uus konto / uus mudel ei näe seda ja alustaks nullist. See logi elab **repos** (commititud), nii et iga uus sessioon loeb selle + master-plaani + runbook'i ja **jätkab katkemata**.

**Konventsioon:** iga lõpetatud etapi järel lisa siia dateeritud kirje: commit-hash(id) + mis/miks + kuidas verifitseeritud. Hoia "PRAEGUNE SEIS / JÄRGMINE SAMM" ülal ajakohasena.

## Lugemisjärjekord uuele sessioonile
1. **See logi** — kus oleme, mis tehtud, mis järgmine.
2. `reports/css-tailwind-cleanup-plan.md` — master-plaan (põhiidee, juured, arhitektuur, faasid, tööriistad).
3. `reports/css-cleanup-runbook.md` — samm-sammuline snapshot-väravaga töövoog.
4. `reports/css-struktuuriplaan-2026-06-11.md` §7/§9 — detailne ajalugu + võla-roadmap.

---

## PRAEGUNE SEIS (15.06.2026)
- **Struktuurne restruktuur:** valmis (etapid 0–7 + 6a/b/c).
- **Rail-dedup + orbiit + surnud mask:** valmis (vt allpool).
- **PROD-CRASH PARANDATUD** — `OrbitStaticGlow` ise-rekursioon (`9e3b1cd9`) → /profiil OOM produktsioonis; fix `d3a92302`, deployitud `8cc8063b`. Vt allpool + `[[css-restructure-progress]]` HOIATUS.
- **Verifikatsiooni-infra:** snapshot + diff + matched-rules + **`css-effective-audit.mjs` (VALMIS & robustne)**. Vt allpool "Effective-audit tööriist".
- **AUTORITEETNE ARTEFAKT:** `reports/css-effective-audit/2026-06-13-authoritative.json` (37 route'i × 6 teemat × 4vp).
- **Faas 2 — dropdown viil:** VALMIS (`ff8390cd`). Järgmine: **button (~99 hajutus)**.
- **Faas 2 — button viilud 1.5–1.9:** VALMIS (15.06.2026). ghost/secondary = 0, mono mega-ahelad kustutatud. !important: 3769 → 3746 (−23). Järgmine: HC ahelad.
- **HC ahelad viilud 2.1–2.8 VALMIS (15.06.2026).** !important: 3769 → 3649 (−120 sessiooniga). Testid: 967/13.
- **CSS SAFE-LOOP süsteem ehitatud (15.06.2026).** `scripts/css-cleanup/` — ise-verifitseeruv ahel olemasoleva snapshot/page-report infra peal. **Loe esmalt: `scripts/css-cleanup/README.md`.** Komponendid: `targets-gen.mjs` (täielik katvus page-reportist → `css-snapshot.targets.generated.json`, 48 targetit), `worklist-gen.mjs` (võla-nimekiri failide kaupa, top = `theme/hc.css` 328), `run.mjs` (orkestraator: `before --file X` → muuda → `verify --file X [--auto-revert]`; gate1 snapshot-diff + gate2 npm test). `css-snapshot.mjs` täiendatud: `--all` (kõik instantsid) + `waitFor`-samm. **Kaks turvaluku:** (1) täielik katvus — vana 7-selektori target oli illusioon; (2) **ALATI headed** — headless ei renderda token/glass/canvas komponente õigesti, mõõdaks vale asja (before/after mõlemad valed → diff valeroheline). **LIVE-PoC + 2 ise-testi VALMIS (15.06.2026, auth-vabalt /hinnastusel):** tühi-jooks=🟢 identical, tahtlik regressioon=🔴 püütud kõigis teemades. **Flaky-parandus:** ise-test paljastas, et BorderGlow box-shadow emiteerib täiesti läbipaistvaid (`rgba(...,0)`) glow-kihte, mille geomeetria jitterib jooksude vahel → valepositiivsed. `css-snapshot-diff.mjs` ignoreerib nüüd läbipaistvaid varjukihte (nähtav kiht jääb; alpha>0 muutus püütakse ikka). **Fidelity-parandus (KRIITILINE, 15.06.2026):** kasutaja märkas, et mid-teema renderdus jäädvustamisel valesti (mono taust mid CSS-aktsentidega). Juur: app loeb teema TÕEALLIKAT `a11y_prefs` **küpsisest** (server `layout.js parseA11yPrefs` → React-kontekst + `BackgroundLayer`; klient `AccessibilityProvider.readPrefsFromCookie`). `css-snapshot.mjs` seadis ainult localStorage → CSS-klassid õiged, aga React/JS-joonistatud pinnad (taust, glow) jäid default "mono" peale. **Fix:** `applyTheme` seab nüüd ka `a11y_prefs` küpsise (`encodeURIComponent(JSON)`, sama kodeering nagu app `setCookie`). Visuaalselt kinnitatud (mid = pruun). + `captureTarget` austab nüüd `target.themes` (ignoreeris seda → jooksis kõik 6). **ÕPPETUND:** snapshot-tööriista teema/seisu seadmine peab matchima rakenduse PÄRIS-mehhanismi (küpsis+localStorage+server), mitte ainult ühte kihti. **Veel tegemata:** täis auth-jooks faithful capturega (kõik 48 targetit, vajab `SNAPSHOT_SESSION`) + reaalne viil-2.9 hc.css safe-loopiga.

## ⏳ POOLELI — järgmine: viil 2.9+ (15.06.2026)

**Viil 2.1 VALMIS [`f4f0a20b`]:** a11y-modal 3 redundantset HC ahelat kustutatud.
**Viil 2.2 VALMIS [`bf9b1e83`]:** login-modal ahel kitsendatud `.no-click-pulse`-le + `#login-modal` token blokk. OTP `<Button>` saab BG tokenist, PIN-klahvistik saab serva !important-reeglist.
**Viil 2.3 VALMIS [`76acf708`]:** chat-analysis HC ahel kärpitud minimumini — `border: 2px solid ...` + `backdrop-filter: none` (ainulaadne, glassPrimaryButtonToneClassName nullib border tokeni). Kustutatud 18 rida redundantset !important.
**Viil 2.4 VALMIS [`f06fd321`]:** `app/error.jsx` retry nupp migreeritud `<Button>` komponendile. 3-reaLine Tailwind duplikaat (baseStyles+primaryStyles koopia) eemaldatud.
**Viil 2.5 VALMIS [`055d1d15`]:** `glassPrimaryButtonToneClassName` border-nulli kitsendatud `.theme-light:not(.theme-mid)` kontekstile. HC teema saab nüüd 2px kollase piiri klaas-lehtedel läbi token kaskaadi (enam ei nullita üle).
**Viil 2.6 VALMIS [`8b1b017a`]:** `theme/hc.css` chat-analysis border-rida eemaldatud (token katab pärast viil 2.5). `features/chat/shell.css` 4-reegel (color+bg+border+shadow+::before+hover+active) → 1 reegel (ainult backdrop-filter). !important: 3676 → 3662 (−14). 967/13.
**Viil 2.7 VALMIS [`cf45cadb`]:** `theme/hc.css` vana HC mega-ahel (30 rida, `hc-control-bg !important` + `border-color !important`) KUSTUTATUD. Token-põhine ahel (259-306) katab samad elemendid ilma `!important`-ta; kontekstispetsiifilised reeglid kaitsevad erandeid. NB: Edit tööriist tekitas CRLF – parandatud `sed -i` ENNE commiti. !important: 3662 → 3654 (−8). 967/13.
**Viil 2.8 VALMIS [`29eabfe7`]:** `features/service-map/desktop.css` — kaks surnud `[data-variant="secondary"]` Button-ahelat kustutatud (JSX-is pole ühtegi `variant="secondary"` Button'it; kõik migreeritud → primary/danger viiludes 1.1-1.9). !important: 3654 → 3649 (−5). 967/13.

### Viil 2.9+ — järgmise sihiotsing (sessioonilõpp)

**Surnud selektor-kontrolli tulemused (15.06.2026):**
- `ghost` ja `secondary` [data-variant] selekoreid CSS-is = **null** (kõik kustutatud).
- `panel-surfaces.css` — VALE HINNANG logikirjes "peaaegu täielikult surnud". `ViewportLayoutSetter.jsx:33` seab `body.setAttribute("data-layout", "mobile")` → selektorid `html[data-layout="mobile"] body[data-layout="mobile"] ...` ON ELUSAD. Ära kustuta.
- `app/styles/base/a11y.css` — 1-reaLine kommentaarfail ("Moved to ../theme/hc.css"), 0 !important, pole imporditud. Triviaalne, ei mõjuta arvu.
- `components/chat-focus.css` ja `components/documents-mode.css` — auditeerimise "orphan" märge on ekslik. Testid loevad neid otse; `chat-focus.css` @impordib `features/chat/focus.css`; `documents-mode.css` on test-loader virtuaalbundle. Elusad.

**Järgmised realistlikud sihtmärgid:**
1. **hc.css subscription/materials/rooms ahel-grupp** (read ~475–600) — palju `color: var(--hc-accent) !important` ahelaid, kuid need on hetkel intentionaalsed (leheküljespetsiifilised HC tekstivärvid). Vaja analüüsi kas token katab.
2. **chat/hc.css** (207 !important) — kõrge risk (a11y-kriitiline), Opus-töö.
3. **Tokeniseerimine (Rada B viil 2.2+)**: `documents/ui.css` (110), `chat/themes.css` (93), `mid.css` (65) — suurim pikaajaline mõju, kuid vajab token-infrastruktuuri laiendust. Järjekord ja mall: `css-sonnet-execution-plan.md §viil 2.2+`.
4. **`base/a11y.css` kustutus** — triviaalne, 0 !important, aga puhtam.

**Eelmiste viilide lühikokkuvõte (1.5–1.9):**
- viil 1.5: `.invite-primary-btn` eemaldus mono/hc `:is()`-loendist + JSX
- viil 1.6: ikoon-close token + segmented VALMIS (`91185f3e`, `dcdbbec8`)
- viil 1.7 [`281adad9`]: MaterialsAdminSubmissionsPanel secondary→primary
- viil 1.8 [`c40af872`]: AgentModePage audio-toggle ghost→linkBrand
- viil 1.9 [`61c895eb`]: mono.css 4 button mega-ahelat KUSTUTATUD (Button.jsx+tokens katab ise)

**Otsus (kasutaja kinnitas 14.06):** migreeri allesjäänud `secondary`/`ghost` Button-kasutused → `primary` (või `linkBrand` ekspordile), SIIS kustuta teema-ahelad. Põhjus: mono ahel `:is(.button,.btn,[data-variant="primary"])` tabab `.button`-haru kaudu KÕIKI nuppe (ka ghost/secondary) ja sunnib neile `!important`-iga primary-välimuse — st mono's näevad praegu kõik nupud välja nagu primary klaaspill. See on **sihilik kaitse**: paljas ghost (`bg-rgba(255,255,255,0.04)`) on mono tumehallil peaaegu nähtamatu. Seega ahela lihtne kustutus EI ole identne — esmalt tuleb ghost/secondary platvormilt kaotada.

**Avastus: progress-logi väide "viilud 1.2–1.4 valmis" oli ÜLEOPTIMISTLIK** — secondary/ghost on veel alles:
1. `components/agent/AgentModePage.jsx:1890` — `variant={isSelected ? "primary" : "ghost"}` = päris VALITUD/valimata toggle. ⚠ Ghost annab siin visuaalse erinevuse; lihtne →primary kaotaks valitud-oleku eristuse. **Eriotsus vajalik** (kandidaat: valimata = `linkBrand`, või segmented/OptionCard archetype).
2. `components/materials/MaterialsAdminSubmissionsPanel.jsx:313,322` — `variant={isRagAdmin ? "primary" : "secondary"}`; non-rag-admin tee kasutab `.materials-surface-button` aliast (`materialsSecondaryButtonClassName`, fail rida 21). ⚠ `.materials-surface-button` on mono.css:191 plokis OMA `--btn-primary-*` token-treatment → topelt-stiilitud, vajab hoolt.
3. `app/admin/wellbeing/AdminWellbeingClient.jsx:237,254` (+332 submit) — `secondary` refresh/load nupud primary CSV kõrval → **lihtne →primary** (plaani siht).
4. `app/tooheaolu/piloot/WellbeingPilotClient.jsx:243,251,255` — refresh + print/xlsx (`as="a"`) secondary, primary CSV kõrval → **lihtne →primary** (CSV on juba primary, ühtlustamiseks kõik primary).

**Ahelate asukohad:**
- `app/styles/theme/mono.css` — 4 ahelat **KUSTUTATUD** viil 1.9 [`61c895eb`]. Button.jsx primaryStyles + tokens/theme-mono.css katavad. desktop.css service-map-toolbar__result-button on ise-stiilitud (own !important token vars).
- `app/styles/theme/hc.css` read **538, 543, 549, 553, 558, 562, 813, 827, 840** (+ chat-analysis 903+). HC = a11y-kriitiline, kontrasti-kontroll kohustuslik. OLULINE ERO: HC ahelad lisavad `border-color: rgba(255, 234, 0, 0.66)` kollast äärt — token `--btn-primary-border: 0 solid transparent` ei kata seda. Lahendus: kas (a) lisa HC tokenisse `--btn-primary-border: rgba(255,234,0,0.66)` kõikidele kontekstidele, või (b) migreeri scoped-kontekstid HC `--btn-primary-border` override'iga. Kontrastikontroll ENNE kustutust.

**NB nimekonventsioon (kasutaja selgitas 14.06):** `--forest-*` tokenid on **legacy roheka teema nimed** — mono on endine "forest"-teema, väärtused ümber kirjutatud hallskaalaks (`--forest-icon: rgba(230,230,230,0.96)` = hall). Nime EI pea muutma.

**Tehtud (15.06):** token kaskaad parandatud + 15 ahela-reeglit kustutatud (viil 2.0). Brauseris verifitseeritud.

**Järele jäänud hc.css töö:**
- `hc.css` login-modal + a11y-modal: VALMIS (viilud 2.1–2.2).
- Järgmine: `!important` arvu täpne mõõtmine + võimalikud teised hajutatud HC ahelad.
- Värav: `npm test` 967/13.

---

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

### LÕPP-SIHT (Definition of Done) — IGA primitiiv saab 2 asja
Faas 2 ja faas 4 tehakse **koos, ühe viiluna per primitiiv** (mitte eraldi globaalsete faasidena). Primitiiv on VALMIS ainult kui tal on MÕLEMAD:
1. **Oma kanooniline komponent** — üks React-komponent + variandid (nt `<Button variant>`, `<Dropdown>`), mida kõik kasutuskohad kasutavad. Null scattered duplikaat-CSS-peret.
2. **Oma värvi-/teema-tokenid** — komponendi juures ko-lokeeritud `var(--primitiiv-*)` + per-teema `:root.theme-Y { --primitiiv-*: … }`. MITTE `:not(.theme-Y)`-override-ahelad, MITTE pinna-`!important`. Teema "võidab" muutuja kaudu.

⇒ Iga viil viib ÜHE primitiivi täielikult lõpuni (komponent + tokenid + kustutatud override'd + snapshot-värav), enne kui järgmise juurde minna. Lõppseis: kõik primitiivid = komponent + token-teema; null hajutatud primitiiv-CSS; `!important`/`!`-arv kukub iga viiluga.

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

### Rada 1 viil 2.5 — glassPrimaryButtonToneClassName border-nulli kitsendus  [`055d1d15`]  (15.06.2026)
`components/ui/glassPageStyles.js`: kolm `[--btn-primary-border:0_solid_transparent]` juhtumatut ülekirjutust asendatud `.theme-light:not(.theme-mid)_&`-skoobitutega. Night/mono/mid ei muutu (neil on teema-tokenist border null). HC teema: `glassPrimaryButtonToneClassName` ei nullita enam border-tokenit → `tokens/theme-hc.css`-i `--btn-primary-border: 2px solid rgba(255,234,0,0.66)` jõuab kõigile klaas-lehe nuppudele. Testid: 967/13.

### Rada 1 viil 2.4 — error.jsx retry nupp → Button komponent  [`f06fd321`]  (15.06.2026)
`app/error.jsx`: `retryButtonClassName` (3 rida Tailwind) oli käsitsi kopeeritud `Button.jsx` `baseStyles + primaryStyles`. Asendatud `<Button type="button" onClick={...} className="max-[768px]:...">`. Mobile-mõõdu override säilinud className-s. Testid: 967/13.

### Rada 1 viil 2.3 — chat-analysis HC ahel minimumiks  [`76acf708`]  (15.06.2026)
`hc.css` read 806-828: 4 reeglit → 1 reegel. `glassPrimaryButtonToneClassName` nullib `--btn-primary-border` tokeni (override klassis endas), seega `border: 2px solid rgba(255,234,0,0.66) !important` on vältimatu. `backdrop-filter: none !important` ainulaadne (Button.jsx-s on backdrop-blur-[10px]). Kõik muu (color/bg/shadow/::before/hover/active) kaetud mega-ahelaga (read 1289-1317). −18 rida, −16 !important. Testid: 967/13.

### Rada 1 viil 2.2 — login-modal HC ahel .no-click-pulse-le + token blokk  [`bf9b1e83`]  (15.06.2026)
`hc.css`: `:is(.button,.btn,button[type="submit"],.no-click-pulse)` ahel asendatud kahega: (1) `html[data-contrast="hc"] #login-modal` token blokk (`--btn-primary-bg: rgba(9,14,24,0.74)`, hover/active/focus-shadow) — OTP `<Button>` saab BG tokenist; (2) `.no-click-pulse` eksplitsiitsed reeglid border-width/style/color + color. `@media (hover:none)` duplikaat eemaldatud. −3 selektorit, −6 !important deklaratsiooni. Testid: 967/13.

### Rada 1 viil 2.1 — a11y-modal redundantsed HC ahelad kustutatud  [`f4f0a20b`]  (15.06.2026)
`hc.css` read 1149-1163: kustutatud 3 `!important`-ahelat (base + hover + focus-visible) `.a11y-csp-scroll :is(.button, .btn, button[type="submit"], input[type="submit"])` kontekstis. `AccessibilityModal.jsx`-l on üks `<Button>`, mis saab kõik HC väärtused `--btn-primary-*` tokenite kaudu (token blokk read 1063-1090 hc.css-is). Testid: 967/13.

### Rada 1 viil 2.0 — HC token kaskaad fix + 4 ahela grupp kustutus  [`523426f8`]  (15.06.2026)
`tokens/theme-hc.css`: eemaldatud `:root:not(.theme-light):not(.theme-mid)` blokk — selle spetsiifilisus (0,3,0) blokeeri `html[data-contrast="hc"]` plokki (0,1,1), mistõttu `--btn-primary-border: 2px solid rgba(255,234,0,0.66)` ei jõudnud kunagi brauserini. Fix laseb HC plokil võita → kõik `<Button variant="primary">` saavad HC's kollase serva automaatselt. `hc.css`: kustutatud 15 ahela-reeglit 4 kontekstis (chat-analysis-overlay-card, drawer-chat-sidebar, subscription/materials-content, register/invite/update-pin/email/reset). Brauseris verifitseeritud (dev-server). −44 !important. npm test 967/13.

### Rada 1 viil 1.9 — mono.css 4 button mega-ahelat kustutatud  [`61c895eb`]  (15.06.2026)
`:is(.button, .btn, [data-variant="primary"]):not(...)` ahelad (baas + ::before + hover + hover::before) on redundantsed: `Button.jsx primaryStyles` + `tokens/theme-mono.css` katavad samad väärtused tokenite kaudu. `desktop.css service-map-toolbar__result-button` blokk on ise-stiilitud (own `!important` token vars). `monoThemeContracts.test.js` 2 assertiooni eemaldatud (kontrollisid ahela olemasolu). −23 !important. npm test 967/13.

### Rada 1 viil 1.8 — AgentModePage audio-toggle ghost→linkBrand  [`c40af872`]  (15.06.2026)
`AgentModePage.jsx:1890`: `variant={isSelected ? "primary" : "ghost"}` → `variant={isSelected ? "primary" : "linkBrand"}`. Valimata audio-allikas oli ghost (peaaegu nähtamatu heledal paneelil); linkBrand on nähtav aga mahajääv. npm test 967/13.

### Rada 1 viil 1.7 — MaterialsAdminSubmissionsPanel secondary→primary  [`281adad9`]  (15.06.2026)
"Margi üle vaadatuks" ja "Margi impordituks" kasutasid `variant="secondary"` (ghost) — selged CTA-d, muudetud `primary`. `.materials-surface-button` hook-klass jääb alles (suurus/vahede overrides + mono.css:191 token-blokk). npm test 967/13.

### Rada B viil 2.5 — hc teema token-blokid  [`bdf7f3dd`]  (14.06.2026)
`:root:not(.theme-light):not(.theme-mid) { ... }` (3 rida) ja `html[data-contrast="hc"] { ... }` (224 rida) — kokku 0 `!important` — liigutatud `theme/hc.css`-ist `tokens/theme-hc.css`-i. `hc.css`: 1992 → 1760 rida. Testilaadir uuendatud: `tokens/theme-hc.css` lisatud `hc.css` bundle'i. npm test 967/13.

### Rada B viil 2.4 — mono teema token-blokk  [`6c5dde29`]  (14.06.2026)
`:root.theme-mono:not([data-contrast="hc"]) { ... }` (250 rida, 0 `!important`) liigutatud `theme/mono.css`-ist `tokens/theme-mono.css`-i. `mono.css`: 780 → 530 rida. Testilaadir (`register-node-test-loader.mjs`) uuendatud: `tokens/theme-mono.css` lisatud `mono.css` bundle'i (ilma selleta kukkus `monoThemeContracts.test.js`). npm test 967/13.

### Rada B viil 2.3 — light + dark + night token-blokid  [`c9692901`]  (14.06.2026)
`:root.theme-light` (255 rida), `:root:not(.theme-light)` (56 rida), `:root.theme-night` (200 rida) — kõik 0 `!important` — liigutatud `tokens/theme-{light,dark,night}.css`-i. `light.css` 379→124, `dark.css` 367→311, `night.css` 274→73 rida. npm test 967/13.

### Rada B viil 2.2 — mid teema token-blokk  [`6eb27bca`]  (14.06.2026)
`:root.theme-mid { ... }` (246 rida, 0 `!important`) liigutatud `theme/mid.css`-ist `tokens/theme-mid.css`-i. `globals.css` laadib `tokens/` faili PÄRAST `theme/` faili — kaskaadi seis muutumatu. Kaks redundantset `--btn-primary-bg-hover/active` definitsiooni scoped `.button[data-variant="primary"]`-reeglist eemaldatud (samad väärtused on nüüd tokens/ plokis). `mid.css`: 629 → 381 rida. npm test 967/13.

### Rada 1 viil 1.6 — ikoon-archetype osaline + segmented  [`91185f3e`]  (14.06.2026)
**Segmented VALMIS:** `primarySegmentedButtonClassName.js` = puhas Tailwind, `--seg-*` tokeneid.
**Ikoon-close token VALMIS:** `--icon-btn-close-color: var(--brand-primary)` baasis + `#7a3a38` light + `var(--forest-title)` monos; `IconButton.jsx` tarbib. `chatDrawerCloseButtonStyles.js` + `ChatSourcesPanel.jsx` uuendatud: hardkodeeritud `#c57171`/`#7a3a38` → `var(--icon-btn-close-color)`. Tokeni ekvivalents matemaatiliselt identne → snapshot-muutus null.
**LAHTINE (vajab brauserit):** back-button `:is()`-ahelad (`mono.css` 48–80), chat-ikoon-btn `:is()`-ahelad (`chat/mono.css` 130–206), HC ikoon-btn ahelad (`chat/hc.css`, `hc.css`) — need katuvad osaliselt viil 1.5 Opus-tööga; teha koos Opusele üleantud hiigel-ahela-commitiga. npm test 967/13.

### Rada 1 viil 1.5 — invite-primary-btn eemaldus mono.css ahelatest + JSX  [`3def32aa`]  (14.06.2026)
`mono.css` + `chat/mono.css`: `.invite-primary-btn` eemaldatud `:is()`-loendist — redundantne alias, kõik kasutuskohad kandsid juba `[data-variant="primary"]`/`.button`. JSX: `ChatSidebar` (3 konstanti), `AgentModePage`, `WorkspaceFeaturePage`. Testid uuendatud. npm test 967/13.

### Rada 1 nupu-konsolidatsioon — viilud 1–5 + platvormi ghost/secondary puhastus  [689e4471 · 84877344 · b345cb42 · 1bacf204 · 0cb3d95e · eb4b64c5 · b210de30 · 1e75c9e4]  (14.06.2026)
**Mis:** kõik `variant="ghost"` ja `variant="secondary"` Button-kasutused üle platvormi → kanooniline kolmik:
- **tegevus-nupp** → `variant="primary"` (klaaspill + glow);
- **hävitav** (kustuta/eemalda) → `variant="danger"`;
- **tühista / tagasi / sulge + `as="a"` navigatsioonilingid** → `variant="linkBrand"`.

Migreeritud failid (viil 1.4/5): KovTable, CovisionPage (22×), WellbeingPage/RecoveryWorkflow/OverviewWorkflow/SupportRequestPanel, ChatComposer, DocumentsPage, ArtifactDetailPage, AgentModePage, JourneyDetail (+10 `as="a"`), JourneyDashboard, WorkspaceFeaturePage, RagAdminSourcePackagesScreen (lammutas ad-hoc `BUTTON_CLASS` → kanooniline `<Button>`). Admin-viilud 1/2/2b: KovSourceMonitor, RtRegistry, RagAdminDocuments/Ingest/OrganizationsView.

**KANOONILINE NUPP (kasutaja kinnitas 14.06, vt [[canonical-button-look]]):** õige nupk = `<Button variant="primary">` valkjas **klaaspill + pehme vari + glow-serv**, NÄIDIS = "Salvesta" nupp `/uuenda-pin` lehel. Adapteerub teemaga `--btn-primary-*` kaudu. Nähtavus hele-pinnal tuleb varjust+glow'st, MITTE värvilisest/hallist taustast.

**LÕKS (tehtud + tagasi võetud):** kui admin-nupud tundusid valgel kaardil nähtamatud, üritati `--btn-primary-bg`→hall + `--btn-primary-bg-hover`→brändi/amber + `glow={false}` + nav-tabid punaseks (`e03ecc40`). Kasutaja lükkas tagasi ("nupud läksid punaseks", "kaks edge-glow efekti"). **Tagasi võetud `4f56fa09`** → admin tegevus-nupud + nav-tabid taas puhas kanooniline. ÄRA korda: admin-nuppe ei tohi halliks/punaseks värvida ega glow'd keelata.

**Verifikatsioon:** Jest-suite hetkel pre-existing ESM-import-fail (sõltumatu, kontrollitud `git stash`-iga). Snapshot-värav button-viilude jaoks: need on className/JSX muutused (Tailwind), mitte CSS-faili muutused.



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

### Faas 2 — dropdown primitiiv  [ff8390cd]
Kanooniline komponent: `DocumentsDropdown.jsx` (olemasolev). Probleem: kõik `--documents-dropdown-*` tokenid olid skoopiline `.documents-workspace` — portaalsed menüüd (keha lapsed) ei pärinud neid.

**Muudatused:** `workspace.css` — lisatud `:root` + `:root.theme-{light,mid,night,mono}` + `[data-contrast="hc"]` tokeniplokid; `mono.css` — eemaldatud `!important` kõigilt visuaalsetelt reeglitelt (reas 80–113), eemaldatud workspace-skoopilist dropdowni tokenid (redundantsed — `:root.theme-mono` annab samad väärtused); `ui.css` — eemaldatud `.documents-dropdown-menu,` HC kombineeritud blokist; HC workspace-reeglid asendatud globaalsete `[data-contrast="hc"] .documents-dropdown-item` reeglitega, spetsiifilisus (0,2,0) > alus (0,1,0); `css-snapshot.targets.json` — lisatud 2 dropdowni sihtmärki.

**Valvurid:** snapshot-diff ✓ identical · npm test 968/12 · jscpd 109→109.

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

### ✅ LAHENDATUD (14.06.2026) — admin RAG nav-tabi VALITUD-olek [`a64cdbc0`]
**Sümptom:** valitud tab = peaaegu-valge pill + brändi-punane tekst puhas-valge admin-kaardi peal → madal kontrast.

**Juur:** heleda teema `--btn-primary-bg-hover` ≈ läbipaistev valge → `ragAdminShellNavClassName` konteiner ei defineerinud oma `--seg-button-bg-*` tokene → selected tab nähtamatu.

**Fix (1 rida):** `ragAdminShellNavClassName` saab `[--seg-button-bg-hover:rgba(122,58,56,0.07)] [--seg-button-bg-selected:rgba(122,58,56,0.13)]`. CSS-pärand viib need `primarySegmentedButtonClassName` → `--seg-card-bg-hover/selected` kaudu nav-link elementideni. Tekst jääb `--title-color` (#7a3a38 heleda teemas) — brändivärv tümpil taustal, kontrastne ja tahtlik.

**Verifikatsioon:** npm test 967/13 (muutumatu baseline).

### Üldised lõksud
- Dev-server sureb korduvatel reload'idel → kasuta production-buildi snapshot'imisel.
- matched-rules vajab auth-taga elementide jaoks tervet serverit + renderdatud elementi; asukoht = kompileeritud chunk (grep selektorit lähtekoodist).
- Committimata `lib/rag/*` WIP (teise konto, lõhub 2 testi) — MITTE puutuda.
- `safety_snapshots/` = tahtlik git-trackimata backup — MITTE kustutada.
- Baseline: `npm test` = 12 teadaolevat kukkumist (+ 2 RAG-WIP). Null UUT.
