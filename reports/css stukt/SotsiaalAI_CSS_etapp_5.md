# SotsiaalAI CSS korrastus — etapp 5

## Fookus

Etapp 5 jätkab globaalse mobiili-CSS-i vähendamist ja omandi selgemaks muutmist. Seekordne siht oli järgmine kiht pärast avalehe taustareeglite lahutamist:

- `app/styles/mobile/panel-surfaces.css`
- `app/styles/mobile/subpage-title-system.css`
- `app/styles/features/policy/index.css`
- `app/styles/features/documents/index.css`

Eesmärk oli eemaldada globaalsest mobiilikihist reeglid, mis ei ole tegelikult shared primitive’id, vaid kuuluvad konkreetsele feature’ile või admin-vaatele.

---

## Tehtud muudatused

### 1. Policy tall mobile clearance kolis policy feature’i alla

Varem elasid policy pikkade mobiililehtede bottom-clearance reeglid globaalses failis:

```text
app/styles/mobile/panel-surfaces.css
```

Need reeglid puudutasid ainult järgmisi klasse:

```css
.policy-scroll-page-ring.policy-mobile-tall
.policy-scroll-page-ring.policy-mobile-tall .policy-scroll-page-scroller
.policy-scroll-page-ring.policy-mobile-tall::before
.policy-scroll-page-ring.policy-mobile-tall::after
```

Need koliti uude faili:

```text
app/styles/features/policy/mobile-tall.css
```

ja imporditakse nüüd policy route’i vertikaali kaudu:

```css
@import url("./mobile-tall.css");
```

failis:

```text
app/styles/features/policy/index.css
```

### 2. Admin/RAG mobile header exceptions kolisid documents/admin vertikaali alla

Varem elasid admin/RAG mobiilipäise erandid globaalses shared header failis:

```text
app/styles/mobile/subpage-title-system.css
```

Need puudutasid ainult järgmisi klasse:

```css
.rag-admin-shell-card
.rag-admin-shell-card .rag-admin-shell-back
.rag-admin-shell-card .rag-admin-shell-title
.admin-framework-acceptances-page
```

Need koliti uude faili:

```text
app/styles/features/documents/admin-mobile-header.css
```

ja imporditakse documents/admin vertikaali kaudu:

```css
@import url("./admin-mobile-header.css");
```

failis:

```text
app/styles/features/documents/index.css
```

See on põhjendatud, sest kõik ZIP-is olevad admin/RAG lehed, mis neid klasse kasutavad, impordivad juba `features/documents/index.css`.

### 3. Puuduvad test helper’id lisati tagasi

ZIP-is olid olemas testid, mis importisid neid faile:

```text
tests/helpers/mobileCssBundle.mjs
tests/helpers/serviceMapCssBundle.mjs
```

aga failid ise puudusid. Etapp 5 lisab mõlemad väikeste wrapper’itena olemasoleva rekursiivse helper’i peale:

```text
tests/helpers/cssSourceBundle.mjs
```

Lisatud helper’id:

```js
readMobileCssBundle()
readServiceMapCssBundle()
```

See võimaldab testidel lugeda CSS-i koos `@import`-ahelaga, mitte ainult entrypoint-faili teksti.

---

## Mõju CSS-koormusele

### Globaalne mobiilikiht

| Fail | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| `mobile/panel-surfaces.css` | 3833 baiti | 2862 baiti | −971 baiti |
| `mobile/subpage-title-system.css` | 13257 baiti | 12483 baiti | −774 baiti |
| Kokku globaalne vähenemine | 17090 baiti | 15345 baiti | **−1745 baiti** |

### Route’ide mõju

Kõigil 42 route’il vähenes mobiili-lisa lähte-CSS **1745 baiti**, sest mõlemad reeglikogumid eemaldati globaalsest mobiilikihist.

Netomõju route’i kogumahule sõltub sellest, kas route peab uue feature-faili tagasi laadima:

| Route’i tüüp | Netomuutus | Põhjus |
|---|---:|---|
| Tavaline route | **−1745 baiti** | ei vaja policy ega admin erandeid |
| Policy route | **−562 baiti** | globaalne −1745, policy `mobile-tall.css` +1149 |
| Documents/admin vertikaali route | **−721 baiti** | globaalne −1745, admin header +982 |

