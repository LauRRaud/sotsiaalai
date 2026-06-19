# SotsiaalAI CSS — etapp 11

## Fookus

Etapp 11 jätkab globaalse mobiilikihi puhastamist ilma testitaristut laiendamata. Kasutaja soovis testid praegu vahele jätta, seega selles etapis ei lisatud ega muudetud ühtegi `tests/` faili.

Töö keskendus kolmele alale:

1. `mobile/scroll-panels.css` omandijagamine;
2. `mobile/panel-surfaces.css` omandijagamine;
3. invite-modal mobiilireeglite eemaldamine globaalsest mobiilipaketist.

Eesmärk oli vähendada igale mobiilsele route’ile laaditavat invite/workspace CSS-i ning teha suured shared-failid väiksemateks omanikufailideks.

---

## Peamine muudatus

`features/invite/mobile.css` ei laadi enam `app/styles/mobile.css` kaudu kõigile mobiilivaadetele.

Varem:

```css
@import url("./mobile/scroll-panels.css");
@import url("./features/invite/mobile.css");
@import url("./mobile/subpage-title-system.css");
@import url("./mobile/panel-surfaces.css");
```

Nüüd:

```css
@import url("./mobile/scroll-panels.css");
@import url("./mobile/subpage-title-system.css");
@import url("./mobile/panel-surfaces.css");
```

Invite’i mobiilireeglid laaditakse nüüd `components/invite-modal.css` kaudu:

```css
@import url("../features/invite/mobile.css");
```

See tähendab, et invite-modal ja selle workspace-embedded reeglid jõuavad ainult route’idele, mis impordivad `invite-modal.css`, näiteks `/vestlus` ja `/ruum`.

---

## `scroll-panels.css` jagamine

Endine 289-realise sisuga fail muutus entrypoint’iks:

```css
@import url("./scroll-panels/direct.css");
@import url("./scroll-panels/workspace-guide-base.css");
@import url("./scroll-panels/glass-card.css");
@import url("./scroll-panels/workspace-layout.css");
@import url("./scroll-panels/workspace-guide-scroll.css");
```

Uued omanikufailid:

```text
app/styles/mobile/scroll-panels/
├── direct.css
├── workspace-guide-base.css
├── glass-card.css
├── workspace-layout.css
└── workspace-guide-scroll.css
```

### Omandiloogika

| Fail | Vastutus |
|---|---|
| `direct.css` | `.direct-scroll-surface` primitive avalike alamlehtede jaoks |
| `workspace-guide-base.css` | workspace guide paneeli baasscroll |
| `glass-card.css` | shared mobiilse glass-card’i suurus, pind ja full-panel header |
| `workspace-layout.css` | documents/materials/covision/workspace feature-paneelide mobiilne shell |
| `workspace-guide-scroll.css` | workspace guide sisemise scrolliala overscan ja scrollbar-gutter |

Invite workspace’i scrollireeglid ei ole enam shared `scroll-panels.css` sees. Need liikusid siia:

```text
app/styles/features/invite/workspace-scroll.css
```

ja imporditakse `features/invite/mobile.css` alguses.

---

## `panel-surfaces.css` jagamine

Endine `panel-surfaces.css` muutus entrypoint’iks:

```css
@import url("./panel-surfaces/shadows.css");
@import url("./panel-surfaces/dashboard-cards.css");
```

Uued failid:

```text
app/styles/mobile/panel-surfaces/
├── shadows.css
└── dashboard-cards.css
```

### Omandiloogika

| Fail | Vastutus |
|---|---|
| `shadows.css` | mobiilsete glass-pindade lõplik varju mahasurumise leping |
| `dashboard-cards.css` | workspace/wellbeing dashboard-kaartide mobiilne kompaktne suurus |

Selles etapis jäid dashboard-kaartide reeglid veel globaalsesse mobiilipaketti, sest need mõjutavad nii chat workspace’i kui ka tööheaolu vaadet. Nende route-põhine eraldamine tuleks teha eraldi etapis, sest see vajab visuaalset kontrolli.

---

## Muudetud failid

