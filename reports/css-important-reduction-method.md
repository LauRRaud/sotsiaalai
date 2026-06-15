# `!important` vähendamise meetod + kaskaadi-teadmine (2026-06-15)

**Miks repos:** sessiooni-mälu on konto-lokaalne; see dokument elab repos, et iga
sessioon/konto jätkaks. Seotud: [css-tailwind-cleanup-plan.md](css-tailwind-cleanup-plan.md),
[css-styles-cleanup-strategy.md](css-styles-cleanup-strategy.md),
[css-campaign1-progress-2026-06-15.md](css-campaign1-progress-2026-06-15.md).

## KASKAADI-KIHI REEGEL (kriitiline, verifitseeritud)

`app/styles/tailwind.css` deklareerib: `@layer theme, base, components, utilities;`
ja impordib Tailwindi utiliidid `layer(utilities)` sisse. **85/87 käsitsi-CSS-faili
on kihistamata** (ainult `base/typography.css` + `tailwind.css` kasutavad `@layer`).

CSS-kaskaadi kihi-reegel on **`!important`-ile PÖÖRATUD:**

| Deklaratsioon | Kes võidab |
|---|---|
| **tavaline** | kihistamata > kihistatud → **käsitsi-CSS võidab Tailwindi** |
| **`!important`** | kihistatud > kihistamata → **Tailwindi `!` võidab käsitsi-CSS `!important`-i** |

(MDN: *"Important styles in layers override important styles defined outside of any layer."*)

### Mida see tähendab
- **CSS-`!important` EI võitle Tailwindiga** — tal pole vaja (tavaline käsitsi-CSS
  võidab Tailwindi niikuinii), ja kui võitleks, **kaotaks** (Tailwindi `!` võidab).
  Niisiis CSS-`!important` (3649) = **CSS-vs-CSS teema-sõda** (Root B), MITTE Tailwind.
- **Tailwindi-vs-käsitsi konflikt ON olemas**, aga väljendatud ~323 Tailwindi
  `!`-modifikaatorina JSX-is (Root A) — eraldi probleem, eraldi parandus (`@layer`).
- Kui käsitsi-`!important` võitleb Tailwindi `!`-iga elemendil → käsitsi-reegel on
  **surnud** (Tailwind renderdab) → eemaldatav; `!important` lisamine ei aita.

## TEEMAD SAAB LUUA `!important`-VABALT (token-muster)

`!important` EI ole "õige kujundus" iseenesest — see on plaaster, mis maskeerib
kihistuse-konflikti. Õige muster:

```css
/* ❌ override (vajab !important): teema seab tausta otse elemendile */
:root.theme-mid .card { background: <gradient> !important; }

/* ✅ token (EI vaja !important): baas loeb muutujat, teema seab muutuja */
.card { background: var(--card-bg); }            /* üks deklaratsioon, no !important */
:root.theme-mid  { --card-bg: <mid väärtus>; }
:root.theme-light { --card-bg: <light väärtus>; }
```

Kood teeb seda **juba osaliselt** — nt `features/documents/agent.css` loeb
`background: var(--subpage-card-bg)` ilma `!important`-ita; teema seab tokeni.
Migratsioon = override → token.

**Aus nüanss:** 100% `!important`-vabaks ei saa — inline-stiile (`style="..."`) ja
Tailwindi `!` elemendil võidab AINULT `!important`. Aga teema-pinnad (background/
border/color/shadow, ~1584 deklaratsiooni) muutuvad token-mustriga `!important`-vabaks.

## MEETOD: leia mida üle kirjutab → kõrvalda → `!important` maha

1. **Leia võitja `!important` + mida see üle kirjutab** (tööriist, allpool).
2. **Klassifitseeri** (verdikt) — miks `!important` on/pole vajalik.
3. **Kõrvalda konkurent** (surnud reegel / duplikaat) VÕI migreeri token-mustrisse.
4. **`!important` maha** (kus enam pole vaja).
5. **Gate:** `css-snapshot-diff` peab näitama computed-style IDENTNE (golden-master =
   õige kujundus). 🟢 commit · 🔴 konkurent oli vajalik, taasta.

## TÖÖRIIST: `scripts/css-important-overrides.mjs`

