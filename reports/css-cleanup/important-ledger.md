# `!important` vähendamise REGISTER (jälg: mis tehtud / mis jäänud)

**Miks:** et üheski sessioonis/kontol ei tekiks segadust, mis on tehtud ja mis tegemata.
See fail elab repos (kandub kontovahetust üle). Uuenda iga partii järel.
Meetod + reeglid: [css-important-reduction-method.md](../css-important-reduction-method.md).

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

## Edenemine feature/faili kaupa

Legend: ✅ tehtud · 🔄 pooleli · ⬜ tegemata · 🔒 alles-jäetud (load-bearing/kontrakt)

| Sihtala | Algus | Stripitud | Surnud-välja | Alles (+miks) | Praegu | Staatus | Commit |
|---|---:|---:|---:|---|---:|---|---|
| `features/policy` tekstiklaster | — | 7 | 1 reegel | — | — | ✅ | 828bb330, 29685773 |
| `features/policy` geomeetria | ~133 | 0 | 0 | 🔒 render-kandev (strip-all diff: height/margin/padding liiguvad) JA kontrakt-lukus (policyScrollHeader + scrollSurfaceHeader, ~29 assert'i) | ~133 | 🔒 | strip-all reverditud |
| `utilities/glass-ring-stable` | 1 | 0 | 0 | 🔒 Reegel A — kontrakt-test valvab | 1 | 🔒 | 56ba160c (KEEP) |
| `theme/hc.css` | 328 | **312** | 0 | 🔒 16 (kontrakt-asserteritud) | **16** | ✅ | (käes) |
| `theme/mono.css` | 148 | **122** | 0 | 🔒 26 (kontrakt-asserteritud, sh hcSurfaceContracts + monoThemeContracts) | **26** | ✅ | (käes) |
| `theme/mid.css` | 65 | **52** | 0 | 🔒 13 (4 kontrakt + 9 box-shadow render-kandev: glass-ring sõda) | **13** | ✅ | (käes) |
| `features/chat/hc.css` | 207 | **112** | 0 | 🔒 95 (88 force-keep: 6 alati-nähtavat load-bearing + KÕIK drawer-sisesed, mida gate ei ava; 7 kontrakt) | **95** | ✅ | 53ff7cf3 |
| `features/chat/mono.css` | 131 | **42** | 0 | 🔒 89 (84 force-keep: .chat-composer-glow-shell load-bearing + KÕIK drawer-sisesed; drawer-keskne fail) | **89** | ✅ | (käes) |
| `features/chat/shell.css` | 191 | **64** | 0 | 🔒 127 (5 force-keep: .ui-glow-button-frame glow-kaitstud + drawer; ülejäänu kontrakt). BASE-fail (mitte teema-scoped) aga suur vaba fraktsioon = cargo-cult | **127** | ✅ | (käes) |
| `features/chat/mobile.css` | 169 | **102** | 0 | 🔒 67 (63 force-keep: .chat-container(+--round) load-bearing + drawer; ülejäänu kontrakt). @media mobiil, gate püüab 390px | **67** | ✅ | (käes) |
| `features/chat/themes.css` | 93 | 0 | 0 | 🔒 92 (kontrakt-lukus, oraakel STRIP 1) | 93 | 🔒 | — |
| `features/profile/hc.css` | 40 | **12** | 0 | 🔒 28 (25 force-keep: .dock-item + .profile-orbit-menu__center load-bearing + kontrakt; orbit-menu ülejäänu = teema-dropout müra, mitte vaba) | **28** | ✅ | (käes) |
| `features/documents/ui.css` | 110 | **52** | 0 | 🔒 58 (57 force-keep: ~14 base-pinda load-bearing — form-input/panel/surface/notice/field/workspace-shell/guide-panel + interaktsiooni-gated). Suurem load-bearing kui chat (base teeb päris tööd) | **58** | ✅ | a635603e |
| `features/documents/agent.css` | 51 | **4** | 0 | 🔒 47 (suuresti load-bearing: chat-inputbar + conversation-window + glow-composer/window background kõik teemad) | **47** | ✅ | (käes) |
| `features/documents/library.css` | 11 | **6** | 0 | 🔒 5 (kontrakt) — full-strip render-ohutu | **5** | ✅ | (käes) |
| `features/service-map` | 357 | 0 | 0 | — | 357 | ⬜ | — |
| `mobile/` | 806 | 0 | 0 | — | 806 | ⬜ | — |
| `shared/` | 384 | 0 | 0 | — | 384 | ⬜ | — |

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
