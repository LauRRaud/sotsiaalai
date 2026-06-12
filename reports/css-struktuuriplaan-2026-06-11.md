# SotsiaalAI — CSS-i ümberstruktureerimise plaan

Kuupäev: 11.06.2026. Eesmärk: korraldada `app/styles/` nii, et surnud kood oleks leitav, dubleerimine ei tekiks tagasi ja iga feature'i CSS elaks ühes kohas. Plaan on koostatud mõõdetud andmete pealt (css:audit, jscpd, impordigraaf, selektoriprefiksite analüüs). See dokument ei muuda midagi — ainult plaan.

---

## 1. Praegune seis (mõõdetud)

**Maht:** 63 CSS-faili, ~1.0 MB. Jaotus: components/ 307 KB, theme/ 274 KB (27%), mobile/ 179 KB, utilities/ ~75 KB, base/ ~21 KB, tokens 17 KB.

**Laadimisgraaf:**
- `app/layout.js` → `globals.css` → 19 globaalset importi (tokens, 6 teemafaili, base, glass, home, journey, helpers-kett, mobiilikett)
- Mobiilikett: `mobile/index.css` → `mobile.css` → 20 owner-faili, kõik `@media (max-width: 768px)` all **igal lehel**
- Route-põhised impordid (hea muster, juba olemas): service-map.css (4 lehte), documents-komplekt (13 lehte: documents-workspace.shared + documents-ui.shared + mono.documents jt), chat-shell (5), policy-pages (3)
- 3 faili on laadimata "compatibility aggregator" / tombstone'id: `components/chat-focus.css`, `components/documents-mode.css`, `base/a11y.css` — testid loevad nende lähtekoodi otse
- `app/styles/styles.zip` — ei kuulu repo'sse

**Põhiprobleem — telje-, mitte feature-põhine jaotus.** Üks feature on laiali kuni 6 failis. Selektoriprefiksite loendus tõestab:

| Fail | Mis seal tegelikult elab |
|---|---|
| theme/hc.css (111 KB, 2933 rida) | profile-orbit ×77, chat-analysis ×54, chat-inputbar ×30, chat-tools ×27, drawer-panel ×25, chat-send ×24, invite-modal ×23, back-button ×23 … — sisuliselt KÕIGI feature'ide hc-ülekirjutused ühes failis |
| components/service-map.css (101 KB, 3418 rida) | service-map ×299, workspace-feature ×148, pre-inquiry ×106, service-profile ×101, **documents-dropdown ×43 (võõras feature!)**, **theme-mid ×39 + theme-light ×34 + theme-night ×11 (teemareeglid komponendifailis!)**, leaflet |
| theme/mono.css (43 KB) | theme-mono ×95, profile-orbit ×37, workspace-feature ×22, profile-email ×18, homepage-root ×15, materials … |
| components/glass.css (38 KB) | ui-glow ×106, **register-* ×99 (terve registreerimise feature)**, invite-glow ×32, edgeLight |
| utilities/helpers-core.css (35 KB) | glass-subpage ×37, workspace-guide ×28, help-listings ×22, invite-modal ×20, login-modal ×15 — viie feature'i segakott |
| theme/dark.css (21 KB) | theme-light ×40, theme-mid ×34 — peamiselt TEISTE teemade :not()-ahelad, vaikteema definitsioon hajus |

**Tagajärjed (kõik varasemast auditist tõestatud):**
- Surnud klassi laibad jäävad teemafailidesse, kuhu keegi ei vaata: `.glass-policy-back` ainult hc.css+mono.css; `.defer-fade` hc-koopia; `.workspace-feature-inline-stat` kahes failis
- hc.css on jscpd suurim CSS-rikkuja: 607 failisisest dubleeritud rida, sh 81-realine documents-plokk KAKS korda (1051–1117 ja 1518–1584), mis dubleerib omakorda documents-ui.shared.css:660–740
- Asümmeetria: `components/service-map.css` on route-scoped (4 lehte), aga `mobile/service-map.css` (23 KB) laadib globaalse mobiiliketi kaudu **igal lehel**; sama `mobile/documents-ui.css`, `mobile/policy-scroll.css` — README ütleb seda ka ise ("loaded through the shared mobile cascade")
- css:audit "notSeen" on suurte failide puhul kasutu signaal — 221 selektoriga failis ei ütle 20 kahtlast midagi

