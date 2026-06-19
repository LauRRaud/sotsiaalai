# SotsiaalAI CSS — etapp 11l: globaalse mobiilikihi lõppinventuur

## Otsus

Etapp 11l on **inventuurietapp, mitte patch**. Pärast etappe 11a–11k on globaalse mobiilikihi kõige suurem madala riskiga puhastus tehtud.

Järgmised allesjäänud feature-nimelised selectorid on valdavalt shared registry failides, eriti:

- `mobile/subpage-header/layout.css`;
- `mobile/subpage-header/title-fit.css`;
- `mobile/scroll-panels/glass-card.css`;
- `mobile/scroll-panels/workspace-*` failid.

Neid ei soovita praegu agressiivselt lõhkuda ilma brauseripõhise visuaalse kontrollita, sest need failid hoiavad mitme route’i ühist päise, klaaspinna ja scroll-paneeli lepingut.

---

## Rakendatud alus

Inventuur tehti ajutises tööpuus, kuhu rakendati järjest patch’id:

```text
sotsiaalai-css-cleanup-01.patch
...
sotsiaalai-css-cleanup-19.patch
```

Teste ei lisatud ega käivitatud. Tehti ainult staatiline kontroll.

---

## Staatiline kontroll

```text
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Project CSS !important count after patch 19: 2025
Global mobile files: 24
Global mobile bytes: 34820
Global mobile !important: 48
Global mobile feature-named selectors: 105
```

---

## Globaalse mobiilikihi muutus

| Seis | Failid | Bytes | `!important` | Feature-nimelised selectorid |
|---|---:|---:|---:|---:|
| After 08 | 22 | 71 828 | 163 | 366 |
| After 19 | 24 | 34 820 | 48 | 105 |
| Muutus | +2 | **−37 008** | **−115** | **−261** |

Järeldus: etapid 11a–11k vähendasid globaalse mobiilikihi mahtu umbes **51,5%** ja eemaldasid sellest suure osa feature-spetsiifilisest CSS-ist.

---

## Kogu route-graafi mõju

Need arvud kirjeldavad staatilise lähte-CSS-i sõltuvusgraafi, mitte production buildi gzip/brotli chunk’e.

| Route | Algne | After 08 | After 19 | 08→19 | Algne→19 |
|---|---:|---:|---:|---:|---:|
| `/` | 404 206 | 392 103 | 361 287 | −30 816 | −42 919 |
| `/vestlus` | 748 929 | 741 020 | 741 190 | +170 | −7 739 |
| `/teenusekaart` | 684 580 | 667 778 | 645 140 | −22 638 | −39 440 |
| `/documents` | 455 986 | 437 069 | 409 042 | −28 027 | −46 944 |
| `/dokreziim` | 578 957 | 560 635 | 537 997 | −22 638 | −40 960 |
| `/tooheaolu` | 371 233 | 351 292 | 324 738 | −26 554 | −46 495 |
| `/profiil` | 402 103 | 391 055 | 358 922 | −32 133 | −43 181 |
| `/registreerimine` | 371 233 | 351 292 | 325 390 | −25 902 | −45 843 |
| `/ruum` | 387 302 | 367 361 | 356 551 | −10 810 | −30 751 |
| `/materjalid` | 371 233 | 351 292 | 324 042 | −27 250 | −47 191 |
| `/kovisioon` | 448 563 | 429 646 | 401 747 | −27 899 | −46 816 |
| `/teekond/[id]` | 371 233 | 351 292 | 323 359 | −27 933 | −47 874 |

`/vestlus` vähenes pärast after 08 seisu ainult 170 B, sest selle route’i juurde tõsteti teadlikult mitu varem globaalset feature-stiili. See on omandiparandus, mitte mahupuhastus.

---

## Globaalse mobiilikihi failid after 19 seisus

