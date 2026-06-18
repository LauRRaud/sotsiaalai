# SotsiaalAI CSS-puhastus — etapp 2

## Fookus

Teise etapi eesmärk oli vähendada globaalse mobiilikihi ulatust ilma CSS-i visuaalseid väärtusi muutmata. Puhastus puudutab Androidi feature-erandeid, koduvaate scroll-stiile ja üht valesse omanikufaili sattunud shared-reeglit.

## Tehtud muudatused

### 1. Androidi feature-CSS ei lae enam globaalselt

Varem importis `app/styles/mobile/platform-android.css` kõigil mobiilsetel route’idel:

- `features/policy/android-mobile.css`;
- `features/profile/android-mobile.css`.

Nüüd:

- policy Androidi reeglid laaditakse `features/policy/index.css` kaudu ainult policy-route’idel;
- profile Androidi reeglid laaditakse `features/profile/index.css` kaudu ainult `/profiil` ja `/vestlus` vaadetes;
- eksitav globaalne `mobile/platform-android.css` on eemaldatud.

Failis olnud ainus tegelikult mitte-Androidi reegel `.a11y-screenprofile-option--bottom` viidi õigesse omanikku: `features/accessibility/fields.css`.

### 2. `home-scroll.css` on nüüd päriselt koduvaate fail

Varem sisaldas `features/home/home-scroll.css` kolme eri omaniku koodi:

- home-vaate lugemis- ja scroll-cue reeglid;
- profile orbit stack’i reeglid;
- shared `.direct-scroll-surface` reset.

Nüüd:

- profile stack’i reeglid asuvad `features/profile/mobile.css`-is;
- `.direct-scroll-surface` asub `mobile/scroll-panels.css`-is;
- `home-scroll.css` laaditakse ainult `features/home/index.css` kaudu;
- globaalne `mobile.css` ei impordi enam `home-scroll.css`-i.

### 3. Lisatud omandilepingute testid

- tugevdatud `tests/ui/androidMobileCssOwnership.test.js`;
- lisatud `tests/ui/mobileCssOwnership.test.js`.

Testid kaitsevad edaspidi selle eest, et profile/policy Androidi CSS või home-only scroll-CSS uuesti globaalsesse mobiiliahelasse satuks.

## Mõju lähte-CSS-i sõltuvusmahule

Arvud tähistavad rekursiivselt imporditud toor-CSS-i lähtekoodi, mitte production buildi gzip/brotli võrgumahtu.

| Vaade / kiht | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne mobiilikiht | 91 547 B | 80 626 B | **−10 921 B** |
| Tavaline route (`globals.css`) | 375 020 B | 364 099 B | **−10 921 B** |
| Avaleht | 407 993 B | 397 761 B | **−10 232 B** |
| `/profiil` või `/vestlus` profile-vertikaaliga | 406 168 B | 404 140 B | **−2 028 B** |
| Policy route | 413 749 B | 403 939 B | **−9 810 B** |

Globaalsest mobiiliahelast kadus neli faili: kaks Androidi feature-faili, home scroll-fail ja tühi/misleading platform-entrypoint.

## Kontroll

### Reeglite säilimine

Puudutatud CSS-failide kõik kommentaaridest ja importidest puhastatud selector/deklaratsiooniread võrreldi multisetina:

- enne: 851 normaliseeritud rida;
- pärast: 851 normaliseeritud rida;
- erinevus: **0**.

Seega ükski CSS-deklaratsioon ei kadunud ega muutunud; muutus ainult omanik ja laadimisulatus.

### Testid

Sihttestid:

- 3/3 läbisid.

Kogu ZIP-is kaasas olnud testivalim:

- enne etappi 2: 150 testi, 112 läbis, 38 kukkus läbi;
- pärast etappi 2: 152 testi, 114 läbis, 38 kukkus läbi.

Kõik 38 läbikukkumist olid täpselt samad kui enne etappi 2. Uusi regressioone testivalimis ei tekkinud.

Patch läbib `git apply --check` kontrolli.

## Visuaalne kontroll päris projektis

Pärast patch’i rakendamist tuleb kontrollida vähemalt:

1. Android `/profiil`: orbit avatud ja suletud, logout-nupp, stack-list.
2. Android `/vestlus`: JourneyDashboardi orbit/empty state.
3. Android policy-lehed: `/kasutustingimused`, `/privaatsustingimused`, `/kasutusjuhend`.
4. iPhone/PWA avaleht: scroll-cue animatsioon ja about-tekst.
5. Mobiili shared direct-scroll lehed: `/autorilt`, `/hinnastus`, `/voimalused`, `/tooalase-kasutuse-raamistik`.

## Järgmine siht

Suurim allesjäänud omandiprobleem globaalses mobiilikihis on `features/home/background.css` (9 828 B). Faili sisu ei ole tegelikult ühe omaniku oma:

| Sisu | Ligikaudne maht | Õige omanik |
|---|---:|---|
| BackgroundLayer ja mobile bends/particles | 4 441 B | `mobile/background-layer.css` |
| Päriselt home-only reeglid | 3 259 B | `features/home/background.css` |
| Shared touch/surface/layout resetid | 2 042 B | `mobile/touch-controls.css`, `foundations.css` või `panel-surfaces.css` |

Järgmises etapis tuleks see fail esmalt täpselt kolmeks omandiks jagada ning alles seejärel home-only osa globaalsest ahelast eemaldada. See on tundlikum kui etapp 2, sest fail mõjutab PWA tausta, glass-pindu ja avalehe kaarte.
