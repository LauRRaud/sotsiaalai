# SotsiaalAI CSS etapp 11d — modal-surfaces omandi lahutamine

## Eesmärk

Etapp 11d võtab ette `app/styles/mobile/modal-surfaces.css` faili, mis enne kandis korraga mitme eri vaate mobiilse modal-/glass-surface’i loogikat:

- invite modal;
- subscription modal;
- help listings modal;
- selected listing modal;
- materials page shell;
- framework page shell;
- profile account settings modal;
- üldised mid/light vormi- ja glass-tokenid.

Selles etapis ei lisatud ega käivitatud teste. Kontroll piirdus staatiliste kontrollidega, sest kasutaja soovis testid hetkel vahele jätta.

---

## Tehtud muudatused

### 1. `modal-surfaces.css` muudeti väikeseks global entrypoint’iks

Enne oli fail 280+ rea pikkune mitme feature’i segu.

Pärast:

```css
/* Shared mobile modal surface entrypoint.
   Feature-owned modal adapters live with the route CSS. */
@import url("./modal-surfaces/form-theme.css");
```

Globaalsesse mobiilikihisse jäi ainult cross-feature vormi- ja tokenikiht:

```text
app/styles/mobile/modal-surfaces/form-theme.css
```

See sisaldab endiselt shared `mobile-keep-desktop-glass-cards` ja `theme-mid` vormisisendite reegleid, sest need puudutavad mitut auth/profile/invite voogu korraga.

---

### 2. Ühine route-imported modal shell loodi shared failina

Lisatud:

```text
app/styles/shared/mobile-modal-surfaces.css
```

See sisaldab modali ühist mobiilset geomeetriat:

- width/height/max-height;
- safe-area marginid;
- border-radius;
- border/box-shadow reset;
- overflow;
- backdrop-filter;
- modal padding;
- selected-listing eraldi background.

Fail on **shared**, aga mitte globaalne. Seda impordivad ainult route’id/komponendid, kus vastavaid modaleid kasutatakse.

---

### 3. Fullscreen page-shell reset viidi shared route-imported primitive’iks

Lisatud:

```text
app/styles/shared/mobile-fullscreen-page-shell.css
```

See hoiab koos varasema ühise reegli:

```css
.subscription-page-shell,
.materials-page-shell {
  padding: 0 !important;
}
```

See lahendus hoiab `!important` koguarvu muutumatuna. Kui reegel oleks subscriptioni ja materialsi vahel kaheks jagatud, oleks `!important` arv kasvanud ühe võrra.

---

### 4. Feature-owned modal/adapters

Lisatud failid:

```text
app/styles/features/subscription/index.css
app/styles/features/invite/modal-surfaces.css
app/styles/features/chat/help-listings-modal-surfaces.css
app/styles/features/chat/selected-listing-modal-surfaces.css
app/styles/features/materials/mobile-modal-surfaces.css
app/styles/features/framework/mobile-surfaces.css
app/styles/features/profile/account-modal.css
```

Muudetud importid:

```text
app/tellimus/page.js
app/admin/framework-acceptances/page.jsx
app/tooalase-kasutuse-raamistik/page.jsx
app/styles/components/invite-modal.css -> features/invite/mobile.css -> features/invite/modal-surfaces.css
app/styles/components/workspace-help-listings.css
app/styles/components/selected-listing.css
app/styles/features/materials/index.css
app/styles/features/profile/index.css
```

---

## Omandi uus jaotus

| CSS osa | Uus omanik |
|---|---|
| ühine modal shell | `shared/mobile-modal-surfaces.css` |
| subscription modal + page shell | `features/subscription/index.css` |
| invite modal overlay, person invite pad, scroll spacing | `features/invite/modal-surfaces.css` |
| help listings modal panel/card mobiilireeglid | `features/chat/help-listings-modal-surfaces.css` |
| selected listing modal max-width reeglid | `features/chat/selected-listing-modal-surfaces.css` |
| materials shell ja admin/upload paneelide max-width | `features/materials/mobile-modal-surfaces.css` |
| framework body/card mobiilireeglid | `features/framework/mobile-surfaces.css` |
| account settings modal scroll spacing | `features/profile/account-modal.css` |
| mid/light cross-feature vormi- ja glass-tokenid | `mobile/modal-surfaces/form-theme.css` |

