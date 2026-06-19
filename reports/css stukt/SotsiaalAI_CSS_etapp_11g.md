# SotsiaalAI CSS etapp 11g — accessibility fields ja mobile foundations puhastus

## Fookus

Etapp 11g kontrollis ja korrastas pärast patch’i 14 järgmised kihid:

- `app/styles/features/accessibility/fields.css`
- `app/styles/mobile/foundations.css`
- `app/styles/mobile/interaction-surfaces.css`
- globaalse mobiilikihi allesjäänud feature-lekked

Teste ei lisatud ega käivitatud. Tehti ainult staatiline kontroll ja rakendatav Git-patch.

---

## Muudatused

### 1. Accessibility fields kontroll

`features/accessibility/fields.css` jäi accessibility omaniku alla. Seal olev `a11y-screenprofile-option--bottom` ei ole profile feature’i leke, vaid accessibility modaali UI profile valiku klass.

Kontrollitud, et failis ei ole järgmisi feature-lekkeid:

- `register`
- `rooms`
- `invite`
- `login`
- `chat`
- `selected-listing`
- `help-listings`
- `homepage`
- `drawer-close`

Tulemus:

```text
Accessibility fields leaks: 0 []
```

### 2. Home-only mobile foundations välja globaalist

`mobile/foundations.css` sisaldas seni avalehe-spetsiifilisi dokumenti, browser chrome’i ja `homepage-root` reegleid.

Need liikusid uude faili:

```text
app/styles/features/home/mobile-foundations.css
```

Fail imporditakse nüüd ainult avalehe feature-entrypoint’is:

```css
@import url("./mobile-foundations.css");
@import url("./background.css");
@import url("./desktop.css");
@import url("./themes.css");
@import url("./mobile.css");
@import url("./home-scroll.css");
```

Liikusid muu hulgas:

- `body.homepage`
- `html[data-initial-page="home"] body.app-root`
- `html[data-initial-page="home"]`
- `.homepage-root`
- `.homepage-root::-webkit-scrollbar`
- mobiili `--card-size`

### 3. Chat drawer close sizing välja globaalist

`mobile/foundations.css` sisaldas ka chat drawer’i sulgemisnupu suuruse reegleid:

```css
.drawer-close-btn--chat.modal-close-btn
.drawer-close-btn--chat.modal-close-btn::before
```

Need liikusid õigesse omanikku:

```text
app/styles/features/chat/mobile.css
```

### 4. Interaction/touch primitive’id välja foundations-failist

`mobile/foundations.css` ei oma enam:

- `.click-pulse-cursor` mobiilis peitmist;
- primary button’i coarse/touch active-state primitive’i.

Need liikusid shared interaktsioonikihi alla:

```text
app/styles/mobile/interaction-surfaces.css
```

See ei vähenda globaalset CSS-i, kuid teeb `foundations.css` rolli selgemaks.

---

## Mõju

Mõõdikud on normaliseeritud lähte-CSS-i põhjal, mitte production gzip/brotli bundle’i põhjal.

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 322 888 B | 320 508 B | **−2380 B** |
| `/` | 365 468 B | 365 531 B | +63 B |
| `/vestlus` | 741 843 B | 739 633 B | **−2210 B** |
| `/ruum` | 360 127 B | 357 747 B | **−2380 B** |
| `/registreerimine` | 332 528 B | 330 148 B | **−2380 B** |
| `/documents` | 414 173 B | 411 793 B | **−2380 B** |
| `/tooheaolu` | 329 869 B | 327 489 B | **−2380 B** |
| `/teenusekaart` | 650 102 B | 647 892 B | **−2210 B** |
| `/profiil` | 364 772 B | 362 392 B | **−2380 B** |

Avaleht kasvas 63 B, sest ta impordib nüüd ise home-only foundations faili ja failikommentaarid on omanikufailis selgemad. Sisuline CSS liikus globaalist avalehe alla.

Chat-route’id võidavad vähem kui teised route’id, sest chat sai tagasi drawer close sizing reeglid oma feature’i alla.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Bad use client directive files: 0
!important count after patch 15: 2020
Accessibility fields leaks: 0 []
Mobile foundations former feature leaks: 0 []
```

`!important` arv ei muutunud:

```text
2020 → 2020
```

---

## Allesjäänud globaalse mobiilikihi leketest

Pärast 11g-d on `mobile/foundations.css` puhtam, kuid globaalses mobiilikihis on veel feature-nimelisi selektoreid.

Kiirkontroll:

| Fail | Allesjäänud feature-sõnad | Märkus |
|---|---|---|
| `mobile/foundations.css` | `workspace`, `wellbeing` | glass shadow suppression grupp; vajab eraldi otsust, sest samu klasse kasutatakse mitmes route’is |
| `mobile/interaction-surfaces.css` | `invite`, `account`, `login` | järgmine hea puhastuskoht |
| `mobile/scroll-panels.css` | `invite`, `workspace`, `materials`, `covision` | osaliselt compatibility/entrypoint; osa on juba välja viidud |
| `features/accessibility/fields.css` | `profile` | ei ole profile feature’i leke, vaid `a11y-screenprofile` nimetus |

---

## Riskid

- Avalehe browser chrome’i reeglid liiguvad route-imported CSS-i alla. See on arhitektuuriliselt õige, aga iPhone/PWA avaekraani visuaal tasub päris brauseris üle vaadata.
- Home CSS-i importjärjekord on route’i sees selge, kuid see ei ole enam globaalse mobiilikihi varajane osa. Kui mõni varajane render sõltus neist reeglitest enne route CSS-i laadimist, võib tekkida hetkeline FOUC. Seda saab kinnitada ainult brauseris.
- `interaction-surfaces.css` sisaldab endiselt modal/account/invite nimesid. Seda ei lahendatud 11g-s, et patch püsiks väike.

---

## Rakendamine

Rakendada pärast `sotsiaalai-css-cleanup-14.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-15.patch
git apply sotsiaalai-css-cleanup-15.patch
```

---

## Järgmine soovitus

Järgmine mõistlik etapp on **11h: `interaction-surfaces.css` puhastus**.

Seal tuleks eraldada:

- shared tap-highlight/touch-action primitive;
- glass surface primitive;
- invite modal interaction erandid;
- account/profile modal interaction erandid;
- login-specific interaction erandid.

See peaks andma veel ühe väikese globaalse CSS-i vähenemise ja eemaldama `interaction-surfaces.css` failist feature-nimelised lekked.
