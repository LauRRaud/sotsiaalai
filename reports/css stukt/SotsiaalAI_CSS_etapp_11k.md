# SotsiaalAI CSS etapp 11k — workspace/wellbeing dashboard shadow ja header-offset jääkide eraldamine

## Fookus

Etapp 11k jätkab globaalse mobiilikihi puhastamist pärast patch’i 18.

Sihtfailid:

- `app/styles/mobile/foundations.css`
- `app/styles/mobile/panel-surfaces/shadows.css`
- `app/styles/mobile/subpage-header/workspace-offsets.css`
- `app/styles/shared/mobile-workspace-scroll-adapters.css`

Eesmärk oli eemaldada globaalsest mobiiliahelast workspace/wellbeing/dashboard-spetsiifilised shadow ja header-offset reeglid, jättes `subpage-header/layout.css` ja `subpage-header/title-fit.css` teadlikult puutumata.

Teste ei lisatud ega käivitatud. Tehtud on staatiline kontroll.

---

## Muudatused

### 1. Workspace-family header-offset’id kolisid route-imported shared faili

Loodud fail:

```text
app/styles/shared/mobile-workspace-header-offsets.css
```

Sinna liikusid `mobile/subpage-header/workspace-offsets.css` failist:

- `.workspace-dashboard-panel` header-offset’id;
- `.workspace-feature-panel.workspace-scroll-surface` header-offset’id;
- `.wellbeing-page-surface` header-offset’id;
- workspace/wellbeing title margin reset;
- dashboard-spetsiifiline header override;
- wellbeing-spetsiifiline info-button offset.

`mobile/subpage-header/workspace-offsets.css` jäi alles ainult generic `.workspace-guide-panel-scroll` control-offset primitive’iks.

### 2. Workspace-family shadow suppression kolis route-imported shared faili

Loodud fail:

```text
app/styles/shared/mobile-workspace-shadow-surfaces.css
```

Sinna liikus workspace-family shadow suppression:

- `.workspace-dashboard-panel`
- `.workspace-feature-panel.workspace-scroll-surface`
- `.wellbeing-page-surface`

Globaalsed shared pinnad jäid endiselt globaalsetesse failidesse:

- `.glass-ring`
- `.glass-ring.glass-ring--desktop-stable`
- `.glass-subpage-surface`
- `.mobile-keep-desktop-glass-cards`

### 3. Route-imported shared entrypoint täienes

`app/styles/shared/mobile-workspace-scroll-adapters.css` impordib nüüd lisaks:

```css
@import url("./mobile-workspace-shadow-surfaces.css");
@import url("./mobile-workspace-header-offsets.css");
```

See tähendab, et workspace-family header/shadow reeglid laetakse ainult route’idel, mis juba impordivad workspace scroll adaptereid.

### 4. README uuendatud

Lisatud reegel:

- workspace-family dashboard/wellbeing header-offset’id ja shadow suppression peavad elama route-imported shared CSS-is;
- neid ei tohi lisada tagasi globaalsetesse `mobile/panel-surfaces/shadows.css`, `mobile/foundations.css` või `mobile/subpage-header/workspace-offsets.css` failidesse.

---

## Miks `layout.css` ja `title-fit.css` jäid puutumata

Need failid on endiselt globaalsed shared registry failid.

Nad sisaldavad laia selectorite nimekirja:

- `.glass-ring`
- `.direct-scroll-surface`
- `.workspace-scroll-surface`
- `.workspace-dashboard-panel`
- `.service-map-page-panel`
- `.workspace-guide-panel`
- `.workspace-feature-panel`
- `.documents-workspace-shell`
- `.materials-page-content`
- `.covision-page-surface`
- modalid ja policy pinnad

Need failid määravad üldist header layout’i ja title-fitting käitumist. Nende jagamine route’ide alla oleks suurema riskiga ning vajaks brauseripõhist visuaalkontrolli.

Etapp 11k liigutas ainult selged offset-tokenid ja shadow suppression’i.

---

## Mõju normaliseeritud lähte-CSS-i järgi

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 317 083 B | 314 284 B | **−2799 B** |
| `/` | 364 086 B | 361 287 B | **−2799 B** |
| `/profiil` | 361 721 B | 358 922 B | **−2799 B** |
| `/registreerimine` | 328 189 B | 325 390 B | **−2799 B** |
| `/vestlus` | 740 516 B | 741 190 B | **+674 B** |
| `/teenusekaart` | 644 466 B | 645 140 B | **+674 B** |
| `/documents` | 408 368 B | 409 042 B | **+674 B** |
| `/tooheaolu` | 324 064 B | 324 738 B | **+674 B** |
| `/ruum` | 355 877 B | 356 551 B | **+674 B** |
| `/materjalid` | 323 368 B | 324 042 B | **+674 B** |
| `/kovisioon` | 401 073 B | 401 747 B | **+674 B** |
| `/teekond/[id]` | 322 685 B | 323 359 B | **+674 B** |

Tavalised mitte-workspace route’id võidavad umbes 2.8 KB. Workspace-family route’id kasvavad 674 B, sest nad kannavad nüüd ise oma header/shadow CSS-i.

See on omandiparandus, mitte suur mahupuhastus.

---

## `!important` mõju

`!important` arv kasvas:

```text
2022 → 2025
```

Põhjus: workspace shadow suppression pidi grupiselektorist välja kolides saama route-imported shared faili oma deklaratsioonid. See dubleerib kolm `!important` markerit, et säilitada senine shadow suppression’i tugevus.

See on riskina kirjas, sest `!important` inventuur on teadlikult edasi lükatud.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
!important count after patch 19: 2025
Workspace shadow/header global leaks: 0 []
Route-imported shared workspace CSS imports missing: []
```

Kontrollitud leak-pattern’id järgmistes globaalsetes failides:

- `mobile/foundations.css`
- `mobile/panel-surfaces/shadows.css`
- `mobile/subpage-header/workspace-offsets.css`

Otsitud selectorid:

- `workspace-dashboard-panel`
- `workspace-feature-panel.workspace-scroll-surface`
- `wellbeing-page-surface`

Tulemus: nendes kolmes failis lekkeid ei ole.

---

## Patch

Fail:

```text
sotsiaalai-css-cleanup-19.patch
```

Rakendamine pärast `sotsiaalai-css-cleanup-18.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-19.patch
git apply sotsiaalai-css-cleanup-19.patch
```

---

## Riskid

1. `layout.css` ja `title-fit.css` sisaldavad endiselt workspace selector’eid, kuid see on hetkel teadlik shared registry otsus.
2. Workspace-family route’id kasvavad 674 B, sest reeglid ei ole enam globaalses ahelas.
3. `!important` arv kasvab 3 võrra.
4. Brauseripõhist visuaalkontrolli ei tehtud.

---

## Järgmine soovitus

Järgmine mõistlik etapp on **11l: globaalse mobiilikihi lõppinventuur**.

Selles etapis võiks teha ainult raporti, mitte kohe patch’i:

- kui palju CSS-i on pärast 11a–11k globaalses mobiiliahelas alles;
- millised selectorid on veel feature-nimelised;
- millised neist on teadlikud shared registry selectorid;
- millised tuleks järgmises patch’is välja tõsta;
- millised failid võiks nüüd lugeda “stabiliseeritud” shared primitive’ideks.

Pärast seda saab otsustada, kas minna edasi teemade/tokennite auditiga või võtta veel üks väike mobiiliomandi patch.
