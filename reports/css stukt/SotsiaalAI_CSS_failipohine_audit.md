# SotsiaalAI CSS-failide audit

Koostatud ZIP-is olnud lähtekoodi staatilise analüüsi põhjal.

## Kokkuvõte

- **95 CSS-faili**, kokku **1024.9 KB** toor-CSS-i.
- **3275 reeglit** ja **14027 deklaratsiooni**.
- **1992 `!important`-i**, neist vähemalt **619 struktuurset** (mõõt, asukoht, display, overflow, transform jms).
- `globals.css` kaudu jõuab globaalsesse kaskaadi **48 faili / 362.5 KB** toor-CSS-i.
- `vestlus` route’i otsesed CSS-entrypoint’id koos globaalse ahelaga moodustavad konservatiivselt umbes **731 KB** toor-CSS-i enne komponentide CSS Module’eid.
- Leitud **16 täpselt dubleeritud reeglirühma**. Osa on CSS Module’i `composes` boilerplate, kuid profile mono ↔ OrbitalMenu duplikaadid on päris omandiprobleem.
- CSS süntaksivigu ei leitud.

## Kõige olulisemad järeldused

1. **Põhiprobleem on omand, mitte ainult surnud CSS.** Sama pind on sageli korraga feature-, mobile-, shared- ja theme-faili kontrolli all.
2. **Globaalne mobiilikiht on liiga lai.** See laeb home, invite, login, register, policy ja profile stiile ka route’idel, kus neid pole vaja.
3. **Teemad sisaldavad komponente.** Eriti `theme/hc.css` ja `theme/mono.css` tunnevad kümneid feature-klassi nimesid; teema peaks valdavalt määrama tokeneid.
4. **`!important` on arhitektuurne sümptom.** Kõige kriitilisemad on `profile/android-mobile.css`, `mobile/panel-surfaces.css`, WorkspacePanel, rails, Covision ja UI glow.
5. **Suurimad failid tuleb jagada enne peenpuhastust.** Muidu eemaldatakse üks override ja teine kiht taastab probleemi.

## Soovitatud tööjärjekord

### Etapp A — madala riskiga koristus
- Eemalda `components/chat-focus.css`, `components/documents-mode.css` ja tühi `tokens/base.css` (või lõpeta selle migratsioon).
- Eemalda kinnitatud surnud module-klassid: PageInfo duplikaadid, Loader `glowHidden` ning muud kandidaadid alles pärast route-testi.
- Lameda compatibility-aggregaatorid alles siis, kui import orderi regressioonitest on olemas.

### Etapp B — globaalpaketi kahandamine
- Vii home, invite, policy/profile Android, register ja accessibility CSS nende route’ide/komponentide juurde.
- Jäta `globals.css`-i ainult tokenid, teemajuured, reset/base ja päriselt universaalsed primitiivid.

### Etapp C — suurte omanike split
- `service-map/desktop.css`, WorkspacePanel, OrbitalMenu, Wellbeing, Covision, chat shell/themes ja documents UI/workspace.
- Iga split’i järel tee visuaalne kontroll: desktop, iPhone PWA, Android, light/mid/night/mono/HC, reduce transparency/motion.

### Etapp D — teema ja `!important` lõppmäng
- Tõsta feature-selectorid globaalsest HC/mono failist feature-owned `hc.css`/`mono.css` failidesse.
- Asenda selectoripõhised theme override’id semantiliste custom property’dega.
- Alles seejärel vähenda `!important`-e; enne seda võib markerite pime eemaldamine muuta import orderist sõltuva renderduse katki.

## Metoodika ja piirangud

- Analüüsisin CSS importgraafi, JS/JSX importijaid, CSS Module’i kasutust, selectorite kattuvust, deklaratsioone, `!important`-e, failisuurust ja klassinimede tekstilisi viiteid.
- Staatiliselt “leidmata” klass ei ole automaatselt surnud: klass võib tulla dünaamilisest `styles[...]` avaldisest, Leafletist või runtime-andmeatribuudist.
- CSS Module’ite samanimelised selectorid ei lähe brauseris tingimata konflikti, sest build muudab need scoped-nimedeks.
- See audit ei asenda visuaalset regressioonitesti; eriti PWA safe-area, HC ja teema-kaskaad vajavad brauseris kontrollimist.

## Failipõhine audit

