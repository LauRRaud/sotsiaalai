# SotsiaalAI CSS etapp 11j — globaalse mobiilikihi jääkide koondkontroll

## Eesmärk

Etapp 11j kontrollib pärast etappe 11a–11i globaalsesse mobiiliahelasse alles jäänud feature-nimelisi selektoreid ja liigutab välja ainult madala riskiga, selgelt route-owned jäägid.

Teste selles etapis ei lisatud ega käivitatud. Kontroll on staatiline: patch rakenduvus, CSS-impordid, importtsüklid, brace-balance, `!important` arv ja globaalse mobiiliahela tekstiline lekkeotsing.

---

## Tehtud muudatused

### 1. Home reduced-motion reegel liikus home feature’i alla

Enne oli `mobile/motion.css` globaalses mobiiliahelas, kuigi ainus reegel puudutas ainult avalehe klassi:

```css
.home-scroll-cue-arrow {
  animation: none;
}
```

Nüüd on see failis:

```text
app/styles/features/home/motion.css
```

ja imporditakse ainult `features/home/index.css` kaudu.

### 2. Home BackgroundLayer pending-bends reegel liikus home feature’i alla

Globaalne `mobile/background-layer.css` sisaldas ühte home-spetsiifilist reeglit:

```css
[data-bg-layer][data-page="home"][data-mobile-bends="pending"] .bg-bends-layer
```

See liikus faili:

```text
app/styles/features/home/background-mobile.css
```

Globaalne BackgroundLayer fail jäi page-neutral shared kihiks, välja arvatud subpage-leping, mis on seal teadlikult shared.

### 3. Account settings modal sizing liikus profile feature’i alla

Fail:

```text
app/styles/mobile/subpage-header/account-modal.css
```

kustutati globaalsest mobiiliahelast. Selle sisu liikus faili:

```text
app/styles/features/profile/account-modal.css
```

`subpage-title-system.css` ei impordi enam account-modali erandit.

---

## Mõju CSS-koormusele

Arvud näitavad normaliseeritud lähte-CSS-i staatilist route-graafi, mitte Next.js production bundle’i gzip/brotli mahtu.

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 318721 B | 317083 B | -1638 B |
| `/` | 365346 B | 364086 B | -1260 B |
| `/vestlus` | 741002 B | 740516 B | -486 B |
| `/profiil` | 362207 B | 361721 B | -486 B |
| `/documents` | 410006 B | 408368 B | -1638 B |
| `/tooheaolu` | 325702 B | 324064 B | -1638 B |
| `/teenusekaart` | 646104 B | 644466 B | -1638 B |
| `/ruum` | 357515 B | 355877 B | -1638 B |
| `/registreerimine` | 329827 B | 328189 B | -1638 B |
| `/tellimus` | 325622 B | 323984 B | -1638 B |
| `/taasta-parool` | 320278 B | 318640 B | -1638 B |
| `/kasutustingimused` | 359926 B | 358288 B | -1638 B |


### Tõlgendus

- Enamik route’e võidab **−1638 B**, sest account-modal, home-motion ja home pending-bends ei ole enam globaalne koormus.
- `/` võidab vähem (**−1260 B**), sest home route impordib nüüd ise home-motion ja home pending-bends reeglid.
- `/vestlus` ja `/profiil` võidavad vähem (**−486 B**), sest profile route’id impordivad nüüd ise account settings modal sizing reeglid.
- `!important` arv ei muutunud.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
!important count after patch 18: 2022
global home-scroll-cue-arrow: False
global data-page=home pending bends: False
global account-modal header file exists: False
global subpage-title imports account-modal: False
Global mobile chain files with feature-named text: 9
 - app/styles/mobile/foundations.css lines 194
 - app/styles/features/accessibility/touch-controls.css lines 16, 18, 23, 32, 33, 34, 35
 - app/styles/features/accessibility/fields.css lines 4
 - app/styles/mobile/scroll-panels.css lines 2
 - app/styles/mobile/scroll-panels/glass-card.css lines 13, 14, 15, 61, 64, 65, 66
 - app/styles/mobile/subpage-header/workspace-offsets.css lines 17, 18, 21, 22, 40, 41, 46, 47
 - app/styles/mobile/subpage-header/layout.css lines 8, 9, 10, 13, 14, 15, 16, 17
 - app/styles/mobile/subpage-header/title-fit.css lines 4, 8, 13, 18, 47, 48, 49, 52
 - app/styles/mobile/panel-surfaces/shadows.css lines 16, 18