Kaskaadi-resolver. Elemendile (selektor × route) üle 6 teema + pseudo-olekute küsib
CDP `getMatchedStylesForNode`-iga **kõik matchivad reeglid** ja lahendab kaskaadi
per property. Võitja = **computed-vastavuse** järgi (kihi-teadlik — arvestab
Tailwind-`!` inversiooni); box-shadow puhul fallback järjekorrale (`computedMatched=false`).

```bash
MSYS_NO_PATHCONV=1 SNAPSHOT_SESSION='<cookie>' node scripts/css-important-overrides.mjs \
  --selector ".glass-ring--desktop-stable" --route /kasutusjuhend \
  --props box-shadow --headed --out reports/css-cleanup/state/overrides.json
# --props all = kõik propid; --targets <file> = mitu sihti; vt skripti päist
```

### Verdiktid
| Verdikt | Tähendus | Tegevus |
|---|---|---|
| `REDUNDANT` | ükski teine reegel ei deklareeri | eemalda `!important` |
| `WINS-BY-SPECIFICITY` | võitja kõrgeim spetsiifikatsus, ainult tavalised konkurendid | eemalda `!important` (gate) |
| `DEAD-DUPLICATE` | üle-kirjutatud reegel sama väärtusega | eemalda see duplikaat |
| `IMPORTANT-WAR` | teine `!important` konkurent, eri väärtus | `!important` kandev; kõrvalda kaotaja-konkurent enne |
| `CHECK-TAILWIND-LAYER` | Tailwindi `!` (kihis) konkureerib | Tailwind võidab kihi-reegli järgi; võitja võib olla valesti tuvastatud → kontrolli |

### `removalCandidates`
Reeglid mis on **üle-kirjutatud, aga mitte kunagi võitjad** üheski püütud olekus
(`dup` = sama väärtusega kaotaja, turvaseim). **HOIATUS:** "ei võida SELLE selektori
jaoks" ≠ "kasutamata mujal" — sama reegel võib võita teisel elemendil. **Vaja
globaalset kasutus-kontrolli + gate'i enne eemaldamist.** Teema+element-spetsiifilised
selektorid on turvaline tsoon.

### Auto-eemaldaja (faas 2, veel ehitamata)
`removalCandidates` → eraldi eemaldaja rakendab → gate verifitseerib → 🔴 = auto-revert.
Safe-loop, rakendatud eemaldamisele. ÄRA eemalda ilma gate'ita (capture katab vaid osa
olekuid).

## NÄIDE-LEID: `.glass-ring--desktop-stable` (üks element, 3 konfliktset box-shadow)

Tööriist leidis mid-i all 3 konkureerivat `box-shadow: ... !important`:
- **Võidab** (`theme/mid.css:165`): `var(--mid-round-shell-shadow)` = `0 18px 34px …, 0 9px 18px …`
- **Surnud** (`utilities/glass-ring-stable.shared.css:5`): `0 24px 48px rgba(12,7,6,0.34) !important` — kõrgem-skoobiline `:is()` võitja sööb ära; computed-väärtus seda EI näita → eemaldamis-kandidaat
- `mobile/foundations.css` `none !important` võidab mobiilis (@media)

Verdikt mid = `IMPORTANT-WAR`; `glass-ring-stable.shared.css:5` on surnud kaotaja
(eemalda + gate). mono = `WINS-BY-SPECIFICITY` (`!important` üleliigne, eemaldatav).

## MÕÕTMINE: `!important` on valdavalt KANDEV (mitte surnud)

Kõigi 65 `!important` strip mid.css-st → 1450 computed-muutust (12 distinktset
nupu/pinna-selektorit). Järeldus: ei saa lihtsalt kustutada → vaja token-migratsiooni.
Üks lai reegel mõjutab paljusid (mid.css:98 `transition !important` → 1276 lahtrit) →
laia-reegli migreerimine = suur `!important`-langus korraga.

## JÄRGMINE
1. Lõpeta glass-ring loop-tõestus (eemalda surnud `glass-ring-stable.shared.css:5`, gate).
2. Jooksuta tööriist teema-failide võtmeselektoritel → koonda eemaldamis-/migreerimis-partii.
3. Token-migratsioon failihaaval (pinna-`!important` → `var(--token)`), gate-verifitseeritud.
4. Faas 2: gate-guarded auto-eemaldaja.
