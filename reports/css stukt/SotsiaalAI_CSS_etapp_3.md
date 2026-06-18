# SotsiaalAI CSS-i korrastamine — etapp 3

## Eesmärk

Jagada `app/styles/features/home/background.css` omanike järgi väiksemateks failideks nii, et:

- vana globaalse mobiilikaskaadi järjekord ei muutuks;
- ükski CSS-deklaratsioon ei kaoks ega muutuks;
- BackgroundLayeri, avalehe kaartide, shared mobiilipindade ja ringteksti reeglid oleksid eristatavad;
- olemasolevad lähtekoodipõhised testid ei sõltuks enam sellest, et kogu CSS asub ühes monoliitfailis.

## Algseis

`app/styles/features/home/background.css`:

- 397 rida;
- 9 828 baiti;
- sisaldas korraga BackgroundLayeri runtime-reegleid;
- avalehe tausta ja brauseri chrome'i reegleid;
- globaalseid touch- ja glass-reegleid;
- avalehe kaartide pööramist ja animatsioone;
- üldist mobiilipaigutust;
- ringteksti mobiilireegleid.

Faili nimi viitas avalehele, kuid märkimisväärne osa sellest mõjutas kõiki mobiiliroute'e.

## Uus struktuur

### Compatibility entrypoint

`app/styles/features/home/background.css`

- nüüd 8 rida ja 410 baiti;
- sisaldab ainult omanike importimist;
- säilitab vana faili täpse asukoha globaalses mobiilikaskaadis;
- väldib selles etapis Next.js CSS-entrypoint'ide järjestuse muutmise riski.

Importide järjekord:

1. `app/styles/mobile/background-layer.css`
2. `app/styles/features/home/background-mobile.css`
3. `app/styles/mobile/interaction-surfaces.css`
4. `app/styles/features/home/cards-mobile.css`
5. `app/styles/mobile/content-surfaces.css`
6. `app/styles/features/home/circular-text-mobile.css`

### `mobile/background-layer.css`

- 49 rida;
- BackgroundLayeri reveal-transition'id;
- mobiili bends/particles valmisolek;
- subpage'i taustakihi üleminekud;
- BackgroundLayeri runtime-leping.

### `features/home/background-mobile.css`

- 132 rida;
- ainult avalehe taustageomeetria;
- `--home-browser-base-bg` teemade kaupa;
- avalehe browser chrome'i `:has(...)` reeglid;
- avalehe background-space'i mõõdud;
- about-paneeli mobiilne renderdamisstabiilsus.

### `mobile/interaction-surfaces.css`

- 86 rida;
- üldine touch-highlight'i eemaldamine;
- mobiili glass-shadow'de vähendamine;
- glass-hole maski kihistus;
- `html`, `body`, `main#main`, `.main-content` ja `.side` mobiilne baasgeomeetria.

### `features/home/cards-mobile.css`

- 106 rida;
- avalehe kaartide mobiilne flip-state;
- pointer-events esi- ja tagakülgedel;
- float-animation;
- reduced-motion käitumine;
- hero paigutus;
- kaartide mobiilne kontrast.

### `mobile/content-surfaces.css`

- 13 rida;
- mobiilse `.glass-box` laiuse ja padding'u lõppreegel;
- BackgroundLayeri hit-testing'u `pointer-events: none`.

### `features/home/circular-text-mobile.css`

- 19 rida;
- avalehe ringteksti mobiilne suurus;
- sõnade animatsioonide peatamine;
- ringi nähtavus.

## Testide parandused

### Uus test

Lisatud `tests/ui/homeBackgroundCssOwnership.test.js`.

Test kontrollib:

1. compatibility entrypoint'i importide täpset järjekorda;
2. et agregaatoris ei ole enam oma CSS-reegleid;
3. et BackgroundLayeri reeglid ei sisalda kaardi- või glass-reegleid;
4. et home-background ei sisalda kaardi- või shared glass-reegleid;
5. et shared interaction-fail ei sisalda avalehe kaarte;
6. et kaartide fail ei sisalda BackgroundLayeri reegleid;
7. et rekursiivselt lahendatud bundle sisaldab kõiki kaitstud lepinguid.

Tulemus: **3/3 testi läbisid**.

### Olemasolevate testide kohandamine

`homePwaSafeArea.test.js` loeb nüüd `background.css` entrypoint'i rekursiivselt `readCssBundle(...)` kaudu. Seega test ei eelda enam, et reegel asub füüsiliselt agregaatorfailis.

`monoThemeContracts.test.js` kontrollib legacy forest-tokenite puudumist nüüd kõigis kuues omaniku failis, mitte tühjaks muutunud compatibility entrypoint'is.

## Deklaratsioonide terviklikkuse kontroll

Algne monoliit ja kuue omaniku faili sisu võrreldi pärast kommentaaride ja whitespace'i eemaldamist.

- algne normaliseeritud pikkus: 7 718 märki;
- uus normaliseeritud pikkus: 7 718 märki;
- erinevus: 0;
- tulemus: **täpne vaste**.

See tähendab, et selles etapis ei muudetud ühtegi CSS-deklaratsiooni ega selektorit.

## Testitulemus

### Uued etapi testid

- läbis: 3;
- ebaõnnestus: 0.

### Laiem koduvaate testivalim

Patch 02 lähteolekus:

- läbis: 8;
- ebaõnnestus: 3.

Patch 03 järel:

- varasemad testid läbisid: 8;
- uued testid läbisid: 3;
- kokku läbis: 11;
- ebaõnnestus: samad varasemad 3.

Olemasolevad läbikukkumised tulenevad ZIP-i puuduvatest `messages/en.json` ja `tests/helpers/mobileCssBundle.mjs` failidest ning ühest juba lähteolekus ebaõnnestunud home-card shadow lepingust. Patch 03 ei lisanud uusi läbikukkumisi.

## Mõju CSS-i laadimismahule

Selles etapis CSS-i route-koormust teadlikult ei vähendatud.

Põhjus: `background.css` jäeti compatibility entrypoint'ina samasse globaalsesse mobiilikaskaadi asukohta. Esmalt eraldati omanikud ja lisati lepingutestid. Home-only failide route'i juurde tõstmine on nüüd järgmises etapis oluliselt väiksema riskiga.

## Riskitase

**Madal.**

- deklaratsioonid on täpselt samad;
- deklaratsioonide järjekord on sama;
- vana entrypoint ja selle impordipositsioon säilisid;
- uus test kaitseb omanike järjestust;
- patch läbis `git apply --check` kontrolli.

## Rakendamine

Patch 03 eeldab, et patch'id 01 ja 02 on juba rakendatud.

```bash
git apply --check sotsiaalai-css-cleanup-03.patch
git apply sotsiaalai-css-cleanup-03.patch
node --test tests/ui/homeBackgroundCssOwnership.test.js
```

## Järgmine etapp

Etapp 4 peaks tegema route-põhise lahutamise:

1. hoida globaalses mobiilikihis ainult:
   - `mobile/background-layer.css`;
   - `mobile/interaction-surfaces.css`;
   - `mobile/content-surfaces.css`;
2. laadida ainult avalehe route'il:
   - `features/home/background-mobile.css`;
   - `features/home/cards-mobile.css`;
   - `features/home/circular-text-mobile.css`;
3. kontrollida Next.js-i genereeritud CSS-järjekorda;
4. teha desktopi ja mobiili visuaalne regressioonivõrdlus;
5. mõõta tegelik globaalse mobiili-CSS-i vähenemine.

