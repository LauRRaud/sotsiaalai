# Sonneti teostusplaan — nupu-süsteemi lammutus + `app/styles/` ümbertõstmine

**Koostas Opus 2026-06-14.** See on **master-worklist**: konkreetne, mõõdetud, järjestatud
nimekiri, mille Sonnet teeb otsast lõpuni, viil-kaupa, snapshot-väravaga. Eesmärk:
kaotada 2-kihiline nupu-võlg (Tailwind className-stringid + `app/styles/` CSS) ja viia
kogu platvorm ühele kanoonilisele nupule + token-tabelile.

**REEGLID elavad mujal — see fail on AINULT järjekord + ulatus:**
- `css-button-system.md` — archetype'id, kontrakt (I1–I4), alias-otsustusreegel §3, **variant-korrektsuse kontroll §3 ⚠** (kohustuslik).
- `css-restructure-plan.md` — sihtarhitektuur (3 muret), `app/styles/` siht-kaust §3, `@layer` §4, Rada B token-viilu mall §5.
- `css-cleanup-runbook.md` — viilu-runbook + snapshot-värav.
- Mälu: `css-restructure-progress`, `css-debt-roadmap`.

**Põhiidee (kordus):** brauseri võitev arvutatud stiil ON spec. Disain on enamasti
õige; võlg on STRUKTUURNE — võitev kujundus elab vales kohas (81 className-konstanti +
teema-CSS-ahelad). Korrastus = vii kujundus komponenti + tokenisse, kustuta kaotajad.
`!important`/`!` kaovad **kõrvalsaadusena**.

---

## 0. Lähtekoht (mõõdetud 2026-06-14)

**Kaks kihti, mõlemas paralleelsed nupu-definitsioonid:**

| Kiht | Maht | Kus |
|---|---|---|
| **Tailwind (JSX)** | **81 `*ButtonClassName` konstanti üle 33 faili** | `grep -rn "Button.*ClassName\s*=" components` |
| **CSS (`app/styles/`)** | `.button`/`[data-variant]` reeglid **11 failis**; laiem `button/btn` **1232 esinemist 45 failis** | teema-koondumine: `hc.css` 264 · `mid.css` 97 · `mono.css` 71 · `light.css` 44 · `dark.css` 35 |
| **`!important` kokku** | **3769** (mõõdik) | `node scripts/css-important-audit.mjs` |

**Kanooniline siht (ainus tõde):**
- Komponent: `components/ui/Button.jsx` (variandid `primary/secondary/ghost/danger/linkBrand`, suurused `sm/md/lg`).
- Baas-CSS: `app/styles/base/core.css:174` (`.button`).
- Tokenid: `--btn-primary-*` → `tokens/theme-X.css`.
- Efektid: `app/styles/shared/ui-glow.css` (efekti-spec, ÄRA riku — vt §G4).

---

## RADA 1 — Nupu-konsolidatsioon (mõlemad kihid)

Eesmärk: kõik 81 konstanti → kas `<Button>` prop/variant, või Tailwind-layout kutsumiskohas, või kustutatud. Iga viil = `css-button-system.md §3` otsustusreegel + §3 ⚠ variant-kontroll.

> **SEIS 14.06.2026 (vt `css-progress-log.md` dateeritud kirje + [[canonical-button-look]]):**
> Viilud **1.1–1.4 TEHTUD** (commits `1bacf204`→`1e75c9e4`). Kogu platvormi `ghost`/`secondary`
> Button-kasutus migreeritud: tegevus → `primary`, hävitav → `danger`, tühista/tagasi/sulge +
> `as="a"` → `linkBrand`. Kanooniline nupp = `/uuenda-pin` "Salvesta" klaaspill.
> **⚠ LAHTINE → Opus:** admin RAG nav-tabi VALITUD-olek "ei ole ikka õige" (punane tekst valgel
> kaardil, madal kontrast) — vt `css-progress-log.md` § "⭐ LAHTINE". Vajab brauseri-verifikatsiooni.
> **Viil 1.5 (mono/hc ahelad) + 1.6 (segmented sulgemine) endiselt Opusele.**

### Viil 1.1 — `ragAdminShared.js` varisüsteem ⭐ PILOOT (halvim kolle)

[components/admin/rag/ragAdminShared.js:155–192](../components/admin/rag/ragAdminShared.js) on **terve paralleelne nupu-süsteem** — halvim üksik kolle kogu koodibaasis:
- Konstandid: `buttonBase` · `Compact` · `Tiny` · `Primary` · `Ghost` · `Danger` · `Secondary` · `Refresh`.
- Oma token-nimeruum `--admin-button-*` (rida 157–166), mis remapib `--documents-*` peale (rida 12–16).
- **~50 `!important`** ainult nendes 8 stringis (`![background:…]`, `!rounded-[…]`, `!shadow-none`, `!transform-none`…).

