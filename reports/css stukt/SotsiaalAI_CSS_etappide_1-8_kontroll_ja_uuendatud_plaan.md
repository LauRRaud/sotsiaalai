# SotsiaalAI CSS-i etappide 1–8 kontroll ja uuendatud plaan

## Kokkuvõttev otsus

Etappide 1–8 patch-jada on **omavahel rakendatav ja lõppseisus tehniliselt sidus**, kuid seda ei tohiks veel käsitleda tootmisvalmis refaktorina.

Kõik kaheksa patch’i rakendusid algsele kontekstiarhiivi puule järjestuses 01 → 08 ilma konfliktita. Iga etapi raportis nimetatud sihttestide arv kinnitati eraldi uuesti. Lõppseisus:

- kõik kohalikud CSS `@import` viited lahenevad;
- CSS-importides ei ole tsükleid;
- kõiki 117 CSS-faili saab parsida ilma top-level süntaksiveata;
- etapp 8 ei kaotanud service-map’i deklaratsioone ega selektoreid;
- visuaalset brauseriregressiooni ja päris Next.js build’i ei ole kontekstiarhiivi põhjal võimalik kinnitada.

Kõige olulisemad parandused varasemasse käsitlusse:

1. **Etapp 3 ei ole eraldi rakendamiseks ohutu.** Etapp 3 jättis neli uut CSS-faili tasakaalustamata `@media` plokkidega. Etapp 4 parandab need. Patch’e 03 ja 04 tuleb käsitleda ühe atomaarse muudatusena.
2. **Etapp 7 on ainus senine patch, mis muudab teadlikult CSS-i käitumist**, mitte ainult omandit või failijaotust. See lisab service-map mobiilipäisele spetsiifilisemaid reegleid ja kasvatab tegelike `!important` deklaratsioonide arvu kolme võrra.
3. **Etapp 8 muudab reavahetused CRLF-ist LF-iks.** Selle tõttu väheneb staatilise route-graafi toorbaidimaht umbes 2,9 KB service-map route’idel, kuigi CSS-i semantika ei muutu. Seda ei tohi raporteerida päris jõudlusvõiduna.
4. Kontekstiarhiiv on teadlikult osaline. Patch 05 lisab helper-failid, mis võivad päris projektis juba olemas olla. Kõik patch’id tuleb enne päris repos rakendamist selle hetke harule ümber baasida.

---

# 1. Etappide sõltumatu kontroll

| Etapp | Fookus | `git apply --check` | Raporti sihttestid | Sõltumatu tulemus | Otsus |
|---|---|---:|---:|---:|---|
| 1 | Testide rekursiivne CSS-bundle ja esimene puhastus | läbis | 16/16 | 16/16 | korras |
| 2 | Androidi ja home-scroll CSS-i route-omand | läbis | 3/3 | 3/3 | korras |
| 3 | `home/background.css` omanike järgi jagamine | läbis | 3/3 | 3/3 | ainult koos etapiga 4 |
| 4 | Home-only CSS route’i juurde ja etapp 3 süntaksiparandus | läbis | 5/5 | 5/5 | korras |
| 5 | Policy/admin header ownership ja puuduvad test-helper’id | läbis | 9/9 | 9/9 | korras, kuid päris repo konfliktirisk |
| 6 | Shared mobiilipäise entrypoint ja route-adapterid | läbis | 16/16 | 16/16 | korras |
| 7 | Service-map mobiilipäise feature-omand | läbis | 25/25 | 25/25 | vajab visuaalset kinnitamist |
| 8 | `service-map/desktop.css` mehaaniline jagamine | läbis | 24/24 | 24/24 | korras |

Kõik patch’id rakendusid järjestikku samale puule:

```text
01 OK
02 OK
03 OK
04 OK
05 OK
06 OK
07 OK
08 OK
```

---

# 2. Oluline etapp 3 ja 4 parandus

Etapi 3 seisus olid failid järgmises olukorras:

| Fail | Brace balance etapp 3 järel | Etapp 4 järel |
|---|---:|---:|
| `mobile/background-layer.css` | +1 | 0 |
| `features/home/background-mobile.css` | −1 | 0 |
| `mobile/interaction-surfaces.css` | +1 | 0 |
| `features/home/cards-mobile.css` | −1 | 0 |
| `mobile/content-surfaces.css` | 0 | 0 |
| `features/home/circular-text-mobile.css` | 0 | 0 |

Etapi 3 regexipõhine omanditest läbis, kuid ei tuvastanud iseseisvalt vigaseid CSS-faile. Etapp 4 lisas brace-balance’i ja parsimise kontrolli ning tegi failid korrektselt iseseisvaks.

## Järeldus

