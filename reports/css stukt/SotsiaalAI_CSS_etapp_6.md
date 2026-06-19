# SotsiaalAI CSS audit — etapp 6

## Fookus

Etapp 6 jätkas mobiilipäise kihi korrastamist. Eelmises etapis jäi järgmise sihina `app/styles/mobile/subpage-title-system.css`, mis oli küll shared fail, kuid sisaldas korraga mitut eri omanikku:

- shared mobiilipäise tokenid;
- workspace-family header offset’id;
- üldine title/back/info paigutus;
- title fitting ja tüpograafia;
- account settings modal’i mobiilikõrgus;
- policy route’i header offset’id;
- chat topnav title tüpograafia.

Selle etapi eesmärk oli teha esimene kontrollitud lahutus nii, et globaalne mobiilikiht jääks shared primitive’iks ning route-spetsiifilised reeglid liiguksid oma feature’i juurde.

---

## Tehtud muudatused

### 1. `subpage-title-system.css` muudeti entrypoint’iks

Endine 372-realise sisuga fail on nüüd väike agregaator:

```css
@import url("./subpage-header/tokens.css");
@import url("./subpage-header/workspace-offsets.css");
@import url("./subpage-header/layout.css");
@import url("./subpage-header/title-fit.css");
@import url("./subpage-header/account-modal.css");
```

### 2. Shared mobiilipäise failid

Lisatud failid:

| Fail | Omanik / vastutus |
|---|---|
| `mobile/subpage-header/tokens.css` | shared vaikimisi `--mobile-header-*` tokenid |
| `mobile/subpage-header/workspace-offsets.css` | workspace, workspace-feature ja wellbeing header-offset’id |
| `mobile/subpage-header/layout.css` | shared title-wrap, back-button ja info-button paigutus |
| `mobile/subpage-header/title-fit.css` | mobiili pealkirja fitting, suurused ja tekstikäitumine |
| `mobile/subpage-header/account-modal.css` | account settings modal’i mobiilikõrgus ja scrolliala |

### 3. Policy header offset’id viidi policy feature’i juurde

Lisatud:

```text
app/styles/features/policy/mobile-header.css
```

`features/policy/index.css` impordib nüüd selle faili:

```css
@import url("./mobile-header.css");
```

See tähendab, et `.policy-scroll-page-scroller` header offset’id ei ela enam globaalses mobiilipäise failis.

### 4. Chat topnav title tüpograafia viidi chat feature’i juurde

Lisatud:

```text
app/styles/features/chat/mobile-topnav.css
```

`features/chat/index.css` impordib nüüd selle faili:

```css
@import url("./mobile-topnav.css");
```

See tähendab, et `.chat-mobile-topnav .mobile-shared-topnav-title` ei laadi enam route’idel, kus chat’i ei ole.

### 5. Testid kohandati bundle’i lugema

Pärast seda, kui `subpage-title-system.css` muutus entrypoint’iks, ei tohi testid enam eeldada, et kõik reeglid asuvad otse samas failis. Uuendatud testid kasutavad `readCssBundle(...)`, kui kontrollitav reegel võib asuda imporditud omanikufailis.

Lisaks suunati chat ja policy omandit kontrollivad testid vastava feature’i bundle’i peale.

---

## Säilituskontroll

Policy ja chat blokid kopeeriti vanast failist uutesse omanikufailidesse sisuliselt 1:1.

| Kontroll | Tulemus |
|---|---:|
| Policy header blokid säilisid | jah |
| Chat topnav title blokk säilis | jah |
| Vana `subpage-title-system.css` maht | 12 483 baiti |
| Uus globaalne shared header bundle | 11 745 baiti |
| Route-owned policy header fail | 1 129 baiti |
| Route-owned chat topnav fail | 559 baiti |

---

## Mõju CSS-koormusele

Mõju on väike, aga arhitektuuriliselt oluline.

| Route’i tüüp | Mõju lähte-CSS-ile |
|---|---:|
| 34 route’i, kus pole policy ega chat feature’it | −738 baiti |
| 5 chat/service-map/chat-vertikaali route’i | −143 baiti |
| 3 policy route’i | +427 baiti |