### 0. Põhisisenemispunktid

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/globals.css` | Sisenemispunkt / aggregator; Globaalne | 22 r / 0.9 KB | 0 (0 str.) | 0 | — | **P0 · KAHANDA.** Globaalne entry laadib 48 CSS-faili ja umbes 362.5 KB toor-CSS-i. Jäta siia tokenid, teemajuured, reset/base ja tõesti ühised primitiivid; journey, home, invite, policy/profile Android ning lehepõhised süsteemid peavad lahkuma. |
| `app/styles/mobile.css` | Sisenemispunkt / aggregator; Globaalne | 17 r / 0.8 KB | 0 (0 str.) | 0 | — | **P0 · KAHANDA.** Globaalne mobiiliaggregaator impordib 16 faili, sh home, invite, login, register, policy ja profile funktsioonid. Jäta ainult foundations, motion, shared touch ja tõeliselt universaalsed pinnad. |
| `app/styles/tailwind.css` | Globaalne komponent; Globaalne | 41 r / 1.2 KB | 0 (0 str.) | 0 | — | **P2 · HOIA.** Tailwind theme/utilities on enne kohandatud base CSS-i, seega custom layer saab teadlikult võita. Hoia utility-klasside safelist/dynamic klassid testidega; ära kasuta Tailwindi ja globaalset CSS-i sama komponendi geomeetria topeltomanikena. |

### 1. Baas

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/base/animations.css` | Globaalne baas; Globaalne | 124 r / 2.4 KB | 0 (0 str.) | 4 | — | **P3 · HOIA.** Baaskiht keyframe’idele. Fail on väike ja ilma `!important`-ita. Prefix’i kõik keyframe-nimed (`saai-*`), sest staatiline ristselektorite arv sisaldab siin peamiselt `0%/50%/100%` plokke, mitte päris kaskaadikonflikte. |
| `app/styles/base/backgrounds.css` | Globaalne baas; Globaalne | 182 r / 4.4 KB | 2 (1 str.) | 3 | — | **P2 · HOIA + PIIRA.** Baastaustad on sobiv omanik, kuid `[data-bg-layer]` reeglid kattuvad `features/home/background.css`-iga. Jäta siia ainult kogu rakenduse taust ning vii avalehe erandid avalehe faili. |
| `app/styles/base/core.css` | Globaalne baas; Globaalne | 294 r / 7.2 KB | 2 (1 str.) | 7 | — | **P2 · JAGA.** Fail segab reset’i, juure olekuid, kursorit ja üldkomponente. Jaga vähemalt `reset.css`, `root-state.css` ja `interaction.css`; `.click-pulse-cursor` mobiiliülekirjutus vajab ühte omanikku. |
| `app/styles/base/layout.css` | Globaalne baas; Globaalne | 57 r / 1.2 KB | 0 (0 str.) | 2 | — | **P3 · HOIA.** Selge väike paigutuskiht. `main#main` ja `.main-content` avalehe erandid peaksid jääma avalehe faili, mitte siia kasvama. |
| `app/styles/base/typography.css` | Globaalne baas; Globaalne | 59 r / 1.2 KB | 0 (0 str.) | 1 | — | **P3 · HOIA.** Väike ja arusaadav tüpograafiakiht. `.glass-box` tüpograafia tuleks siduda tokeniga, mitte kasvatada siin klaaspinna geomeetriat. |

