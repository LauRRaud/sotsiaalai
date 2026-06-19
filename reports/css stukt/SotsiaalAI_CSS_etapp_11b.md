# SotsiaalAI CSS — etapp 11b

## Fookus

Etapp 11b jätkab globaalse mobiili-CSS-i vähendamist ja võtab ette etapis 11 tekkinud faili:

```text
app/styles/mobile/panel-surfaces/dashboard-cards.css
```

See fail sisaldas korraga kahte vastutust:

1. chat workspace’i dashboard-kaartide mobiilne kompaktne kuju;
2. tööheaolu vaate samade dashboard-kaartide mobiilne kompaktne kuju;
3. lisaks üks chat/workspace-spetsiifiline erand `card_document_drafting` kaardile.

Fail laadis endiselt globaalselt kõigile mobiilroute’idele, kuigi enamik lehti ei kasuta ei `workspace-dashboard-panel` ega `wellbeing-page-surface` dashboard-kaarte.

---

## Tehtud muudatus

### 1. Eemaldatud globaalne import

Failist:

```text
app/styles/mobile/panel-surfaces.css
```

eemaldati import:

```css
@import url("./panel-surfaces/dashboard-cards.css");
```

See tähendab, et dashboard-kaartide kompaktne mobiilireegel ei jõua enam kõigile route’idele globaalse mobiilipaketi kaudu.

---

### 2. Loodud route-imported shared primitive

Endine ühine dashboard-kaardi kompaktne reegel liikus siia:

```text
app/styles/shared/workspace-dashboard-card-compact.css
```

Sellesse jäid ainult mõlemale pinnale ühised reeglid:

- `.workspace-dashboard-panel .workspace-dashboard-card`;
- `.wellbeing-page-surface .workspace-dashboard-card`;
- kaardi ikooni suurus;
- kaardi `row-gap`;
- kaardi varju eemaldus;
- ikooni vertikaalne nihe;
- `focus-visible` ring;
- pealkirja font ja vertikaalne nihe.

Oluline: see fail ei ole globaalne. Seda imporditakse ainult nende route’ide CSS-is, mis seda päriselt vajavad.

---

### 3. Chat/workspace erand liikus chat feature’i alla

Uus fail:

```text
app/styles/features/chat/workspace-dashboard-cards.css
```

See:

- impordib shared compact primitive’i;
- sisaldab ainult workspace-spetsiifilist `card_document_drafting` erandit;
- laetakse chat route’idel `features/chat/index.css` kaudu.

`features/chat/index.css` sai uue impordi:

```css
@import url("./workspace-dashboard-cards.css");
```

---

### 4. Tööheaolu sai oma feature CSS entrypoint’i

Uued failid:

```text
app/styles/features/wellbeing/index.css
app/styles/features/wellbeing/mobile-dashboard-cards.css
```

`mobile-dashboard-cards.css` impordib shared compact primitive’i. Tööheaolu route’id impordivad nüüd:

```js
import "../styles/features/wellbeing/index.css";
```

ja detailvaade:

```js
import "../../styles/features/wellbeing/index.css";
```

Muudetud failid:

```text
app/tooheaolu/page.jsx
app/tooheaolu/[tool]/page.jsx
```

---

## Miks shared primitive, mitte dubleeritud chat/wellbeing CSS?

Esimene variant oleks olnud luua kaks eraldi koopiat:

```text
features/chat/workspace-dashboard-cards.css
features/wellbeing/mobile-dashboard-cards.css
```

See oleks küll omandi poolest selge, kuid kasvataks kogu projekti `!important` arvu, sest samad neli kompaktkaardi reeglit korduksid kahes failis.

Valitud lahendus:

```text
shared/workspace-dashboard-card-compact.css
features/chat/workspace-dashboard-cards.css
features/wellbeing/mobile-dashboard-cards.css
```

annab parema tulemuse:

- ühine primitive on ainult üks kord olemas;
- primitive ei ole enam globaalne;
- chat lisab ainult oma erandi;
- tööheaolu impordib ainult ühise osa;
- `!important` koguarv ei kasva.

---

## Mõju