| Fail | Bytes | `!important` | Selectorid |
|---|---:|---:|---:|
| `app/styles/mobile/foundations.css` | 5685 | 10 | 25 |
| `app/styles/mobile/scroll-panels/glass-card.css` | 4361 | 2 | 15 |
| `app/styles/mobile/subpage-header/layout.css` | 3922 | 1 | 76 |
| `app/styles/mobile/scroll-panels/workspace-layout.css` | 2422 | 0 | 1 |
| `app/styles/mobile/interaction-surfaces.css` | 2225 | 3 | 26 |
| `app/styles/mobile/subpage-header/title-fit.css` | 2069 | 5 | 30 |
| `app/styles/features/accessibility/touch-controls.css` | 1736 | 11 | 7 |
| `app/styles/mobile/modal-surfaces/form-theme.css` | 1638 | 0 | 2 |
| `app/styles/mobile/scroll-panels/workspace-guide-base.css` | 1571 | 4 | 1 |
| `app/styles/mobile/scroll-panels/workspace-guide-scroll.css` | 1570 | 2 | 1 |
| `app/styles/features/accessibility/touch.css` | 1394 | 0 | 8 |
| `app/styles/mobile/background-layer.css` | 1066 | 2 | 8 |
| `app/styles/mobile/subpage-header/tokens.css` | 1051 | 0 | 1 |
| `app/styles/mobile/panel-surfaces/shadows.css` | 872 | 2 | 8 |
| `app/styles/mobile.css` | 636 | 0 | 0 |
| `app/styles/features/accessibility/fields.css` | 517 | 5 | 4 |
| `app/styles/mobile/subpage-header/workspace-offsets.css` | 507 | 0 | 1 |
| `app/styles/mobile/scroll-panels.css` | 389 | 0 | 0 |
| `app/styles/mobile/content-surfaces.css` | 303 | 0 | 2 |
| `app/styles/mobile/subpage-title-system.css` | 301 | 0 | 0 |
| `app/styles/mobile/touch-controls.css` | 175 | 0 | 0 |
| `app/styles/mobile/modal-surfaces.css` | 151 | 0 | 0 |
| `app/styles/mobile/scroll-panels/direct.css` | 133 | 1 | 1 |
| `app/styles/mobile/panel-surfaces.css` | 126 | 0 | 0 |

---

## Allesjäänud feature-nimelised selectorid

Inventuur leidis globaalsest mobiilikihist veel 105 feature-nimelist selectorit. See ei tähenda automaatselt viga. Need jagunevad kolme rühma.

### 1. Teadlik shared registry — jätta praegu rahule

#### `mobile/subpage-header/layout.css`

Sisaldab umbes 67 feature-nimelist selectoriviidet. Need on peamiselt ühises mobiilipäise registris:

- `workspace-*`;
- `service-map-*`;
- `documents-*`;
- `materials-*`;
- `covision-*`;
- `subscription-*`;
- `account-*`;
- `help-listings-*`;
- `selected-listing-*`;
- `invite-*`;
- `policy-*`.

See fail kontrollib ühise mobiilipäise paigutust, back/info nuppe ja title-wrap’i. Seda ei tasu praegu lõhkuda, sest väike järjekorra- või specificity-muutus võib lõhkuda mitme route’i päised.

#### `mobile/subpage-header/title-fit.css`

Sisaldab umbes 24 feature-nimelist selectorit. Need on seotud title fit’i ja pealkirja tüpograafiaga. Eraldi riskid:

- `glass-title-register`;
- `policy-mobile-title`;
- `account-modal-title`;
- `subscription-page-title`;
- `rooms-page-title`.

Ka see on shared registry fail. Järgmine võimalik töö, aga mitte ilma visuaalse kontrollita.

### 2. Shared surface primitive — võimalik hilisem jagamine

#### `mobile/scroll-panels/glass-card.css`

Sisaldab veel viiteid:

- `subscription-modal-content`;
- `help-listings-modal-content`;
- `selected-listing-modal-content`;
- `profile-container`;
- `rag-admin-shell-card`;
- `workspace-guide-panel`.

See on järgmine võimalik patchikandidaat, kuid mitte väga madala riskiga, sest tegu on ühise klaaspinna ja kaardigeomeetria kihiga.

### 3. Aktsepteeritavad shared primitive’id

Järgmised failid sisaldavad feature-nimelisi klasse, aga nende roll on hetkel arusaadav ja väikese riskiga:

- `scroll-panels/workspace-layout.css` — workspace-family layout primitive;
- `scroll-panels/workspace-guide-base.css` — workspace-guide scroll primitive;
- `scroll-panels/workspace-guide-scroll.css` — workspace-guide scroll behavior;
- `subpage-header/workspace-offsets.css` — üks allesjäänud workspace-guide offset;
- `features/accessibility/fields.css` — `a11y-screenprofile-option--bottom`, mis on pigem ligipääsetavuse valiku nimi, mitte profiili feature’i leke.

---

## Tähtis tähelepanek kogu CSS kohta

Kuigi globaalse mobiilikihi maht vähenes tugevalt, kasvas kogu CSS-failide arv ja kogu lähte-CSS-i toormaht.

| Seis | CSS-faile | Lähte-CSS bytes | `!important` kokku |
|---|---:|---:|---:|
| Algne | 95 | 1 049 498 | 1992 |
| After 08 | 117 | 1 053 079 | 1995 |
| After 19 | 156 | 1 070 285 | 2025 |

See on ootuspärane kõrvalmõju: route-owned failides kordub osa varem grupiselektorina kirjeldatud reeglitest. See on omandiliselt puhtam, aga mitte veel lõplik optimeeritud CSS.

Järgmine päris vähendamise etapp peaks tulema tokenite, registry-failide ja `!important`-ide korrastamisest, mitte enam ainult failide ümbertõstmisest.

---

## Soovituslik järgmine otsus

### Mitte jätkata kohe 11m patch’iga

Pärast 11l inventuuri ei ole enam suurt madala riskiga globaalse mobiilikihi puhastust. Edasi minnes tekib kiiresti kolm riski:

1. route’id hakkavad kandma duplikaat-CSS-i;
2. `!important` arv kasvab veel;
3. shared päise ja title-fit’i registry võib visuaalselt katki minna.

### Järgmine mõistlik samm

Soovitus on teha nüüd koondetapp:

1. liita patch’id 03+04;
2. koondada 11a–11k üheks või kaheks loogiliseks commit’iks;
3. teha päris repos `git apply --check` ja `npm run build`;
4. võrrelda mobiilivaateid käsitsi vähemalt:
   - `/`;
   - `/vestlus`;
   - `/teenusekaart`;
   - `/documents`;
   - `/profiil`;
   - `/registreerimine`;
   - `/ruum`;
   - `/tooheaolu`;
   - `/kovisioon`;
   - `/teekond/[id]`.

### Kui siiski jätkata ilma build/testita

Siis järgmine tehniline kandidaat on:

> **11m: `scroll-panels/glass-card.css` audit ja ainult kõige ilmsemate modal-selectorite väljaviimine.**

Aga see on juba keskmise riskiga etapp, mitte enam sama ohutu nagu 11a–11j.

---

## Kokkuvõte

Etapp 11 täitis oma peamise eesmärgi:

- globaalse mobiilikihi maht vähenes umbes poole võrra;
- suurem osa route-spetsiifilisi invite/login/register/profile/rooms/home/policy jms lekkeid viidi omaniku juurde;
- puuduvad importvead, tsüklid ja brace-balance vead;
- allesjäänud lekete tuum on shared registry, mitte juhuslik CSS-pudru.

Minu soovitus: **siin võiks etapp 11 lõpetada** ja liikuda edasi kas koondamise/buildi või tokenite/teemade auditi juurde.
