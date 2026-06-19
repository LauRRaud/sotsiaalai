# SotsiaalAI CSS etapp 11e — touch-controls ja auth/login/register mobiiliomand

## Eesmärk

Etapp 11e jätkab globaalse mobiilikihi vähendamist ilma Playwrighti/testitaristu laiendamiseta.

Fookus:

- `mobile/touch-controls.css` ei tohiks kanda register-, invite- ega chat-analysis-spetsiifilisi reegleid;
- registeri mobiilireeglid peaksid laadima ainult `/registreerimine` route’il;
- LoginModal mobiili-CSS peaks laadima ainult route’idel, mis renderdavad `LoginModal` komponenti;
- accessibility touch-feedback jääb globaalse mobiilikihi osaks, sest ligipääsetavuse modaal võib olla üleprojektiline.

Teste ei lisatud ega käivitatud. Tehtud on staatiline kontroll.

---

## Muudatused

### 1. `mobile/touch-controls.css` muudeti compatibility-entrypoint’iks

Enne sisaldas fail korraga:

- `register-content` touch state’e;
- `invite-modal-content` ja `person-invite-modal-content` touch state’e;
- `a11y-modal-shell` touch state’e;
- `chat-analysis-overlay` touch state’e.

Pärast:

```text
app/styles/mobile/touch-controls.css
└── imports ../features/accessibility/touch-controls.css
```

Accessibility jäi globaalseks, ülejäänu liikus feature’i juurde.

---

### 2. Uued touch-control omanikud

Lisatud failid:

```text
app/styles/features/accessibility/touch-controls.css
app/styles/features/register/touch-controls.css
app/styles/features/invite/touch-controls.css
app/styles/features/chat/analysis-touch-controls.css
```

Omand:

| Fail | Omanik |
|---|---|
| `features/accessibility/touch-controls.css` | ligipääsetavuse modaali control state’id |
| `features/register/touch-controls.css` | registreerimise vaate control state’id |
| `features/invite/touch-controls.css` | person/invite modal control state’id |
| `features/chat/analysis-touch-controls.css` | chat-analysis overlay control state’id |

---

### 3. Register route sai oma CSS-entrypoint’i

Lisatud:

```text
app/styles/features/register/index.css
```

Sisu:

```css
@import url("./touch-controls.css");
@import url("./mobile.css");
```

Route-import:

```js
import "../styles/features/register/index.css";
```

Lisatud faili:

```text
app/registreerimine/page.js
```

---

### 4. LoginModal sai route-owned entrypoint’i

Lisatud:

```text
app/styles/features/login/index.css
```

Sisu:

```css
@import url("./mobile.css");
@import url("./otp-close.css");
```

`mobile.css` globaalsest ahelast eemaldati:

```css
@import url("./features/login/mobile.css");
@import url("./features/login/otp-close.css");
```

Login entrypoint imporditi route’idele, mis renderdavad `LoginModal` komponenti:

```text
app/page.js
app/join/page.jsx
app/vestlus/page.js
app/profiil/page.js
app/tellimus/page.js
app/uuenda-epost/page.js
app/uuenda-pin/page.js
```

Märkus: `app/join/page.jsx` on client page; `"use client"` direktiiv jäi faili esimeseks sisuliseks realiseks direktiiviks ja CSS-import lisati pärast seda.

---

### 5. Register mobile eemaldati globaalsest ahelast

`mobile.css` globaalsest ahelast eemaldati:

```css
@import url("./features/register/mobile.css");
```

Registeri mobiili- ja touch-reeglid laaditakse nüüd `/registreerimine` route’il `features/register/index.css` kaudu.

---

## Mõju CSS-koormusele

Mõõdikud põhinevad staatilisel lähte-CSS-i graafil, mitte Next.js production bundle’i gzip/brotli väljundil.

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 335 517 B | 329 766 B | **−5751 B** |
| `/` | 376 328 B | 372 346 B | **−3982 B** |
| `/vestlus` | 747 452 B | 748 721 B | **+1269 B** |
| `/ruum` | 369 447 B | 365 969 B | **−3478 B** |
| `/registreerimine` | 335 517 B | 332 110 B | **−3407 B** |
| `/join` | 335 517 B | 331 535 B | **−3982 B** |
| `/profiil` | 375 632 B | 371 650 B | **−3982 B** |
| `/tellimus` | 339 047 B | 335 065 B | **−3982 B** |
| `/uuenda-epost` | 335 517 B | 331 535 B | **−3982 B** |
| `/uuenda-pin` | 335 517 B | 331 535 B | **−3982 B** |
| `/documents` | 426 802 B | 421 051 B | **−5751 B** |
| `/teenusekaart` | 659 753 B | 656 980 B | **−2773 B** |
| `/tooheaolu` | 342 498 B | 336 747 B | **−5751 B** |
| `/materjalid` | 341 802 B | 336 051 B | **−5751 B** |
| `/kovisioon` | 419 507 B | 413 756 B | **−5751 B** |
| `/teekond/[id]` | 341 119 B | 335 368 B | **−5751 B** |

