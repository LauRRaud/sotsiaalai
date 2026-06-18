# SotsiaalAI CSS-i korrastamise tervikplaan

## Eesmärk

SotsiaalAI kujunduskihi korrastamise eesmärk ei ole ainult kasutamata CSS-i eemaldamine, vaid selge ja hooldatava süsteemi loomine, kus:

- igal komponendil ja vaatel on selge stiiliomanik;
- globaalsesse CSS-i jääb ainult päriselt globaalne kiht;
- route’id ei lae teiste funktsioonide CSS-i;
- mobiili-, teema- ja ligipääsetavuse reeglid ei võitle põhistiilidega;
- `!important` ei asenda korrektset arhitektuuri;
- muudatusi saab kontrollida automaatsete regressioonitestidega;
- CSS-i maht ja keerukus ei hakka pärast puhastust uuesti kasvama.

---

## 1. CSS-i omandikaart

Koostada iga suurema vaate ja komponendi kohta kaart, mis näitab kõiki seda mõjutavaid CSS-faile.

Näide:

```text
WorkspacePanel
├── WorkspacePanel.module.css
├── workspace-help-listings.css
├── mobile/scroll-panels.css
├── mobile/panel-surfaces.css
├── shared/workspace-guide.css
├── theme/hc.css
└── chat/themes.css
```

### Analüüsitavad küsimused

- Milline fail peaks olema komponendi põhistiilide omanik?
- Millised failid teevad ainult override’e?
- Millised reeglid kuuluvad mobiili-, teema- või ligipääsetavuse kihti?
- Kas sama elementi kontrollib korraga liiga palju faile?
- Millised feature’id muudavad teiste feature’ite sisemisi klasse?

### Tulemus

- komponentide ja vaadete CSS-omand on dokumenteeritud;
- iga klassi või reegli jaoks on määratud sobiv omanik;
- ristmõjud ja kõrge riskiga alad on nähtavad enne refaktorit.

---

## 2. Täpne kustutamisraport

Jagada eemaldamiskandidaadid riskitaseme järgi.

### Kindlasti eemaldatavad

- tühjad CSS-failid;
- importimata compatibility-failid;
- klassid, millele JSX/TSX-is viiteid ei ole;
- täielikult dubleeritud deklaratsioonid;
- aegunud kommentaarid ja wrapper-failid.

### Tõenäoliselt eemaldatavad

- vanad fallback-klassid;
- ainult testides esinevad selektorid;
- klassid, mida võib moodustada dünaamiliselt;
- teise faili ümbertõstmise järel üleliigseks muutunud reeglid.

### Mitte eemaldada ilma kontrollita

- `composes from` kaudu kasutatavad CSS Module’i klassid;
- dünaamiliselt konstrueeritavad klassinimed;
- kolmanda osapoole teekide klassid;
- HTML-i või serveri poolt genereeritud klassid;
- runtime-teemade ja olekute selektorid.

### Soovitud raporti vorm

| Objekt | Otsus | Tõendus | Risk | Tegevus |
|---|---|---|---|---|
| `documents-mode.css` | eemalda või muuda testibundle’iks | sisuline CSS puudub | madal | patch |
| `chat-focus.css` | kontrolli compatibility-rolli | aktiivset otsest importi pole | madal | patch |
| dünaamiline klass | säilita | runtime lookup | kõrge | dokumenteeri |

---

## 3. Importgraaf ja route’ide CSS-koormus

Kaardistada iga route’i tegelik CSS-ahel.

### Kontrollida

- mida impordib `globals.css`;
- millised feature-stiilid laaditakse kõigil lehtedel;
- millised mobiilifailid jõuavad route’idele, kus neid ei kasutata;
- millised agregaatorfailid põhjustavad suuri impordiahelaid;
- millised route’id on CSS-mahu poolest kõige raskemad;
- kas sama fail jõuab bundle’isse mitme imporditee kaudu.

Näide:

```text
/vestlus
  globals.css
  ├── mobile.css
  │   ├── home/background.css
  │   ├── invite/mobile.css
  │   ├── profile/android-mobile.css
  │   └── policy/android-mobile.css
  ├── theme/hc.css
  └── shared/ui-glow.css
```

### Eesmärk