```text
app/styles/components/invite-modal.css
app/styles/features/invite/mobile.css
app/styles/features/invite/workspace-scroll.css
app/styles/mobile.css
app/styles/mobile/panel-surfaces.css
app/styles/mobile/panel-surfaces/dashboard-cards.css
app/styles/mobile/panel-surfaces/shadows.css
app/styles/mobile/scroll-panels.css
app/styles/mobile/scroll-panels/direct.css
app/styles/mobile/scroll-panels/glass-card.css
app/styles/mobile/scroll-panels/workspace-guide-base.css
app/styles/mobile/scroll-panels/workspace-guide-scroll.css
app/styles/mobile/scroll-panels/workspace-layout.css
```

Patch’i maht:

```text
13 files changed, 395 insertions(+), 367 deletions(-)
```

---

## Mõju CSS-koormusele

Need arvud on staatilise lähte-CSS-i hinnang, mitte Next.js production buildi gzip/brotli tulemus.

| Route / bundle | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| `app/styles/mobile.css` bundle | 71 828 B | 64 645 B | **−7 183 B** |
| `/` | 392 103 B | 384 920 B | **−7 183 B** |
| `/kasutustingimused` | 392 497 B | 385 314 B | **−7 183 B** |
| `/tooheaolu` | 351 292 B | 344 109 B | **−7 183 B** |
| `/teenusekaart` | 667 778 B | 660 595 B | **−7 183 B** |
| `/documents` | 437 069 B | 429 886 B | **−7 183 B** |
| `/vestlus` | 741 020 B | 742 255 B | +1 235 B |
| `/ruum` | 367 361 B | 368 596 B | +1 235 B |

`/vestlus` ja `/ruum` kasvavad veidi, sest invite CSS on nüüd route-owned ja `invite-modal.css` bundle sisaldab kogu invite mobile kihti. See on teadlik omandiparandus: invite CSS ei kuulu enam kõikide mobiilroute’ide ühisesse mobiilipaketti.

---

## Staatiline kontroll

Testifaile ei lisatud ega käivitatud. Tehti ainult staatilised kontrollid:

| Kontroll | Tulemus |
|---|---:|
| Patch rakendub puhtale after-08 puule | OK |
| Kohalikud CSS `@import` viited | 0 puuduvat |
| CSS parse error’id | 0 |
| Brace-balance vead | 0 |
| `!important` arv | 1995 → 1995 |

---

## Riskid

### 1. Invite CSS-i laadimisjärjekord muutus

Varem laadis `features/invite/mobile.css` globaalses mobiilikihis enne `subpage-title-system.css` ja `panel-surfaces.css` faili.

Nüüd jõuab invite mobile CSS route’i kaudu `components/invite-modal.css` sisse. See võib `/vestlus` ja `/ruum` vaadetes muuta mõne invite-modal reegli kaskaadipositsiooni.

Kõige olulisem käsitsi kontroll:

- `/vestlus` mobiilis;
- workspace paneelis avatud invite-modal;
- embedded invite vaade workspace’is;
- `/ruum` invite-modal;
- high contrast / mono invite-modal, kui need vaated on kasutusel.

### 2. Dashboard-kaartide globaalsus jäi alles

`panel-surfaces/dashboard-cards.css` on nüüd eraldi fail, kuid endiselt globaalne. Selle edasine jagamine tuleb teha pärast seda, kui on selge, kas reegel kuulub:

- chat workspace’i;
- tööheaolu vaatesse;
- shared workspace primitive’i.

### 3. Route’i kasv `/vestlus` ja `/ruum` puhul

See ei ole jõudlusvõit nendel kahel route’il. Võit tuleb sellest, et ülejäänud route’id ei kanna enam invite-modal mobiilireegleid.

---

## Soovitatud järgmine etapp

Järgmine kõige mõistlikum samm on **etapp 11b**:

1. jagada `panel-surfaces/dashboard-cards.css` kaheks omanikuks:
   - `features/chat/workspace-dashboard-mobile.css`;
   - `features/wellbeing/mobile-dashboard-cards.css`;
2. importida tööheaolu CSS ainult `/tooheaolu` route’il;
3. hoida `panel-surfaces/shadows.css` globaalsena, sest see on endiselt shared final surface contract;
4. pärast seda võtta ette `mobile/scroll-panels/workspace-layout.css`, sest seal on endiselt documents/materials/covision/workspace segamini.

Ilma visuaaltestideta tuleks need teha väikeste patch’idena, mitte ühe suure korraga.