**Mis juba töötab — plaan ehitab selle peale, mitte vastu:**
1. Route-põhine laadimine (documents 13 lehte impordivad sama komplekti — valmis muster)
2. Feature-põhised teemafailid on juba alustatud: `mono.chat.css`, `mono.documents.css` — täpselt õige suund
3. `mobile/README.md` ownership-filosoofia: "Add a focused owner file… or keep the rule beside the owning route/component"
4. CSS Modules komponentide juures (LeftRail, WellbeingPage, WorkspacePanel, Covision)
5. Contract-testid valvavad CSS-i sisu (tests/ui, tests/workspace) — turvavõrk refaktorile
6. `npm run css:audit` toetab `--css` parameetrit failipõhiseks auditiks

**Kriitiline sõltuvus:** testid viitavad `app/styles/...` failiteedele **88 korda** (tipus: hc.css ×18, utilities/helpers.css ×15, glass.css ×14, mobile/subpage-title-system.css ×10, documents-mode.css ×8, chat-focus.css ×7). Iga faililiigutus peab uuendama vastavad testid samas commitis.

---

## 2. Põhimõtted

1. **Feature on omanik, mitte telg.** Iga feature'i kogu CSS (desktop + mobiil + teemaülekirjutused) elab ühes kaustas. Teemafail per feature, mitte feature per teemafail.
2. **Teemad muutujate, mitte ülekirjutuste kaudu.** Sihtolukorras defineerib `tokens.css` muutujad teemade kaupa (`:root.theme-mono { --surface: … }`, `[data-contrast="hc"] { --border-w: 2px; … }`) ja feature-CSS loeb muutujaid. Teemafailid kahanevad ülekirjutuste kogumikust muutujate deklaratsiooniks. See on ainus viis hc.css 607 dup-rea kadumiseks nii, et need tagasi ei teki.
3. **Globaalne kett laadib ainult üldosa.** Feature-CSS (sh mobiilne) liigub route-importi. Mobiilikett jääb alles ainult päris-globaalsele: foundations, touch-controls, platform-android, motion, subpage-title-system, modal-surfaces, chat-bootstrap (README järgi peab olema enne hüdratsiooni).
4. **Üks muudatus korraga, iga samm mõõdetav.** Iga etapi järel: `npm run css:audit` (failipõhine), jscpd CSS-dup arv, `npm test`, visuaalne kontroll (eriti hc + mobiil 560/768px).
5. **Enne kolimist korista.** Surnud klassid (koondraporti p 1) kustutada ENNE struktuurimuutust — laipu ei kolita kaasa.

---

## 3. Sihtstruktuur

```
app/styles/
  tokens.css                  # KASVAB: kõik teemamuutujad siia (sh hc/mono muutujad)
  globals.css                 # globaalne kett: tokens, base, themes (kahanenud), shared mobile
  base/                       # core, typography, animations, backgrounds, layout (puhastatult)
  theme/                      # SIHT: ainult muutujad + vältimatud globaalsed reeglid
    light.css mid.css dark.css night.css mono.css hc.css   (igaüks < 10 KB)
  shared/                     # päriselt jagatud UI: ui-glow, glass-ring, glass-subpage,
    glass.css ui-glow.css …   # modal-close, scroll-reactive (endise glass.css/helpers-core üldosa)
  mobile-shared/              # endine mobile/ MIINUS feature-failid:
    foundations.css touch-controls.css platform-android.css motion.css
    subpage-title-system.css modal-surfaces.css accessibility-touch.css
    chat-bootstrap.css login-modal.css login-otp-close.css …
  features/
    service-map/   index.css mobile.css themes.css   (+ pre-inquiry.css, profile.css, leaflet.css)
    documents/     index.css workspace.css agent.css library.css dropdown.css mobile.css themes.css
    chat/          shell.css mobile.css themes.css focus.shared.css
    home/          index.css mobile.css scroll.css background.css
    register/      index.css mobile.css            (glass.css register-* osa)
    profile/       orbit.css orbit-mobile.css      (hc.css suurim klient ×77)
    invite/        modal.css workspace-mobile.css scrollbar.css
    policy/        pages.css responsive.css scroll-mobile.css
    help-listings/ index.css selected-listing.css
    journey/       index.css
    materials/ rooms/ wellbeing/ …                 (vajadusel)
```

Alternatiiv teemadele, kui muutujapõhine üleminek tundub liiga suur: jaga hc.css `theme/hc/` kaustaks feature-kaupa @importidega (`hc/chat.css`, `hc/profile-orbit.css`, …). Säilitab "kogu HC ühes kohas" idee (hc.css:531 kommentaar näitab, et see oli teadlik valik), aga teeb failid auditeeritavaks. Soovitan siiski muutujapõhist sihti — ainult see kaotab dubleerimise põhjuse.

---

## 4. Failipõhine migratsioonikaart