- feature CSS imporditakse feature’i või route’i juures;
- globaalne kiht jääb võimalikult väikeseks;
- mobiili- ja teema-CSS ei too kaasa kõrvaliste funktsioonide koodi;
- CSS-koormus on route’ide kaupa mõõdetav.

---

## 4. `!important`-ide põhjusanalüüs

Kõik `!important`-id tuleb liigitada, mitte lihtsalt eemaldada.

### Kategooriad

1. Ligipääsetavuse jaoks vajalikud override’id.
2. Kolmanda osapoole teegi override’id.
3. Impordijärjekorra parandused.
4. Liiga madala spetsiifilisuse kompensatsioon.
5. Inline-stiili vastu võitlevad reeglid.
6. Mobiili lõplikud override’id.
7. Teema- või platvormierandid.
8. Tegelikult ebavajalikud `!important`-id.

### Töövõte

- eemaldada kohe ainult madala riskiga markerid;
- ülejäänud puhul parandada kõigepealt CSS-i omandit ja spetsiifilisust;
- uusi `!important`-e lubada ainult põhjendava kommentaariga;
- jälgida CI-s, et nende koguarv ei suureneks.

---

## 5. Teemade täielik audit

Analüüsida kõik kuvarežiimid:

- light;
- mid;
- dark/night;
- mono;
- high contrast;
- reduced transparency;
- reduced motion.

### Kontrollida

- millised teemafailid muudavad ainult väärtusi;
- millised teemafailid kirjutavad ümber terveid komponente;
- kus korduvad samad mono- või HC-reeglid;
- millised värvid, varjud, border’id ja blur’id on hardcoded;
- millised teematokenid puuduvad.

### Soovitud mudel

```css
:root {
  --surface-page: ...;
  --surface-panel: ...;
  --surface-elevated: ...;
  --surface-glass: ...;

  --text-primary: ...;
  --text-secondary: ...;
  --border-subtle: ...;

  --glow-primary: ...;
  --glow-opacity: ...;
  --glass-blur: ...;
}
```

Komponendid kasutavad tokeneid, teema muudab nende väärtusi.

---

## 6. Disainitokenite audit

Koguda kõigist CSS-failidest välja:

- värvid;
- gradient’id;
- blur-väärtused;
- varjud;
- `border-radius`-ed;
- spacing-väärtused;
- `z-index`-id;
- breakpoint’id;
- fondisuurused;
- rea kõrgused;
- opacity’d;
- animatsioonide kestused;
- paneelide mõõdud.

### Analüüsi eesmärk

- leida peaaegu identsed väärtused;
- eristada teadlikud variandid juhuslikest;
- vähendada käsitsi kirjutatud väärtuste hulka;
- luua SotsiaalAI ametlik tokenisüsteem;
- vältida visuaalse keele killustumist.

---

## 7. Breakpoint’ide ja mobiilireeglite audit

Mobiilikiht tuleb käsitleda eraldi arhitektuurina.

### Kontrollida

- kõik `min-width` ja `max-width` väärtused;
- kattuvad media query’d;
- samade komponentide korduvad mobiilireeglid;
- `100vh`, `100dvh`, `100svh` ja `100lvh` kasutus;
- safe-area käsitlemine;
- PWA standalone-režiim;
- iOS-i ja Androidi platvormierandid;
- landscape-vaade;
- sticky/fixed elementide konfliktid;
- scroll container’ite omand;
- alumiste navigeerimisribade ja overlay’de käitumine.

### Eraldi kontroll

- iPhone PWA alumine must või poolläbipaistev ala;
- `env(safe-area-inset-bottom)` kasutus;
- viewport’i muutumine brauseririba ilmumisel;
- background-layer’i ja fixed-elementide kõrgused;
- body/html overflow’i mõju.

---

## 8. `z-index`, overlay ja stacking context audit

Koguda kokku:

- kõik `z-index` väärtused;
- `transform`;
- `filter`;
- `backdrop-filter`;
- `opacity`;
- `isolation`;
- `contain`;
- `position: fixed/sticky`;
- `pointer-events`.

### Eesmärk

