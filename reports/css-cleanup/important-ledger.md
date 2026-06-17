# `!important` vähendamise REGISTER (jälg: mis tehtud / mis jäänud)

**Miks:** et üheski sessioonis/kontol ei tekiks segadust, mis on tehtud ja mis tegemata.
See fail elab repos (kandub kontovahetust üle). Uuenda iga partii järel.
Meetod + reeglid: [css-important-reduction-method.md](../css-important-reduction-method.md).
Kaustade restruktuuri-plaan (sessioon 8): [css-styles-restructure-plan.md](../css-styles-restructure-plan.md).

## ⚠⚠ SESSIOON 8 LEID — KAMPAANIA SKOOP OLI PIME 804 `!important`-ile (2026-06-16)

**Kogu prior "3642 → 1208 (−74%)" mõõdik luges AINULT `app/styles`-i (87 faili). TÕELINE TOTAL = 2013.**
- `app/styles/**` (globaalne kaskaad): **1209** ← kampaania jälgis ainult seda
- ko-lokeeritud `components/**/*.module.css` + paar `.css` (~13 faili): **804** ← KUNAGI AUDITEERIMATA
- Tipud: `CovisionPage.module.css` 169, `chat/WorkspacePanel.module.css` 163, `OrbitalMenu.css` 155,
  `WellbeingPage.module.css` 92, `chat/RightRail`+`LeftRail` 130, `ui/BorderGlow.module.css` 62.
- **Profiil = sama pinna-sõda** (background 70, box-shadow 64, color 44, opacity 43) — MITTE skoobitud cargo-cult.
- **Anti-muster:** CovisionPage 169-st on **72 `:global(...)`** + 16 teema-override't → moodul lekib globaalsesse
  skoopi, taasloob kaskaadi-sõja mooduli-failis. St suur osa 804-st on load-bearing-laadne `:global` sõda, mitte vaba.

**Kaks JUURT (kinnitatud kaskaadi-kihi reegliga):**
- **Root B = CSS-vs-CSS teema-sõda (2013 `!important`)** — kihistamata käsitsi-CSS võidab Tailwindi niikuinii;
  `!important` võitleb TEISTE teema-failide vastu. EI ole Tailwindi pärast.
- **Root A = Tailwind-sõda elab JSX-is: ~480 Tailwind-`!` modifikaatorit** üle 42 `.jsx/.tsx` faili. MITTE `.css`-is.
- ⇒ **Vastus "kas Tailwind-sõda on CSS-is": EI.** CSS `!important` = teema-kaskaad; Tailwind-sõda = JSX-`!`.

**Edasi (vt restruktuuri-plaan):** (1) sulata `mobile/` → features (kaotab override-kihi); (2) ühenda token-failid;
(3) auditeeri 804 ko-lokeeritut (pime nurk); (4) struktuurne lõppmäng = CSS-moodulite skoopimine + `:global` koristus
→ kaskaadi-sõjad kaovad → `!important` langeb kõrvalsaadusena.

**✅ B1 DEMO (2026-06-16, kasutaja andis SNAPSHOT_SESSION + e2e-konto):** auth-taga audit AVATUD.
Resolver `.covision-glow-field` peal /kovisioon'il: **3-poolne IMPORTANT-WAR** — `ui-glow.css .ui-glow-field`
gradient võidab enamikus teemades, `CovisionPage.module.css var(--covision-field-bg)` võidab HC-s; **15 removal-
kandidaati** (surnud), neist mitu CovisionPage enda `!important` (hc-field-bg/none duplikaadid). Kinnitab:
ko-lokeeritud 804 = SAMA profiil kui app/styles (WAR + surnud droppable), `:global`-reeglid võistlevad ui-glow'ga
(moodul pole isoleeritud). Auth: `tmp-create-login-token.mjs` (e2e.call.owner) VÕI SNAPSHOT_SESSION cookie →
`css-important-overrides.mjs --route <auth-route> --token/SNAPSHOT_SESSION`. Edasi = per-fail B1 audit fokusseeritud sessioonis.

**✅ B1 STRIPID CovisionPage'il (`b03d03f7` + `808b1b59`): 169 → 163 (−6).**
- `b03d03f7`: `.page width/max-width: 100vw !important` → redundantne (Tailwind `.w-full/.w-screen/.max-w-[…]` ainsad konkurendid).
- `808b1b59`: `.surface margin-left/right: auto + justify-self/align-self: center !important` → redundantne (`.surface` kannab
  Tailwind `mx-auto`; moodul võidab niikuinii). `.surface` width/height (workspace-glass geomeetria) JÄETI (kontrakt vs glass-subpage shell).
Gate (covision, /kovisioon, e2e, noise-floor lahutatud): GATE-1 ✓ identical (kõik selektorid × 6 teemat × 390/1920), GATE-2 0 uut.

