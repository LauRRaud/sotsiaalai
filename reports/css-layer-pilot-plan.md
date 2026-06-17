<!-- Sessioon (2026-06-17): orbiit-menüü alalehtede pilootgrupi audit + teostus-plaan. -->
# `@layer` / orbiit-menüü pilootgrupp — audit + teostus-plaan

**Taastepunkt enne tööd:** GitHub `origin/main` = `80608c3b` (vt mälu `css-layer-pilot-restore-point`).

## Pilootgrupp (sama "vorm-klaasrõngal" template)
`UuendaEpostiBody`, `UuendaPinBody`, `TellimusBody`, `ProfiilBody` (konto), keel/ligipääsetavus + `RegistreerimineBody`.
**NB:** RegistreerimineBody = `/registreerimine` = **AVALIK → gate'itav ilma auth'ita.** Ülejäänud (uuenda-epost/pin, tellimus, profiil) = auth-taga → vajavad värsket sessiooni (`tmp-create-login-token.mjs` e2e.call.owner / SNAPSHOT_SESSION).

## Leid: lehed on JUBA puhtad
- `UuendaEpostiBody`, `UuendaPinBody`: **0 oma `!important`, 0 oma `.css`-import** — ehitatud komponentidel (GlassRing, GlowField, Button) + jagatud `glassPageStyles` + Tailwind.
- Residuaal = ~4-6 Tailwind-`!`-modifikaatorit lehe kohta + `glassPageStyles.js` 6.

## ⚠ KRIITILINE: `!`-modifikaatoritel on KAKS eri põhjust
1. **Leht → komponendi-käsitsi-CSS** (nt uuenda-epost `!min-h-[3.42rem] !py !px !text`): kihistamata `ui-glow.css .ui-glow-field` (min-height 3.6rem jne) lööb lehe tavalist Tailwindi → leht vajab `!`-i. **`@layer` VÕI komponendi-token parandaks.**
2. **Tailwind-vs-Tailwind kompositsioon** (glassPageStyles: back-nupp `max-[768px]:!inline-flex` üle baasi `max-[768px]:hidden`; `min-[769px]:!text-[2.6rem]` jne): kaks Tailwind-utiliiti, võrdne spetsiifikatsus, järjekord ebakindel → `!` sunnib. **`@layer` EI paranda seda** (mõlemad samas utilities-kihis); vajab Tailwind-kompositsiooni ümberkorraldust.

⇒ **`@layer` pole täis-lahendus pilootgrupile** — see katab ainult tüübi 1.

## Fix-valikud (risk/effort)
- **A. `@layer`** (globaalne): parandab tüüp-1. EI ole render-neutraalne (muudab pretsedentsi → nihked, vajab inim-üle-vaatust). Globaalne risk. **Koos-tehtav.**
- **B. Komponendi-mõõtude tokenid** (soovitan tüüp-1 jaoks): `ui-glow.css .ui-glow-field { min-height: var(--ui-glow-field-min-h, 3.6rem) }` (default = praegune → **render-neutraalne**), leht seab `--ui-glow-field-min-h` `!`-i asemel. Skoobitud, inkrementaalne, **gate'itav avalikul /registreerimine'l**. Madalam risk kui globaalne `@layer`.
- **C. Tailwind-kompositsiooni ümberkorraldus** (tüüp-2): väldi override't (üks tingimuslik klass, mitte baas+`!override`). Tailwind-idioom, per-koht.

## Soovitatud järjekord (koos-sessiooniks)
1. **B tüüp-1 jaoks** — token-ize jagatud komponendi-mõõdud (render-neutraalne default), gate /registreerimine'l (avalik) → siis lehed seavad tokeni, drop `!`. Auth-lehed gate'itud värske sessiooniga.
2. **C tüüp-2 jaoks** — glassPageStyles Tailwind-kompositsiooni puhastus, per-koht.
3. **A (`@layer`)** — AINULT kui B/C ei kata; globaalne, render-shift-review koos.

## Miks AUTONOOMSELT EI teostatud
`@layer` = globaalne render-shift (vajab "kas see nihe OK?" inim-otsust). Auth-lehed vajavad sessiooni-verifitseerimist. **Ei committi verifitseerimata main'i sel ajal kui kasutaja eemal** — taastepunkt kaitseb täis-katastroofi eest, aga MITTE peent verifitseerimata regressiooni eest flow-gated lehel. Teostus = koos-sessioon.
