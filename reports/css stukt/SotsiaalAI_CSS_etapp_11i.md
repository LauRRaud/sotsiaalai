# SotsiaalAI CSS etapp 11i — `modal-surfaces/form-theme.css` puhastus

## Eesmärk

Etapi 11i eesmärk oli võtta ette `app/styles/mobile/modal-surfaces/form-theme.css`, kuid mitte lõhkuda selle päriselt shared-rolli.

Failis oli kaks erinevat vastutust:

1. üleprojektilised `mobile-keep-desktop-glass-cards` tone-tokenid;
2. konkreetsete vormide mid-theme input/select/textarea reeglid.

Esimene osa jäi globaalsesse mobiilikihti, sest `mobile-keep-desktop-glass-cards` on kasutusel paljudes eri vaadetes. Teine osa liikus route/feature omanike juurde.

Teste ei lisatud ega käivitatud, vastavalt otsusele testitaristu laiendamine praegu vahele jätta.

---

## Muudatused

### Globaalsesse faili jäi alles

`app/styles/mobile/modal-surfaces/form-theme.css`

- `:root.theme-light:not(.theme-mid) .mobile-keep-desktop-glass-cards`
- `:root.theme-mid .mobile-keep-desktop-glass-cards`

See on endiselt shared tone-token kiht.

### Globaalsest failist viidi välja

Varem globaalses failis olnud mid-theme form field reeglid selectoritele:

- `.invite-modal-content`
- `.person-invite-modal-content`
- `.update-pin-content`
- `.update-email-content`
- `.reset-password-content`
- `.register-content`

Need ei kuulu enam globaalse mobiilikihi alla.

### Uued omanikufailid

| Fail | Omanik | Selectorid |
|---|---|---|
| `features/invite/form-theme.css` | invite modal | `.invite-modal-content`, `.person-invite-modal-content` |
| `features/register/form-theme.css` | registreerimise route | `.register-content` |
| `features/auth-forms/form-theme.css` | parooli/PIN/e-posti vormid | `.update-pin-content`, `.update-email-content`, `.reset-password-content` |

### Uued importid

- `features/invite/mobile.css` impordib `./form-theme.css`;
- `features/register/index.css` impordib `./form-theme.css`;
- `features/login/index.css` impordib `../auth-forms/form-theme.css`;
- `/taasta-parool` impordib `features/auth-forms/form-theme.css`;
- `/taasta-parool/[token]` impordib `features/auth-forms/form-theme.css`.

Reset-parooli route’id vajasid eraldi importi, sest need ei kasutanud varem `features/login/index.css` entrypoint’i, kuid sõltusid globaalsest `reset-password-content` form-theme reeglist.

---

## Mõju route’i lähte-CSS-i järgi

Mõõdik on normaliseeritud lähte-CSS, mitte production gzip/brotli bundle.

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 320392 B | 318721 B | -1671 B |
| `/` | 365415 B | 365346 B | -69 B |
| `/vestlus` | 739516 B | 741002 B | +1486 B |
| `/ruum` | 357631 B | 357515 B | -116 B |
| `/registreerimine` | 330032 B | 329827 B | -205 B |
| `/taasta-parool` | 320392 B | 320278 B | -114 B |
| `/taasta-parool/[token]` | 320392 B | 320278 B | -114 B |
| `/uuenda-epost` | 322161 B | 322092 B | -69 B |
| `/uuenda-pin` | 322161 B | 322092 B | -69 B |
| `/join` | 322161 B | 322092 B | -69 B |
| `/tellimus` | 325691 B | 325622 B | -69 B |
| `/profiil` | 362276 B | 362207 B | -69 B |
| `/documents` | 411677 B | 410006 B | -1671 B |
| `/tooheaolu` | 327373 B | 325702 B | -1671 B |
| `/teenusekaart` | 647775 B | 646104 B | -1671 B |


Peamine tulemus:

- globaalne CSS vähenes **−1671 B**;
- mitte-auth ja mitte-invite route’id võitsid sama palju;
- `/vestlus` kasvas **+1486 B**, sest see route omab nüüd ise invite/auth form-theme reegleid;
- reset-parooli route’id säilitasid vajaliku field-tone CSS-i route-importidena.

---

## `!important` mõju

`!important` arv kasvas:

```text
2020 → 2022
```

Põhjus: üks globaalne `opacity: 1 !important` reegel oli varem ühe koondselectorina. Pärast feature-omandisse jagamist on sama deklaratsioon kolmes omaniku failis.

See on teadlik kompromiss, sest etapp 12 ehk `!important` inventuur jäeti praegu vahele. Käitumise mõttes on risk piiratud vormiväljade mid-theme toonile.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Bad use client directive files: 0
!important count after patch 17: 2022
Global form-theme feature/form leaks: 0 []
Expected route-owned form-theme files missing: 0 []
```

---

## Riskid

### 1. `/vestlus` kasvab

`/vestlus` kasvab, sest see kasutab nii login/auth CSS-i kui invite modalit. See on omandiparandus, mitte globaalne regressioon.

### 2. Field-tone reeglite importjärjekord muutus

Reeglid ei laadi enam globaalse mobiilikihi sees, vaid feature’i entrypoint’i kaudu. Kui mõni route kasutab vastavaid klasse ilma uue entrypoint’ita, võib mid-theme vormiväli visuaalselt muutuda.

Kontrollitud kate:

- invite → `features/invite/mobile.css`;
- register → `features/register/index.css`;
- update PIN/email → `features/login/index.css`;
- reset password → reset route’i otseimport.

### 3. `!important` kasvas kahe võrra

See tuleks hiljem tokeni/field primitive’i refaktoris tagasi võtta, kuid praeguses omandipuhastuse faasis ei ole see blokker.

---

## Otsus

Etapp 11i on sobiv jätk 11h järel.

Patch ei muuda shared card tone tokeneid. See eemaldab globaalsest `form-theme.css` failist ainult konkreetsete vormide selectorid ja viib need route/feature omanike juurde.

---

## Rakendamine

Rakendada pärast `sotsiaalai-css-cleanup-16.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-17.patch
git apply sotsiaalai-css-cleanup-17.patch
```

---

## Järgmine võimalik etapp

Pärast 11i võiks jätkata kahe suunaga:

1. **11j — `mobile-keep-desktop-glass-cards` kasutuskaart**: otsustada, kas osa tokenitest saab viia shared primitive’i asemel konkreetsete route’ide alla.
2. **11j alternatiiv — globaalse mobiilikihi koondkontroll**: võtta kogu `mobile.css` importgraaf ja vaadata, millised feature-nimed on veel globaalses kihis alles.

Praegu soovitan pigem teist varianti: **11j globaalse mobiilikihi jääkide kontroll**, sest 11a–11i on juba palju väikseid lekkeid eemaldanud ja nüüd on vaja uus koondpilt.