- patch 03 ei tohiks enam eraldi levitada;
- patch 03 ja 04 tuleb squash’ida;
- veel parem on baasida kõik 01–08 üheks kontrollitud patch’iks päris projekti praeguse haru vastu.

---

# 3. Lõppseisu tehniline kontroll

## CSS-struktuur

- CSS-faile: **95 → 117**
- Muutus: **+22 faili**, sest monoliite jagati väiksemateks omanikufailideks.
- Puuduvaid kohalikke `@import` faile: **0**
- CSS importtsükleid: **0**
- Lõppseisu CSS parse error’eid: **0**
- Suurim CSS-fail:
  - enne: `service-map/desktop.css`, 3353 rida;
  - pärast: `OrbitalMenu.css`, 2019 rida;
  - service-map’i suurim uus osa: `desktop/base.css`, 1622 rida.

## CSS-i semantiline võrdlus

Kõigi CSS-failide parseripõhises globaalses võrdluses:

- algseisus 3281 semantilist reegliüksust;
- lõppseisus 3283 semantilist reegliüksust;
- kolm vana koondreeglit asendati viie selgema omanikureegliga;
- sisuline erinevus koondub service-map mobiilipäise eraldamisele ja accessibility-reegli media-kontekstile;
- etapp 8 service-map desktopi jagamine säilitab reeglid ja deklaratsioonid.

## `!important`

- algseis: **1992**
- lõppseis: **1995**
- muutus: **+3**

Kõik kolm lisandust tulenevad etapi 7 service-map mobiilipäise eraldamisest:

- route-owned back-reegel kordab vajalikku `left !important` prioriteeti;
- back-reegli `top` sai `!important`;
- info-reegli `top` sai `!important`.

Seega pole `!important` vähendamise etapp veel alanud.

---

# 4. CSS-koormuse muutus

Need arvud kirjeldavad staatilise lähtekoodigraafi toor-CSS-i, mitte Next.js production bundle’i gzip/brotli mahtu.

| Mõõdik | Algseis | Lõppseis | Muutus |
|---|---:|---:|---:|
| Kõigi route’ide ühine CSS | 399 022 B | 379 077 B | **−19 945 B / −5,0%** |
| Globaalse ulatusega CSS-faile | 51 | 53 | +2 |
| Avaleht `/` | 434 543 B | 422 436 B | −12 107 B |
| `/vestlus` | 948 972 B | 937 713 B | −11 259 B |
| `/teenusekaart` | 723 289 B | 703 137 B | −20 152 B |
| `/dokreziim` | 614 320 B | 595 994 B | −18 326 B |
| `/documents` | 490 178 B | 471 257 B | −18 921 B |

## Mõõtmise täpsustus

Etapp 8 muutis service-map desktopi faili reavahetused CRLF-ist LF-iks. See vähendas toorbaite ligikaudu 2875 võrra, kuid mitte brauserile rakenduva CSS-i semantikat.

Arhitektuurilise mõju hindamisel tuleks:

- võrrelda normaliseeritud lähtekoodi;
- mõõta päris Next.js buildi CSS chunk’e;
- eristada failijaotust, toorbaite ja gzip/brotli võrguressurssi.

---

# 5. Laiema testijooksu seis

Kontekstiarhiivi 61 testifaili otse `node --test` abil käivitades:

```text
256 testi
217 läbis
39 ebaõnnestus
```

Neist:

- 12 ebaõnnestumist on `ENOENT`, sest arhiivist puuduvad `messages/*.json` või `public/site.webmanifest`;
- ülejäänud 27 on olemasolevad lepingute või lähtekoodi lahknevused väljaspool nende patch’ide sihtala;
- etapp 7 ja etapp 8 järel oli läbikukkumiste arv sama: 39;
- etapp 8 lisas ainult uusi läbivaid omanditeste.

See ei võrdu päris projekti `npm test` tulemusega, sest kontekstiarhiivist puuduvad muu hulgas:

- `node_modules`;
- `scripts/register-node-test-loader.mjs`;
- täielik `messages/` kataloog;
- `public/site.webmanifest`;
- osa buildi- ja runtime-kontekstist.

## Tootmisvärav, mida pole veel läbitud

Päris repos tuleb edukalt käivitada vähemalt:

```bash
npm test
npm run build
npm run css:audit:check
npm run css:budget
```

Olemasolu korral ka:

```bash
npm run lint
npm run dup:check:ci
npm run test:e2e
```

---

# 6. Test-helper’i piirang

`tests/helpers/cssSourceBundle.mjs` on kasulik reeglite olemasolu kontrollimiseks, kuid see ei modelleeri CSS-kaskaadi täielikult.

Praegune helper:

- lisab imporditud failide sisu entrypoint’i teksti järele;
- ei inline’i `@import` sisu täpsesse impordikohta;
- ei säilita impordi media-tingimust wrapper’ina;
- deduplikeerib sama faili `seen` abil;
- ei sobi kaskaadi, media-ulatuvuse ega lõpliku prioriteedi kontrolliks.