### SESSIOON 8 lisa — AUTOMATISEERIMINE: `scripts/css-cleanup/auto-loop.mjs` (`73a7a94e`)
Orkestraator, et `!important`-sweep ei käiks ükshaaval: per fail baseline+noise → resolver-audit → konservatiivne autostrip → gate → revert-kui-punane. Üks käsk/fail.
**⚠ KRIITILINE ÕPPETUND (parandab ka KÄSITSI-meetodit):**
- `npm test` **exit-koodi EI saa usaldada** — projektil on püsiv baseline-kukkujate hulk (case-tasemel **14**, file-tasemel 11) → exit alati punane.
- **Kukkuvate-FAILIDE võrdlus (`comm -13` failidel) on PUUDULIK** — strip võib lõhkuda VÄRSKE assert'i juba-kukkuvas failis (failihulk ei muutu). Tõestatud: shell.css `inline-grid !important` strip → file-set 0 uut, AGA `hcSurfaceContracts:47` grep'ib seda markerit.
- **ÕIGE GATE-2 = kukkuvate test-CASE-nimede hulga diff** baseline'i vastu (`reports/css-cleanup/state/test-case-baseline.txt`, 14 juhtumit). Ainult päris-uus juhtum = punane. auto-loop teeb seda nüüd; **edaspidi käsitsi ka case-tasemel, mitte file-tasemel.**
- **Allesjääv lünk:** case-gate ei näe markerit, mida juba-kukkuv kontrakt grep'ib (juhtum on punane niikuinii). Enne `--commit`: `grep tests/` selektorit; kui kontrakt viitab, jäta (nt shell.css inline-grid jäeti).
- Piirang: gate animatsiooni-pime (ära auto-stripi box-shadow/transition glow-pindadel); vajab nähtavaid selektoreid route'il.

