# CSS täielik ümberstruktureerimise plaan

**Koostas Opus 2026-06-14.** See on **definitiivne plaan** kogu süsteemi ümberstruktureerimiseks:
(1) kuidas komponendid tulevad, (2) kuidas `app/styles/` sisu ümber tõstame, (3) `!important`
kaotamine. Sonnet teostab, kui suur ümberstruktureerimine algab; see dokument on tema kontrakt.

Seotud (loe ka): `css-button-system.md` (komponendi-kontrakt, archetype'id), `css-tailwind-cleanup-plan.md`
(2 juurt/5 sümptomit), `css-cleanup-runbook.md` (snapshot-värav), audit `reports/css-important-audit/2026-06-14/`,
skann `reports/css-page-report/2026-06-14/consistency.md`. Mälu: `css-debt-roadmap`, `css-restructure-progress`.

---

## 0. Lähtekoht (mõõdetud 2026-06-14)

- **3769 `!important`** — 1686 surface-prop (background/box-shadow/color/border/backdrop/opacity), 1646 theme-override selektori all. Top-fail `hc.css` (407).
- **Nupu-ebajärjekindlus:** `.button[data-variant="primary"]` = **20 erinevat kujundust** light-teemas (consistency.md), admin RAG = 4.
- **Kaks juurt** (`css-tailwind-cleanup-plan §1`): **A** = kaks stiilisüsteemi ilma kihihierarhiata (käsitsi-CSS kihistamata → võidab Tailwindi → 1360 Tailwind `!`); **B** = override-põhine teemamine (`:not(.theme-X)`-ahelad + surface-`!important`).

**Põhiidee:** brauseri võitev arvutatud stiil ON spec. Disain on enamasti õige — võlg on STRUKTUURNE: võitev kujundus elab vales kohas. Korrastus = vii kujundus õigesse kohta (komponent + token + kiht), eemalda kaotajad. `!important`/`!`/scattered reeglid kaovad **kõrvalsaadusena**, neid ei jahita otse.

---

## 1. Sihtarhitektuur (kuhu jõuame)

**Kolm muret, rangelt eraldatud:**

| Mure | Kus elab | Reegel |
|---|---|---|
| **Kuju + käitumine** | React-komponent (`components/ui/*` + `*.module.css`) | tarbib `var(--*)`; ei tea teemast midagi |
| **Teema-väärtused** | `app/styles/tokens/theme-*.css` | AINULT `:root.theme-X { --*: }`; null muud selektorit |
| **Layout/spacing** | Tailwind-utiliidid JSX-is | inline; ei lähe CSS-faili |

Pluss **`@layer` hierarhia** (vt §4), mis teeb prioriteedi tahtlikuks → `!important`/`!` ülearuseks.

Lõppseis: ava ükskõik milline komponent → tema kuju on komponendis, värvid tulevad tokenist, paigutus Tailwindist. Teemafail = puhas token-tabel. Null `:is():not()` ahelat, null surface-`!important`.

---

## 2. Komponendi-mudel (kuidas komponendid tulevad)

Reeglid on `css-button-system.md`-s (archetype'id, token-nimeruumid, alias-otsustusreegel). Üldistus kõigile primitiividele:

1. **Üks kanooniline komponent per archetype.** Nupud → `<Button>`/`<IconButton>`; paneelid → `<Panel>`; kaardid → `<Card>`; sisendid → `<Input>`; modaalid → `<Modal>`; dropdownid → `<Dropdown>`; valik → `<OptionCard>`. (Olemas: `components/ui/`.)
2. **Komponent = kuju + variandid + token-tarbimine.** `var(--<primitiiv>-*)`. Null teema-teadlikkust.
3. **Token-nimeruum per archetype** (`--btn-*`, `--icon-btn-*`, `--panel-*`, `--card-*`, `--input-*`, `--seg-*`). Üks archetype ei laena teise tokeneid.
4. **Migratsioon per archetype (viil):** (a) vii kõik kasutuskohad kanoonilisele komponendile; (b) alias-klassid → kas `<Button>` prop (käitumis-/visuaali-alias) või Tailwind-layout (paigutus-alias) või kustuta (surnud); (c) **kontrolli variant-korrektsust** (alias võis peita vale variandi — vt css-button-system §3 ⚠).
5. **Järjekord:** button → icon → panel → card → input → modal → dropdown → segmented. (Button consistency.md annab esimese worklisti: admin-RAG nupud + `/tooheaolu/*` 20-variandi probleem.)

**DoD per archetype:** üks komponent · üks token-nimeruum (ainult `:root.theme-X`) · null nupu-selektorit teemafailides · null scattered alias-CSS · snapshot identical · test 968/12 · jscpd ≤ baseline.

---

## 3. `app/styles/` ümberkorraldus (kuhu mis läheb)

**Praegu** (probleem): `theme/{hc,mono,...}.css` segab tokeneid + selektor-ahelaid; `features/<v>/` segab struktuuri + teema-override'e + mobiili; `mobile/` on paralleelhierarhia; `components/` on compat-aggregaator (orvud).

**Siht-omandus:**

```
app/styles/
  reset.css                 — normaliseerimine (oli base/)
  base/                     — typography, foundations, a11y (struktuurne, teema-vaba)
  tokens/                   — ★ UUS: KÕIK teema-väärtused
    base.css                — :root vaikeväärtused (--* defaultid)
    theme-light.css         — :root.theme-light { --* }   (ainult tokenid!)
    theme-mid.css           — :root.theme-mid { --* }
    theme-dark.css          — :root:not(.theme-…) { --* }  (vaikima/dark)
    theme-night.css         — :root.theme-night { --* }
    theme-mono.css          — :root.theme-mono { --* }
    theme-hc.css            — [data-contrast="hc"] { --* }
  primitives/               — kanooniliste komponentide struktuur (VÕI komponendi *.module.css kõrval)
    button.css, panel.css, card.css, input.css, modal.css, dropdown.css …
    (loevad var(--<primitiiv>-*); null teema-väärtust)
  features/<vertical>/       — AINULT feature-struktuur + layout (chat, documents, service-map, …)
    (null teema-override'i, null surface-!important → need läksid tokens/-i)
  utilities/                 — abiklassid (migreeri Tailwindi poole)
```

**Kustub/sulab:**
- `theme/*.css` selektor-ahelad (`:is():not()` + surface-`!important`) → **tokens/** (väärtused) + **primitives/** (tarbimine). Teemafailist jääb ainult token-blokk.
- `components/{glass.css, ...}` compat-aggregaatorid → orvud (vt `orphans.md`), kustuta kui keegi ei impordi.
- `mobile/` paralleelhierarhia → kas feature-faili `@media`-blokk VÕI responsive-token (`--*` mis muutub `@media`-s). Mitte eraldi fail.

**Kolimise reegel (viil, 1:1):** liiguta reeglid muutmata, kontrolli import-graafi (`@import url(...)` ahelad globals.css-ist), kontrolli test-loaderit (`register-node-test-loader.mjs legacyCssBundles`), snapshot identical. Üks kolimine = üks commit.

---

## 4. `@layer` hierarhia (Root A parandus)

```css
@layer reset, base, tokens, primitives, features, utilities, overrides;
```

- **Tailwind utiliidid → `utilities` kiht** (eelviimane). Käsitsi-CSS → `base/primitives/features` (utiliitide EES) → Tailwind võidab vaikimisi → **1360 Tailwind `!` muutub eemaldatavaks**.
- **`overrides`** kiht (viimane) = harv tõeline eskaleerimine `!important` asemel.
- **KÕRGE RISK** — globaalne, kogu kaskaad reastub ümber. **Pilootida ühel komponendil**, verifitseerida lai snapshot üle lehtede/teemade. Opus + high reasoning.

---

## 5. `!important` kaotamise plaan ⭐ ALUSTA SIIT

`!important` ei kustutata ükshaaval — see on KAHE juure SÜMPTOM. Kaks rada, eri risk:

### Rada B — teema-sõda (token-migratsioon) — snapshot-väravaga, Sonnet-ohutu
**Katab:** ~1686 surface + 1646 theme-override `!important` (suur kattuvus). Top-props: box-shadow 397, background 395, color 255, border 162.

**Viil (per feature/teemafail):**
1. Leia `:root.theme-X feature { surface-prop: VALUE !important }` (+ `:not(.theme-X) feature { … !important }`).
2. Lisa **tokens/theme-X.css**-i: `:root.theme-X { --feature-surface: VALUE }`.
3. Feature loeb **`var(--feature-surface)`** (ilma `!important`-ita) primitiivis/feature-failis.
4. `!important` KAOB — kaskaadi-sõda lõppes, üks muutuja võidab.
5. Snapshot-diff `✓ identical` → re-run `css-important-audit.mjs` → arv langeb. Commit.

**Järjekord = RISK, mitte arv.** ÄRA alusta hc.css-iga (407, suurim, AGA a11y-risk). Soovitatud:
1. **`documents/ui.css`** (61 surface+theme-override) — keskmine, hästi mõistetav, dropdown-viil juba tegi eeltööd.
2. **`chat/themes.css`** (93) → **`chat/shell.css`** (52) → **`chat/mono.css`** (84).
3. **`mid.css`** (61), **`mono.css`** (87) — teema-token-failid.
4. **`service-map/desktop.css`** (75) — keerukam (Leaflet).
5. **VIIMASENA `hc.css` (325) + `chat/hc.css` (144)** — suurim võit, aga a11y-kriitiline (kontrast ei tohi katki); Opus, lai snapshot, kontrasti-kontroll.

### ⟶ NÄIDISVIIL (Rada B mall): `documents/ui.css:167–177`

Reaalne juhtum, mis õpetab mustri JA paljastab A↔B sõltuvuse.

**ENNE** — üks reegel teeb KOLM asja: määrab tokeni, rakendab otse, sunnib `!important`:
```css
.documents-workspace-page--library .documents-surface-panel {
  --panel-secondary-bg: var(--documents-surface-panel-bg);      /* token-määrang — ÕIGE, jätta */
  --panel-secondary-shadow: var(--glass-shell-shadow, none);    /* token-määrang — ÕIGE, jätta */
  background: var(--documents-surface-panel-bg) !important;     /* redundantne + !important */
  border: none !important;                                      /* redundantne + !important */
  box-shadow: var(--glass-shell-shadow, none) !important;       /* redundantne + !important */
  -webkit-backdrop-filter: …blur… !important;                  /* redundantne + !important */
  backdrop-filter: …blur… !important;                          /* redundantne + !important */
}
```

**DIAGNOOS:** reegel JUBA määrab `--panel-secondary-*` tokenid, mida `<Panel>` / `.documents-surface-panel` baas loeb. Otse-rakendus (read 172–176) on **kaitse-kiht** — dubleerib tokenit ja sunnib kaskaadis. 5 `!important` ilma lisaväärtuseta.

**PÄRAST** — jäta token-määrangud, kustuta otse-rakendus; baas loeb `var()`-i ilma `!important`-ita:
```css
.documents-workspace-page--library .documents-surface-panel {
  --panel-secondary-bg: var(--documents-surface-panel-bg);
  --panel-secondary-border: transparent;
  --panel-secondary-shadow: var(--glass-shell-shadow, none);
  --panel-secondary-backdrop: var(--documents-glass-backdrop-filter, blur(var(--glass-blur-radius, 1rem)));
}
/* primitives/panel.css:  .documents-surface-panel { background: var(--panel-secondary-bg);
   box-shadow: var(--panel-secondary-shadow); … }  — ilma !important */
```

**EELTINGIMUS (A↔B side):** panel-baas peab kaskaadis võitma ILMA `!important`-ita. Kui ei võida (käsitsi-CSS kihistamata → Tailwind/muu sunnib üle), siis see viil OOTAB Rada A `@layer` järel VÕI tõsta baasi spetsiifilisust. ⇒ **osa surface-`!important` kaob alles pärast kihistamist** — seepärast on Rada B ja A seotud, mitte täiesti sõltumatud.

**VALVUR:** snapshot `✓ identical` (väärtus ei muutu — token oli sama) · `css-important-audit` arv −5 · test 968/12.

**Müll vs päris token (otsustus):** kui otse-rakenduse väärtus = sama mis token-määrang (nagu siin) → redundantne, kustuta. Kui otse-rakendus erineb tokenist → see on tegelik teema-väärtus, vii **tokens/theme-X.css**-i `:root.theme-X { --token: VALUE }` ja lase baasil lugeda. Mitte kunagi jäta otse-`!important` surface-prop'ile.

### Rada A — kihi-sõda (layout `!important`) — kõrge risk, Opus
**Katab:** "plain" layout-`!important` (width 94, height 68, display 68, transform 72, padding/margin ~280, min-height 59) — need EI ole teema-sõda vaid Tailwind/käsitsi-CSS kihi-sõda (peamiselt `mobile/*` failid mis sunnivad Tailwindi üle).
**Parandus:** §4 `@layer` migratsioon → layout-`!important` + Tailwind-`!` muutuvad ülearuseks.

### Järjestus
**Rada B enne** (inkrementaalne, ohutu, suurim arvu-langus) → siis **Rada A** (globaalne kihi-migratsioon). Mõõdik: `css-important-audit.mjs` arv langeb iga viiluga; jälgi trendina.

---

## 6. Kes mida teeb

- **Sonnet** (snapshot-väravaga mehaanika): Rada B token-viilud, komponendi-migratsioon (§2, css-button-system reeglid), kausta-kolimised (§3, 1:1 + import-graaf).
- **Opus** (kõrge risk): §4 `@layer` migratsioon (Rada A), hc.css/mono.css `:is():not()` ahela-kokkuvaremine (spetsiifilisus-tundlik), hc.css token-migratsioon (a11y), iga koht kus snapshot näitab seletamatut muutust.

---

## 7. Valvurid (iga viil, kohustuslik)

- Snapshot-diff `✓ identical` (VÕI tahtlik muutus seletatud) — enne commiti.
- `npm test` = 968/12 baseline (null UUT kukkumist).
- `jscpd` ≤ baseline (ei tõuse).
- `css-important-audit.mjs` arv langeb (Rada B viilul).
- Komponendi-migratsioonil: **vaata renderdatud elementi** + kontrolli variant-korrektsust (snapshot ei püüa "alias kadus aga vale variant").
- LF mitte CRLF CSS-failides. Ära kasuta PowerShell Set-Content't CSS-il.
- ÄRA puuduta `lib/rag/*`. ÄRA kustuta `safety_snapshots/`.
- **Efekti-spec puutumata** (kasutaja kinnitas): dark/night/mono/HC = 2 edge-glow; light/mid = 3 (2 glow + idle vari). Ühtlusta identiteet, ÄRA kustuta efekte.
- Üks viil = üks commit. `Co-Authored-By` rida.