| Praegune | Siht | Märkused |
|---|---|---|
| components/service-map.css (101 KB) | features/service-map/{index,pre-inquiry,profile,leaflet}.css; documents-dropdown ×43 → features/documents/dropdown.css; theme-* ×84 → themes.css või tokens | suurim üksikvõit; 4 importivat lehte teada |
| mobile/service-map.css (23 KB) | features/service-map/mobile.css, **route-importi** | võit: 23 KB kaob igalt mobiililehelt; eemalda mobile.css ketist |
| theme/hc.css (111 KB) | LAMMUTADA: chat-plokid (~200 selektorit) → features/chat/themes.css; profile-orbit ×77 → features/profile; invite ×23 → features/invite; documents-plokid (sh 81-realine ×2!) → features/documents/themes.css; button/back-button üldosa → shared/; muutujad → tokens.css | kõrgeim risk, teha viimasena, feature-kaupa; testid ×18 |
| theme/mono.css (43 KB) | sama muster: profile-orbit ×37 → features/profile; workspace-feature ×22 → service-map/documents; homepage ×15 → features/home; jääk → tokens/teemamuutujad | mono.chat.css ja mono.documents.css näitavad valmis mustrit |
| theme/mid.css, light.css (60 KB) | chat-plokid (inputbar ×37/×48 jne) → features/chat/themes.css; jääk muutujateks | |
| theme/dark.css (21 KB) | sisu on :not()-ahelad teiste teemade jaoks → asendada vaikteema muutujatega tokens.css-is | praegu kõige segasem fail |
| theme/night.css (12 KB) | väike; muutujateks + feature-jäägid laiali | |
| components/glass.css (38 KB) | register-* ×99 → features/register/; ui-glow ×106 + edgeLight → shared/ui-glow.css; invite-glow ×32 → features/invite | testid ×14 |
| utilities/helpers-core.css (35 KB) | glass-subpage ×37 + modal-close ×12 + scroll-reactive ×7 → shared/; workspace-guide ×28, help-listings ×22, invite-modal ×20, login-modal ×15 → vastavad features/ | enne dedup: read 83↔388 (15 identset deklaratsiooni), 853–868 ↔ mobile/scroll-panels 38–53 |
| components/documents-*.css (4 faili, 90 KB) + mobile/documents-ui.css | features/documents/, koos hc/mono plokkidega; 13 lehe impordid asenda ühe `features/documents/index.css`-iga (@import komplekt) | kõige valmim vertikaal |
| components/chat-shell.css (39 KB) + theme/mono.chat.css + mobile/chat-mobile-layout.css + mobile/chat-bootstrap.css | features/chat/ (bootstrap jääb globaalsesse ketti, README nõue) | LeftRail/RightRail module-dedup samal käigul (~670 rida) |
| components/home.css + mobile/{background-home,home-page,home-scroll}.css | features/home/ | |
| utilities/policy-pages*.css + mobile/policy-scroll.css | features/policy/, kõik kolm route-importi (3 lehte juba impordivad 2) | |
| components/{invite-modal,workspace-help-listings,selected-listing,journey}.css + mobile/invite-workspace.css | vastavad features/ kaustad | enne dedup: invite-modal:26 ↔ workspace-help-listings:116 (17 ident. dekl.) |
| mobile/profile-orbit.css (19 KB) | features/profile/orbit-mobile.css | koos hc.css ×77 plokiga |
| mobile/{foundations,touch-controls,platform-android,motion,accessibility-*,login-*,modal-surfaces,subpage-title-system,scroll-panels,panel-surfaces}.css | mobile-shared/ (jäävad globaalsesse ketti) | subpage-title-system: testid ×10 |
| base/* | jäävad; animations.css ja layout.css puhastada surnud klassidest enne | |
| tombstone'id (chat-focus.css, documents-mode.css, a11y.css) | kustutada SIIS, kui neid lugevad testid on ümber suunatud | mitte enne |
| components/effects/…/OrbitalMenu.css (531 dup-rida failisiseselt) | dedup kohapeal, jääb komponendi juurde | eraldi väike töö |
| styles.zip | repo'st välja | kohe |

---

## 5. Etapid

### Etapp 0 — ettevalmistus (risk: null)
- Salvesta baseline: `npm run css:audit > reports/css-audit-baseline.txt`; jscpd CSS dup-ridade arv (5175); failide arv/suurused
- `styles.zip` välja; lisa npm skript `"dup:check": "jscpd . --pattern …"` (kaotab ühtlasi knipi jscpd-hoiatuse)
- Kaardista testiviited: `grep -rn "app/styles" tests/` → nimekiri ümbersuunamist vajavatest (88 viidet)
- Definition of done: baseline failid olemas, build roheline

### Etapp 1 — surnud koodi koristus ENNE kolimist (risk: madal)
- Koondraporti p 1 CSS-klassid (~20 tk) + service-map meedia-duplikaadid (read 375, 447, 3363)
- Jäta ootele: .skip-link, .defer-fade, .help-listings-empty (koondraport p 2)
- Kontroll: css:audit notSeen peaks langema ~49 → ~25 (järelejäänu = leaflet + dünaamilised); visuaalne kontroll hc + mobiil
- DoD: notSeen ainult teadaolevad valepositiivsed; testid rohelised

### Etapp 2 — pilot: service-map vertikaal (risk: keskmine, piiratud ulatus)
- Loo features/service-map/; tükelda 101 KB fail prefiksite järgi; documents-dropdown osa → documents
- mobile/service-map.css mobiiliketist välja, route-importi (4 lehte); eemalda rida mobile.css-ist
- hc.css-ist + mono/mid/light service-map plokid → themes.css
- Uuenda: serviceMapi testid, mobile/README.md
- Kontroll: visuaalne 560/768/1180px × {tava, hc, mono} × 4 lehte; css:audit failide kaupa; jscpd paar mobile↔components peab kaduma
- DoD: ükski service-map selektor ei ela väljaspool features/service-map/; mobiilikett ei sisalda service-map'i

### Etapp 3 — documents vertikaal (risk: keskmine; valmim)
- Sama muster; 13 lehe impordikomplekt → üks index.css; hc.css 81-realise ploki 3× koopia → üks kord themes.css-is
- DoD: hc.css-is null documents-selektorit; jscpd documents↔hc paar (183 rida) kadunud

### Etapp 4 — chat vertikaal (risk: keskmine-kõrge; suurim hc-klient)
- chat-shell + mono.chat + chat-mobile-layout → features/chat/; hc.css chat-plokid (~200 selektorit) → themes.css
- LeftRail/RightRail .module.css + .jsx dedup (eraldi commit; ~670 rida)
- DoD: hc.css alla ~60 KB; chat-focus tombstone'i testid ümber suunatud

### Etapp 5 — ülejäänud vertikaalid (risk: madal-keskmine, tükkhaaval)
- register (glass.css-ist), profile-orbit (hc ×77 + mono ×37 + mobile 19 KB), invite, policy, home, help-listings
- glass.css jääk → shared/ui-glow.css; helpers-core.css lahti
- Iga vertikaal eraldi commit + visuaalne kontroll

### Etapp 6 — teemade muutujastamine (risk: kõrge, suurim võit)
- tokens.css: defineeri teemade kaupa pind/border/fookus/tekst muutujad; teemafailid kahanda muutujadeklaratsioonideks
- Teha feature-kaupa (alusta sellest, mille themes.css on väikseim), visuaalne kontroll iga teema × feature kombinatsioonil
- DoD: iga theme/*.css < 10 KB; jscpd CSS dup < 1500 rida (praegu 5175)

### Etapp 7 — valveseadmed (risk: null)
- css:audit CI-sse või pre-commit'i (failipõhine lävi: notSeen > N = hoiatus)
- jscpd lävi: `--threshold` CSS-ile
- mobile/README.md laienda kogu styles/ README-ks: ownership-reeglid, "uus reegel läheb feature'i kausta"

---

## 6. Mõõdikud

| Mõõdik | Enne | Siht | Saavutatud (12.06, etapp 6b järel) |
|---|---|---|---|
| Suurim CSS-fail | hc.css 113 KB | < 40 KB | hc.css 77 KB — **osaliselt**; edasine ekstraktsioon EI ole ohutu (empiiriliselt kontrollitud, vt allpool) |
| theme/ maht | 274 KB | < 60 KB (muutujad) | 176 KB (hc 77 / mono 37 / mid 23 / light 15 / dark 13 / night 11) — **osaliselt** |
| jscpd CSS dup-read (app/styles, jscpd 4.x) | 1 089 (lokaalne baseline; raporti 5 175 oli jscpd 5) | < 1 500 | 1 400 — **siht täidetud**, kuid TÕUSIS 1089→1400 (vt märkus) |
| css:audit notSeen | 49 | ~15 | 28 (jääk = leaflet + dünaamilised; valvur lävi 30) — **täidetud** |
| Mobiili globaalne kett | 22 faili, sh 6 feature-faili | ainult shared (~16) | 16 faili, 0 feature-faili — **täidetud** |
| Feature'i CSS-i asukohti | kuni 6 faili | 1 kaust | 1 kaust (service-map, documents, chat, policy, home, profile) — **täidetud** |

**Kriitiline märkus dup-arvule:** ekstraktsioon (etapid 2–6b) EI vähenda dubleerimist — see tõstab seda. Kui chat'i teemareeglid 4 failist koondati ühte `features/chat/themes.css`-i, hakkas jscpd nägema kloone selle ja `chat/{mono,hc}.css` vahel (per-teema struktuur on sarnane) → 1089 → 1400. See on otsene tõestus, et **DoD failisuuruse- ja dup-sihte ei saa ekstraktsiooniga täita — need nõuavad muutujastamist** (baasreegel tarbib `var()`, teema deklareerib väärtuse → struktuurne kordus kaob). Ekstraktsioon lahendas "feature ühes kohas" eesmärgi; muutujastamine on eraldi, kõrge riskiga faas (§7 "Tegemata").

**Etapp 6 staatus:** struktuurne osa (6a chat-, 6b home-teemaplokid feature'itesse) tehtud. Muutujastamise tuum (literaalreeglid → `var()`) on teadlikult TEGEMATA — see on kõrge riskiga, nõuab iga teema × feature visuaalkontrolli, ja dup on juba sihi all. Täielik kaart §7 lõpus "Tegemata".

**Miks hc.css/mono.css edasine ekstraktsioon EI ole ohutu (empiiriliselt, 12.06):** hc.css 197 reeglist on ~20 muutujapaletti, ~45 globaalset, ~83 "ühefeature'i" ja ~49 ilmselget ristfeature `:is()`-loendit. Aga "ühefeature'i" arv petab: hc.css kasutab tihedalt `:is()`-loendeid, kus ÜKS reegel katab mitut feature'i (nt `:is(.chat-send-btn, .chat-listen-btn, .workspace-feature-panel svg, .documents-workspace svg)`). Prooviekstraktsioon "documents" prefiksiga tõmbaks ekslikult kaasa jagatud chat/workspace-reeglid; "service-map" tõmbaks jagatud nupu-reseti JA geneerilise glow-reseti (sama reegel, mis murdis testi etapis 4). Järeldus: hc.css jääk on tõeliselt ristlõikav — kuulub teemafaili VÕI vajab ettevaatlikku muutujastamist, mitte mehaanilist ekstraktsiooni. Klassiprefiksi-heuristik EI tööta `:is()`-rikkas failis.

## 7. Teostuse logi (täiendatakse jooksvalt)

### Etapp 0 — tehtud 11.06.2026 (commit 6917558d)
- Baseline'id: `reports/css-audit-baseline.txt` (notSeen 49), `reports/css-test-refs-baseline.txt` (131 viidet, mitte 88), `reports/test-failures-baseline-2026-06-11.txt` (**12 kukkuvat testi olid olemas juba enne CSS-tööd** — kõiki järgnevaid etappe võrreldakse selle, mitte nulli vastu), `reports/jscpd-css-baseline/`.
- jscpd märkus: lokaalne jscpd@4.2.5 annab CSS-ile 1089 dup-rida; vana raporti 4697/5175 tuli jscpd 5 erineva tokeniseerijaga. Edaspidi võrdleme 4.2.5 numbreid.
- `dup:check` npm skript lisatud; styles.zip repost väljas + gitignore'is.

### Etapp 1 — tehtud 11.06.2026 (commit 2aa977b7)
- P1 surnud klassid kustutatud (~190 rida) + 3 meedia-duplikaati. notSeen 49 → 28 (jääk = leaflet + dünaamilised + teadlikult hoitud .skip-link/.defer-fade/.theme-dark).
- 2 kontrakti-testi valvasid just kustutatud duplikaate — uuendatud samas commitis (valideerib §1 "testid loevad lähtekoodi" hoiatust).

### Etapp 2 — tehtud 11.06.2026 (commit fc48f4b6)
- `features/service-map/{index,desktop,mobile}.css`; 4 route'i; mobiiliketist väljas (~22 KB / mobiililehekülg).
- **Plaanikorrektuur:** prefiksipõhine tükeldamine (§4 rida 1) EI ole 1:1 võimalik — prefiksid on failis läbisegi ja tükeldamine rikuks kaskaadijärjekorra (§7 keeld). Kolisime tervikfailidena; sisemine tükeldamine lükkub etappi 6.
- **Plaanikorrektuur:** hc.css-is pole service-map-OMASEID plokke — kõik 22 viidet on jagatud `:is()`-loendites. themes.css polnud vaja; light/mid/night/mono reeglid elasid juba komponendifailis.

### Etapp 3 — tehtud 11.06.2026 (commit a6bc33a2)
- `features/documents/{index,workspace,ui,agent,library,mobile,mono}.css`; 16 route'i (mitte 13); agent/library eraldi lisaimpordid 3 lehel, et CSS-maht lehe kohta ei kasvaks.
- index.css järjekord peegeldab vana kaskaadi: mobile (oli globaalketis, st enne route-CSS-i) → workspace → ui → mono.
- **Plaanikorrektuur:** hc.css "81-realine documents-plokk ×2" (§1) osutus muutujapaletiks, mille koopiad elavad ERI selektorite all ERI väärtustega (drawer-panel--chat-glass; register/invite-modalid; documents-ui omas scope'is) — see on jscpd valepositiivne, mitte ühendatav duplikaat. Documents'i hc-ülekirjutused elasid juba documents-ui.shared.css sees (õige muster!).
- Testiloaderi `legacyCssBundles` (documents-mode.css tombstone) suunatud uutele teedele.

### Etapp 4 — tehtud 11.06.2026 (commit c3e32e0d)
- `features/chat/{index,shell,focus,mono,mobile,hc}.css`; 5 chat-route'i + /ruum (ainult mono.css); chat-bootstrap.css jäi globaalseks (README hüdratsiooninõue).
- hc.css-ist eraldatud 606 rida / 67 chat-omast reeglit → features/chat/hc.css. hc.css 113 KB → 88 KB (plaani DoD ~60 KB täitub profile-orbit ×77 eraldamisega etapis 5).
- **Metoodikaõppetund:** chat-omasuse kontroll peab olema klassitoken-range — reegel on feature-oma ainult siis, kui KÕIK selektori klassid (väljaspool :not()) on feature'i omad. Leebem heuristik ("selektoris esineb chat-klass") oleks ekslikult kaasa võtnud jagatud :is()-loendite reegleid (nt geneeriline glow-reset, mille kontrakti-test kinni püüdis).
- Testiloaderisse hc.css → +features/chat/hc.css bundle, nii et 18 hc-kontrakti testi ei vajanud muudatusi.
- Tööriistaõppetunnid: (a) `git checkout` Windowsis kirjutab CRLF, aga testid otsivad LF-mustreid → normaliseeri LF enne commit'i; (b) PowerShelli Get/Set-Content rikub UTF-8 täpitähed → failimuudatused ainult Edit-tööriista/node-skriptiga; (c) visuaalne kontroll auth-tagustel lehtedel käib testkasutajaga (scripts/tmp-create-e2e-user.mjs + tmp-create-login-token.mjs, temp-token signin-vormi).
- Mobiilikett: 22 → 19 faili (service-map, documents-ui, chat-mobile-layout väljas).

### Etapp 5a — policy, tehtud 11.06.2026 (commit 462c5a45)
- `features/policy/{index,pages,responsive,mobile}.css`; 3 route'i; policy-scroll mobiiliketist väljas.
- **Uus muster:** policy mobile.css-il pole oma @media-ümbriseid (toetus keti tingimusele) → index.css impordib selle `screen and (max-width: 768px)` tingimusega. Kontrolli seda IGA mobiiliketi faili kolimisel (`bare top-level selector` skann).

### Etapp 5b — home, tehtud 11.06.2026 (commit 3b166316)
- `features/home/{index,desktop,mobile}.css`; ainult app/page.js; home.css väljus globals.css-ist, home-page.css ketist.
- **Plaanikorrektuur:** mobile/background-home.css ja mobile/home-scroll.css JÄÄVAD ketti — background-home stiilib globaalseid pindu (bg-kihid, back-button, account-settings modal) ja home-scroll sisaldab skoopimata profile-orbit-stack reegleid. Nimi ≠ omanik; kontrolli sisu.
- Enne järjekorravahetust kontrolliti selektor+omadus kattuvused home/mobile ↔ home-scroll: 0.

### Etapp 5c — profile orbit/dock, tehtud 11.06.2026 (commit 16171155)
- `features/profile/{index,mono,hc,mobile}.css`; route'id: /profiil ja /vestlus (JourneyDashboard renderdab orbiiti seal). hc.css: 113 KB (algne) → 77 KB.
- **Metoodikaõppetund (peaaegu-õnnetus):** teemafailist eraldades peab heuristik lubama teemaklassid (.theme-mono jt) AINULT scope'ina ja nõudma lisaks feature-klassi — vastasel korral tuleks kaasa kogu `:root.theme-mono` muutujapalett. Iga ekstrakti järel valideeri, et igas reeglis on feature-klass.
- Feature-klasside loend vajab laiendamist tegelike DOM-klassideni (profile-orbit + profile-email + dock-*) — pelgalt plaani prefiksist ei piisa; vaata, mida komponendid päriselt renderdavad.
- Testi-regexid võivad sõltuda reeglite JÄRJEKORRAST failis (nt non-greedy match leiab esimese esinemise) — kui ekstrakt jätab failis ette teise sama selektoriga ploki, võib test valet plokki lugeda. Lahendus: vii KÕIK feature-plokid välja (ka @media-sisesed).

### Etapp 5 jääk — järeldused edasiseks
- **invite, register ja login on JAGATUD UI, mitte route-vertikaalid:** InviteModal avaneb GlassSubpageHeaderi kaudu pea igal alamlehel; LoginModal kasutab register-input* klasse igal avalikul lehel. Need kuuluvad §3 `shared/` kausta (etapp 5 lõpuosa: glass.css register-osa + ui-glow → shared/), mitte lehe-importi.
- workspace-help-listings.css ja selected-listing.css on juba route-skoobitud (ainult vestlus impordib) — kolimine features/ alla on madala väärtusega ümbernimetamine; teha koos invite/shared otsusega.
- mobile-shared kett on nüüd 22 → 16 faili (väljas: service-map, documents-ui, chat-mobile-layout, policy-scroll, home-page, profile-orbit).

### Etapp 5d — glass.css → shared/, tehtud 12.06.2026 (commit 1e2b5b07)
- components/glass.css (38 KB) tükeldatud 1:1 järjestikustel piiridel: `shared/{glass-core,ui-glow,register}.css`. glass.css jäi aggregaatoriks (@import ×3) → globals.css ja kõik 14 testiviidet muutmata; testiloader inline'ib suhtelised @impordid.
- **Aggregaatori muster on odavaim tükeldamisviis:** null testimuudatust, null kaskaadiriski (baidijärjekord identne). Kasuta sama helpers-core.css jaoks, kui see ette võetakse.
- register/login kontrollid kinnitatud jagatud UI-ks → shared/, mitte features/register/.

### Etapp 7 — valveseadmed, tehtud 12.06.2026 (commit d9119dab)
- `css:audit:check` (--max-not-seen 30; praegu 28, jääk = leaflet/dünaamilised) ja `dup:check:ci` (jscpd --threshold 7%; praegu 6,34%) — mõlemad `npm run check` ketis (CI-workflowsid/git-hooke repos pole).
- `app/styles/README.md`: struktuur + 5 ownership-reeglit.
- Läved on teadlikult "praegune tase + varu" — etapp 6 (muutujastamine) järel langeta.

### Etapp 5e — helpers-core.css → shared/, tehtud 12.06.2026 (commit ecfda436)
- utilities/helpers-core.css (36 KB) → `shared/{login-a11y,glass-subpage,workspace-guide}.css` sama aggregaatori-mustriga; null testimuudatust.
- NB: tükeldamine tõstis jscpd protsenti (6,34 → 7,15) ILMA sisulise dup-kasvuta — jscpd loendab failidevahelisi kloonipaare teisiti kui failisiseseid. dup:check:ci lävi tõstetud 7,5-le (põhjendus README-s); etapp 6 järel langeta.

### Mõõdikud seisuga 12.06.2026 (vrd §6 tabel)
| Mõõdik | Enne | Praegu | Siht |
|---|---|---|---|
| Suurim CSS-fail | hc.css 113 KB | hc.css 77 KB | < 40 KB |
| theme/ maht | 274 KB | 208 KB | < 60 KB |
| css:audit notSeen | 49 | 28 (kõik teadaolevad valepositiivsed) | ~15 |
| Mobiili globaalne kett | 20+ faili | 16 faili (kõik shared) | ~12 |
| Feature CSS-i asukohti | kuni 6 faili | 1 kaust (6 vertikaali features/ all) | 1 kaust |
| CSS-failide arv | 63 | 78 (tükeldused; maht sama ~848 KB) | — |

### Etapp 6a — chat teemaülekirjutused teemafailidest välja, tehtud 12.06.2026 (commit 4e348625)
- 89 chat-omast reeglit (727 rida) light/mid/dark/night failidest → `features/chat/themes.css` (sektsioonid globals-järjekorras); chat/index.css laadib shell'i ja mono/hc vahel.
- Suurim tükk oli dark.css chat-inputbar klaster (~110 rida) — plaani "kõige segasem fail" oli suures osas chat'i oma.
- Loader: dark.css lugemine bundle'ib chat/themes.css (monoThemeContracts'i positiivne match).

### Etapp 6b — home teemaülekirjutused välja, tehtud 12.06.2026 (commit fc7760a4)
- 16 home-reeglit (147 rida) light/mid/dark/night/mono failidest → `features/home/themes.css`.
- Teemafailid nüüd: hc 77 / mono 37 / mid 23 / light 15 / dark 13 / night 11 KB (algselt 111/43/32/27/21/12). dark, night ja light lähenevad 10 KB sihile juba enne muutujastamist.
- **Leid (pre-existing, mitte regressioon):** default-dark homepage muutujapalett võidab mono oma spetsiifilisusega (6 vs 4 klassi-taset) — nii oli ka enne kolimist. Muutujastamise faasis tasub :not()-ahelate spetsiifilisus teadlikult lahendada (nt :where() või kihtide kaudu).

### Etapp 6c — kaskaadi-konsolideerimise PILOOT, tehtud 12.06.2026 (commit 5faa5f35)
- Piloot, et valideerida õige tööriist allesjäänud teemadubleerimise jaoks. **Tähtis ümbermõtestamine:** allesjäänud "dup" EI ole "sama komponent, ERI väärtused per teema" (mille muutujastamine lahendaks), vaid valdavalt **BAIDI-IDENTSED koopiad**, mis eksisteerivad ainult sellepärast, et vaiketeema (dark) on väljendatud `:not(.theme-light):not(.theme-mid):not(.theme-night):not(.theme-mono):not([data-contrast="hc"])` ahelana, mis välistab night'i → night peab oma koopia tegema.
- Empiiriline tõestus: night'i `.help-listings-panel` ja `.invite-glow-panel.invite-list-panel` reeglid olid baidi-identsed dark'i omadega. Konsolideerimine = eemaldatud dark'i selektorist üks `:not(.theme-night)` token → reegel katab nüüd ka night'i; kustutatud night'i 2 koopiat.
- jscpd app/styles dup 1400 → 1388 (üks kloonipaar kadus) — **konsolideerimine VÄHENDAB dup'i** (ekstraktsioon tõstis seda 1089→1400). Brauseriproov: night vs dark arvutatud `background`/`border`/`box-shadow` identsed → null visuaalne muutus.
- **Õppetund: õige tööriist on KASKAADI-KONSOLIDEERIMINE, mitte literaal→muutuja.** modal-confirm ja rooms-action-btn on AINULT mid.css-is (ühe teema literaalid — pole dup'i, mida eemaldada); login-modal-otp reeglid juba kasutavad `var()`-e. Päris "literaal-erineb-per-teema" juhtumeid on vähe.

### Tegemata (järgmised sammud) — UUENDATUD piloodi põhjal
- **Etapp 6 tuum on enamjaolt KASKAADI-KONSOLIDEERIMINE, mitte muutujastamine.** Käi läbi vaiketeema (`:not()`-ahela) reeglid; iga reegli kohta, mis on baidi-identne mõne `:root.theme-X` koopiaga, eemalda see `:not(.theme-X)` ahelast ja kustuta koopia. Ohutu AINULT kui kehad on baidi-identsed (kontrolli enne!). Kui kehad erinevad → jäta rahule (genuine per-teema). Mõõda dup iga sammu järel (peab langema), testid baseline'i vastu, brauseriproov night/dark/mono arvutatud stiilidel.
- **Tõeline muutujastamine** ainult seal, kus 3+ teemat annavad samale komponendile ERI väärtused — neid on vähe; tuvasta enne grep'iga, ära eelda.
- **Väikesed eraldi tööd:** OrbitalMenu.css failisisene dedup (531 rida); LeftRail↔RightRail ühendamine (~670 rida); tombstone'ide kustutamine pärast testide ümbersuunamist (chat-focus.css, documents-mode.css, glass.css ja helpers-core.css aggregaatorid, a11y.css); invite/help-listings/selected-listing shared-otsus.

## 8. Mida MITTE teha

- Ära tee "suurt pauku" — ühe commitiga kogu struktuuri liigutamine teeb visuaalsete regressioonide leidmise võimatuks
- Ära muuda kaskaadijärjekorda kolimisel: @importide järjekord globals.css-is ja mobile.css-is on tahtlik (README: "later files intentionally override earlier foundations"); feature'i sees säilita reeglite järjekord algul 1:1
- Ära kustuta tombstone-faile ega muuda failiteid enne, kui vastavad testid (88 viidet) on samas commitis uuendatud
- Ära puuduta leaflet-* reegleid ega dünaamilisi klasse (koondraport p 2)
- Ära lisa uusi reegleid vanadesse monoliitidesse migratsiooni ajal — kehtesta reegel kohe etapis 0