- leida ootamatud stacking context’id;
- vältida overlay’de sattumist paneelide taha;
- leida nähtamatud kihid, mis püüavad klikke;
- ühtlustada modaalide, dropdown’ide, toast’ide ja orbital menu kiht.

### Soovitud skaala

```css
--z-base: 0;
--z-panel: 10;
--z-sticky: 100;
--z-dropdown: 300;
--z-overlay: 500;
--z-modal: 600;
--z-toast: 700;
```

---

## 9. Animatsioonide ja jõudluse audit

Analüüsida:

- kõik `transition` deklaratsioonid;
- kõik `animation` deklaratsioonid;
- kõik `@keyframes` plokid;
- dubleeritud keyframe’id;
- lõputud animatsioonid;
- layout’i põhjustavad animatsioonid;
- blur/filter/backdrop-filter animatsioonid;
- `will-change` kasutus;
- reduced-motion katvus;
- mobiilis kallid glow- ja taustaefektid.

### Prioriteetsed komponendid

- OrbitalMenu;
- BorderGlow;
- avalehe taust;
- vestlusvaate efektid;
- glass-paneelid;
- avanevad külgpaneelid;
- kaardi- ja modal-transition’id.

---

## 10. Ligipääsetavuse CSS-audit

Kontrollida vähemalt:

- `:focus-visible`;
- klaviatuurifookuse nähtavus;
- touch target’ite suurus;
- tekstisuurenduse mõju;
- 200% ja 400% zoom;
- teksti lõikamine `overflow: hidden` tõttu;
- forced-colors režiim;
- high contrast;
- reduced motion;
- reduced transparency;
- värvist sõltuvad olekud;
- disabled/readonly olekud;
- vormiväljade veateated;
- skip link;
- sticky/fixed navigeerimise mõju.

Ligipääsetavus tuleb käsitleda eraldi omanikukihina, mitte juhuslike globaalsete override’idena.

---

## 11. Inline-stiilide ja CSS-i topeltomandi audit

Analüüsida JS/JSX/TSX failides:

- `style={{ ... }}` plokid;
- hardcoded värvid;
- hardcoded mõõdud;
- CSS-i dubleerivad väärtused;
- inline-stiilid, mille vastu CSS kasutab `!important`-i;
- dünaamilised väärtused, mida saaks edastada CSS custom property kaudu.

### Soovitud muster

```jsx
<div
  className={styles.panel}
  style={{ "--panel-height": `${height}px` }}
/>
```

Komponendi põhikujundus jääb CSS-i, ainult dünaamiline väärtus läheb custom property kaudu.

---

## 12. Suurte failide detailne jagamisplaan

Suured failid tuleb jagada omanike, mitte suvalise rea- või sektsioonijaotuse järgi.

Näide teenusekaardile:

```text
features/service-map/
├── index.css
├── shell.css
├── toolbar.css
├── results-list.css
├── map-leaflet.css
├── map-popup.css
├── pre-inquiry-adapter.css
├── mobile.css
├── themes.css
└── hc.css
```

### Prioriteetsed failid

- `service-map/desktop.css`;
- `chat/shell.css`;
- `chat/themes.css`;
- `OrbitalMenu.css`;
- `WellbeingPage.module.css`;
- `CovisionPage.module.css`;
- `documents/ui.css`;
- `documents/workspace.css`;
- `theme/hc.css`;
- `WorkspacePanel.module.css`.

Iga faili puhul tuleb määrata:

- millised selektorid jäävad;
- millised liiguvad uude faili;
- millises järjekorras failid imporditakse;
- millised testid kaitsevad kaskaadi;
- milline route või komponent on uus omanik.

---

## 13. CSS Module’iteks üleviimise kandidaadid

Kõiki faile ei ole mõistlik moduleerida.

### Kindlasti moduleerida

- ühe komponendi globaalsed klassid;
- modalid;
- selected listing;
- CircularText;
- OrbitalMenu;
- register/login komponendid;
- väikesed korduvkasutatavad paneelid;
- lokaalsed nupud ja toolbar’id.

### Jätta globaalseks

- reset;
- root-tokenid;
- `html` ja `body`;
- universaalsed ligipääsetavuse reeglid;
- kolmanda osapoole teegi klassid;
- route’i tõeliselt globaalsed shell-reeglid.

### Jätta feature-scoped globaalseks