Etapp 3 näitas selle piirangu praktilist mõju: reeglite olemasolu test läbis, kuigi osa failidest oli iseseisvalt vigane.

## Parandus

Enne uusi suuri refaktoreid tuleb helper täiendada nii, et see:

1. inline’iks impordi täpselt selle asukohta;
2. säilitaks `@media`, `supports()` ja `layer()` imporditingimused;
3. tuvastaks tsükli eraldi veana;
4. pakuks nii presence-bundle’i kui cascade-faithful bundle’i;
5. parsiks lõpptulemuse `postcss` või `lightningcss` abil.

---

# 7. Algse tervikplaani tegelik seis

| Tervikplaani töövoog | Seis | Märkus |
|---|---|---|
| CSS-i omandikaart | osaline | route-tase olemas, komponentide täielik omandikaart puudub |
| Täpne kustutamisraport | osaline | üks tühi tokenifail eemaldatud; täielik dead-code otsus puudub |
| Importgraaf ja route-koormus | tehtud | vajab lõppseisu ja päris buildi mõõtmist |
| `!important` põhjusanalüüs | alustamata | arv kasvas 1992 → 1995 |
| Teemade audit | alustamata | light/mid/night/mono/HC süsteem läbi töötamata |
| Disainitokenite audit | alustamata | värvi, blur’i, shadow, radius’e ja spacing’u inventuur puudub |
| Breakpoint’ide ja mobiili audit | osaline | omand paranes; täielik viewport/PWA audit puudub |
| Z-index ja stacking context | alustamata | inventuur puudub |
| Animatsioonide ja jõudluse audit | alustamata | inventuur puudub |
| Ligipääsetavuse CSS-audit | alustamata | tehtud ainult üksikuid omandiliigutusi |
| Inline-stiilide audit | alustamata | JSX/CSS topeltomand kontrollimata |
| Suurte failide jagamine | osaline | service-map desktop jagatud; teised monoliidid alles |
| CSS Module’ite kandidaadid | alustamata | otsustusraport puudub |
| Visuaalne regressioonitest | alustamata | suurim allesolev risk |
| CSS-arhitektuuri reeglistik | osaline | README ja omanditestid olemas, formaalne standard puudub |
| Automaatne kvaliteedikontroll | osaline | helper’id ja lepingutestid olemas, CI-väravad puuduvad |

## Plaanist kõrvalekalle

Service-map’i 3353-realise faili jagamine toimus enne:

- visuaalsete regressioonitestide loomist;
- täieliku globaalse mobiilikihi auditi lõpetamist;
- `!important` eelarve fikseerimist;
- päris buildi kontrolli.

Etapp 8 oli semantiliselt mehaaniline ja seetõttu vastuvõetav. Järgmine samm ei tohiks siiski olla kohe toolbar’i või popup’i uus jagamine. Kõigepealt tuleb stabiliseerida senine patch-stack.

---

# 8. Uuendatud tööjärjekord

## Etapp 9 — patch’ide koondamine ja päris repo värav

See on järgmine kohustuslik etapp.

### Tegevused

1. Võtta aluseks projekti praegune päris Git-haru.
2. Kontrollida, kas patch 05 helper-failid on seal juba olemas.
3. Rakendada muudatused päris harule, mitte kontekstiarhiivi koopiale.
4. Squash’ida vähemalt patch’id 03+04.
5. Eelistatult koondada 01–08 üheks või 3–4 loogiliseks commit’iks:
   - testitaristu;
   - globaalne mobiiliomand;
   - mobiilipäise omand;
   - service-map mehaaniline failijaotus.
6. Täiendada `cssSourceBundle` helper’it.
7. Kinnitada:
   - `git diff --check`;
   - `npm test`;
   - `npm run build`;
   - CSS audit ja budget;
   - importtsüklite ja puuduva impordi kontroll.
8. Salvestada uus lähtebaas:
   - route-graaf;
   - CSS-failide arv;
   - production CSS chunk’id;
   - `!important` arv;
   - suurimate failide nimekiri.

### Valmiskriteerium

Üks kontrollitud patch/commit-jada, mis rakendub projekti praegusele harule ja läbib päris buildi.

---

## Etapp 10 — visuaalse regressiooni miinimumkomplekt

Enne uusi käitumist muutvaid CSS-parandusi.

### Esmane maatriks

- `/`
- `/vestlus`
- `/profiil`
- `/teenusekaart`
- `/documents`
- `/dokreziim`
- `/kasutustingimused`
- `/kovisioon`
- `/tooheaolu`

Vaated:

- desktop;
- iPhone viewport;
- Android viewport;
- light;
- night;
- mono;
- high contrast;
- reduced motion;
- reduced transparency.

