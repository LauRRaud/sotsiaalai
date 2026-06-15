# Kampaania 1 edenemine + gate-2 leid (2026-06-15, Opus)

## TEHTUD — teema-aktsentide tokeniseerimine (kõik commititud + pushitud)

Kampaania 1 (teema-override kiht) värvi-tokeniseerimine on **lõpetatud kõigil 6 teemafailil + mono feature-failidel**. Iga commit verifitseeritud safe-loop golden-master diffiga (gate 1, visuaalne).

| Commit | Fail | Token(id) | Inst |
|---|---|---|---|
| `e369e995` | theme/hc.css | `--hc-accent-rgb` | 204 |
| `14c94bb3` | theme/mono.css | `--mono-light-rgb` + `--mono-mid-rgb` | 37+16 |
| `3b1f8335` | features/chat/mono.css | `--mono-light-rgb` | 26 |
| `916d82c1` | features/documents/mono.css | `--mono-mid-rgb` + `--mono-light-rgb` | 20+3 |
| `65a10792` | features/profile/mono.css | `--mono-light-rgb` + `--mono-mid-rgb` | 7+12 |
| `d2c86c6d` | theme/mid.css | `--mid-white-rgb` | 16 |
| `0442349e` | theme/dark.css | `--dark-white-rgb` + `--dark-black-rgb` | 42+17 |
| `99434dac` | theme/light.css | `--light-white-rgb` | 15 |
| `32ab6cac` | theme/night.css | `--night-white-rgb` + `--night-blue-rgb` | 4+2 |

Origin/main on sünkroonis (kuni `32ab6cac` pushitud).

## OTSUS — multi-teema failid (chat/themes.css, home/themes.css) JÄÄVAD tokeniseerimata

Roadmap (`css-debt-roadmap`) kinnitab: värvi-tokeniseerimise **väärtuslik osa on tehtud** (päris teema-aktsendid: HC kollane, mono hallid, night sinine). Kaks järelejäänud multi-teema faili on geneerilised valge/musta/slate **pinnad-varjud** hajutatuna üle mitme teema-skoobi — `255,255,255` tokeniseerimine lisaks indirektsiooni ilma single-source võiduta. **Mitte kõrge väärtusega → ei jätka pimedat sweep'i.** Tegelik järgmine võlg = `!important` (4637) + `:not()`-ahelad + @layer arhitektuur (eraldi kampaania).

## GATE-2 LEID — Sonnet jättis testid jooksmata (`--no-tests`)

Kõik 9 commiti tehti `--no-tests`-iga (ainult visuaalne gate 1). Gate 2 (`npm test`) jooksutamisel: **15 kukkujat vs baseline 12 = 3 "uut".** Triage:

### 1 PRE-EXISTING (stale baseline, MITTE minu töö) — väljaspool skoopi
- `high contrast mobile chat top nav icons stay background-free`
- Kukkuv assert on **struktuurne** selektor `:not([data-chat-mobile-topnav-button="1"]):not(.chat-rail-icon-btn)` — seda mustrit pole hc.css-s.
- Tõestus: muster puudub NII tokeniseerimise-eelses (`e369e995^`) KUI praeguses hc.css-s. Tokeniseerimine muutis AINULT värve (git-diff puhtalt rgba) → ei saa struktuuri muuta. Pass/fail identne enne/pärast → pre-existing.
- 2026-06-11 baseline on lihtsalt vananenud. **Ei paranda (skoobiväline).**

### 2 TOKENISEERIMISE-PÕHJUSTATUD (e369e995, HC) — vaja parandada
- `HC selected option cards keep a yellow fill after the generic glow reset`
- `HC service map toolbar placeholders are yellow`
- Põhjus: need on **teksti-kontrakt-testid**, mis grep'ivad lähtekoodist literaal-`rgba(255, 234, 0, X)`. Pärast HC-tokeniseerimist on seal `rgba(var(--hc-accent-rgb), X)`.
- Visuaalne gate läbis (arvutatud stiil identne, brauseris `var()` resolvub); unit-testid loevad lähteteksti, kus token ei resolvu.
- **Isolatsioon tõestab põhjuse:** tokeniseerimise-eelse hc.css-ga mõlemad testid LÄBIVAD; praegusega kukuvad. Ainus muutuja = hc.css.

### Kõrval-leid: CRLF
- Edit-tööriist (Windows) konverteeris hc/mono/dark/documents-mono working-tree CRLF-iks. `.gitattributes` nõuab `*.css eol=lf`; repos (HEAD) on LF (git normaliseeris). Parandasin working-tree LF-iks (ei mõjuta arvutatud CSS-i ega git-diffi). See lahendas `genericResetIndex`-i (mitmerealine `\n` indexOf CRLF-il ei matchi).

### Loaderi käitumine (oluline teadmine)
- `scripts/register-node-test-loader.mjs` **resolvib CSS `@import`-id** test-lugemisel: 7-rea `glass.css` agregaator annab testile täisbundle (shared/glass-core+ui-glow+register). Seetõttu glass-assertid läbivad hoolimata 7-rea failist.
- Loader EI resolvi `var()`-tokeneid → tokeniseeritud failis on token-string → literaal-assertid kukuvad.

## PARANDUS (pooleli) — uuenda HC teksti-kontraktid token-vormile

Failis `tests/ui/hcSurfaceContracts.test.js`, AINULT `hc`-viitega literaal-assertid (glass/borderGlow/segmented loevad tokeniseerimata faile → JÄTTA literaal):
- rida 224: `rgba\(255,\s*234,\s*0,\s*0\.1\)` → `rgba\(var\(--hc-accent-rgb\),\s*0\.1\)`
- rida 228: `...0\.06\)` → token-vorm
- rida 232: `...0\.1\)` (`:is(button...)` algusega) → token-vorm
- rida 312 (service-map placeholder): `...0\.92\)` → token-vorm

Token-vorm failis on tühikuta: `rgba(var(--hc-accent-rgb),0.1)`. Kasuta `\s*` peale koma (spacing-tolerantne). Kontrakt jääb tähenduslikuks (kontrollib `--hc-accent-rgb` viidet, mis ON kollane) — kooskõlas faili olemasoleva stiiliga (rida 243 juba `var(--seg-card-bg-selected)`).

**Pärast parandust:** oodatav tulemus = baseline 12 + 1 pre-existing mobile = 13 kukkujat (2 HC parandatud). Verifitseeri `npm test`.

## JÄRGMINE (kui jätkatakse)
1. (Pooleli) Paranda 4 HC teksti-kontrakti → commit.
2. Otsusta kas chat/hc.css + profile/hc.css vajavad tokeniseerimist (HC-passi ülejäänud feature-failid; previous session tegi ainult theme/hc.css).
3. Kampaania 2 (struktuur) VÕI !important-vähendus (eraldi, kõrge risk, gate kohustuslik).