Arvud on normaliseeritud lähte-CSS-i põhjal, et CRLF/LF reavahetused ei moonutaks tulemust.

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 344 109 B | 342 074 B | **−2035 B** |
| `/` | 384 920 B | 382 885 B | **−2035 B** |
| `/documents` | 429 886 B | 427 851 B | **−2035 B** |
| `/ruum` | 368 596 B | 366 561 B | **−2035 B** |
| `/tooheaolu` | 344 109 B | 343 547 B | **−562 B** |
| `/tooheaolu/[tool]` | 344 109 B | 343 547 B | **−562 B** |
| `/vestlus` | 742 255 B | 742 396 B | **+141 B** |
| `/teenusekaart` | 660 595 B | 660 736 B | **+141 B** |

Chat route’id kasvavad 141 B võrra, sest nad impordivad nüüd route-owned compact primitive’i ja workspace-spetsiifilise `card_document_drafting` erandi. See on aktsepteeritav, sest:

- CSS ei laadi enam kõigil mobiilroute’idel;
- workspace erand asub õiges feature’is;
- tööheaolu ei kanna enam workspace `card_document_drafting` erandit;
- `!important` arv ei kasvanud.

---

## Staatiline kontroll

Teste kasutaja soovil ei lisatud ega käivitatud. Tehtud oli ainult staatiline kontroll.

Tulemused:

```text
missing_css_imports 0
brace_errors 0
css_files_head 125
css_files_current 128
important_head 1995
important_current 1995
global_css_head_files 56
global_css_current_files 55
git_diff_check OK
git_apply_check_on_after09_tree OK
```

Tähendus:

- puuduvaid CSS-importide sihtfaile ei ole;
- CSS brace-balance vigu ei ole;
- `!important` arv jäi samaks;
- globaalne CSS-sõltuvuste arv vähenes ühe faili võrra;
- patch rakendub puhtale after-09 puule.

---

## Riskid

### 1. Chat route’i importjärjekord

Dashboard-card compact CSS tuleb nüüd `features/chat/index.css` kaudu, pärast globaalset mobiilikihti. Kuna selektorid on samad või samaväärsed ja väärtusi ei muudetud, on risk madal.

### 2. Tööheaolu page-level CSS import

Tööheaolu sai uue page-level CSS impordi. See järgib projekti olemasolevat mustrit, kus route’id impordivad oma feature CSS-i `app/.../page.jsx` failides.

### 3. Päris build vajab hiljem kinnitamist

Kontekstiarhiivis ei kontrollitud `npm run build`. Päris repos tuleks hiljem kontrollida, et Next.js aktsepteerib uut `features/wellbeing/index.css` importi tööheaolu route’idest.

---

## Muudetud failid

```text
app/styles/features/chat/index.css
app/styles/features/chat/workspace-dashboard-cards.css
app/styles/features/wellbeing/index.css
app/styles/features/wellbeing/mobile-dashboard-cards.css
app/styles/mobile/panel-surfaces.css
app/styles/mobile/panel-surfaces/dashboard-cards.css -> app/styles/shared/workspace-dashboard-card-compact.css
app/tooheaolu/page.jsx
app/tooheaolu/[tool]/page.jsx
```

---

## Rakendamine

Patch rakendatakse pärast patche 01–09:

```bash
git apply --check sotsiaalai-css-cleanup-10.patch
git apply sotsiaalai-css-cleanup-10.patch
```

Kuna selles etapis teste teadlikult ei kasutatud, on minimaalne hilisem kontroll päris repos:

```bash
npm run build
```

Soovituslik käsitsi visuaalne kontroll:

- `/vestlus` mobiilis, workspace avatud;
- dokumendi koostamise kaart workspace’is;
- `/tooheaolu` mobiilis;
- mõni tööheaolu detailvaade, näiteks `/tooheaolu/kiirkontroll` või vastav tööriista route.

---

## Järgmine soovitus

Järgmine mõistlik samm on **etapp 11c**:

```text
scroll-panels feature-adapterite väljaviimine globaalsest mobiilikihist
```

Prioriteetsed kandidaadid:

- documents workspace scroll-adapter;
- materials/covision/workspace adapterid;
- invite embedded scroll-adapterite jäänused;
- shared glass-card primitive’i ja feature-geomeetria lõplik eraldamine.

Etapp 11c peaks jätkama sama põhimõttega: mitte muuta visuaalväärtusi, vaid ainult omandit ja laadimisulatust.