See on see, mis teeb RAG-lehel "surnud" lameda kujunduse — varisüsteem võidab `<Button>`-i jõuga.

**Mõjutatud kasutuskohad (8 faili, `import … from "./ragAdminShared"`):**
`RagAdminContactRegistryPanel.jsx`, `RagAdminKovSourceMonitorPanel.jsx`, `RagAdminRtRegistryPanel.jsx`,
`RagAdminDocumentsView.jsx`, `AnalyticsDashboard.jsx` (+ ülejäänud `components/admin/rag/*` ja `kov/*`).

**Otsus (kasutaja kinnitas 2026-06-14): admin-nupud EI ole eraldi "admin"-stiil — need on platvormi primaarsed tegevused.** Seega:
1. Kõik admin-RAG tegevus-nupud → `<Button variant="primary">` (suured CTA-d) / `variant="danger"` (hävitav).
   - "secondary"/"ghost" admin-nupud olid **vale variant** (peaaegu nähtamatud heleda paneeli peal) — vt `css-button-system.md §3 ⚠`. Tegevus-nupp = `primary`.
2. Tabeli-rea pisinupud (`buttonTiny`/`buttonCompact`): säilita **mõõt** Tailwind-layoutina kutsumiskohas (`size="sm"` + vajadusel `!px`/`!min-h`), AGA värv/kuju/vari tuleb `<Button>`-ist, mitte `--admin-button-*`-ist.
3. **Kustuta** `buttonBase/Primary/Ghost/Danger/Secondary/Refresh` konstandid + `--admin-button-*` token-blokk (rida 157–166) + `--documents-*` button-remapid, kui neid mujal ei loeta (grep enne kustutust).
4. Kui admin vajab tihedamat mõõtu kui `size="sm"`, lisa `Button.jsx`-i suurus (nt `xs`) — **mitte** uut className-konstanti.

**DoD:** `ragAdminShared.js`-s null `button*ClassName` (v.a puhas layout, kui tõesti vaja) · null `--admin-button-*` · admin-nupud renderdavad sama `[data-variant="primary"]` kujundust mis `/uuenda-pin` · snapshot identical (VÕI tahtlik: nupud muutuvad nähtavaks — seleta + screenshot) · test 968/12 · audit-arv langeb.

> ⚠ **NB:** see viil MUUDAB tahtlikult välimust (lame surnud → platvormi pill). Snapshot EI ole identical siin — see on ainus viil kus muutus on soovitud. Dokumenteeri before/after screenshot. Edasised viilud peavad olema identical.

### Viil 1.2 — `invite-primary-btn` + `invite-refresh-btn` pere

Vt `css-button-system.md §5 (1)–(2)`. Token-remap (`register.css:100`) + mono.css:376 token-blokk → `<Button>` variant/prop või token-väärtus per teema. Eemalda mono/hc `:is()` kaasamis-nimekirjast.

### Viil 1.3 — `drawer-pill-btn` + `workspace-feature-action-btn`

Vt `css-button-system.md §5 (3)–(4)`. chat/mono + chat/themes + light → Button variant. (`documents-*` pere JUBA VALMIS.)

### Viil 1.4 — Ülejäänud Tailwind-konstandid (feature kaupa)

Worklist: `grep -rn "Button.*ClassName\s*=" components` → 81 konstanti. Järjekord = `consistency.md` lahknevused (suurim mõju enne). Iga konstant § 3 otsustusreegli järgi. Failid loendiga (count):
`ProfiilBody` 5 · `ChatComposer` 6 · `ChatSidebar` 5 · `CovisionPage` 5 · `ChatAnalysisPanel` 5 · `AnalyticsDashboard` 4 · `MaterialsAdminSubmissionsPanel` 4 · `RegistreerimineBody` 3 · `InviteModal` 3 · `ChatSourcesPanel` 3 · … (vt grep täisnimekiri).

### Viil 1.5 — Teema-CSS hiigel-ahelad ⚠ KÕRGE RISK (Opus, mitte Sonnet)

`mono.css:361` + `hc.css:1064` `:is(.button,…):not(…)` ahelad. Pärast 1.1–1.4 on kaasamis-nimekiri kahanenud. Spetsiifilisus-tundlik, a11y-kriitiline (hc) → **eskaleeri Opusele**, lai snapshot, kontrasti-kontroll. Vt `css-button-system.md §5 (5)`.