Näited:

| Route | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| `/` | 424990 | 423245 | −1745 |
| `/vestlus` | 940474 | 939753 | −721 |
| `/kasutustingimused` | 421471 | 420909 | −562 |
| `/profiil` | 494650 | 492905 | −1745 |
| `/tooheaolu` | 468945 | 467200 | −1745 |

### Uute route-owned failide ulatus

| Fail | Route’e |
|---|---:|
| `features/policy/mobile-tall.css` | 3 |
| `features/documents/admin-mobile-header.css` | 16 |

`features/policy/mobile-tall.css` jõuab ainult policy-lehtedele:

- `/kasutusjuhend`
- `/kasutustingimused`
- `/privaatsustingimused`

---

## Säilitamise kontroll

Patch ei muuda deklaratsioonide väärtusi. Reeglid tõsteti omaniku failidesse samade selektorite ja väärtustega.

Lisaks kontrollitud:

- `policy-mobile-tall` ei esine enam `mobile/panel-surfaces.css` failis;
- `rag-admin-shell-card` ja `admin-framework-acceptances-page` ei esine enam `mobile/subpage-title-system.css` failis;
- `policy/index.css` impordib `mobile-tall.css`;
- `documents/index.css` impordib `admin-mobile-header.css`;
- puudutatud CSS-failide sulgude tasakaal on korras.

---

## Testid

Rakendamise kontroll:

```bash
git apply --check sotsiaalai-css-cleanup-05.patch
```

Tulemus: läbis.

Sihtvalimi testid:

```bash
node --test \
  tests/ui/mobileGlassPanelShadow.test.js \
  tests/ui/mobileHeaderPlacement.test.js \
  tests/ui/policyScrollHeader.test.js \
  tests/ui/mobileCssOwnership.test.js
```

Tulemus:

```text
9 testi / 9 läbis
```

Märkus: helper’ite lisamine tähendab, et osa varem `missing module` tõttu mittejooksnud teste hakkab nüüd päriselt CSS-i sisu kontrollima. Laiemas juhuvalimis ilmnesid endiselt mõned vanad compatibility-testide ootused, mis ei ole selle patch’i muudatustest põhjustatud. Need tuleks võtta eraldi testipuhastuse etapina.

---

## Failid patch’is

Muudetud:

```text
app/styles/README.md
app/styles/features/documents/index.css
app/styles/features/policy/index.css
app/styles/mobile/README.md
app/styles/mobile/panel-surfaces.css
app/styles/mobile/subpage-title-system.css
tests/ui/mobileCssOwnership.test.js
tests/ui/mobileGlassPanelShadow.test.js
tests/ui/mobileHeaderPlacement.test.js
tests/ui/policyScrollHeader.test.js
```

Lisatud:

```text
app/styles/features/documents/admin-mobile-header.css
app/styles/features/policy/mobile-tall.css
tests/helpers/mobileCssBundle.mjs
tests/helpers/serviceMapCssBundle.mjs
```

---

## Rakendamine

Rakenda pärast patche 01–04:

```bash
git apply --check sotsiaalai-css-cleanup-05.patch
git apply sotsiaalai-css-cleanup-05.patch

node --test \
  tests/ui/mobileGlassPanelShadow.test.js \
  tests/ui/mobileHeaderPlacement.test.js \
  tests/ui/policyScrollHeader.test.js \
  tests/ui/mobileCssOwnership.test.js
```

Täielikus projektis tasub pärast seda käivitada:

```bash
npm test
npm run build
```

---

## Järgmine soovitatud etapp

Järgmine kõige mõistlikum samm on `subpage-title-system.css` detailne jagamine kaheks:

1. päriselt shared mobiilipäise primitive’id;
2. workspace/service-map/documents/policy spetsiifilised header adapterid.

Praegu on `subpage-title-system.css` endiselt suur ja sisaldab palju erinevate feature’ite selektoreid ühes `:is(...)` grupis. Enne selle tükeldamist tuleks teha täpne selektorigrupi kaart, et mitte muuta back/title/info nuppude mobiilipaigutust.