```

---

## Globaalsest mobiiliahelast eemaldatud jäägid

| Jääk | Enne | Pärast |
|---|---|---|
| `home-scroll-cue-arrow` | globaalne `mobile/motion.css` | `features/home/motion.css` |
| `[data-page="home"][data-mobile-bends="pending"]` | globaalne `mobile/background-layer.css` | `features/home/background-mobile.css` |
| account settings modal sizing | `mobile/subpage-header/account-modal.css` | `features/profile/account-modal.css` |
| `subpage-title-system.css` account-modal import | olemas | eemaldatud |

---

## Allesjäänud globaalse mobiiliahela jäägid

11j kontroll leidis, et pärast seda patch’i on globaalses mobiiliahelas veel 9 faili, mille tekstis esineb feature-nimelisi termineid. Kõik ei ole vead.

| Fail | Leid | Otsus |
|---|---|---|
| `features/accessibility/touch-controls.css` | `selected` tokeninimedes | Ei ole selected-listing leke. See on segment-card selected-state token. |
| `features/accessibility/fields.css` | `a11y-screenprofile-option--bottom` | Accessibility fieldi klassinimi. Nime võiks hiljem paremaks teha, aga omand on õige. |
| `mobile/scroll-panels.css` | documents/materials/covision/invite sõnad kommentaaris | Ei ole CSS-leke. Kommentaar kirjeldab, et adapterid elavad feature’i all. |
| `mobile/scroll-panels/glass-card.css` | subscription/help/selected modalid ja profile-container välistus | Shared glass-card primitive. Võimalik hilisem kandidaat, aga mitte 11j-s ohutu. |
| `mobile/subpage-header/layout.css` | paljud feature’id ühises header-selectorite grupis | Teadlik shared header registry. Jagamine vajab eraldi etappi. |
| `mobile/subpage-header/title-fit.css` | paljud feature’id ühises title-fit grupis | Teadlik shared title fitting registry. Jagamine vajab eraldi etappi. |
| `mobile/subpage-header/workspace-offsets.css` | workspace/wellbeing/policy/dashboard | Workspace-family header offset. Võimalik 11k kandidaat. |
| `mobile/foundations.css` | `wellbeing-page-surface` | Shadow/foundation erand. Võimalik 11k kandidaat. |
| `mobile/panel-surfaces/shadows.css` | workspace/wellbeing/dashboard | Final shadow suppression. Võimalik 11k kandidaat. |

---

## Riskid

### 1. Account settings modal järjekord

Account settings modal sizing liikus globaalsest subpage-header kihist profile feature’i alla. See on õige omand, kuid päris brauseris tuleks hiljem kontrollida:

- `/profiil` account modal;
- `/vestlus` sees profile/account modal, kui see seal avaneb;
- iPhone safe-area ja scrolli alumine padding.

### 2. Home pending-bends järjekord

Home pending-bends reegel oli varem globaalses BackgroundLayer failis, nüüd home route’is. Reeglil on `opacity` puhul juba `!important`, seega prioriteedirisk on väike, kuid avalehe mobiilse alglaadimise fade/reveal tuleks hiljem visuaalselt üle vaadata.

### 3. Header registry jääb suureks shared kihiks

`subpage-header/layout.css` ja `title-fit.css` on jätkuvalt suur cross-feature selector registry. Seda ei tohiks mehaaniliselt lahti lõigata ilma route’i/komponendi järgi täpse kaardita.

---

## Järgmine soovitus

Järgmine mõistlik etapp on **11k: workspace/wellbeing/dashboard shadow ja header-offset jääkide eraldamine**.

Eesmärk:

- võtta `wellbeing-page-surface` välja `mobile/foundations.css` ja `panel-surfaces/shadows.css` failidest;
- vaadata üle `workspace-offsets.css`, kus wellbeing ja dashboard on veel shared header offset grupis;
- jätta `subpage-header/layout.css` ja `title-fit.css` praegu puutumata, sest need on suurema mõjuga shared registry failid.

Alternatiivina võib võtta ette **11k-audit only**: teha ainult tabel kõigist `subpage-header/layout.css` ja `title-fit.css` selectoritest ning otsustada, kas neid üldse tasub lähiajal jagada.