- runtime-generated klassidega vaated;
- suure feature’i adapterikihid;
- Leafleti või muu teegi integratsioon;
- feature’i teemaadapterid.

---

## 14. Visuaalse regressioonitesti plaan

Luua Playwrighti kuvatõmmiste testimaatriks.

| Vaade | Desktop | iPhone | Android | Light | Night | Mono | HC |
|---|---:|---:|---:|---:|---:|---:|---:|
| Avaleht | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vestlus | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profiil | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Teenusekaart | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dokumendid | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Teekond | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tööheaolu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kovisioon | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Testida

- põhivaade;
- menüüd avatud;
- modalid;
- veateated;
- loading-state;
- empty-state;
- väga pikk tekst;
- 200% zoom;
- vähendatud liikumine;
- vähendatud läbipaistvus;
- PWA viewport.

---

## 15. Uue CSS-arhitektuuri reeglistik

Soovituslikud kohustuslikud reeglid:

1. `globals.css` ei impordi feature CSS-i.
2. Route impordib ainult enda entrypoint’i.
3. CSS Module omab komponendi geomeetriat ja sisemist kujundust.
4. Teema muudab tokenit, mitte komponendi tervet selektorit.
5. Mobiilifail muudab ainult desktopist erinevaid väärtusi.
6. Uus `!important` vajab põhjendavat kommentaari.
7. Feature ei tohi muuta teise feature’i sisemist klassi.
8. Kõik `z-index` väärtused tulevad ühisest skaalast.
9. Shared pind peab olema kas komponent või selgelt määratud primitive.
10. Compatibility-failil peab olema kirjeldatud eesmärk ja eemaldamise tingimus.
11. Üks CSS-fail ei tohiks kasvada üle kokkulepitud piiri.
12. Inline-stiilides hoitakse ainult päriselt dünaamilisi väärtusi.
13. Uus hardcoded värv või shadow vajab põhjendust või tokenit.
14. Route-spetsiifiline CSS ei tohi jõuda globaalsesse bundle’isse.
15. Kõik suuremad refaktorid peavad läbima visuaaltestid.

---

## 16. Automaatne CSS-kvaliteedikontroll

Lisada CI-sse ja lokaalsetesse skriptidesse kontrollid.

### Soovituslikud piirangud

- CSS-fail ei tohi ületada näiteks 500 rida;
- `!important` koguarv ei tohi suureneda;
- globaalse CSS-i maht ei tohi suureneda;
- feature ei tohi importida teise feature’i sisemist faili;
- kasutamata CSS Module’i klassid annavad hoiatuse või vea;
- dubleeritud deklaratsiooniplokid raporteeritakse;
- hardcoded värvid ja mõõdud raporteeritakse;
- uued globaalsed feature-selectorid raporteeritakse;
- puuduva tokeni kasutus annab vea;
- testid peavad lugema rekursiivselt kogu CSS `@import`-ahelat.

---

# Soovitatud tööjärjekord

## Etapp 1 — Testide ja importgraafi alus

- rekursiivne CSS-bundle’i lugeja testidele;
- route’ide importgraaf;
- CSS-i omandikaart;
- tühjade ja selgelt üleliigsete failide eemaldamine;
- esimene ohutu patch.

**Seis:** alustatud ja esimene patch koostatud.

---

## Etapp 2 — Globaalse mobiilikihi vähendamine

- profile/policy Androidi CSS route’ide juurde;
- eksitavate globaalsete mobiiliagregaatorite eemaldamine;
- valesse faili sattunud reeglite tagasiviimine omaniku faili;
- kaskaadi säilitavad testid.

**Seis:** tehtud ja teine patch koostatud.

---

## Etapp 3 — Avalehe ja BackgroundLayeri eraldamine

- `features/home/background.css` lahtivõtmine;
- BackgroundLayeri shared reeglid;
- ainult avalehele kuuluvad reeglid;
- touch-control reeglid;
- üldised glass-pinnad;
- mobiilivariandid;
- route’i koormuse uus mõõtmine.

---

## Etapp 4 — Ülejäänud globaalse mobiili-CSS-i audit