---

## Mõju CSS-koormusele

Mõõdik on normaliseeritud lähte-CSS route-graafis, mitte production buildi gzip/brotli suurus.

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| globaalne CSS | 340 921 B | 335 517 B | **−5 404 B** |
| `/` | 381 732 B | 376 328 B | **−5 404 B** |
| `/documents` | 432 206 B | 426 802 B | **−5 404 B** |
| `/teenusekaart` | 665 157 B | 659 753 B | **−5 404 B** |
| `/tooheaolu` | 347 902 B | 342 498 B | **−5 404 B** |
| `/profiil` | 380 684 B | 375 632 B | **−5 052 B** |
| `/admin/framework-acceptances` | 424 783 B | 419 726 B | **−5 057 B** |
| `/tooalase-kasutuse-raamistik` | 340 921 B | 335 864 B | **−5 057 B** |
| `/materjalid` | 346 494 B | 341 802 B | **−4 692 B** |
| `/tellimus` | 340 921 B | 339 047 B | **−1 874 B** |
| `/ruum` | 370 917 B | 369 447 B | **−1 470 B** |
| `/vestlus` | 746 884 B | 747 452 B | **+568 B** |

`/vestlus` kasvab 568 B, sest see route omab nüüd ise invite/help/selected-listing modali CSS-i. See on teadlik omandiparandus. Samas ühine shell liigub shared route-imported faili, et vältida sama modal-geomeetria liigset kolmekordset dubleerimist.

---

## Staatiline kontroll

Käivitati ainult staatilised kontrollid.

```text
git apply --check: OK
CSS brace-balance errors: 0
Missing local CSS imports: 0
CSS import cycles: 0
!important count after patch 12: 1995
```

`!important` arv jäi samaks:

```text
1995 -> 1995
```

---

## Riskid

### 1. CSS-i laadimisjärjekord muutub osaliselt

Reeglid liikusid global mobile chain’ist route/component importide alla. Väärtusi ei muudetud, kuid kaskaadijärjekord võib route’is olla hilisem kui enne.

Kõige olulisem visuaalselt kontrollida:

- `/vestlus` invite modal;
- `/vestlus` help listings modal;
- `/vestlus` selected listing modal;
- `/ruum` invite modal;
- `/tellimus` subscription modal;
- `/materjalid` mobile shell;
- `/tooalase-kasutuse-raamistik` framework page;
- `/profiil` account settings modal.

### 2. `form-theme.css` on endiselt globaalne

See on teadlik kompromiss. Fail sisaldab mitut auth/profile/invite voogu puudutavaid tokeni- ja input-reegleid. Seda ei ole praegu mõistlik agressiivselt jagada enne auth-route’ide omandi ülevaatust.

### 3. Tests skipped

Teste ei lisatud ega käivitatud. Patch on kontrollitud ainult staatiliselt.

---

## Rakendamine

Rakendada pärast `sotsiaalai-css-cleanup-11.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-12.patch
git apply sotsiaalai-css-cleanup-12.patch
```

Soovituslik käsitsi visuaalkontroll:

```text
/vestlus
/ruum
/tellimus
/materjalid
/profiil
/tooalase-kasutuse-raamistik
/admin/framework-acceptances
```

---

## Järgmine soovituslik etapp

### Etapp 11e — `touch-controls.css` ja auth/register/login mobiilikihi omand

Pärast 11d on suurimad globaalse mobiilikihi kandidaadid:

```text
app/styles/mobile/foundations.css
app/styles/mobile/touch-controls.css
app/styles/mobile/modal-surfaces/form-theme.css
app/styles/features/register/mobile.css
app/styles/features/login/mobile.css
app/styles/features/login/otp-close.css
```

Järgmine mõistlik väike samm oleks võtta `touch-controls.css`, sest osa sealsetest reeglitest on invite-modal-spetsiifilised ja võiks liikuda `features/invite/` alla. See vähendaks globaalset mobiilikihti ilma suurt foundations-faili veel avamata.
