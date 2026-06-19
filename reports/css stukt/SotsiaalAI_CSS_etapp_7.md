# SotsiaalAI CSS audit — etapp 7

## Fookus

Etapp 7 parandab service-map mobiilipäise omandit. Eelmises seisus olid service-map’i enda juhtnupud (`.service-map-workspace__back` ja `.service-map-workspace__info`) veel shared `mobile/subpage-header/layout.css` kihi sees. See tähendas, et üldine mobiilipäise primitive teadis konkreetse feature’i sisemisi klasse.

Selle etapi eesmärk oli:

- viia service-map’i mobiilipäise juhtnupud service-map feature’i enda CSS-i;
- jätta shared subpage header ainult päriselt jagatud back/info/title primitive’ide omanikuks;
- parandada service-map lepingutestid, mis kontrollisid vanu või vale omaniku küljes olevaid eeldusi;
- mitte muuta service-map’i desktop-toolbar’i ja mobiilikaardi visuaalseid lepinguid.

## Muudatused

### 1. Uus service-map mobiilipäise omanik

Lisatud fail:

```text
app/styles/features/service-map/mobile-header.css
```

See fail omab nüüd service-map’i mobiilsed header-control reeglid:

- `.service-map-workspace__back`
- `.service-map-workspace__info`

Fail imporditakse service-map feature’i entrypoint’is enne üldist mobiilifaili:

```css
@import url("./desktop.css");
@import url("./mobile-header.css");
@import url("./mobile.css");
```

See tähendab, et service-map’i back/info juhtnupud ei ole enam shared mobiilipäise kihi osa, vaid route-imported feature CSS-i osa.

### 2. Shared `subpage-header/layout.css` puhastus

Failist eemaldati service-map spetsiifilised siseklassid:

- `.service-map-workspace__back`
- `.service-map-workspace__info`

Shared layout jääb endiselt omama üldiseid primitive’e:

- `.glass-subpage-back-button`
- `.workspace-scroll-back-button`
- `.documents-scroll-back-button`
- `.account-settings-back-button`
- `.scroll-reactive-back`
- `.dashboard-info-trigger-corner`

### 3. Testivõla parandused

Kaks olemasolevat service-map testi olid lähtekoodist maha jäänud:

1. Mono-teema popup-surface token on koodis juba `--mono-floating-surface`, mitte vana `--forest-floating-surface`.
2. Workspace service-map ikoon kasutab `serviceMapMarkerMaskId` ning SVG path’id on tühikutega, mitte vanade komaeraldustega.

Need testid uuendati tegeliku lähtekoodi ja uue omaniku järgi.

### 4. Omandit kaitsvad testid

Uuendatud testid kontrollivad nüüd, et:

- shared `subpage-header/layout.css` ei sisalda enam `service-map-workspace__back` ega `service-map-workspace__info` selektoreid;
- `features/service-map/index.css` impordib `mobile-header.css` faili;
- `features/service-map/mobile-header.css` sisaldab service-map’i back/info mobiilipäise reegleid;
- service-map lepingutest loeb reeglit service-map CSS-bundle’ist, mitte shared header-bundle’ist.

## Mõju CSS-koormusele

Selles etapis ei olnud peamine eesmärk mahu vähendamine, vaid omandi parandamine ja vale testi parandamine.

Mõõdetud route-graafi järgi:

| Mõõdik | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS-maht | 379 148 B | 379 077 B | −71 B |
| Globaalsete CSS-failide arv | 53 | 53 | 0 |
| Mitte-service-map route’id | — | — | −71 B |
| Service-map route’id | — | — | +978 B |

Service-map route’ide kasv tuleb uuest route-owned `mobile-header.css` failist. See on teadlik kompromiss: väike lisafail muudab omandi selgeks ja eemaldab feature’i siseklassid shared mobiilikihist.

Mõjutatud service-map route’id:

- `/teenusekaart`
- `/teenuseprofiil`
- `/eelpoordumised`
- `/vestlus`

Kõigil teistel route’idel vähenes globaalne CSS 71 baiti.

## Testid

Patch kontrolliti puhta etapp 6 seisu vastu:

```bash
git apply --check sotsiaalai-css-cleanup-07.patch
```

Sihttestid:

```bash
node --test \
  tests/ui/mobileHeaderPlacement.test.js \
  tests/ui/mobileCssOwnership.test.js \
  tests/ui/serviceMapLeafletVisualContracts.test.js \
  tests/workspace/serviceMapIconInline.test.js
```

Tulemus:

```text
25 testi / 25 läbis
```

## Risk

Risk on madal kuni keskmine.

Põhjus:

- service-map back/info reeglid liiguvad shared kihist feature-kihi alla;
- deklaratsioonid on sisuliselt samad, kuid service-map route’il asuvad need nüüd importjärjekorras hiljem;
- `.service-map-workspace__back` top väärtusele lisandus `!important`, et service-map’i oma leping vastaks mobiilipäise ankurdusele ja konkureerivate toolbar-reeglitega oleks selge prioriteet.

Visuaalselt tuleks pärast rakendamist kontrollida:

- `/teenusekaart` mobiilis;
- `/vestlus` sees avatud teenusekaart;
- service-map filter toolbar avatud ja suletud olekus;
- tagasi-nupp ja info-nupp iPhone/PWA vaates;
- high contrast ja mono režiim.

## Rakendamine

Patch 07 tuleb rakendada pärast patche 01–06:

```bash
git apply --check sotsiaalai-css-cleanup-07.patch
git apply sotsiaalai-css-cleanup-07.patch

node --test \
  tests/ui/mobileHeaderPlacement.test.js \
  tests/ui/mobileCssOwnership.test.js \
  tests/ui/serviceMapLeafletVisualContracts.test.js \
  tests/workspace/serviceMapIconInline.test.js
```

Täielikus projektis soovitatav lisakontroll:

```bash
npm test
npm run build
```

## Järgmine soovitatud etapp

Järgmine mõistlik samm on service-map CSS-i enda sisemine jagamine, kuid mitte veel kogu `desktop.css` suurfaili lahtivõtmine.

Soovituslik etapp 8:

```text
features/service-map/
├── index.css
├── desktop.css
├── mobile-header.css
├── mobile.css
├── leaflet.css
├── popup.css
└── toolbar.css
```

Alustada võiks Leaflet-kaardi ja popup’i reeglitest, sest need on selgelt eristatavad ning testidega juba hästi kaetud.