- `panel-surfaces.css`;
- `scroll-panels.css`;
- safe-area reeglid;
- PWA standalone reeglid;
- fixed/sticky konfliktid;
- iOS ja Androidi erandid;
- shared ja feature’i omandi lahutamine.

---

## Etapp 5 — Teemad ja disainitokenid

- värvide inventuur;
- shadow’d ja blur’id;
- radius’ed;
- spacing;
- paneelipinnad;
- light/night/mono/HC tokenid;
- teemafailidest komponendipõhiste override’ide eemaldamine.

---

## Etapp 6 — `!important` vähendamine

- liigitamine;
- madala riskiga eemaldused;
- impordijärjekorra parandused;
- spetsiifilisuse lihtsustamine;
- inline-stiili konfliktide kõrvaldamine;
- CI piirang.

---

## Etapp 7 — Suurte failide jagamine

Soovitatud järjekord:

1. `WorkspacePanel.module.css`;
2. `OrbitalMenu.css`;
3. `chat/themes.css`;
4. `WellbeingPage.module.css`;
5. `CovisionPage.module.css`;
6. `documents/ui.css`;
7. `documents/workspace.css`;
8. `service-map/desktop.css`.

`service-map/desktop.css` tuleks jätta hilisemaks, sest see on suure mõjuga ja kõrge regressiooniriskiga.

---

## Etapp 8 — Inline-stiilide audit

- suured `style={{...}}` plokid;
- CSS-i dubleerivad väärtused;
- custom property lahendused;
- hardcoded teema- ja mõõduväärtused;
- PageInfo ja sarnaste komponentide puhastus.

---

## Etapp 9 — Z-index ja overlay süsteem

- stacking context’i inventuur;
- kihtide ühine skaala;
- modalid;
- dropdown’id;
- toast’id;
- orbital menu;
- background layer;
- pointer-events kontroll.

---

## Etapp 10 — Jõudlus ja animatsioonid

- backdrop-filter;
- blur;
- filter;
- lõputud animatsioonid;
- keyframe’ide dubleerimine;
- reduced motion;
- mobiili GPU-koormus;
- scroll-jank.

---

## Etapp 11 — Ligipääsetavuse audit

- focus-visible;
- high contrast;
- forced colors;
- reduced transparency;
- reduced motion;
- touch target’id;
- zoom;
- tekstisuurendus;
- overflow ja clipping.

---

## Etapp 12 — Visuaaltestid ja CI

- Playwrighti kuvatõmmised;
- peamiste route’ide maatriks;
- desktop/iPhone/Android;
- light/night/mono/HC;
- CSS-mahu eelarved;
- `!important` eelarve;
- failisuuruse piirangud;
- arhitektuurireeglid.

---

# Põhimõtted refaktori ajal

- Ära muuda korraga arhitektuuri ja visuaali.
- Kõigepealt liiguta reegel õigesse omanikku, alles siis lihtsusta.
- Enne suure faili jagamist loo regressioonitestid.
- Ära kustuta klassi ainult tekstilise otsingu põhjal.
- Säilita impordijärjekord, kuni visuaalne võrdlus kinnitab muudatuse.
- Üks patch peaks lahendama ühe selge omandiprobleemi.
- Iga patch peab sisaldama mõju, riski ja kontrollimise juhiseid.
- Kõrge riskiga failid jäta pärast globaalse kaskaadi korrastamist.
- Ära loo uusi compatibility-kihte ilma eemaldamisplaanita.
- Iga paranduse järel mõõda uuesti route’i CSS-mahtu.

---

# Edukriteeriumid

Projekt on korrastatud, kui:

- globaalne CSS sisaldab ainult tõeliselt globaalset koodi;
- route ei lae teiste feature’ite kujundust;
- suuremal komponendil on üks selge stiiliomanik;
- teemad töötavad peamiselt tokenite kaudu;
- mobiilireeglid asuvad oma feature’i või shared primitive’i juures;
- `!important` arv on oluliselt vähenenud;
- tühjad ja aegunud failid on eemaldatud;
- suuri CSS-faile on jagatud loogilisteks osadeks;
- visuaaltestid kaitsevad peamisi vaateid;
- CI takistab uue CSS-segaduse tekkimist;
- CSS-maht route’ide kaupa on väiksem ja kontrollitav.
