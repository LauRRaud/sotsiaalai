# SotsiaalAI CSS-i korrastamine — etapp 4

## Eesmärk

Eraldada avalehe mobiilne taust, kaardid ja ringtekst globaalsest mobiili-CSS-ist nii, et:

- kõigil teistel route'idel ei laaditaks avalehe kujundust;
- shared BackgroundLayeri ja mobiilipindade reeglid jääksid globaalseks;
- avalehe CSS-i reeglid ja deklaratsioonid säiliksid;
- eelmises etapis loodud omaniku failid oleksid iseseisvalt parsitavad;
- omandipiiri kaitseks oleksid automaatsed testid.

## Oluline parandus etapi 3 järel

Etapi 3 tekstiline terviklikkuse võrdlus kinnitas, et kõik deklaratsioonid olid omaniku failidesse üle viidud, kuid see ei tuvastanud üht CSS-i süntaksiprobleemi: osa `@media (max-width: 768px)` plokke oli lõigatud kahe faili vahele.

CSS `@import` ei ühenda faile enne parsimist üheks tekstifailiks. Iga imporditud fail peab olema eraldi korrektne stylesheet. Seetõttu parandab etapp 4 järgmised piirid:

- `mobile/background-layer.css` saab puuduva media query sulgemise;
- `features/home/background-mobile.css` saab oma media query avamise;
- `mobile/interaction-surfaces.css` saab puuduva media query sulgemise;
- `features/home/cards-mobile.css` saab oma media query avamise.

Lisatud test kontrollib nüüd iga omaniku faili brace-balance'i eraldi. Kõik kuus faili parsiti lisaks `tinycss2` abil: süntaksivigu 0.

## Uus laadimispiir

### Globaalsesse mobiilikihti jäävad

`app/styles/mobile.css` impordib nüüd otse:

1. `mobile/background-layer.css`;
2. `mobile/interaction-surfaces.css`;
3. `mobile/content-surfaces.css`.

Need reeglid on shared:

- BackgroundLayeri reveal ja subpage transition;
- üldine touch-feedback;
- glass-hole kihistus;
- mobiili baaspaigutus;
- `.glass-box` laius;
- background-layer hit-testing.

### Ainult avalehe route'il laaditakse

`app/styles/features/home/background.css` on nüüd avalehe route-owned entrypoint ja impordib:

1. `background-mobile.css`;
2. `cards-mobile.css`;
3. `circular-text-mobile.css`.

`app/styles/features/home/index.css` impordib selle enne `desktop.css`, `themes.css`, `mobile.css` ja `home-scroll.css` faile.

Avalehe omandisse kuuluvad:

- `[data-page="home"]` taustageomeetria;
- `--home-browser-base-bg` definitsioonid;
- about-paneeli renderdamisstabiilsus;
- kaartide flip-state ja mobiilianimatsioon;
- hero asetus;
- kaartide mobiilikontrast;
- ringteksti mobiilitüpograafia.

## CSS-reeglite terviklikkuse kontroll

Algset etapp 2 monoliitfaili võrreldi kõigi kuue uue omaniku failiga CSS-i struktuuri tasandil.

- algses failis: 60 leaf-rule'i;
- uutes omaniku failides: 60 leaf-rule'i;
- puuduvaid reegleid: 0;
- uusi reegleid: 0;
- muutunud selektoreid või deklaratsioone: 0.

Võrdlus arvestas media query konteksti, selektorit, property väärtust ja `!important` olekut.

## Mõju route'ide CSS-koormusele

Tegemist on lähtekoodi importgraafi mõõduga, mitte minifitseeritud või Brotli-pakitud produktsioonibundle'i mõõduga.

### Globaalne ulatus

| Näitaja | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Kõigile 42 route'ile ulatuvad CSS-failid | 52 | 48 | −4 faili |
| Globaalse ulatuse lähte-CSS | 388 727 B | 381 631 B | **−7 096 B** |

Globaalse lähte-CSS vähenemine on ligikaudu **1,83%**.

### Route'ide mõju