### SESSIOON 8 lisa — AUTONOOMNE JOOKS (kasutaja magas, "vähenda + restruktureeri")
**`!important`-korje:** `sweep.mjs` 3 avalikul global-failil (home/desktop, glass-subpage, register; layout-propid) → **0 strippi** ("nothing droppable"). **Kinnitab empiiriliselt: ohutu autonoomne `!important`-fraktsioon on AMMENDUNUD** (avalikud failid load-bearing; auth/flow-failid autonoomselt ebausaldusväärsed — auth-expiry → 0 strip = ohutu aga tühi). Senised sessioon-8 võidud: documents/mono 6→0, mid-button 4→3, covision .page/.surface 169→163, shell chat-send-glyph 59→56. Kogu app/styles ~1209 → ~1200; ko-lokeeritud 804 enamjaolt puutumata (auth/flow-gate).
**RESTRUKTUUR: ✅ token-failide konsolideerimine (A1, `dcc2aac0`)** — vt restruktuuri-plaan §Faas A. 6 faili −. Gate roheline (staatilised route'id).
**Aus piir (ei riskinud magades):** edasine restruktuur (theme/ rename, mobile-fold, tokens.css/base.css merge) on **loader-coupled** (`register-node-test-loader.mjs` kodeerib `theme/hc.css`/`mono.css` + `components/documents-mode.css` teed) → vajab koordineeritud loader-muudatusi + inim-üle-vaatust. Token-migratsioon (override→token) = kaskaadi-risk. Neid EI tehtud autonoomselt.
- **KORDUV B1-MUSTER (oluline):** moodul-CSS layout-`!important`, mis võistleb AINULT Tailwind-utiliitidega
  (`.w-full`/`.w-screen`/`.max-w-[…]`, kõik non-important), on **REDUNDANTNE** — kihistamata moodul võidab kihistatud
  Tailwindi niikuinii (kaskaadi-kihi reegel). Resolver lipustab need "IMPORTANT-WAR" (sama-spec Tailwind), AGA see on
  vale-lipp; gate tõestab redundantsuse. Sama muster tõen. üle paljude moodul-failide (width/max-width/position/inset
  `!important` Tailwindi ületamiseks). **See on 804 puhtaim fraktsioon.**
- **⚠ KONTRAKT-LUKK leitud:** sama `.page` `justify-content/align-*: center !important` → render-identical (Gate-1 roheline),
  AGA strip lõhub `tests/ui/mobileWorkspacePageSpacing.test.js` (grep'ib markerit). Jäeti — vajab testi-omaniku otsust.

## Lähteseis (staatiline, 2026-06-15)

Kokku **3642** `!important` 87 autori-CSS-failis. Jaotus arhitektuuri-rühmade kaupa:

| Rühm | `!important` | % | Iseloom |
|---|---:|---:|---|
| `mobile/` | 806 | 22% | mobiili-kaskaadi override'id |
| `features/chat` | 794 | 22% | suurim üksik-feature |
| `features/` (muu) | 619 | 17% | documents, profile, home, policy, … |
| `theme/` (teema-override) | 577 | 16% | **token-migratsiooni siht** (hc 328, mono 148, mid 65) |
| `shared/` | 384 | 11% | ui-glow, workspace-guide, register, glass-subpage |
| `features/service-map` | 357 | 10% | service-map/desktop 276 + mobile 81 |
| `components/` + `utilities/` | 72 | 2% | |
| `base/` + `tokens/` | 33 | 1% | |

## Edenemine feature/faili kaupa (uuendatud 2026-06-16, sessioon 4 lõpus)

**KOKKUVÕTE: 3642 → 1208 (−2434). Kõik 87 faili uuritud ≥1 korda. Odav oraakel-korje ammendunud.**
**✅ SESSIOON 7 (2026-06-16): müra-põranda re-audit lõpetatud. policy/responsive.css (noise=0, PÄRIS)
+ chat/shell.css (noise=45, pärast lahutust PÄRIS border-muutused) — mõlemad kinnitatult lukus.
Kõik prior "GATE-1 RED" failid on nüüd müra-vaba-gate'iga kontrollitud.**

### SESSIOON 7 lisa — token-migratsiooni kampaania (kasutaja lubas täiskampaania + kontrakt-testi muutmise)
**✅ documents/mono.css 6→0 (`361ffc30`):** teema-mono defineeris tokenid juba (`--input-bg` jne),
eksplisiitsed `background: var(--forest-input-surface) !important` overrided olid cargo-cult.
GATE-1 ✓ identical (noise=0, /dokreziim+/documents), GATE-2 0 uut, kontrakt-testi polnud vaja. **1215→1209.**

**✅ theme/mid.css `.button[data-variant="primary"]` `-webkit-backdrop-filter: none !important` → ilma `!important` (commit all):**
Button-arhitektuuri (I1) esimene viil. `!important` võitis ainult Tailwind-utiliiti — aga kihistamata käsitsi-CSS
võidab Tailwindi niikuinii (kaskaadi-kihi reegel) → marker oli redundantne. Sõsar-rida `backdrop-filter: none`
oli juba ilma `!important`-ita (asümmeetria parandatud). Gate (`mid-button-gate`, /registreerimine, noise=0):
GATE-1 ✓ identical, GATE-2 0 uut (HEAD vs muudatus: identne 11-faili baseline, `comm -13` tühi). **mid.css 4→3, 1209→1208.**

### SESSIOON 7 lisa — Button I1 mapping (2 paralleelset Explore-agenti, read-only)
**Eesmärk:** kaardistada Button-arhitektuuri-lõppmängu (I1 = NULL nupu-selektori `!important` teema-failides) PÄRIS
allesjäänud pind. Agent A = `Button.jsx` token-tarbimine + `ui-glow.css` poliitika-lukus nupu-pinnad; Agent B =
teema-failide nupu-`!important` loendus + `tests/` kontrakt-lukud. Liite tulemus:

**`Button.jsx` tarbib juba KÕIK primary/danger tokenid** (`--btn-primary-{bg,bg-hover,bg-active,border,shadow,
shadow-hover,shadow-focus,shadow-active,text}` jne) base/hover[`before:`]/active/focus seisudes → teema-faili
otse-tarbimine on redundantne; õige koht teemale = `:root.theme-X { --btn-* }` blokk.

**PÄRIS `<Button>`-primitiivi / `[data-variant]` / `.ui-glow-button-frame` / `.chat-send-btn` `!important` teema-failides = ainult ~4 markerit:**

| file:line | selektor | property | klassifikatsioon |
|---|---|---|---|
| `mid.css:109` | `.button[data-variant="primary"]:active::before` | `opacity: 1` | KONTRAKT-VABA, aga **active-gated** (glow-reveal ::before) — vajab gate'i, võib olla mid-spetsiifiline |
| `light.css:70` | `.drawer-chat-sidebar [data-variant="primary"]` | `-webkit-backdrop-filter: none` | KONTRAKT-VABA, aga **drawer-gated** — madal ROI |
| `hc.css:1425` | `.chat-inputbar .chat-send-btn.invite-primary-btn` | `background: transparent` | 🔒 **KONTRAKT-LUKUS** (`hcSurfaceContracts.test.js:27-28`) |
| `hc.css:1462` | `.framework-page-shell .ui-glow-button-frame` | `border: 2px solid` | 🔒 **KONTRAKT-LUKUS** (`hcSurfaceContracts.test.js:259-266`) |

**Ülejäänud "nupu-nimelised" teema-`!important` EI OLE `<Button>`-primitiiv** (eraldi mure, mitte I1):
`hc.css` home-before-contact / home-card-a11y (lehe-nupud), invite-modal-overlay backdrop + checkbox `::before`
(modaal/kontroll), `mid.css:207` dock-item (dokk), `mono.css:98-100` chat-tools-surface-popover (popover),
`dark.css:299-302` login-modal OTP shell (modaal). Need ei kuulu Button-konsolideerimise alla.

**⇒ JÄRELDUS:** varasem "~39 I1-rikkumist" = `css-primitive-scatter.mjs` "button"-primitiivi-tüübi summa (nupu-PERE
klassid hajutatud failides, sh dock/popover/modal-close + `!important`-vabad read), MITTE eemaldatav `!important`.
**Button I1 puhas eemaldus-pind = ~4 markerit**, neist 2 kontrakt-vaba-aga-gated + 2 kontrakt-lukus. See KINNITAB
ülalolevat "~15-25 puhas-drop" leidu: Button-lever üksi annab käputäie. Sügavam langus = kontrakt-update
(`chat-send-btn` + `ui-glow-button-frame` vabastamine, vajab kasutaja luba) VÕI primitiivi-konsolideerimine
(struktuurne, väärtus = loetavus + tulevased sõjad kaovad, mitte marker-arv).

### SESSIOON 7 lisa — ui-glow.css poliitika-lukk avatud (kasutaja andis loa lever 1-le) → TULEMUS: ~0 ohutut drop'i
**Kasutaja andis eksplitsiitse loa ui-glow.css puutumiseks** (canonical-button-look guard ajutiselt tõstetud SELLE
`!important`-vähenduse jaoks; tingimus: glow peab renderduma identselt). Tegin `css-important-overrides.mjs` auditi
`.ui-glow-button-frame` peal /registreerimine'l (6 teemat × pseudo-seisud, box-shadow+background+all-props):

**Verdiktid `.ui-glow-button-frame`:**
- **box-shadow:** WINS-BY-SPECIFICITY (light/dark/mono/night) + IMPORTANT-WAR (mid, **hc**). HC-reset `box-shadow: none !important`
  (`components_06~ie25._.css:187`) konkureerib → ui-glow `!important` ON HC jaoks kandev.
- **background:** IMPORTANT-WAR (hc — `--hc-control-bg !important` konkurent).
- **overflow:** IMPORTANT-WAR **kõigis teemades** (Button.jsx baseStyles `overflow-hidden` + konkurent → glow peab `visible`-i läbi suruma).
- **REDUNDANT markereid: 0.**

**⇒ KRIITILINE JÄRELDUS:** üks deklaratsioon (`:root:not(.theme-light):not(.theme-mid) .ui-glow-button-frame`) katab ka HC →
ei saa `!important`-it dropida ilma HC glow'd regresseerimata. Drop nõuaks HC-reset-konkurentide kõrvaldamist (mitmefaili,
need teenivad teisi selektoreid) VÕI deklaratsiooni tükeldamist (HC hoiab `!important`, muud kaotavad → ROHKEM ridu, marginaalne võit).
**+ ANIMATSIOONI-PIME GATE:** box-shadow `!important`-id kannavad 0-alpha glow-kihte transitsiooni kihi-arvu-sobitamiseks (sujuv fade);
`css-snapshot-diff` ignoreerib läbipaistvaid kihte → strip annaks VALE-ROHELISE kui kihi-arv muutub (glow popib, mitte fade'ib).
**ui-glow 118 `!important` EI OLE cargo-cult — need on päris HC-kaskaadi-sõja-valvurid + glow-transitsiooni-kandjad.**
Lever 1 (ui-glow override) annab ~0 ohutut automaat-drop'i; päris vähendus = kallis mitmefaili HC-reset-kirurgia + KÄSITSI animatsiooni-verifikatsioon (gate ei kata).

### SESSIOON 7 lisa — glass/glow token-migratsiooni audit (kasutaja valis "üks terviklik glass-pind")
**Eesmärk:** leida pind, kus teema-override `!important` seab pinna-literaali, mis saaks `:root.theme-X { --token }`-iks.
**LEID: see töö on JUBA TEHTUD (Kampaania 1, vt `[[css-safe-loop]]`).** Kontrollitud 5 pinda:
- **`shared/glass-subpage.css`:** teema-blokid (L130-205) on PUHTAD token-definitsioonid (`--subpage-card-bg: …`, **0 `!important`**);
  baas-konsument loeb tokeneid ilma `!important`-ita. Allesjäänud 19 = **geomeetria** (workspace-glass fikseeritud mõõdud,
  scroll-overscan, HC `::before` reset) — mitte pinna-värv.
- **`features/home/themes.css`:** peaaegu täielikult per-teema `--home-*` definitsioonid; ~6 `!important` = mono link-värvi-sõjad + opacity.
- **`features/home/desktop.css`:** 49 `!important` = **reset'id** (`none`/`0` lülitavad efekte välja) + **värvi-sõjad** (juba `color: var(--home-*) !important`).
- **`features/chat/themes.css`:** read 18-102 tarbivad juba tokeneid (`background: var(--subpage-card-bg) !important`,
  `var(--chat-tools-panel-bg) !important`) — `!important` = kaskaadi-sõja valvur drawer-gated pindadel, MITTE migreerimata literaal.

**⇒ JÄRELDUS (5 sõltumatut nurka sessioonis 7):** struktuursed leverid (Button-komponentiseerimine + glass/glow token-migratsioon)
on JUBA ammendatud eelmise kampaania poolt. Allesjäänud ~1208 on PÄRISELT load-bearing: geomeetria-kontraktid, efekti-reset'id
(`none`/`0`), värvi-sõjad (token-tarbivad aga `!important`-valvega), kaskaadi-sõja-valvurid gated pindadel, poliitika-lukus glow.
**Et minna oluliselt alla ~1185, on AINULT 3 päris-leverit** (kõik vajavad poliitika/luba-otsust, mitte odavat korjet):
1. **ui-glow.css poliitika-override** (118 + ~151 sõjs. ≈ kuni 270) — suurim üksik-blokk, vajab luba (canonical-button-look), risk = glow.
2. **Kontrakt-testide uuendus** (~268 kontrakt-puudutatud) — uuenda test väitma render-elust, siis strip; vajab luba (testid = inim-otsus), mõni kontrakt juba baseline-punane.
3. **Kaskaadi-sõja-valvurite eemaldus gated pindadel** (chat/themes tools-popover jt) — vajab drawer-flow-gate'i per pind (ehitatav, aga töömahukas).
**Aus soovitus: kampaania on sisuliselt valmis (4637 → 1208 = −74%). Edasi = kas poliitika-otsus (lever 1/2) või lõpeta + hoolda.**

**⚠ KRIITILINE LEID — "273 tokeniseeritavat" on petlik ülempiir.** Empiiriline analüüs:
- **151/273 sihib selektoreid mida `ui-glow.css` (POLIITIKA-LUKK) ka puudutab** → IMPORTANT-war
  poliitika-lukus failiga → EI eemaldatav ilma renderit muutmata (ui-glow `!important` võidaks).
- **~47 on muul põhjusel load-bearing:** chat/hc+theme/hc (30, HC-reset war — proven GATE-1 RED),
  service-map/desktop (11, Leaflet runtime-war), chat/shell (6, border-värvid PÄRIS).
- **268/273 on kontrakt-puudutatud** (vajaks testi-uuendust).
- **Tegelik puhas-drop saak ≈ 15-25 markerit** (documents/mono 6 tehtud + theme/mono ~5,
  home/themes ~3, documents/ui ~2, home/desktop ~2 jt). **Realistlik põhi token-dropiga ≈ 1185-1190, MITTE ~940.**
- **Number on kõrge, sest disain kasutab `!important`-i päris kaskaadi-sõdade võitmiseks**
  (poliitika-lukus glow-süsteem + kontrakt-valvatud teema-süsteem), MITTE surnud prahti.
- **Et minna oluliselt alla ~1185:** kas (a) luba puutuda ui-glow.css (poliitika-override), VÕI
  (b) arhitektuuri-lõppmäng (primitiivi-konsolideerimine → sõjad kaovad struktuurselt).

### SESSIOON 7 lisa — baseline test-kukkumiste triaaž (13 → 12)
Senised sessioonid lugesid 13 test-kukkumist "baseline'iks". Uurisin need läbi (täpne kukkuv rida + loetav fail):
- ✅ **PARANDATUD (`59634165`):** `register ring surface...` — `profile/mobile.css`-s oli liitselektor
  `.profile-container.glass-ring .profile-mask-layer, ...[data-orbit-open] ...` mis takistas testil
  avanevat `{` leida. Jagasin kaheks identseks blokiks (0 render-muutust, gate roheline). **13 → 12.**
- 🔒 **Ülejäänud 11 EI ole ohutult CSS-st parandatavad** (loader `register-node-test-loader.mjs` lahendab
  `@import` + `legacyCssBundles`: documents-mode/hc/mono/dark = aggregaatorid mis toovad split-failid):
  - **5 loevad JSX-i** (komponendi-kood, väljaspool CSS-skoopi): mobileChatKeyboardOffset:105,
    entryTypeFilters:27, adminRolePropagation:16, workspaceDashboardBadges:91, serviceMapIconInline:14
  - **4 on väärtuse/reegli triiv** (parandus = RENDER-muutus, regressiks praeguse disaini):
    chatMobileTopNavHighContrast:41 (font-size 1.36/5.5/1.54 vs test 1.16/4.65/1.34),
    dashboardInfoOverlay:59 (reegel shared/glass-subpage.css, test ootab ka mobiili-bundle's),
    documentsWorkspaceLayout:47 (overscan reegel policy/ failis eri selektoritega),
    scrollSurfaceHeader:68 (puuduv `--direct-scroll-surface-header-offset` + kaskaad)
  - **2 pre-existing:** workspaceHeaderAlignment:8 (module.css false-negative, kukub HEAD-il muutuseta),
    hcSurfaceContracts:220 (HC reset-järjestuse kontrakt)
  - **Järeldus:** need 11 on aegunud kontrakt-testid 2026-06-01/02 suure restruktuuri järelt. Õige parandus =
    testi-assertide uuendamine (vajab kasutaja luba) VÕI komponendi-muutus (eraldi ülesanne), MITTE CSS-allikas.
    **Uus baseline = 12.**

Legend: ✅ tehtud · 🔒 blokeeritud (põhjus järel)

| Fail | Algus | Praegu | −Delta | Staatus / Blokeeritud põhjus |
|---|---:|---:|---:|---|
| `shared/ui-glow.css` | 118 | 118 | 0 | 🔒 POLIITIKA-LUKK (canonical-button-look) |
| `features/service-map/desktop.css` | 276 | 104 | −172 | ✅ sessioon 6 −14 (müra-põrand, `40a7892c`); ülejäänu = page-panel fixed-geomeetria + kontrakt |
| `mobile/platform-android.css` | 98 | 98 | 0 | 🔒 gate testitud (sessioon 5): 94→65→21 STRIP erinevate keep-selektorite tasemel → kõik 21 geomeetria. **Täielikult lukus.** |
| `features/chat/themes.css` | 93 | 92 | −1 | 🔒 kontrakt-lukus (256 oraakel-muster) |
| `features/chat/shell.css` | 191 | 56 | −135 | ✅ sessioon 8 (`eff32a14`): chat-send-glyph display/transform-box/transform-origin `!important` (kasutaja-leitud kuhjatud marker; stop-glyph sama prop ilma markerita; selektor 0,0,3,1 > Tailwind .block; resolver REDUNDANT) → −3. Ülejäänu 🔒 border-color müra-audit lukus |
| `features/service-map/mobile.css` | 81 | 77 | −4 | 🔒 kontrakt-lukus (0 STRIP) |
| `mobile/scroll-panels.css` | 95 | 15 | −80 | 🔒 exhausted (kolm passi: 95→71→60→15); ülejäänu geomeetria-kontrakt |
| `mobile/invite-workspace.css` | 101 | 63 | −38 | 🔒 0 STRIP, täielikult kontrakt-lukus |
| `features/policy/responsive.css` | 65 | 62 | −3 | 🔒 sessioon 7 müra-audit: noise=0 (deterministlik gate), GATE-1 RED kinnitatud PÄRIS — glass-policy-scroll max-height/margin/width px-muutused kõigis 6 teemas; geomeetria-kontrakt |
| `features/home/desktop.css` | 52 | 49 | −3 | 🔒 kontrakt-lukus (0 STRIP teises passis) |
| `features/policy/pages.css` | 38 | 38 | 0 | 🔒 0 STRIP (190 oraakel-muster) |
| `shared/workspace-guide.css` | 92 | 33 | −59 | ✅ kaks passi (kaskaad vabastas) |
| `features/chat/mobile.css` | 169 | 14 | −155 | ✅ kaks passi (kaskaad vabastas data-chat-layout luku) |
| `features/chat/hc.css` | 207 | 29 | −178 | 🔒 HC inputbar border + kontrakt (keep-selectors → 0) |
| `components/workspace-help-listings.css` | 29 | 29 | 0 | 🔒 0 STRIP (273 oraakel-muster) |
| `features/profile/hc.css` | 40 | 28 | −12 | 🔒 orbit-menu kontrakt + oracle blind spot (0 STRIP). Oracle 23-STRIP katse: GATE-1 ✓ kuid GATE-2 RED (workspaceHeaderAlignment — HC bundle interferents) |
| `mobile/touch-controls.css` | 25 | 25 | 0 | 🔒 0 STRIP (119 oraakel-muster) |
| `theme/mono.css` | 148 | 24 | −124 | ✅ |
| `mobile/panel-surfaces.css` | 26 | 23 | −3 | ✅ |
| `mobile/subpage-title-system.css` | 82 | 21 | −61 | ✅ |
| `features/chat/mono.css` | 131 | 20 | −111 | ✅ kaks passi |
| `shared/glass-subpage.css` | 66 | 19 | −47 | ✅ |
| `theme/hc.css` | 328 | 16 | −312 | ✅ |
| `features/chat/hc.css` (sessioon 2) | — | 29 | — | vt rida ülal |
| `features/policy/mobile.css` | 32 | 15 | −17 | ✅ |
| `features/home/themes.css` | 15 | 6 | −9 | ✅ kaks passi |
| `features/documents/agent.css` | 51 | 10 | −41 | ✅ kaks passi |
| `features/documents/ui.css` | 110 | 13 | −97 | ✅ kaks passi |
| `features/documents/mobile.css` | 11 | 9 | −2 | ✅ |
| `features/profile/mobile.css` | 74 | 9 | −65 | ✅ |
| `features/profile/mono.css` | 8 | 2 | −6 | ✅ kaks passi |
| `theme/mid.css` | 65 | 3 | −62 | ✅ (sessioon 7: +1 Button I1 backdrop-filter, Tailwind-only redundant) |
| `features/documents/workspace.css` | 6 | 3 | −3 | ✅ |
| `mobile/background-home.css` | 26 | 7 | −19 | ✅ |
| `shared/register.css` | 79 | 7 | −72 | ✅ |
| `mobile/foundations.css` | 28 | 11 | −17 | ✅ |
| `features/home/mobile.css` | 4 | 4 | 0 | 🔒 0 STRIP |
| `features/documents/mono.css` | 6 | 6 | 0 | 🔒 0 STRIP |
| `features/documents/library.css` | 11 | 5 | −6 | ✅ |
| `mobile/modal-surfaces.css` | 6 | 6 | 0 | 🔒 0 STRIP |
| `theme/dark.css` | 14 | 14 | 0 | 🔒 0 STRIP |
| `theme/hc.css` (direct) | 16 | 16 | 0 | 🔒 0 STRIP (bundle-target, kontrakt) |

## ALLESJÄÄNUD — ÜLEJÄÄNUD PLOKID (2026-06-16, sessioon 3 lõpus)

**Kogu odav oraakel-korje ammendunud. Allesjäänu 1229 = 3 bloki:**

| Plokk | Näide-fail | Maht | Vaja |
|---|---|---:|---|
| POLIITIKA-LUKK | ui-glow.css | 118 | Ei puutu (canonical-button-look) |
| KONTRAKT-LUKUS | chat/themes, invite-workspace | ~400 | oracle STRIP 0 — kontrakt valvab |
| LOAD-BEARING geomeetria | policy/responsive, scroll-panels | ~120 | GATE-1 RED kõikides teemades |
| ANDROID / FLOW-GATED | platform-android, modal-surfaces | ~170 | android 98 = täielikult lukus (geomeetria); modal-surfaces vajab klikk-flow |
| TAILWIND-KASKAAD-LUKK | chat/shell inputbar | 85 | transform: none !important eemaldus lõhub Tailwind |
| ÜLEJÄÄNUD VÄIKSED LUKUS | chat/hc, profile/hc, touch-controls | ~200 | HC border / orbit-kontrakt |

**Edasi-töö valikud:**
0. **🥇 MÜRA-PÕRANDA RE-AUDIT** (sessioon 6 uus, ODAVAIM võit): iga prior "GATE-1 RED → lukus"
   fail üle-kontrolli müra-vaba gate'iga (HANDOFF §4a). service-map tõestas, et "lukus" võis olla
   ainult async-müra (Leaflet/scroll/identity-transform). Alusta: policy/responsive.css (47 STRIP),
   chat/shell.css (38 STRIP, transform=identity-müra).
1. **Token-migratsioon** (struktuurne): `--token` süsteem asendab `!important` teema-overridesid — suurim mõju, kuid struktuurne töö.
2. **Flow-gate** (`steps:[{eval/click}]`): avab modaalid/drawerid, et gateida interaktsiooni-gated reegleid.
3. **Tailwind override** chat/shell.css inputbar osas: CSS Layers või specificity fix.

## ALLESJÄÄNUD FAILIDE KAART (oraakel-dry-run, 2026-06-16) — tuleviku prioriteet
Veerg "STRIP?" = kontrakt-vaba marker (oraakel), MITTE render-tõestatud — vajab gate'i
veerus "vaja". Sorteeritud STRIP-potentsiaali järgi. ⚠ = teadaolev takistus.

| Fail | total | STRIP? | vaja (gate-tüüp) | märkus |
|---|---:|---:|---|---|
| service-map/desktop | 104 | (14 tehtud) | müra-vaba gate | ✅ sessioon 6: müra-põrand avas 14. Ülejäänu page-panel fixed + kontrakt |
| mobile/accessibility-touch | 138 | 135 | multi-route 390px | ⚠ touch-target geomeetria = tõen. load-bearing (a11y) |
| shared/ui-glow | 118 | 110 | — | ⚠ KAITSTUD (canonical-button-look, ÄRA keela glow) — poliitika-lukk, mitte kontrakt |
| mobile/platform-android | 98 | 94 | — | ⚠ gate testitud sessioon 5: 3 keep-taset → 21 STRIP jäi → kõik geomeetria. **LUKUS** |
| mobile/subpage-title-system | 82 | 60 | multi-route 390px + modal-flow | broad: policy/profile/chat/documents/modaalid |
| mobile/background-home | 67 | 58 | homepage 390px | ⚠ homepage capture-flaky |
| mobile/modal-surfaces | 62 | 56 | modal-flow-gate (`eval`/click) | interaktsiooni-gated |
| policy/responsive | 65 | 50 | /policy multi-route 390px | ⚠ policy geomeetria-kontrakt-lukus (vt policy õppetund) |
| mobile/invite-workspace | 101 | 38 | invite-flow-gate | interaktsiooni-gated |
| mobile/foundations | 41 | 13 | multi-route 390px | suuresti kontrakt-lukus |
| mobile/scroll-panels | 95 | 12 | — | suuresti kontrakt-lukus (geomeetria) |
| service-map/mobile | 81 | 4 | — | kontrakt-lukus |

**Järeldus:** suurim kontrakt-vaba potentsiaal (service-map 229, touch 135) vajab flow/multi-route gate'i.
platform-android (94 STRIP) on nüüd kinnitatud täielikult lukus (sessioon 5 testis 3 keep-taset).
Render-verifitseerimata STRIP = EI committi. ui-glow on poliitika-lukus (glow). Edasi-töö =
kas (a) flow/platform-gate ehitamine per-fail (service-map JS-state, modal-surfaces click-flow),
või (b) token-migratsioon (struktuurne, `css-progress-log.md` rada).
Mõlemad = sihilik fokusseeritud sessioon, mitte autonoomne korje.

## Strateegiline leid (2026-06-15, policy strip-all eksperimendist)

**Kiire masin = strip-all → üks gate → diff klassifitseerib KÕIK korraga.** Baseline +
strip kõik failist + after + npm test (~10 min, mitte 588-nav audit). Diff nimetab
TÄPSELT mis computed-väärtus liikus = render-kandev. Test-fail-count = kontrakt-lukus.
See on edaspidine loop (mitte per-selektor audit).

**Aus reaalsus 3642 kohta:** suur osa `!important`-st on **load-bearing**, mitte vaba:
- **Geomeetria-kontrakt-süsteem** (policy/documents/workspace kerimis-ringid) — render-
  kandev JA source-teksti kontrakt-testidega lukus. policy 133/140 oli seda. Documents,
  service-map tõenäoliselt sarnased.
- **Teema-override** (theme/ 577) — vajab **token-migratsiooni** (struktuurne), ei
  saa lihtsalt strippida.
- **Glow/glass** (shared/ui-glow 118) — kaitstud (canonical-button-look).

**Järeldus:** marker-strip (autostrip) korjab ainult VABA fraktsiooni (policy-s ~11/144 = 8%).
≪1000 jõudmiseks on **token-migratsioon kohustuslik** (theme/ 577 + override-mustriga
feature-reeglid), MITTE ainult märksõna-eemaldus. Strip-all-masin on hea VABA fraktsiooni
kiireks korjeks + load-bearing kaardistuseks per feature.

## LÄBIMURRE: teema-failide `!important` on suuresti RENDER-REDUNDANTNE (2026-06-15)

**hc.css strip-all test:** kõik **328** `!important` maha → **0 computed-muutust** 80 hc-
selektoril /kasutusjuhend-il (gate-1 roheline). Põhjus: `:root.theme-hc .x` / `[data-
contrast="hc"]` on baasist kõrgema spetsiifikatsusega → **võidab ilma `!important`-ita**,
ja teemad on vastastikku välistavad (ei konkureeri runtime'is). `!important` = cargo-cult.

**Nüanss:** gate-2 → **7 kontrakt-testi** valvavad mõne hc `!important` olemasolu source-
tekstis (glass-ring muster, render-surnud märksõna). Need tuleb kas **restoreerida**
(jätta marker) VÕI **test uuendada** (väidab render-surnud detaili).

**Mõju eesmärgile:** theme/ 577 (hc 328 + mono 148 + mid 65) on tõenäoliselt valdavalt
render-redundantne → **strippitav**. See + feature vabad fraktsioonid = peamine tee ≪1000.
Per-fail kiire: 1 strip-all-tsükkel. Ainus töö: contract-asserted markerite restore.
**ENNE commiti:** laienda render-katet (hc kõrge nähtavus — rohkem route'e kui 1).

### hc strip-katse tulemus (2026-06-15) — BLOKEERITUD täpsel restoreerimisel
`theme-strip-keepasserted.mjs` (keep marker kui test väidab `prop:väärtus !important`):
KEEP 166 / STRIP 156. Render: 0-diff (80 sel, ok). **AGA gate-2 → 4 uut testi-kukkumist.**
Põhjus: heuristika **alasäilitab** keerukaid asserte (mitmerea `[\s\S]*?`, shorthand nagu
`border: <w> solid var(--hc-accent)`) — väärtuse-ekstraktsioon regexist on habras.
Reverditud (ei committi punasega). **Õppetund:** value-match heuristikast EI piisa;
vaja täpsemat restoreerijat. Variandid: (a) prop-tasemel keep contract-props'ile (madal
saak, garanteeritud roheline), (b) npm-test-oracle per-decl bisektsioon, (c) parem
regex→deklaratsioon parser. Tööriist `scripts/css-cleanup/theme-strip-keepasserted.mjs`
olemas (suund õige, vajab täpsust).

## ÕPPETUND: feature teema-override'id ≠ puhas teema-strip (2026-06-15, chat/hc.css)
`features/chat/{hc,mono,themes}.css` on teema-laadsed (`html[data-contrast="hc"] .chat-x`),
aga EI ole render-redundantsed nagu `theme/`. Kaks erinevust:
1. **Cross-file `!important`-sõjad** — sama elementi sihivad mitu faili `!important`-iga
   (chat/mobile 169, shell 191). hc-i markeri eemaldus → teise faili `!important` võidab
   (sest `!important` lööb spetsifikatsuse) → render muutub. Täis-strip: 101 diffi.
2. **Drawer-sisesed selektorid flaky gate'is** — `.cs-*`, `.drawer-*`, `.chat-sidebar-
   search-input` elavad `.drawer-panel--chat-glass` all; gate ei ava drawerit →
   APPEARED/DISAPPEARED müra (mitte CSS-efekt).

**Töötav retsept (chat/hc.css 207→95, −112, mõlemad gate'id rohelised):**
- `theme-strip-oracle.mjs --keep-selectors <list>` (uus): force-keep marker, kui ta reegli
  selektor sisaldab substringi. Hoia (a) alati-nähtavad load-bearing selektorid, mille
  render-gate flag'is, (b) KÕIK drawer-sisesed konservatiivselt (ei saa deterministlikult
  gate'ida).
- Ehita **deterministlik gate**: jäta drawer-sisesed selektorid välja (`^\.(drawer-|cs-|
  chat-sidebar)`). Siis ✓ identical on usaldusväärne.
- 2-gate nagu ikka. NB: keep-by-classname on **leaky** grupeeritud/muutuja-kaskaadi
  reeglitele → konservatiivne drawer-keep katab selle.

**MÜRA-PÕRAND (kriitiline /vestlus gate'il):** sama muutmata fail kaks korda
captuuritud → kuni ~18 diffi (terve teema-batch nt `night/desktop` kaob ühel
runil = ajastus/laadimis-müra; + transientsed `.button` opacity disabled-seis,
`.chat-assistant-action-btn` sisu-sõltuv). **Reegel: DISAPPEARED + ühe-korra-
diffid = müra; PÄRIS signaal = sama selektor+väärtus JÄRJEPIDEVALT mitmel
capture'il** (chat/mono full-strip: `.chat-composer-glow-shell` 20 diffi püsivalt
= päris). Tõesta keep-versioon roheliseks: capture 2× → diffide LÕIKE tühi =
render-ohutu. Ära usalda ühe-capture "✖ 1 diff" — võrdle müra-põrandaga.

## Tööriistad

- **Audit (valija):** `scripts/css-important-overrides.mjs` — verdikt per (selektor, prop),
  nüüd viewport-korrektne (390+1920). REDUNDANT/WINS-BY-SPEC = auto-strippitav.
- **Auto-strip:** `scripts/css-cleanup/important-autostrip.mjs` — audit valib → strip
  märksõna autori-failist → (väline gate kinnitab). Konservatiivne: ainult ühene
  tekstivaste; mitmene/kahtlane → skip + logi.
- **Gate (kohtunik):** `scripts/css-snapshot.mjs` + `css-snapshot-diff.mjs` (computed
  identne, 390+1920 × 6 teemat) + `npm test` (kontraktid). 🟢 commit · 🔴 revert.

## Reeglid (et jälg jääks ausaks)
1. Iga partii = audit → strip → **mõlemad gate'id** → commit VÕI revert. Ära committi punasega.
2. Uuenda seda registrit **iga commiti järel** (rida + commit-hash).
3. Render-surnud ≠ eemaldatav, kui kontrakt valvab (vt glass-ring 🔒).
4. Responsiivne baas+@media paar: baas EI ole surnud (viewport-korrektne audit kohustuslik).