`/vestlus` kasvab veidi, sest chat route omab nüüd ise:

- LoginModal mobiili-CSS-i;
- chat-analysis touch-control reegleid;
- invite touch-control reegleid läbi invite-modal entrypoint’i.

See on omandiparandus, mitte globaalse kihi regressioon.

---

## `!important` muutus

| Mõõdik | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Kõik CSS-failid | 1995 | 2020 | **+25** |
| `app/styles` CSS | 1199 | 1224 | **+25** |

Põhjus: endine `touch-controls.css` kasutas mitme omaniku jaoks suuri `:is(...)` selectorigruppe. Feature’iteks jagamisel korduvad mõned samad state-deklaratsioonid registeri, invite’i, chat-analysis’e ja accessibility failides.

Seda ei käsitletud selles etapis eraldi optimeerimisena, sest kasutaja soovis `!important` inventuuri praegu vahele jätta. See on siiski esimene etapp pärast 11d, kus `!important` arv kasvab, seega tasub see hiljem konsolideerida.

Võimalik hilisem parandus:

- tuua korduvad selected/active control state’id shared mixin-laadsesse CSS primitive’i;
- vähendada duplicated `!important` plokke tokeni ja `:where()`/`:is()` kombinatsiooniga;
- teha see pärast omandikihi lõpuleviimist.

---

## Staatiline kontroll

```text
git apply --check: OK
CSS files under app/styles: 135
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Bad use client directive files: 0
!important count all CSS: 2020
!important count app/styles CSS: 1224
```

Teste ei lisatud ega käivitatud.

---

## Riskid

### Keskmine risk: LoginModal route-importid

LoginModal CSS ei ole enam globaalses mobiiliahelas. See on arhitektuurselt õige, kuid päris repos tuleb kontrollida, kas mõni route renderdab `LoginModal` komponenti väljaspool neid faile:

```text
app/page.js
app/join/page.jsx
app/vestlus/page.js
app/profiil/page.js
app/tellimus/page.js
app/uuenda-epost/page.js
app/uuenda-pin/page.js
```

Kui mõni uus route või dünaamiline wrapper kasutab `LoginModal`it, peab see importima:

```js
import "../styles/features/login/index.css";
```

või kasutama vastava route’i suhtelist importi.

### Keskmine risk: touch state’i kaskaad

Touch-control reeglid laadivad nüüd feature-route’i CSS-i sees, mitte globaalse mobiiliahela alguses. Kuna enamik neist kasutab `!important`, on visuaalse regressiooni risk väiksem, kuid täielikult seda staatiliselt kinnitada ei saa.

### Madal risk: register route

Registeri mobiili- ja touch-reeglid on nüüd `/registreerimine` route’i omandis. See peaks vähendama kõrvalroute’ide CSS-i ilma registeri vaadet kahjustamata.

---

## Rakendamine

Rakenda pärast `sotsiaalai-css-cleanup-12.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-13.patch
git apply sotsiaalai-css-cleanup-13.patch
```

Soovitatav manuaalne kontroll pärast rakendamist:

```text
/registreerimine mobile
/ mobile login modal
/vestlus mobile login modal
/vestlus chat-analysis overlay
/vestlus invite modal
/ruum invite modal
/profiil login modal
/tellimus login modal
/uuenda-epost login modal
/uuenda-pin login modal
```

---

## Järgmine etapp

Soovituslik **etapp 11f**:

- `features/accessibility/touch.css` ja `features/accessibility/fields.css` audit;
- accessibility-spetsiifilised reeglid jätta globaalseks;
- register/invite/login/chat viited eemaldada accessibility failidest, kui neid seal veel leidub;
- pärast seda vaadata `theme/hc.css` suured auth/invite/register plokid, kuid mitte veel täieliku `!important` inventuurina.

Alternatiivne järgmine etapp:

- `features/login/index.css` ja `shared/register.css` piiritlemine;
- LoginModal CSS-i route-omaniku kontroll kõigi `LoginModal` importide järgi.