Policy route’ide väike kasv tuleneb sellest, et policy header reeglid on nüüd eraldi omanikufailis koos kommentaari ja feature importiga. See on teadlik vahetus: policy-spetsiifiline loogika ei ole enam globaalse mobiilipäise sees.

Oluline arhitektuuriline tulemus: globaalne mobiilipäis ei sisalda enam `.policy-scroll-page-scroller` ega `.chat-mobile-topnav` reegleid.

---

## Testid

Käivitatud sihttestid:

```bash
node --test \
  tests/ui/mobileHeaderPlacement.test.js \
  tests/ui/policyScrollHeader.test.js \
  tests/ui/mobileGlassPanelShadow.test.js \
  tests/ui/chatMobileTopNavHighContrast.test.js \
  tests/ui/homePublicSubpageHeader.test.js \
  tests/ui/mobileCssOwnership.test.js
```

Tulemus:

```text
16 testi / 16 läbis
```

Lisaks:

```bash
git diff --check
```

läbis.

Patch kontrolliti puhta etapp 5 puu vastu:

```bash
git apply --check sotsiaalai-css-cleanup-06.patch
```

läbis.

---

## Märkus olemasoleva laiema testivalimi kohta

`tests/workspace/mobileBackButtonPosition.test.js` sisaldab jätkuvalt varasemast baasist pärit service-map back-icon lepingu läbikukkumist. See ei tekkinud etapp 6 muudatusest; sama läbikukkumine esines ka etapp 5 baasis. Seetõttu ei võtnud see etapp service-map back-icon lepingut ümber, vaid piirdus mobiilipäise omandi lahutamisega.

---

## Failid, mida patch muudab

### CSS

- `app/styles/mobile/subpage-title-system.css`
- `app/styles/mobile/subpage-header/tokens.css`
- `app/styles/mobile/subpage-header/workspace-offsets.css`
- `app/styles/mobile/subpage-header/layout.css`
- `app/styles/mobile/subpage-header/title-fit.css`
- `app/styles/mobile/subpage-header/account-modal.css`
- `app/styles/features/policy/mobile-header.css`
- `app/styles/features/policy/index.css`
- `app/styles/features/chat/mobile-topnav.css`
- `app/styles/features/chat/index.css`
- `app/styles/mobile/README.md`
- `app/styles/README.md`

### Testid

- `tests/ui/mobileHeaderPlacement.test.js`
- `tests/ui/policyScrollHeader.test.js`
- `tests/ui/mobileGlassPanelShadow.test.js`
- `tests/ui/chatMobileTopNavHighContrast.test.js`
- `tests/ui/homePublicSubpageHeader.test.js`
- `tests/ui/mobileCssOwnership.test.js`
- `tests/workspace/mobileBackButtonPosition.test.js`

---

## Rakendamine

Rakenda pärast patche 01–05:

```bash
git apply --check sotsiaalai-css-cleanup-06.patch
git apply sotsiaalai-css-cleanup-06.patch

node --test \
  tests/ui/mobileHeaderPlacement.test.js \
  tests/ui/policyScrollHeader.test.js \
  tests/ui/mobileGlassPanelShadow.test.js \
  tests/ui/chatMobileTopNavHighContrast.test.js \
  tests/ui/homePublicSubpageHeader.test.js \
  tests/ui/mobileCssOwnership.test.js
```

Täielikus projektis:

```bash
npm test
npm run build
```

---

## Järgmine soovitatud etapp

Järgmine mõistlik etapp on service-map mobiilipäise lepingu parandamine ja omandamine:

1. selgitada, miks `service-map-workspace__back` reeglit otsiv test loeb praegu vale bundle’i;
2. otsustada, kas service-map back/info paigutus jääb shared `subpage-header/layout.css` faili või liigub `features/service-map/mobile-header.css` faili;
3. parandada test nii, et see loeb tegelikku omanikku;
4. alles siis jätkata `service-map/desktop.css` suurema jagamisega.

Pärast seda saab liikuda `z-index`/overlay auditisse või `!important` põhjusanalüüsi juurde.
