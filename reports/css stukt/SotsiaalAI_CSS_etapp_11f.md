# SotsiaalAI CSS etapp 11f — accessibility `touch.css` omandipuhastus

## Eesmärk

Etapp 11f puhastab `features/accessibility/touch.css` faili nii, et accessibility-kihi alla jäävad ainult ligipääsetavuse modaali coarse-pointer reeglid. Registeri ja ruumide centered-scroll/layout reeglid olid sinna ajalooliselt jäänud ning laadisid seetõttu globaalselt kõigile mobiilroute’idele.

Selles etapis ei lisatud ega käivitatud teste. Kontroll piirdus staatilise kontrolliga:

- patch rakendub after-13 puule;
- kohalikud CSS `@import` viited lahenevad;
- CSS importtsükleid ei ole;
- brace-balance vigu ei ole;
- `use client` import-järjekorda ei rikutud;
- accessibility `touch.css` failis ei ole enam register/rooms/invite/login/chat lekkeid.

---

## Muudatused

### 1. Accessibility touch fail puhastatud

Fail:

```text
app/styles/features/accessibility/touch.css
```

Jäi omama ainult:

- `.a11y-language-fieldset-*` coarse-pointer spacing;
- `.a11y-textscale-*` coarse-pointer spacing;
- `.a11y-contrast-fieldset` spacing;
- `.a11y-csp-scroll.csp-container` centered-scroll käitumine;
- `.a11y-save-step` snap käitumine.

Sealt eemaldati:

- `.register-*` reeglid;
- `.rooms-scroll` reeglid;
- registeri Androidi tüpograafia erandid;
- registeri mid-theme input shell erandid;
- registeri CSP scroll container reeglid;
- rooms CSP scroll container reeglid.

### 2. Register sai oma coarse-pointer omaniku

Lisatud fail:

```text
app/styles/features/register/coarse-pointer.css
```

See sisaldab nüüd registeri mobiili/coarse-pointer reegleid:

- `.register-content`;
- `.register-scroll`;
- `.register-form`;
- `.register-alert`;
- `.register-input`;
- `.register-input-shell`;
- `.register-option-card`;
- `.register-checkbox-card`;
- `.register-copy`;
- `.register-submit`;
- `.register-back-button`;
- `.register-scroll.csp-container`.

Registeri entrypoint uuendati:

```text
app/styles/features/register/index.css
```

Uus järjekord:

```css
@import url("./touch-controls.css");
@import url("./coarse-pointer.css");
@import url("./mobile.css");
```

### 3. Ruumide route sai oma coarse-pointer omaniku

Lisatud failid:

```text
app/styles/features/rooms/index.css
app/styles/features/rooms/coarse-pointer.css
```

Need omavad nüüd:

- `.rooms-scroll` coarse-pointer width/padding;
- `.rooms-scroll.csp-container` scroll-snap käitumist;
- `.rooms-scroll.csp-container .csp-item` snap käitumist;
- `.rooms-scroll.csp-container` overflow käitumist.

`/ruum` route impordib nüüd rooms feature entrypoint’i:

```js
import "../styles/features/rooms/index.css";
```

### 4. README täiendatud

Failis:

```text
app/styles/mobile/README.md
```

lisati märge, et `features/accessibility/touch.css` omab ainult accessibility modaali coarse-pointer spacingut ning register/rooms coarse-pointer layout asub nüüd route-owned feature entrypoint’ides.

---

## Mõju

Staatilise normaliseeritud lähte-CSS-i järgi:

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 329 766 B | 322 888 B | **−6878 B** |
| `/` | 372 346 B | 365 468 B | **−6878 B** |
| `/vestlus` | 748 721 B | 741 843 B | **−6878 B** |
| `/ruum` | 365 969 B | 360 127 B | **−5842 B** |
| `/registreerimine` | 332 110 B | 332 528 B | **+418 B** |
| `/documents` | 421 051 B | 414 173 B | **−6878 B** |
| `/tooheaolu` | 336 747 B | 329 869 B | **−6878 B** |
| `/teenusekaart` | 656 980 B | 650 102 B | **−6878 B** |
| `/profiil` | 371 650 B | 364 772 B | **−6878 B** |

### Tõlgendus

- Peaaegu kõik route’id võidavad **−6878 B**, sest register/rooms coarse-pointer reeglid ei laadi enam globaalselt.
- `/ruum` võidab vähem, sest see route impordib nüüd ise rooms coarse-pointer CSS-i.
- `/registreerimine` kasvab **+418 B**, sest register route omab nüüd ise kogu register coarse-pointer CSS-i. See on teadlik omandiparandus.
- `/vestlus` väheneb samuti **−6878 B**, sest see ei vaja register/rooms coarse-pointer reegleid.

---

## `!important`

| Mõõdik | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| `!important` arv | 2020 | 2020 | 0 |

Etapp 11f ei suurendanud `!important` arvu.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Bad use client directive files: 0
!important count after patch 14: 2020
Accessibility touch feature leaks: 0
```

---

## Riskid

1. **Route CSS order**  
   Registeri ja rooms coarse-pointer reeglid laaditakse nüüd route-owned entrypoint’ide kaudu, mitte globaalse mobiilikihi kaudu. Staatiliselt on see korrektne, kuid brauseris tasub kontrollida `/registreerimine` ja `/ruum` mobiilivaadet.

2. **Register route väike kasv**  
   `/registreerimine` kasvab +418 B, sest varem jagas ta register/rooms grupireeglit globaalse kihiga. Nüüd on register ja rooms lahutatud ning register kannab oma osa ise.

3. **CenteredScrollPicker sõltuvus**  
   `components/CenteredScrollPicker.css` jääb endiselt komponentide kaudu imporditavaks. Etapp 11f ei muuda seda faili.

---

## Soovituslik manuaalne kontroll

Pärast patch’i rakendamist ava mobiilivaates:

1. `/registreerimine`
   - rollikaardid;
   - nõusoleku checkbox;
   - sisendiväljad;
   - tagasi-nupp;
   - Android viewport, kui võimalik.

2. `/ruum`
   - ruumide nimekiri;
   - scroll-snap käitumine;
   - iPhone/Android viewport.

3. accessibility modal
   - keele valik;
   - tekstisuuruse valik;
   - kontrasti valik;
   - salvestamise samm.

---

## Rakendamine

Rakenda pärast `sotsiaalai-css-cleanup-13.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-14.patch
git apply sotsiaalai-css-cleanup-14.patch
```

Soovi korral staatiline kontroll:

```bash
python3 patch14_static_check.py <projekti-juur>
```

---

## Järgmine soovitus

Järgmine mõistlik samm on **11g: `features/accessibility/fields.css`, `mobile/foundations.css` ja accessibility/modal primitive’ide viimane kontroll**.

Kui jätkata ilma testitaristu laiendamiseta, siis hoiaksin 11g väikese:

- kinnitada, et `fields.css` on päriselt ainult accessibility;
- otsida veel globaalsest mobiilikihist register/login/invite/chat leket;
- eemaldada või ümber nimetada compatibility-entrypoint’id, mille sisu on nüüd ainult import.