### Eriti oluline

Etapp 7 tõttu kontrollida:

- service-map tagasi-nupp;
- info-nupp;
- toolbar avatud/suletud;
- embedded service-map `/vestlus` sees;
- iPhone/PWA safe-area.

---

## Etapp 11 — lõpetada globaalne mobiiliomand

Prioriteetsem kui järgmine service-map failijagamine.

### Failid

1. `mobile/scroll-panels.css`
2. `mobile/panel-surfaces.css`
3. globaalsed feature-importid:
   - `features/invite/mobile.css`;
   - `features/login/mobile.css`;
   - `features/login/otp-close.css`;
   - `features/register/mobile.css`;
   - accessibility failid.

### `scroll-panels.css` jaotus

Fail sisaldab praegu korraga:

- shared glass-card primitive’i;
- workspace scroll-geomeetriat;
- invite modal scroll-loogikat;
- documents route’i geomeetriat;
- materials/covision/workspace feature’i adapteerimist.

Soovituslikud omanikud:

```text
mobile/scroll-panels/
├── primitive.css
├── workspace.css
├── invite.css
├── documents.css
└── feature-adapters.css
```

Route-spetsiifilised osad tuleb pärast visuaaltesti viia feature-entrypoint’ide alla.

---

## Etapp 12 — `!important` inventuur ja eelarve

### Esimene reegel

`!important` arv ei tohi enam tõusta üle 1995.

### Tegevused

- liigitada kõik markerid;
- märkida ligipääsetavuse ja kolmanda osapoole teegi erandid;
- eraldada inline-style konfliktid;
- eraldada impordijärjekorra parandused;
- kontrollida, kas etapi 7 kolm lisandust saab asendada korrektse layer’i või spetsiifilisusega;
- lisada CI eelarve.

---

## Etapp 13 — teema- ja disainitokenite audit

Koguda ja normaliseerida:

- värvid;
- gradient’id;
- blur’id;
- shadow’d;
- radius’ed;
- spacing;
- font-size;
- breakpoint’id;
- z-index;
- animatsioonide kestused.

Seejärel vähendada `theme/hc.css`, `theme/mono.css` ja `chat/themes.css` komponentide ümberkirjutusi tokenipõhiseks.

---

## Etapp 14 — suurte failide jätkuv mehaaniline jagamine

Alles pärast etappe 9–13.

### Service-map

- `desktop/base.css` — 1622 rida;
- `desktop/toolbar.css` — 548 rida;
- `desktop/popup.css` — 499 rida.

Toolbar’i soovituslik jaotus:

```text
desktop/toolbar/
├── frame.css
├── identity.css
├── fields.css
├── type-cards.css
└── results.css
```

Popup’i soovituslik jaotus:

```text
desktop/popup/
├── frame.css
├── content.css
├── contacts.css
└── actions.css
```

### Muud suured failid

Prioriteedid:

1. `OrbitalMenu.css` — 2019 rida;
2. `theme/hc.css` — 1836 rida;
3. `service-map/desktop/base.css` — 1622 rida;
4. `WellbeingPage.module.css` — 1346 rida;
5. `WorkspacePanel.module.css` — 1216 rida;
6. `chat/shell.css` — 869 rida;
7. `documents/ui.css` — 861 rida;
8. `chat/themes.css` — 828 rida;
9. `CovisionPage.module.css` — 807 rida;
10. `documents/workspace.css` — 769 rida.

Kõigepealt ainult semantiliselt neutraalne failijaotus. Väärtuste ja selektorite lihtsustamine eraldi patch’ides.

---

## Etapp 15 — ülejäänud süsteemiauditid

Pärast stabiilset baasi:

1. inline-stiilide ja CSS topeltomand;
2. z-index ja stacking context;
3. animatsioonid ja jõudlus;
4. täielik ligipääsetavuse CSS-audit;
5. CSS Module’ite kandidaadid;
6. dead-code kustutamisraport;
7. arhitektuurireeglid ja CI jõustamine.

---

# 9. Praktiline järgmine otsus

**Ära jätka praegu kohe `toolbar.css` jagamisega.**

Õige järgmine etapp on:

> **Etapp 9: patch’ide koondamine, `cssSourceBundle` parandamine ja päris projekti test/build-värava läbimine.**

Pärast seda:

> **Etapp 10: minimaalne Playwrighti visuaaltestide komplekt.**

Alles seejärel:

> **Etapp 11: `scroll-panels.css` ja ülejäänud globaalse mobiiliomandi puhastus.**

See järjekord vähendab riski, et järjestikused mehaanilised patch’id kuhjuvad kontekstiarhiivi põhjal, kuid päris projekti harul selgub hiljem import-, build- või visuaalne konflikt.