### 2. Globaalsed komponendifailid

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/components/chat-focus.css` | Globaalne komponent; Ei laadita | 9 r / 0.3 KB | 0 (0 str.) | 0 | — | **P0 · EEMALDA.** Kasutamata ühilduvus-aggregaator: 5 importi, kuid ükski JS/JSX ega aktiivne CSS-sisenemispunkt seda ei lae. Eemaldamine on madala riskiga pärast importide testi. |
| `app/styles/components/documents-mode.css` | Globaalne komponent; Ei laadita | 4 r / 0.1 KB | 0 (0 str.) | 0 | — | **P0 · EEMALDA.** Failis pole reegleid ega importe; alles on ainult ühilduvuskommentaar. See ei mõjuta renderdust. |
| `app/styles/components/glass.css` | Globaalne komponent; Globaalne | 7 r / 0.2 KB | 0 (0 str.) | 0 | — | **P2 · AJUTISELT HOIA.** Aktiivne ühilduvus-aggregaator kolme `shared/*` faili jaoks. Hoia kuni impordistruktuur on stabiliseeritud, seejärel impordi shared-failid otse `globals.css`-ist ja eemalda üks vahekiht. |
| `app/styles/components/invite-modal.css` | Globaalne komponent; Route/komponent (2 otsest importijat) | 45 r / 1.5 KB | 0 (0 str.) | 2 | — | **P2 · HOIA.** Väike modaalikomponendi baas, route-import on mõistlik. Mobiiligeomeetria on praegu teises globaalses failis; koonda baas ja mobiil sama funktsiooni alla. |
| `app/styles/components/journey.css` | Globaalne komponent; Globaalne | 116 r / 2.7 KB | 4 (1 str.) | 2 | — | **P1 · VII ROUTE/KOMPONENTI.** Journey-stiilid on globaalses paketis, kuigi klassid on funktsioonipõhised. Impordi JourneyDashboardi või vastava route’i juures, et avalikud lehed seda CSS-i ei kannaks. |
| `app/styles/components/selected-listing.css` | Globaalne komponent; Route/komponent (1 otsest importijat) | 91 r / 3.3 KB | 1 (1 str.) | 1 | — | **P2 · HOIA + MODULEERI.** Selge üksik komponent, kuid globaalsed klassid ja üks struktuurne `!important` muudavad selle kaskaadist sõltuvaks. CSS Module oleks siin lihtne ja ohutu. |
| `app/styles/components/workspace-help-listings.css` | Globaalne komponent; Route/komponent (1 otsest importijat) | 135 r / 5.1 KB | 26 (12 str.) | 1 | — | **P1 · REFAKTORI.** Väike fail, kuid 26 `!important`-i 9 reegli kohta näitab, et komponent võitleb parent-paneeliga. Muuda WorkspacePaneli variandiks või CSS Module’iks ning eemalda geomeetria topeltomandus. |

### 3. Accessibility

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/accessibility/fields.css` | Feature CSS; Globaalne | 16 r / 0.3 KB | 0 (0 str.) | 3 | — | **P2 · ÜHENDA.** Ainult kolm mobiilivälja reeglit. Ühenda `touch.css`-iga või AccessibilityModal CSS Module’isse; eraldi globaalne fail ei anna väärtust. |
| `app/styles/features/accessibility/touch.css` | Feature CSS; Globaalne | 299 r / 8.1 KB | 3 (0 str.) | 5 | — | **P1 · VII KOMPONENTI.** Ligipääsetavusmodaali puuteekraanireeglid laetakse globaalselt. Impordi need AccessibilityModalist; CenteredScrollPickeri ülekirjutused peaksid olema komponendi variandid. |

### 4. Chat

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/chat/focus.css` | Feature CSS; Route/komponent (1 otsest importijat) | 12 r / 0.3 KB | 1 (0 str.) | 0 | — | **P2 · HOIA.** Üks globaalne olekureegel mitme overlay koordineerimiseks. Hoia route-tasemel, kuid dokumenteeri klassi tootja ja tarbijad, sest see on teadlik ristfunktsionaalne leping. |
| `app/styles/features/chat/hc.css` | Feature CSS; Route/komponent (kaudne) | 675 r / 21.7 KB | 29 (0 str.) | 0 | — | **P1 · JAGA ALAMOSADEKS.** Route-owned HC on õige suund, kuid 675 rida ühes failis on raske auditeerida. Jaga `messages`, `composer`, `drawer`, `workspace` järgi; siin on vähe struktuurset `!important`-i, mis on hea. |
| `app/styles/features/chat/index.css` | Sisenemispunkt / aggregator; Route/komponent (5 otsest importijat) | 13 r / 0.7 KB | 0 (0 str.) | 0 | — | **P3 · HOIA.** Selge route-sisenemispunkt ja õige impordijärjekord. Pärast alamfailide korrastamist jäägu see chat-bundle’i ainsaks avalikuks impordiks. |
| `app/styles/features/chat/mobile.css` | Mobiilikiht; Route/komponent (kaudne) | 368 r / 11.7 KB | 14 (5 str.) | 1 | — | **P1 · PIIRA OMANIKKU.** Mobiilifail on mõistlik, kuid osa samu selektoreid on `shell.css`-is. Jäta siia ainult media-põhised erinevused; baasgeomeetria peab olema shellis. |
| `app/styles/features/chat/mono.css` | Feature CSS; Route/komponent (1 otsest importijat) | 333 r / 14.2 KB | 20 (4 str.) | 0 | — | **P1 · HOIA + ÜHTLUSTA.** Mono-chat on route-owned, kuid `/ruum` impordib seda eraldi ilma chat-entrypoint’ita. Loo ruumile oma entry või ühine chat-theme entry, et impordijärjekord ei sõltuks lehest. |
| `app/styles/features/chat/shell.css` | Feature CSS; Route/komponent (kaudne) | 868 r / 36.6 KB | 56 (26 str.) | 2 | — | **P0 · JAGA.** 868 rida ning sõnumid, composer, drawer, overlay ja workspace-shell on samas failis. Jaga vähemalt viieks omanikufailiks; 56 `!important`-ist 26 on struktuursed, mis viitab kaskaadisõjale. |
| `app/styles/features/chat/themes.css` | Feature CSS; Route/komponent (kaudne) | 827 r / 27.3 KB | 86 (0 str.) | 0 | — | **P0 · MUUDA TOKENIPÕHISEKS.** 827 rida standardteemade selektoripõhiseid override’e ja 86 `!important`-i. Defineeri chat-semantic tokenid teema juurel ning lase komponendireeglitel neid tarbida; teema ei peaks kordama komponente. |

### 5. Documents

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/documents/agent.css` | Feature CSS; Route/komponent (3 otsest importijat) | 666 r / 15.2 KB | 10 (2 str.) | 5 | — | **P1 · HOIA + JAGA.** Agent on eraldi funktsioon, kuid 666 rida on juba suur. Jaga vorm, mallivalik, tegevused ja tulemused; mobiilifailis korduvad samad selectorid ainult responsive override’ina. |
| `app/styles/features/documents/index.css` | Sisenemispunkt / aggregator; Route/komponent (16 otsest importijat) | 11 r / 0.6 KB | 0 (0 str.) | 0 | — | **P3 · HOIA.** Õige route-entrypoint. `library.css` ja `agent.css` jäävad teadlikult valikulisteks, sest kõik documents-route’id neid ei vaja. |
| `app/styles/features/documents/library.css` | Feature CSS; Route/komponent (2 otsest importijat) | 372 r / 7.2 KB | 5 (0 str.) | 14 | — | **P1 · HOIA.** Route-owned teegivaade on loogiline. 14 ristselektorit mobiilifailiga on enamasti normaalne responsive muster; väldi samade baasomaduste dubleerimist. |
| `app/styles/features/documents/mobile.css` | Mobiilikiht; Route/komponent (kaudne) | 277 r / 7.4 KB | 9 (2 str.) | 21 | — | **P1 · KORRASTA.** Fail muudab korraga agenti, library’t, UI-d ja workspace’i. Jaga responsive reeglid samade alamomanike järgi või kasuta iga alamfaili sees media-plokke. |
| `app/styles/features/documents/mono.css` | Feature CSS; Route/komponent (kaudne) | 105 r / 6.0 KB | 0 (0 str.) | 0 | — | **P2 · HOIA.** Väike ja selgelt route-owned mono override. Hoia ainult tokenite/paint’i erinevused, mitte paigutust. |
| `app/styles/features/documents/ui.css` | Feature CSS; Route/komponent (kaudne) | 860 r / 25.1 KB | 13 (3 str.) | 3 | `documents-dropdown--align-end`, `documents-dropdown--align-start`, `documents-dropdown--open-up` | **P0 · JAGA + KONTROLLI SURNUD KLASSE.** 860 rida ja 72 klassi ühes UI-failis. Jaga dropdown, controls, form fields, banners ja action rows. Staatiliselt leidmata `documents-dropdown--align-*` ning `--open-up` vajavad runtime-kinnitust; vähemalt osa neist näib vananenud. |
| `app/styles/features/documents/workspace.css` | Feature CSS; Route/komponent (kaudne) | 768 r / 36.5 KB | 3 (0 str.) | 9 | — | **P0 · JAGA.** 768 rida, kuigi ainult 44 reeglit: väga suured deklaratsiooniplokid ja palju tokeniseerimist. Jaga shell/header/filter/list; ära hoia dokumentide komponente `:root` teemaeranditega samas failis. |

### 6. Home

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/home/background.css` | Feature CSS; Globaalne | 397 r / 9.6 KB | 7 (0 str.) | 17 | — | **P0 · EEMALDA GLOBAALSEST MOBIILIKETIST.** Avalehe taust laetakse praegu globaalselt `mobile.css` kaudu. See kattub base/backgrounds ja glass-core’iga. Impordi ainult `features/home/index.css` kaudu ning eralda profile-stack reeglid. |
| `app/styles/features/home/desktop.css` | Feature CSS; Route/komponent (kaudne) | 668 r / 16.9 KB | 49 (3 str.) | 15 | — | **P0 · JAGA.** 668 rida ja 104 reeglit: hero, carousel, about, cards, animatsioonid ja HC erandid on koos. Jaga vaateplokkide järgi ning vii teema/HC reeglid `home/themes.css` või tokenitesse. |
| `app/styles/features/home/home-scroll.css` | Feature CSS; Globaalne | 71 r / 1.8 KB | 3 (2 str.) | 4 | — | **P1 · JAGA OMANIKE VAHEL.** Fail laetakse globaalselt, kuid sisaldab nii avalehe kui profiili stack-fade reegleid. Vii home-scroll avalehele ja profile-fade profile mobile faili. |
| `app/styles/features/home/index.css` | Sisenemispunkt / aggregator; Route/komponent (1 otsest importijat) | 9 r / 0.5 KB | 0 (0 str.) | 0 | — | **P3 · HOIA + LAIENDA.** Õige avalehe entrypoint. Lisa siia ka `background.css` ja avalehe osa `home-scroll.css`-ist, et home CSS ei jõuaks teistele route’idele. |
| `app/styles/features/home/mobile.css` | Mobiilikiht; Route/komponent (kaudne) | 304 r / 8.6 KB | 4 (2 str.) | 8 | — | **P1 · HOIA.** Avalehe route-owned mobiilireeglid on õigel kohal. Vähenda desktop-failiga kattuvaid baasselektoreid; mobile peab kirjeldama ainult erinevusi. |
| `app/styles/features/home/themes.css` | Feature CSS; Route/komponent (kaudne) | 177 r / 6.2 KB | 6 (0 str.) | 0 | — | **P1 · MUUDA TOKENIPÕHISEKS.** Teemaoverride’id on route-owned, kuid komponendiselektorite kordamise asemel defineeri home tokenid. HC home reeglid on endiselt globaalses `theme/hc.css`-is ja tuleks siia tuua. |

### 7. Invite

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/invite/mobile.css` | Mobiilikiht; Globaalne | 240 r / 7.4 KB | 63 (27 str.) | 3 | — | **P0 · VII INVITE ENTRYPOINTI.** 240 rida laetakse igal mobiililehel ning sisaldab 63 `!important`-i, neist 27 struktuursed. Impordi invite-komponendiga ja vähenda parent-paneelide ülekirjutusi. |

### 8. Login

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/login/mobile.css` | Mobiilikiht; Globaalne | 36 r / 0.9 KB | 0 (0 str.) | 2 | — | **P2 · VII LOGIN KOMPONENTI.** Ainult kolm mobiilireeglit, kuid globaalses ketis. Impordi LoginModalist või ühenda `shared/login-a11y.css`-i login-osaga. |
| `app/styles/features/login/otp-close.css` | Feature CSS; Globaalne | 26 r / 0.7 KB | 0 (0 str.) | 0 | — | **P2 · ÜHENDA.** Kaks OTP sulgemisnupu reeglit ei vaja eraldi faili. Ühenda login mobile faili või modaalinupu komponendi variandiks. |

### 9. Policy

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/policy/android-mobile.css` | Feature CSS; Globaalne | 30 r / 1.0 KB | 8 (2 str.) | 0 | — | **P1 · VII POLICY ENTRYPOINTI.** Androidi policy reeglid laetakse globaalse platform-wrapperi kaudu. Need kuuluvad policy route’i ja võivad olla policy indexi viimane import. |
| `app/styles/features/policy/index.css` | Sisenemispunkt / aggregator; Route/komponent (3 otsest importijat) | 9 r / 0.5 KB | 0 (0 str.) | 0 | — | **P3 · HOIA.** Õige route-entrypoint. Muuda impordid selgeks järjekorraks: base/pages → responsive/mobile → android → theme/HC vajadusel. |
| `app/styles/features/policy/mobile.css` | Mobiilikiht; Route/komponent (kaudne) | 164 r / 5.9 KB | 15 (12 str.) | 11 | — | **P1 · KONSOLIDEERI.** Fail kattub `pages.css` ja `responsive.css` selectoritega. Otsusta, kas responsive reeglid elavad alamkomponentide juures või ühes mobile failis; praegu on kolm paralleelset omanikku. |
| `app/styles/features/policy/pages.css` | Feature CSS; Route/komponent (kaudne) | 635 r / 18.7 KB | 38 (27 str.) | 18 | — | **P0 · JAGA.** 635 rida: kasutusjuhend, policy-pinnad, materials/invite seosed ja teemaerandid on koos. Jaga `policy-shell`, `guide-content`, `scroll-surface`; eemalda teiste funktsioonide selectorid. |
| `app/styles/features/policy/responsive.css` | Feature CSS; Route/komponent (kaudne) | 348 r / 11.7 KB | 62 (48 str.) | 7 | — | **P0 · KIRJUTA ÜMBER.** 62 `!important`-i 104 deklaratsioonist ja 48 struktuurset markerit tähendab, et fail on sisuliselt lõplik override-kiht. Lahenda geomeetria komponentide baasis ning jäta responsive faili ainult media-delta. |

### 10. Profile

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/profile/android-mobile.css` | Feature CSS; Globaalne | 183 r / 7.7 KB | 85 (41 str.) | 2 | — | **P0 · KIRJUTA ÜMBER.** 85 `!important`-i 87 deklaratsioonist on kõige tugevam kaskaadihäire. Fail on peaaegu täielikult jõuga override. Import peab olema profile entry kaudu ja reeglid tuleb modelleerida Androidi variandi tokenite/atribuutidega. |
| `app/styles/features/profile/hc.css` | Feature CSS; Route/komponent (kaudne) | 278 r / 8.8 KB | 28 (0 str.) | 0 | — | **P1 · HOIA.** Profile-owned HC on õige. Eemalda ainult need reeglid, mis tegelikult kuuluvad OrbitalMenu komponendile, et kaks omanikku sama menüüd ei kujundaks. |
| `app/styles/features/profile/index.css` | Sisenemispunkt / aggregator; Route/komponent (2 otsest importijat) | 8 r / 0.4 KB | 0 (0 str.) | 0 | — | **P3 · HOIA + LISA ANDROID.** Õige route-entrypoint. `android-mobile.css` peaks tulema siia viimaseks, mitte globaalsest mobile/platform ketist. |
| `app/styles/features/profile/mobile.css` | Mobiilikiht; Route/komponent (kaudne) | 541 r / 16.7 KB | 10 (2 str.) | 10 | — | **P0 · JAGA.** 541 rida hõlmab orbitit, stack-menu’d, fade’e ja teemaerandeid. Jaga vähemalt `orbit-mobile`, `stack-mobile`, `profile-shell-mobile`; väldi dubleerimist OrbitalMenu.css-iga. |
| `app/styles/features/profile/mono.css` | Feature CSS; Route/komponent (kaudne) | 84 r / 4.2 KB | 2 (0 str.) | 0 | — | **P0 · VALI ÜKS OMANIK.** Kolm täpselt sama mono reeglit on ka `OrbitalMenu.css`-is. Otsusta, kas OrbitalMenu omab enda teemasid või profile feature; dubleerimine tuleb eemaldada ühelt poolelt. |

### 11. Register

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/register/mobile.css` | Mobiilikiht; Globaalne | 27 r / 0.6 KB | 0 (0 str.) | 6 | — | **P2 · VII REGISTER/LOGIN KOMPONENTI.** Väike keelepõhine mobile-kiht on globaalselt laaditud. Impordi registreerimisvaate või shared register komponendiga; selectorid korduvad `shared/register.css`-is. |

### 12. Service map

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/features/service-map/desktop.css` | Feature CSS; Route/komponent (kaudne) | 3352 r / 96.5 KB | 104 (27 str.) | 42 | Leaflet runtime-klassid — mitte surnud | **P0 · JAGA KOHE.** Suurim fail: 3352 rida, ~96.5 KB, 416 reeglit. Lisaks service-map’ile sisaldab workspace-, pre-inquiry-, documents-, theme- ja Leaflet-reegleid. Jaga vähemalt `shell`, `toolbar`, `map-leaflet`, `results`, `popup`, `pre-inquiry-integration`, `themes`. |
| `app/styles/features/service-map/index.css` | Sisenemispunkt / aggregator; Route/komponent (4 otsest importijat) | 5 r / 0.3 KB | 0 (0 str.) | 0 | — | **P3 · HOIA.** Õige entrypoint. Pärast split’i jäägu see ainus service-map CSS import route’ides. |
| `app/styles/features/service-map/mobile.css` | Mobiilikiht; Route/komponent (kaudne) | 698 r / 21.6 KB | 77 (49 str.) | 42 | Leaflet runtime-klassid — mitte surnud | **P0 · JAGA + VÄHENDA OVERRIDE’E.** 698 rida, 77 `!important`-i ja 49 struktuurset. 42 selectorit kattuvad desktopiga; responsive delta on normaalne, kuid praegu kirjutatakse liiga palju baasi jõuga üle. |

### 13. Mobiili shared-kiht

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/mobile/chat-bootstrap.css` | Mobiilikiht; Globaalne | 19 r / 0.6 KB | 2 (2 str.) | 0 | — | **P3 · HOIA.** Väike kriitiline first-paint paigutus. Hoia globaalsena ainult siis, kui varajane layout-script vajab seda enne route CSS-i; lisa regressioonitest PWA avamisele. |
| `app/styles/mobile/foundations.css` | Mobiilikiht; Globaalne | 305 r / 8.4 KB | 11 (7 str.) | 7 | — | **P1 · HOIA + PUHASTA.** Universaalsed viewport/safe-area tokenid sobivad siia. Eemalda `.click-pulse-cursor`, home või konkreetsete klaaspindade reeglid, mis kuuluvad komponentidele. |
| `app/styles/mobile/index.css` | Sisenemispunkt / aggregator; Globaalne | 1 r / 0.0 KB | 0 (0 str.) | 0 | — | **P2 · EEMALDA VAHEKIHT.** Üherealine wrapper `mobile.css` ümber. `globals.css` võib importida `mobile.css` otse media tingimusega; üks lisasisenemispunkt raskendab ainult graafi. |
| `app/styles/mobile/modal-surfaces.css` | Mobiilikiht; Globaalne | 283 r / 8.7 KB | 6 (2 str.) | 5 | — | **P0 · JAGA KOMPONENTIDEKS.** Üks globaalne fail kujundab invite-, subscription-, help-listings-, materials- ja framework-modale. Need on eri omanikud; jaga funktsioonide juurde või loo päris `ModalSurface` primitiiv variantidega. |
| `app/styles/mobile/motion.css` | Mobiilikiht; Globaalne | 7 r / 0.1 KB | 0 (0 str.) | 0 | — | **P3 · HOIA.** Väike universaalne reduced-motion kiht. Sobib globaalsesse mobiilipaketti. |
| `app/styles/mobile/panel-surfaces.css` | Mobiilikiht; Globaalne | 104 r / 3.7 KB | 23 (9 str.) | 0 | — | **P0 · EEMALDA LÕPLIK OVERRIDE-KIHT.** 23 `!important`-i ainult 30 deklaratsioonist. “Final mobile surface contract” tähendab, et varasemad omanikud pole selged; vii väärtused shared surface primitiivi ja kustuta lõpuparandus. |
| `app/styles/mobile/platform-android.css` | Mobiilikiht; Globaalne | 11 r / 0.4 KB | 5 (4 str.) | 0 | — | **P1 · PIIRA.** Wrapper impordib praegu policy ja profile Androidi reeglid globaalselt. Jäta siia ainult tõesti platvormiülene browser fix; feature-importid vii feature entrypointidesse. |
| `app/styles/mobile/scroll-panels.css` | Mobiilikiht; Globaalne | 285 r / 11.2 KB | 15 (9 str.) | 3 | — | **P0 · JAGA.** “Shared” fail sisaldab konkreetseid workspace/invite klasse ja 15 `!important`-i. Erista universaalne scroll primitive ning feature-adapterid. |
| `app/styles/mobile/subpage-title-system.css` | Mobiilikiht; Globaalne | 401 r / 12.9 KB | 21 (16 str.) | 6 | — | **P0 · JAGA PRIMITIIVIKS.** 401 rida ja 50 klassi ühe title-systemi kohta näitab, et fail tunneb liiga paljusid lehti. Loo 3–5 semantilist klassi/React-komponenti ning vii route-spetsiifilised nihked omanikele. |
| `app/styles/mobile/touch-controls.css` | Mobiilikiht; Globaalne | 136 r / 5.2 KB | 25 (0 str.) | 0 | — | **P1 · REFAKTORI KOMPONENDIKS.** Kõik 25 `!important`-i on paint/interaction tüüpi, mitte geomeetria. Ühine Button/OptionCard variant vähendaks vajadust globaalse coarse-pointer override’i järele. |

### 14. Shared

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/shared/glass-core.css` | Jagatud primitive; Globaalne | 214 r / 5.5 KB | 3 (3 str.) | 7 | — | **P1 · HOIA.** Sobiv ühine primitiiv. Ristselectorid home/background ja foundationsiga näitavad, et teised failid muudavad primitiivi; suuna need muutused tokenitesse või variantklassidesse. |
| `app/styles/shared/glass-subpage.css` | Jagatud primitive; Globaalne | 490 r / 17.1 KB | 18 (14 str.) | 9 | — | **P0 · JAGA STRUKTUUR/TOKEN.** 490 rida ja 18 `!important`-i, neist 14 struktuursed. Erista `GlassSubpageSurface` struktuur, scroll primitive ja teema tokenid; lehespetsiifilised selectorid ei tohiks siin olla. |
| `app/styles/shared/login-a11y.css` | Jagatud primitive; Globaalne | 330 r / 8.6 KB | 1 (0 str.) | 10 | — | **P0 · JAGA KAHEKS KOMPONENDIKS.** Login ja accessibility modal on eri komponendid ning fail kattub nende mobile failidega. Tee `LoginModal.module.css` ja `AccessibilityModal.module.css`. |
| `app/styles/shared/register.css` | Jagatud primitive; Globaalne | 355 r / 10.5 KB | 7 (1 str.) | 6 | — | **P1 · MODULEERI.** Register/login shared controls on arusaadav, kuid globaalsed klassid ja keeleerandid tekitavad route’ideülest mõju. Muuda CSS Module’iks või shared form-primitivideks. |
| `app/styles/shared/ui-glow.css` | Jagatud primitive; Globaalne | 607 r / 23.1 KB | 118 (11 str.) | 0 | — | **P0 · ARHITEKTUURNE ÜMBEREHITUS.** 118 `!important`-i 158 deklaratsioonist. Üks fail kontrollib glow-raame, invite’i, orbitit, HC-d ja teemasid. Tee `GlowFrame`/`EdgeLight` komponendid selgete variantidega ning kasuta semantic tokeneid. |
| `app/styles/shared/workspace-guide.css` | Jagatud primitive; Globaalne | 273 r / 8.6 KB | 33 (21 str.) | 3 | — | **P0 · JAGA.** Workspace guide geomeetria, embedded invite ja help listings on koos; 33 `!important`-ist 21 on struktuursed. Jäta guide baas siia, vii embed-adapterid vastavatesse feature-failidesse. |

### 15. Teemad

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/theme/dark.css` | Globaalne teema; Globaalne | 379 r / 14.5 KB | 14 (0 str.) | 0 | `theme-dark` | **P1 · PIIRA TOKENITELE.** Tume teema on suhteliselt kompaktne. Jäta root-tokenid; feature selectorid vii route-owned theme failidesse. `theme-dark` staatiline kandidaat võib olla init-scripti loogikaga vastuolus, sest script lisab pigem night/mono klasse. |
| `app/styles/theme/hc.css` | Globaalne teema; Globaalne | 1835 r / 64.4 KB | 16 (1 str.) | 4 | `glass-policy-back` | **P0 · JAGA FEATURE’ITE VAHEL.** 1835 rida ja 185 globaalset klassi. Fail sisaldab chat, invite, documents, profile, materials, service-map, home jne. Jäta globaalseks ainult HC tokenid ja universaalsed accessibility normalizerid; kõik muu feature `hc.css`-idesse. |
| `app/styles/theme/light.css` | Globaalne teema; Globaalne | 388 r / 15.4 KB | 2 (0 str.) | 1 | — | **P1 · PIIRA TOKENITELE.** Valge teema on valdavalt tokenikiht, kuid üksikud komponendireeglid tekitavad ristomandust. Hoia siin ainult juure semantic tokenid. |
| `app/styles/theme/mid.css` | Globaalne teema; Globaalne | 636 r / 22.5 KB | 3 (0 str.) | 2 | — | **P0 · JAGA.** 636 rida ja 40 reeglit: teema fail on märksa selectoririkkam kui light/dark/night. Tõsta feature-override’id feature theme failidesse ja jäta root-tokenid. |
| `app/styles/theme/mono.css` | Globaalne teema; Globaalne | 757 r / 32.1 KB | 24 (1 str.) | 1 | — | **P0 · JAGA FEATURE’ITE VAHEL.** 757 rida, 75 klassi ja selectoripõhised workspace/materials/profile override’id. Jäta mono tokenid juurele; route/component override’id liiguta omanikele. |
| `app/styles/theme/night.css` | Globaalne teema; Globaalne | 283 r / 10.5 KB | 3 (0 str.) | 1 | — | **P1 · PIIRA TOKENITELE.** Kompaktne teema. Nagu teised standardteemad, peaks sisaldama ainult semantic tokeneid; feature selectorid route-theme failidesse. |

### 16. Tokenid

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/tokens.css` | Tokenid; Globaalne | 498 r / 16.6 KB | 0 (0 str.) | 1 | — | **P0 · STRUKTUREERI.** 498 rida ja suur hulk eri taseme custom property’sid. Jaga foundations (`spacing`, `type`, `motion`, `z`, `color`) ja semantic component tokeniteks; lisa nimereegel ning väldi feature tokenite globaalset kuhjumist. |
| `app/styles/tokens/base.css` | Tokenid; Globaalne | 4 r / 0.2 KB | 0 (0 str.) | 0 | — | **P0 · EEMALDA VÕI TÄIDA.** Globaalselt imporditud, kuid tühi placeholder. Praegu tekitab vale mulje, et base-tokenid on migreeritud; eemalda kuni kasutuseni või lõpeta migratsioon. |

### 17. Utilities

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `app/styles/utilities/glass-ring-stable.shared.css` | Utility / compatibility; Globaalne | 38 r / 1.0 KB | 1 (0 str.) | 0 | — | **P1 · VOLI GLASS-OMANIKKU.** Kolme reegliga patch-fail ja üks `!important`. Kui testid lubavad, foldi `shared/glass-subpage.css` või päris GlassRing komponenti; `.shared` failinimi ei kirjelda omanikku. |
| `app/styles/utilities/helpers-core.css` | Utility / compatibility; Globaalne | 7 r / 0.3 KB | 0 (0 str.) | 0 | — | **P2 · AJUTISELT HOIA.** Aktiivne compatibility aggregator. Pärast shared-failide otseimporti eemalda; uusi reegleid siia mitte lisada. |
| `app/styles/utilities/helpers-invite-scrollbar.css` | Utility / compatibility; Globaalne | 4 r / 0.1 KB | 0 (0 str.) | 0 | — | **P2 · VII INVITE’I.** Üks invite scrollbar reegel eraldi utilities failis on killustatus. Vii invite-modal või invite/mobile faili. |
| `app/styles/utilities/helpers.css` | Utility / compatibility; Globaalne | 3 r / 0.1 KB | 0 (0 str.) | 0 | — | **P2 · LAMESTA.** Kolmekordne aggregatorikiht (`globals → helpers → helpers-core → shared`). Pärast import orderi testimist impordi shared-failid otse ja eemalda wrapperid. |

### 18. Komponentide CSS

| Fail | Roll / laadimine | Maht | `!important` | Ristselectorid | Staatilised kandidaadid | Otsus ja tegevus |
|---|---|---:|---:|---:|---|---|
| `components/CenteredScrollPicker.css` | Komponendi globaalne CSS; Route/komponent (3 otsest importijat) | 336 r / 7.8 KB | 19 (3 str.) | 8 | — | **P0 · MUUDA CSS MODULE’IKS.** Globaalne komponent-CSS imporditakse mitmest komponendist ning AccessibilityModal override’ib seda eraldi. CSS Module + `variant="accessibility"` eemaldaks globaalsed selectorid ja 19 `!important`-i. |
| `components/TextAnimations/CircularText/CircularText.css` | Komponendi globaalne CSS; Route/komponent (1 otsest importijat) | 137 r / 2.5 KB | 0 (0 str.) | 5 | — | **P1 · MUUDA CSS MODULE’IKS.** Komponent on iseseisev, kuid global classid kattuvad home/backgroundiga. Moduleeri ja lase avalehel anda tokenid/props, mitte selector override’e. |
| `components/backgrounds/ColorBends.css` | Komponendi globaalne CSS; Route/komponent (1 otsest importijat) | 6 r / 0.1 KB | 0 (0 str.) | 0 | — | **P3 · HOIA.** Üks lihtne komponendireegel; risk väike. CSS Module oleks järjepidevam, kuid pole prioriteet. |
| `components/chat/LeftRail.module.css` | CSS Module; Route/komponent (1 otsest importijat) | 290 r / 7.0 KB | 55 (37 str.) | 15 | — | **P0 · VÄHENDA OVERRIDE’E.** Shared `rail.module.css` kasutus `composes` kaudu on hea, kuid 55 `!important`-ist 37 on struktuursed. Tõsta ühine mobile/visibility loogika shared raili ja jäta vasakule ainult küljespetsiifiline geomeetria. |
| `components/chat/RightRail.module.css` | CSS Module; Route/komponent (1 otsest importijat) | 307 r / 6.9 KB | 75 (49 str.) | 17 | — | **P0 · VÄHENDA OVERRIDE’E.** Sama probleem kui vasakul: 75 `!important`-i, neist 49 struktuursed. Kaks raili peaksid jagama olekuvariante, mitte kordama visibility/mobile reegleid. |
| `components/chat/WorkspacePanel.module.css` | CSS Module; Route/komponent (2 otsest importijat) | 1215 r / 37.5 KB | 163 (47 str.) | 3 | `workspace-feature-flat-section` | **P0 · JAGA KOHE.** 1215 rida, 118 reeglit ja 163 `!important`-i. Fail kujundab paneli, dashboard-kaarte, role-menu’d, invite’i, help-listingsi, documents’i ja kovisiooni. Jaga shell, dashboard grid/cards, role controls ja feature adapters. |
| `components/chat/rail.module.css` | CSS Module; Kaudne (`composes`) | 309 r / 8.8 KB | 10 (1 str.) | 11 | — | **P1 · HOIA + TUNNISTA KAUDNE IMPORT.** Fail ei ole surnud: Left/RightRail kasutavad seda `composes from` kaudu. Lisa auditis/buildis composes-sõltuvuste tugi; vähenda shared tooltipi teema-selectoreid tokeniteks. |
| `components/covision/CovisionPage.module.css` | CSS Module; Route/komponent (1 otsest importijat) | 806 r / 28.1 KB | 163 (24 str.) | 7 | `cancelButton`, `documents-dropdown--open-up` | **P0 · JAGA.** 806 rida ja 163 `!important`-i. Jaga page shell, stages, call controls, messages, summary; `cancelButton` ja üks dropdown variant näivad staatiliselt kasutamata, kuid kinnita runtime. |
| `components/effects/Components/OrbitalMenu/OrbitalMenu.css` | Komponendi globaalne CSS; Route/komponent (2 otsest importijat) | 2018 r / 63.4 KB | 155 (9 str.) | 8 | — | **P0 · MODULEERI + JAGA.** 2018 rida ja ~63 KB ühe komponendi kohta. Globaalne CSS sisaldab desktop/mobile, dock, themes, HC ja invite seoseid. Eemalda profile/mono täpsed duplikaadid ning jaga base/layout/themes. |
| `components/ui/BorderGlow.module.css` | CSS Module; Route/komponent (1 otsest importijat) | 353 r / 15.3 KB | 62 (2 str.) | 3 | — | **P0 · MUUDA VARIANT-API-ks.** CSS Module on hea, kuid 62 `!important`-i 132 deklaratsioonist tähendab, et komponent sunnib väliseid pindu. Defineeri mõõt/blur/intensity tokenid või props-variandid ja vähenda parent selector’eid. |
| `components/ui/PageInfoButton.module.css` | CSS Module; Route/komponent (1 otsest importijat) | 241 r / 5.9 KB | 4 (0 str.) | 0 | `detailSection`, `detailsList`, `infoContent`, `infoTitle`, `introBlock` | **P0 · EEMALDA DUPLIKAATNE CSS.** `infoContent`, `introBlock`, `introText`, `detailsList` ja `detailSection` on JSX-is inline-style’idena, mitte module classidena; lisaks `infoTitle` ei paista kasutuses. Vali CSS või inline üks omanik ja kustuta teine. |
| `components/ui/SotsiaalAILoader.module.css` | CSS Module; Route/komponent (1 otsest importijat) | 71 r / 1.2 KB | 0 (0 str.) | 4 | `glowHidden` | **P2 · KONTROLLI SURNUD KLASSE.** Väike ja puhas module. `glowHidden` ei paista lähtekoodis kasutuses; eemaldada pärast loaderi olekute testi. |
| `components/wellbeing/WellbeingPage.module.css` | CSS Module; Route/komponent (14 otsest importijat) | 1345 r / 39.4 KB | 90 (46 str.) | 7 | Dünaamilised `quickCheckSignal_*` — mitte surnud | **P0 · JAGA KOHE.** 1345 rida, 146 reeglit, 90 `!important`-i. Jaga page shell, tool grid, form primitives, output cards ja workflow-spetsiifilised osad. `quickCheckSignal_*` ei ole surnud — neid kasutatakse dünaamilise `styles[\`quickCheckSignal_${signal}\`]` kaudu. |

## Konkreetsed surnud või kahtlased kandidaadid

- **Kindlalt eemaldatav:** `app/styles/components/documents-mode.css` — reegleid ja importe pole.
- **Tõenäoliselt eemaldatav:** `app/styles/components/chat-focus.css` — aktiivset importijat ei leitud.
- **Mitte surnud:** `components/chat/rail.module.css` — kasutatakse `composes from` kaudu.
- **Mitte surnud:** Leafleti klassid service-map failides — kolmanda osapoole runtime DOM.
- **Mitte surnud:** Wellbeing `quickCheckSignal_*` — dünaamiline CSS Module’i võti.
- **Kõrge tõenäosusega surnud/duplitseeritud:** PageInfo `infoContent`, `introBlock`, `introText`, `detailsList`, `detailSection`; JSX kasutab nende asemel inline style-objekte.
- **Kontrolli:** `SotsiaalAILoader.module.css` → `glowHidden`; `CovisionPage.module.css` → `cancelButton`; `WorkspacePanel.module.css` → `workspace-feature-flat-section`; documents dropdowni alignment/open-up variandid.

## Esimene turvaline muudatuspakett

1. Kustuta kaks kasutamata compatibility-faili ja eemalda nende võimalikud vanad viited.
2. Paranda auditiskript, et see tunneks `composes from` sõltuvusi.
3. Tee PageInfo puhul üks otsus: kas geomeetria CSS Module’is või inline style’ides; praegu on mõlemad.
4. Vii `home/background.css` ja home osa `home-scroll.css` avalehe entrypoint’i.
5. Vii policy/profile Android CSS globaalsest platform-ahelast feature entrypoint’idesse.
6. Alles seejärel alusta `service-map/desktop.css` split’i, sest see annab suurima selgusevõidu ühe failiga.
