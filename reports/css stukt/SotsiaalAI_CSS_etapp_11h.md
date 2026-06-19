# SotsiaalAI CSS — etapp 11h

## Fookus

Etapp 11h puhastab `app/styles/mobile/interaction-surfaces.css` faili.

Eelmiste 11.x etappide järel oli globaalne mobiilikiht juba oluliselt väiksem, kuid `interaction-surfaces.css` sisaldas veel feature-nimelisi selektoreid:

- `invite`;
- `person-invite`;
- `account-settings`;
- `login-modal`.

Selle etapi eesmärk oli jätta sinna ainult shared interaction primitive’id ja eemaldada invite/account/login nimelised lekked ilma route-importide lisamiseta.

Teste ei lisatud ega käivitatud, vastavalt kokkuleppele. Tehti ainult staatiline kontroll.

---

## Tehtud muudatused

### 1. `interaction-surfaces.css` muudeti feature-neutral failiks

Failis oli varem selline shared shadow/tone reset:

```css
.glass-ring,
.mobile-keep-desktop-glass-cards,
.invite-modal-content,
.person-invite-modal-content,
.account-settings-modal-content {
  ...
}
```

Uus kuju:

```css
.glass-ring,
.mobile-keep-desktop-glass-cards {
  ...
}
```

Põhjendus: nii invite-modal kui ka account-settings modal kasutavad juba `mobile-keep-desktop-glass-cards` klassi. Seega oli feature-spetsiifiliste klasside lisamine samasse globaalplokki üleliigne ja rikkus omandireeglit.

### 2. Redundantne login-selector eemaldati

Eemaldatud selectoriosa:

```css
:not(.login-modal-close)
```

Sama selector sisaldas juba:

```css
:not(.modal-close-btn)
```

`LoginModal.jsx` järgi on login close nupp kujul:

```jsx
className="login-modal-close modal-close-btn ..."
```

Seega oli `:not(.login-modal-close)` selles globaalfailis redundantne ja tekitas login-spetsiifilise lekke.

### 3. README reeglid täiendatud

Täiendatud failid:

- `app/styles/mobile/README.md`;
- `app/styles/README.md`.

Lisatud reegel: `mobile/interaction-surfaces.css` peab jääma feature-neutral failiks ning invite/account/login modal selectorid ei tohi sinna tagasi tulla.

---

## Mõju

| Ala | Muutus |
|---|---:|
| Globaalne CSS | -116 B |
| `/` | -116 B |
| `/vestlus` | -116 B |
| `/ruum` | -116 B |
| `/profiil` | -116 B |
| `/documents` | -116 B |
| `/teenusekaart` | -116 B |
| `/registreerimine` | -116 B |
| `/tooheaolu` | -116 B |

See on väike mahupuhastus, kuid hea omandiparandus. Kõik peamised route’id vähenevad sama palju, sest muutus asub globaalses mobiiliahelas.

---

## Oluline käitumise hinnang

See patch ei lisa uusi feature-import’e ja ei tõsta reegleid route’ide juurde.

Risk on madal, sest eemaldatud feature-selectorid olid kaetud sama ploki shared selectoriga `mobile-keep-desktop-glass-cards`, mida vastavad komponendid juba kasutavad.

Kontrollitud JSX kasutus:

- `InviteModal.jsx` kasutab `mobile-keep-desktop-glass-cards`;
- `ProfiilBody.jsx` account settings modal kasutab `mobile-keep-desktop-glass-cards`;
- `LoginModal.jsx` close nupp kasutab nii `login-modal-close` kui ka `modal-close-btn`.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Bad use client directive files: 0
!important count after patch 16: 2020
Interaction surfaces feature leaks: 0 []
```

Lisaks kontrollitud:

```text
interaction-surfaces.css enne: invite, person-invite, account-settings, login-modal
interaction-surfaces.css pärast: feature-lekkeid 0
```

---

## Failimuudatused

```text
app/styles/mobile/interaction-surfaces.css
app/styles/mobile/README.md
app/styles/README.md
```

Diffi maht:

```text
3 files changed, 4 insertions(+), 5 deletions(-)
```

---

## Rakendamine

Rakenda pärast `sotsiaalai-css-cleanup-15.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-16.patch
git apply sotsiaalai-css-cleanup-16.patch
```

---

## Järgmine soovitus

Järgmine mõistlik etapp on **11i: `modal-surfaces/form-theme.css` puhastus**.

Seal on veel rist-feature form tokenite plokk, mis sisaldab korraga:

- invite modalit;
- person invite modalit;
- update pin/email vorme;
- reset password vormi;
- register vormi.

Seda ei tohiks agressiivselt eemaldada, sest fail on sihilikult cross-feature token layer. Järgmine etapp peaks pigem jagama selle kaheks:

1. shared form-tone primitive;
2. auth/register/invite feature-adapterid.