- kõik 41 mitte-avalehe route'i: **−7 096 B**;
- `/vestlus`: 947 570 B → 940 474 B;
- `/teenusekaart`: 712 994 B → 705 898 B;
- `/dokreziim`: 604 025 B → 596 929 B;
- avaleht `/`: +53 B lähtekoodi, sest lisati iseseisvate media query'de piirid ja route-entry import; avalehe funktsionaalne CSS jäi alles.

## Testid

### Etapi omanditestid

`tests/ui/homeBackgroundCssOwnership.test.js` kontrollib nüüd:

1. globaalses mobiiliahelas on ainult shared omanikud;
2. avalehe entrypoint laaditakse ainult home feature'i kaudu;
3. home entrypoint ei impordi shared mobiilifaile;
4. kõik kuus omaniku faili on iseseisvalt tasakaalus;
5. reeglid asuvad õige omaniku failis;
6. globaalne bundle ei sisalda avalehe kaardi- ega ringtekstireegleid;
7. avalehe bundle sisaldab kõiki home-lepinguid.

Tulemus: **5/5 läbis**.

### Laiem koduvaate testivalim

Etapp 3 lähteolek:

- läbis 8;
- ebaõnnestus 4.

Etapp 4 järel:

- läbis 8;
- ebaõnnestus samad 4.

Olemasolevad läbikukkumised:

- ZIP-ist puudub `messages/en.json`;
- ZIP-ist puudub `tests/helpers/mobileCssBundle.mjs`;
- üks home-card shadow leping oli juba lähteolekus katki.

Etapp 4 ei lisanud laiemasse valimisse uut regressiooni.

## Muudetud failid

- `app/styles/mobile.css`;
- `app/styles/features/home/index.css`;
- `app/styles/features/home/background.css`;
- `app/styles/mobile/background-layer.css`;
- `app/styles/mobile/interaction-surfaces.css`;
- `app/styles/features/home/background-mobile.css`;
- `app/styles/features/home/cards-mobile.css`;
- `app/styles/README.md`;
- `app/styles/mobile/README.md`;
- `tests/ui/homeBackgroundCssOwnership.test.js`;
- `tests/ui/homePwaSafeArea.test.js`.

## Riskitase

**Madal kuni mõõdukas.**

Madal, sest:

- 60 CSS-reegli struktuurne kogum jäi täpselt samaks;
- shared ja home selektorite vahel ei leitud hilisemas globaalses mobiiliahelas otseseid konflikte;
- route'i omand on testidega kaitstud;
- patch läbis `git apply --check`;
- targeted testid läbisid 5/5.

Mõõdukas, sest Next.js võib produktsioonis route CSS chunk'ide järjestust optimeerida. ZIP ei sisalda käivitatavat sõltuvuste komplekti ega brauseri visuaalset baseline'i, mistõttu päris desktop/iPhone/Android kuvatõmmiste regressioonivõrdlus tuleb teha täielikus projektis.

## Rakendamine

Patch 04 eeldab, et patch'id 01–03 on juba rakendatud.

```bash
git apply --check sotsiaalai-css-cleanup-04.patch
git apply sotsiaalai-css-cleanup-04.patch
node --test tests/ui/homeBackgroundCssOwnership.test.js
```

Täielikus projektis tuleks seejärel käivitada:

```bash
npm test
npm run build
```

ning kontrollida vähemalt:

- avaleht 375 × 812;
- avaleht iPhone PWA standalone-režiimis;
- avaleht Android Chrome'is;
- light, night, mono ja HC teemad;
- kaartide esi- ja tagakülg;
- about-paneel;
- tausta safe-area alumine serv.

## Järgmine etapp

Etapp 5 peaks auditeerima ülejäänud globaalse mobiilikihi:

1. `mobile/panel-surfaces.css`;
2. `mobile/scroll-panels.css`;
3. `mobile/subpage-title-system.css`;
4. shared ja feature-spetsiifiliste selektorite eraldamine;
5. safe-area, `100dvh`/`100lvh` ja fixed/sticky konfliktide kaart;
6. järgmine route-põhine CSS-i vähendamise patch.