### Viil 1.6 — Ikoon-archetype + segmented

`chat-send-btn` jt (9 faili) → `--icon-btn-*` nimeruum. Segmented enamjaolt valmis, kontrolli ja sulge. Vt `css-button-system.md §5 (6)–(7)`.

---

## RADA 2 — `app/styles/` ümbertõstmine + token-migratsioon

Käib **paralleelselt/peale** Rada 1. Vt täis-spec `css-restructure-plan.md §3` (kaust) + `§5 Rada B` (token-viil) + `§4` (`@layer`).

### Viil 2.1 — `tokens/` kaust loodud

Tekita `app/styles/tokens/` (base.css + theme-{light,mid,dark,night,mono,hc}.css), esialgu TÜHJAD token-tabelid + import-graaf globals.css-i. Üks commit, snapshot identical (midagi ei liigu veel).

### Viil 2.2+ — Rada B token-viilud (per feature/teemafail)

`css-restructure-plan.md §5` mall (`documents/ui.css:167–177` näidisviil). Järjekord = RISK, mitte arv:
1. `documents/ui.css` (61) — keskmine, dropdown-eeltöö tehtud.
2. `chat/themes.css` (93) → `chat/shell.css` (52) → `chat/mono.css` (84).
3. `mid.css` (61), `mono.css` (87).
4. `service-map/desktop.css` (75) — Leaflet, keerukam.
5. **VIIMASENA** `hc.css` (325) + `chat/hc.css` (144) — Opus, a11y-kriitiline.

Iga viil: leia `:root.theme-X feature { surface-prop: VALUE !important }` → `tokens/theme-X.css { --token: VALUE }` → feature loeb `var()` ilma `!important` → arv langeb. Snapshot identical.

### Viil 2.3 — Kausta-kolimised (1:1, §3 kaust)

`theme/*.css` ahelad → tokens/ (väärtused) + primitives/ (tarbimine). `components/*` compat-aggregaatorid → orvud (`orphans.md`, kontrolli `register-node-test-loader.mjs legacyCssBundles` enne kustutust). `mobile/` paralleelhierarhia → feature `@media` või responsive-token. Üks kolimine = üks commit, import-graaf + snapshot.

### Viil 2.4 — `@layer` hierarhia ⚠ KÕRGE RISK (Opus)

`css-restructure-plan.md §4`. Globaalne, kogu kaskaad reastub ümber. Pilootida ühel komponendil. **Opus.** Pärast seda muutuvad layout-`!important` + 1360 Tailwind-`!` eemaldatavaks.

---

## G. Valvurid (iga viil, kohustuslik)

- **G1.** Snapshot-diff `✓ identical` enne commiti. ERAND: viil 1.1 (admin nupud muutuvad nähtavaks) — tahtlik, dokumenteeri screenshot.
- **G2.** `npm test` = **968/12** baseline (null UUT kukkumist; 12 on pre-existing `lib/rag/*`).
- **G3.** `jscpd` ≤ baseline. `node scripts/css-important-audit.mjs` arv langeb (Rada B + nupu-viilud).
- **G4.** **Variant-korrektsus** (`css-button-system.md §3 ⚠`): pärast iga alias/konstant-eemaldust VAATA renderdatud nuppu — `primary`=3D klaas+glow, `ghost/secondary`=lapik 2D, `danger`=3D punane. Snapshot ei püüa vale varianti.
- **G5.** **Efekti-spec puutumata** (kasutaja kinnitas): dark/night/mono/HC = 2 edge-glow; light/mid = 3 (2 glow + idle vari). Allikas `shared/ui-glow.css`. Ühtlusta identiteet, ÄRA kustuta efekte.
- **G6.** LF mitte CRLF. ÄRA kasuta PowerShell `Set-Content` CSS-il.
- **G7.** ÄRA puuduta `lib/rag/*` (teise konto WIP). ÄRA kustuta `safety_snapshots/`.
- **G8.** Üks viil = üks commit. `Co-Authored-By` rida. Logi `css-progress-log.md`-sse.

## Kes mida (risk)

- **Sonnet** (snapshot-väravaga mehaanika): viilud 1.1–1.4, 1.6, 2.1–2.3.
- **Opus** (kõrge risk): viilud 1.5 (mono/hc ahelad), 2.4 (`@layer`), iga koht kus snapshot näitab seletamatut muutust.

## Alusta siit

**Viil 1.1 (`ragAdminShared.js` lammutus)** — isoleeritud, halvim kolle, tõestab mustri ja annab kasutajale kohe nähtava võidu RAG-lehel. Siis 2.1 (tokens/ kaust) paralleelselt, edasi järjekorras.
