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

## Edenemine feature/faili kaupa (uuendatud 2026-06-16, sessioon 4 lõpus)

**KOKKUVÕTE: 3642 → 1255 (−2387). Kõik 87 faili uuritud ≥1 korda. Odav oraakel-korje ammendunud.**

Legend: ✅ tehtud · 🔒 blokeeritud (põhjus järel)

| Fail | Algus | Praegu | −Delta | Staatus / Blokeeritud põhjus |
|---|---:|---:|---:|---|
| `shared/ui-glow.css` | 118 | 118 | 0 | 🔒 POLIITIKA-LUKK (canonical-button-look) |
| `features/service-map/desktop.css` | 276 | 118 | −158 | 🔒 position+kontrakt-lukk (keep-selectors → 0 STRIP) |
| `mobile/platform-android.css` | 98 | 98 | 0 | 🔒 Android-only selektorid, gate puudub |
| `features/chat/themes.css` | 93 | 92 | −1 | 🔒 kontrakt-lukus (256 oraakel-muster) |
| `features/chat/shell.css` | 191 | 85 | −106 | 🔒 inputbar Tailwind-kaskaadi-lukk (transform) |
| `features/service-map/mobile.css` | 81 | 77 | −4 | 🔒 kontrakt-lukus (0 STRIP) |
| `mobile/scroll-panels.css` | 95 | 15 | −80 | 🔒 exhausted (kolm passi: 95→71→60→15); ülejäänu geomeetria-kontrakt |
| `mobile/invite-workspace.css` | 101 | 63 | −38 | 🔒 0 STRIP, täielikult kontrakt-lukus |
| `features/policy/responsive.css` | 65 | 62 | −3 | 🔒 geomeetria load-bearing (GATE-1 RED kõikides teemades) |
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
| `theme/mid.css` | 65 | 4 | −61 | ✅ |
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

**Kogu odav oraakel-korje ammendunud. Allesjäänu 1255 = 3 bloki:**

| Plokk | Näide-fail | Maht | Vaja |
|---|---|---:|---|
| POLIITIKA-LUKK | ui-glow.css | 118 | Ei puutu (canonical-button-look) |
| KONTRAKT-LUKUS | chat/themes, invite-workspace | ~400 | oracle STRIP 0 — kontrakt valvab |
| LOAD-BEARING geomeetria | policy/responsive, scroll-panels | ~120 | GATE-1 RED kõikides teemades |
| ANDROID / FLOW-GATED | platform-android, modal-surfaces | ~170 | gate puudub (platform-android) või vajab klikk-flow |
| TAILWIND-KASKAAD-LUKK | chat/shell inputbar | 85 | transform: none !important eemaldus lõhub Tailwind |
| ÜLEJÄÄNUD VÄIKSED LUKUS | chat/hc, profile/hc, touch-controls | ~200 | HC border / orbit-kontrakt |

**Edasi-töö valikud:**
1. **Token-migratsioon** (struktuurne): `--token` süsteem asendab `!important` teema-overridesid — suurim mõju, kuid struktuurne töö.
2. **Flow-gate** (`steps:[{eval/click}]`): avab modaalid/drawerid, et gateida interaktsiooni-gated reegleid.
3. **Tailwind override** chat/shell.css inputbar osas: CSS Layers või specificity fix.

## ALLESJÄÄNUD FAILIDE KAART (oraakel-dry-run, 2026-06-16) — tuleviku prioriteet
Veerg "STRIP?" = kontrakt-vaba marker (oraakel), MITTE render-tõestatud — vajab gate'i
veerus "vaja". Sorteeritud STRIP-potentsiaali järgi. ⚠ = teadaolev takistus.

| Fail | total | STRIP? | vaja (gate-tüüp) | märkus |
|---|---:|---:|---|---|
| service-map/desktop | 276 | 229 | JS-state-flow + Leaflet | ⚠ ~196 JS-oleku-taga, 33 Leaflet runtime |
| mobile/accessibility-touch | 138 | 135 | multi-route 390px | ⚠ touch-target geomeetria = tõen. load-bearing (a11y) |
| shared/ui-glow | 118 | 110 | — | ⚠ KAITSTUD (canonical-button-look, ÄRA keela glow) — poliitika-lukk, mitte kontrakt |
| mobile/platform-android | 98 | 94 | eval `data-platform=android` + multi-route | android-fix, tõen. load-bearing |
| mobile/subpage-title-system | 82 | 60 | multi-route 390px + modal-flow | broad: policy/profile/chat/documents/modaalid |
| mobile/background-home | 67 | 58 | homepage 390px | ⚠ homepage capture-flaky |
| mobile/modal-surfaces | 62 | 56 | modal-flow-gate (`eval`/click) | interaktsiooni-gated |
| policy/responsive | 65 | 50 | /policy multi-route 390px | ⚠ policy geomeetria-kontrakt-lukus (vt policy õppetund) |
| mobile/invite-workspace | 101 | 38 | invite-flow-gate | interaktsiooni-gated |
| mobile/foundations | 41 | 13 | multi-route 390px | suuresti kontrakt-lukus |
| mobile/scroll-panels | 95 | 12 | — | suuresti kontrakt-lukus (geomeetria) |
| service-map/mobile | 81 | 4 | — | kontrakt-lukus |

**Järeldus:** suurim kontrakt-vaba potentsiaal (service-map 229, touch 135, platform-android
94) on KÕIK broad/state-gated → vajavad flow/multi-route/platform gate'i (üks-route ✗).
Render-verifitseerimata STRIP = EI committi. `eval`-samm (`css-snapshot.mjs`) võimaldab
platform-force + event-avatavaid pindu. ui-glow on poliitika-lukus (glow). Edasi-töö =
kas (a) flow/platform-gate ehitamine per-fail, või (b) token-migratsioon (struktuurne,
`css-progress-log.md` rada). Mõlemad = sihilik fokusseeritud sessioon, mitte autonoomne korje.

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
