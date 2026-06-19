# SotsiaalAI CSS korrastus — etapp 8

## Fookus

Etapp 8 võttis ette service-map’i monoliitse `desktop.css` faili. Eesmärk oli eraldada selgelt eristatavad vastutused eraldi omaniku failidesse ilma visuaali, selektoreid või deklaratsioone muutmata.

See ei olnud mahupuhastus, vaid **suure riskiga faili kontrollitud tükeldamine**. `service-map/desktop.css` oli pärast varasemaid etappe endiselt 3352-realise monoliidina üks suurimaid ja regressiooniohtlikumaid CSS-faile.

---

## Tehtud muudatus

`app/styles/features/service-map/desktop.css` muudeti entrypoint-failiks, mis impordib uued alamfailid algses kaskaadijärjekorras.

Uus struktuur:

```text
app/styles/features/service-map/
├── desktop.css
└── desktop/
    ├── base.css
    ├── shell.css
    ├── toolbar.css
    ├── leaflet.css
    ├── popup.css
    ├── leaflet-attribution.css
    ├── pre-inquiry-agent.css
    └── responsive.css
```

Importjärjekord:

```css
@import url("./desktop/base.css");
@import url("./desktop/shell.css");
@import url("./desktop/toolbar.css");
@import url("./desktop/leaflet.css");
@import url("./desktop/popup.css");
@import url("./desktop/leaflet-attribution.css");
@import url("./desktop/pre-inquiry-agent.css");
@import url("./desktop/responsive.css");
```

---

## Uute failide rollid

| Fail | Roll | Ridasi |
|---|---|---:|
| `desktop/base.css` | workspace-feature ja service-profile üldised desktop/põhistiilid | 1621 |
| `desktop/shell.css` | service-map täisekraani shell, safe-area, workspace ja filter panel’i raam | 265 |
| `desktop/toolbar.css` | service-map toolbar, back nupp, väljad, tüübikaardid ja tulemuste nimekiri | 548 |
| `desktop/leaflet.css` | Leafleti map shell, map container, markerid ja legend | 233 |
| `desktop/popup.css` | Leafleti popup wrapper, popup sisu, kontaktid, teenused ja tegevusnupud | 499 |
| `desktop/leaflet-attribution.css` | Leafleti attribution kontrolli asetus ja tüpograafia | 29 |
| `desktop/pre-inquiry-agent.css` | pre-inquiry agent chat adapter service-map kontekstis | 69 |
| `desktop/responsive.css` | `max-width: 1180px` desktop/tablet vahekorra täpsustused | 81 |
| `desktop.css` | ainult entrypoint ja importjärjekord | 10 |

---

## Kontrollid

### 1. Deklaratsioonide säilimine

Vana `desktop.css` ja uute failide kokkuliidetud sisu on normaliseeritult identne.

- vana normaliseeritud pikkus: `98 803` märki;
- uus normaliseeritud pikkus: `98 803` märki;
- SHA-256 mõlemal: `dd895549923936d370586adf4881162782cab41da01013c83f9079102b2798a4`.

Normaliseerimine eemaldas ainult reavahetuse formaadi ja liigsed tühjad read failipiiridel. Selektorid ja deklaratsioonid jäid samaks.

### 2. CSS-i parsitavus

Kõik uued omaniku failid on eraldi tasakaalus CSS-tükid:

- `base.css` — brace balance 0;
- `shell.css` — brace balance 0;
- `toolbar.css` — brace balance 0;
- `leaflet.css` — brace balance 0;
- `popup.css` — brace balance 0;
- `leaflet-attribution.css` — brace balance 0;
- `pre-inquiry-agent.css` — brace balance 0;
- `responsive.css` — brace balance 0.

### 3. Omanditestid

Lisatud test:

```text
tests/ui/serviceMapDesktopCssOwnership.test.js
```

See kontrollib, et:

- `desktop.css` on ainult entrypoint;
- importjärjekord on täpselt fikseeritud;
- toolbar’i selektorid elavad `toolbar.css` failis;
- Leafleti map/marker selektorid elavad `leaflet.css` failis;
- popup’i selektorid elavad `popup.css` failis;
- attribution elab `leaflet-attribution.css` failis;
- pre-inquiry adapter elab `pre-inquiry-agent.css` failis;
- kõik uued CSS-tükid on eraldi tasakaalus;
- rekursiivne service-map bundle sisaldab endiselt toolbar’i, Leafleti, popup’i ja pre-inquiry lepinguid.

### 4. Sihttestid

Käivitatud testivalim:

```bash
node --test \
  tests/ui/serviceMapDesktopCssOwnership.test.js \
  tests/ui/serviceMapLeafletVisualContracts.test.js \
  tests/workspace/serviceMapIconInline.test.js
```

Tulemus:

```text
24/24 testi läbis
```

### 5. Patch’i rakendatavus

`git apply --check` läbis puhta etapp 7 puu vastu.

---

## Mõju

| Ala | Mõju |
|---|---|
| Runtime visuaal | Muutmata |
| Selektorid | Muutmata |
| Deklaratsioonid | Muutmata |
| Importjärjekord | Säilitatud |
| Service-map route’i sisuline CSS | Muutmata |
| Globaalse CSS-i maht | Muutmata |
| Omandiselgus | Paranes oluliselt |
| Edasise refaktori risk | Vähenes |

See etapp ei vähenda route’ide CSS-mahtu. Väärtus on selles, et varem 3352-realise faili sees olnud kõrge riskiga alad on nüüd eraldi testitavad ja muudetavad.

---

## Miks see oli vajalik

`service-map/desktop.css` sisaldas korraga väga erinevaid kihte:

- service profile vormivälju;
- service-map täisekraani shell’i;
- toolbar’i;
- tulemuste nimekirja;
- Leafleti map container’it;
- markerite SVG-stiile;
- popup’i glass-stiile;
- popup’i teenuse ja kontakti sisu;
- attribution kontrolli;
- pre-inquiry agent chat adapterit;
- tablet/desktop vahekorra responsive reegleid.

Sellise faili otse refaktoreerimine oleks olnud liiga riskantne. Etapp 8 teeb järgmised muudatused võimalikuks väiksemate patch’idena.

---

## Järgmine soovitatud etapp

Järgmine mõistlik etapp on **service-map toolbar’i sisemine jagamine või popup’i eraldi korrastus**.

Soovitatud järjekord:

1. `desktop/toolbar.css` jagada kolmeks:
   - `toolbar/frame.css`;
   - `toolbar/fields.css`;
   - `toolbar/results.css`.
2. `desktop/popup.css` jagada kolmeks:
   - `popup/frame.css`;
   - `popup/content.css`;
   - `popup/actions.css`.
3. Alles pärast seda võtta ette visuaalne lihtsustamine ja `!important`-ide vähendamine.

Kõige parem järgmine väike patch oleks `toolbar.css` jagamine, sest see on 548 rida ja sisaldab selgelt eristatavaid osi: back/identity, filter fields, type cards ja results.

---

## Rakendamine

Patch rakendatakse pärast patche 01–07:

```bash
git apply --check sotsiaalai-css-cleanup-08.patch
git apply sotsiaalai-css-cleanup-08.patch

node --test \
  tests/ui/serviceMapDesktopCssOwnership.test.js \
  tests/ui/serviceMapLeafletVisualContracts.test.js \
  tests/workspace/serviceMapIconInline.test.js
```

Täielikus projektis soovituslikult lisaks:

```bash
npm test
npm run build
```
