# Teenuseprofiil, Teenusekaart ja Eelpöördumised

Seis: 2026-05-05  
Staatus: kontseptsiooni ja tehnilise vundamendi arendus on alanud.

## Eesmärk

Ehitada SotsiaalAI-s seotud süsteem, kus:

- teenuseosutaja haldab oma teenuseprofiili;
- avaldatud teenuseprofiil loob süsteemse kaardikirje;
- teenusekaart kuvab KOV kontaktide ja teenuseosutajate markereid;
- eelpöördumise töövoos saab valida adressaadiks KOV kontakti või teenuseosutaja;
- avaldatud teenuseprofiili info muutub AI assistendile leitavaks eraldi teenuseosutajate teadmuskihina.

## Mõisted

| Mõiste | Tähendus |
| --- | --- |
| Teenuseprofiil | Teenuseosutaja haldusvaade. Ei ole sama asi kui kasutaja konto profiil. |
| Teenusekaart | Päris kaardivaade markeritega. Ei ole andmesisestuse koht. |
| Eelpöördumine | Pöördumise/kirja koostamise töövoog koos adressaadi valikuga. |
| ServiceMapEntry | Sisemine struktureeritud kaardikirje, mida kaart ja eelpöördumised kasutavad. |
| AI teenuseosutajate kiht | Avaldatud teenuseprofiilidest loodud RAG/teadmuskirjed assistendi jaoks. |

## Rollireeglid

- `CLIENT`: näeb töölaual `Eelpöördumised` ja `Teenusekaart`.
- `SOCIAL_WORKER`: näeb töölaual `Eelpöördumised` ja `Teenusekaart`.
- `SERVICE_PROVIDER`: näeb töölaual `Eelpöördumised`, `Teenusekaart` ja `Teenuseprofiil`.
- `ADMIN`: peab esialgu saama töölaual kõiki kolme uut funktsiooni kasutada, sõltumata aktiivsest eelvaaterollist.

Oluline: `Teenuseprofiil` ei ole `CLIENT` ega `SOCIAL_WORKER` töölaual kuvatav funktsioon.

## Tehtud

### Töölaua ja navigatsiooni vundament

- Lisatud eraldi töölaud vestlusvaatesse.
- Lisatud rightraili `Töölaud` ikoon.
- Eemaldatud rightrailist `Materjalid` ikoon.
- Eemaldatud left railist `Abisoovid` ja `Abipakkumised`.
- Eemaldatud `+` menüüst töölauale kuuluvad korduvad tegevused.
- `Kuulutused ja vasted` kaart asendatud `Lisa inimene` kaardiga.
- `Lisa inimene` avab kutsevoo ja tagasi/sulge viib kasutaja tagasi töölauale.
- Töölaua paneel ei avane enam vestluse overlay-na, vaid asendab vestluse pinna.
- Töölaua avatud olekus left rail ja right rail on peidetud.
- Töölaua tagasi-nupp ja pealkirja stiil on viidud tellimuse lehega samasse loogikasse.
- Teistelt lehtedelt töölauale naastes taastatakse töölaud enne vaate värvimist, et paneel ei muutuks nähtavalt ümarast kandiliseks.

### Uued funktsioonilehed

Lisatud eraldi route'id:

- `/eelpoordumised`
- `/teenusekaart`
- `/teenuseprofiil`

Töölaua kaardid on suunatud uutele route'idele:

- `Eelpöördumised` -> `/eelpoordumised`
- `Teenusekaart` -> `/teenusekaart`
- `Teenuseprofiil` -> `/teenuseprofiil`

Lisatud ühine klientkomponent:

- `components/workspace/WorkspaceFeaturePage.jsx`

Selles on esialgne UI-vundament:

- eelpöördumise sisend, adressaadi tüüp ja mustandi ala;
- teenusekaardi otsingu/filterpind ja markerite eelvaade;
- teenuseprofiili vorm ja kaardiprofiili/AI väljundite osa.

### Rollipõhine töölaua nähtavus

Muudetud töölaua rolliloogikat:

- `Eelpöördumised` ja `Teenusekaart` jäävad kõigile rollidele;
- `Teenuseprofiil` kuvatakse ainult `SERVICE_PROVIDER` rollile ja adminile;
- adminile antakse töölaual eraldi `isAdmin` signaal, et ta saaks funktsioone testida ka siis, kui admini eelvaateroll on `CLIENT` või `SOCIAL_WORKER`.

### Andmemudeli vundament

Lisatud Prisma skeemi uued enumid:

- `ServiceProviderProfileStatus`
- `ServiceProviderFeeType`
- `ServiceMapEntryType`
- `ServiceMapEntryStatus`
- `ServiceMapGeocodingStatus`

Lisatud Prisma mudelid:

- `ServiceProviderProfile`
- `ServiceMapEntry`

Põhiseosed:

- `User` -> `ServiceProviderProfile[]`
- `ServiceProviderProfile` -> `ServiceMapEntry?`
- `Municipality` -> `ServiceMapEntry[]`

Lisatud migratsioon:

- `prisma/migrations/20260505203000_add_service_provider_profile_and_map_entries/migration.sql`

### Serverikihi vundament

Lisatud helper:

- `lib/serviceProviderProfiles.js`

See sisaldab:

- teenuseprofiili sisendi normaliseerimist;
- teenuseprofiili serialiseerimist;
- `ServiceMapEntry` serialiseerimist;
- teenuseprofiili loomist/uuendamist kasutaja järgi;
- teenuseprofiilist teenuseosutaja tüüpi `ServiceMapEntry` upsert'i;
- avaldatud kaardikirjete listimist teenusekaardi jaoks.

Lisatud API route'id:

- `GET /api/service-provider/profile`
- `PUT /api/service-provider/profile`
- `GET /api/service-map/entries`

Teenuseprofiili API:

- lubab haldust `SERVICE_PROVIDER` rollile;
- lubab haldust adminile;
- seob profiili sisselogitud kasutajaga;
- loob või uuendab sama kasutaja `ServiceProviderProfile` kirje;
- loob või uuendab seotud `ServiceMapEntry` kirje.

Teenusekaardi API:

- tagastab ainult avaldatud ja kindla asukohaga kaardikirjed;
- ei kasuta runtime RAG search'i markerite leidmiseks.

## Pooleli olevad kohad

- Teenuseprofiili UI on ühendatud API suunas, kuid vajab lõplikku testimist pärast Prisma kliendi genereerimist ja migratsiooni rakendamist.
- Teenusekaardi UI kasutab praegu lihtsat visuaalset markerieelvaadet, mitte veel Leaflet/OpenLayers kaarditeeki.
- Eelpöördumiste UI on veel staatiline vundament; mudel, API ja salvestamine on järgmine töö.
- Geokodeerimine on mudelis ette valmistatud, aga adapter Maa- ja Ruumiameti/In-ADS/In-AKS teenuse jaoks on veel lisamata.
- KOV kontaktide sünk `ServiceMapEntry` tabelisse on veel lisamata.
- RAG/AI teenuseosutajate teadmuskihi loomine avaldatud teenuseprofiilist on veel lisamata.

## Tööplaan

### 1. Andmemudel ja migratsioon lõpuni

Eesmärk: panna paika püsiv andmekiht.

Teha:

- valideerida Prisma skeem;
- genereerida Prisma klient;
- rakendada migratsioon andmebaasis;
- lisada baastestid teenuseprofiili normaliseerimisele ja `ServiceMapEntry` olekute tuletamisele;
- kontrollida, et `CLIENT` ja `SOCIAL_WORKER` ei saa API kaudu teenuseprofiili muuta;
- kontrollida, et admin saab teenuseprofiili API-d kasutada.

Acceptance:

- `ServiceProviderProfile` ja `ServiceMapEntry` tabelid on andmebaasis olemas;
- Prisma klient tunneb uusi mudeleid;
- teenuseprofiili salvestamine loob seotud `ServiceMapEntry` kirje.

### 2. Teenuseprofiili MVP

Eesmärk: teenuseosutaja saab hallata teenuseprofiili.

Teha:

- lõpetada `/teenuseprofiil` vormi andmesidumine;
- lisada laadimise, salvestamise, veateate ja õnnestumise olekud;
- lisada väljade serveripoolne valideerimine;
- tagada, et koordinaate kasutaja vormis ei kuvata;
- lisada staatuse loogika: `DRAFT`, `REVIEW`, `PUBLISHED`, `HIDDEN`;
- lisada `mapVisible` lüliti;
- kuvada kaardikirje staatus ja geokodeerimise staatus.

Acceptance:

- `SERVICE_PROVIDER` saab profiili salvestada;
- admin saab profiili testida;
- `CLIENT` ja `SOCIAL_WORKER` ei näe töölaual teenuseprofiili;
- avaldamata profiil ei ilmu teenusekaardile.

### 3. Geokodeerimise adapter

Eesmärk: aadressist tekib süsteemisisene markeriasukoht.

Teha:

- luua `lib/serviceMap/geocoding.js` adapter;
- ette valmistada Maa- ja Ruumiameti/In-ADS/In-AKS aadressiotsingu integratsioon;
- MVP-s võib adapter olla konfigureeritav stub, kuid API kuju peab jääma püsivaks;
- salvestada `normalizedAddress`, `latitude`, `longitude`, `adsObjectId`, `geocodingStatus`, `geocodingRaw`;
- kui vasteid on mitu, märkida `AMBIGUOUS`;
- kui vastet ei leita, märkida `FAILED`;
- mitte avaldada markerit enne kindlat või käsitsi kinnitatud asukohta.

Acceptance:

- aadressi muutmisel saab süsteem geokodeerimise tulemuse salvestada;
- ebakindel aadress ei ilmu kaardile vales kohas;
- teenuseosutaja ei sisesta koordinaate käsitsi.

### 4. Teenusekaart MVP

Eesmärk: päris kaart markeritega.

Teha:

- valida MVP kaarditeek: Leaflet või OpenLayers;
- lisada kaardialuse URL env/config kaudu;
- kuvada `ServiceMapEntry` markerid;
- popup teenuseosutaja markerile;
- popup KOV markerile;
- otsing märksõna järgi;
- filter piirkonna/KOV järgi;
- filter kirje tüübi järgi;
- hiljem kategooria ja sihtrühma filtrid.

Acceptance:

- `/teenusekaart` on päris kaardileht;
- markerid tulevad struktureeritud API-st;
- RAG search'i ei kasutata kaardimarkerite leidmiseks;
- kindla asukohata kirjeid markerina ei kuvata.

### 5. KOV kontaktide sünk

Eesmärk: KOV kontaktid tulevad canonical/KOV andmekihist `ServiceMapEntry` kirjeteks.

Teha:

- kaardistada olemasolev KOV meta/canonical andmekiht;
- luua sünkroonimisskript;
- upsert `ServiceMapEntry` kirjed;
- eristada `KOV_SOCIAL_CONTACT` ja `KOV_GENERAL_CONTACT`;
- säilitada `sourceUrl`, `sourceDocId`, `checkedAt`;
- käivitada geokodeerimine KOV aadressidele.

Acceptance:

- KOV sotsiaalhoolekande kontaktid on teenusekaardil markeritena;
- üldkontakt ei ole ekslikult sotsiaalhoolekande kontakt;
- allika info säilib.

### 6. Eelpöördumised MVP

Eesmärk: kasutaja saab koostada pöördumise mustandi ja valida adressaadi.

Teha:

- lisada `PreInquiry` andmemudel;
- lisada API mustandite loomiseks, uuendamiseks ja listimiseks;
- adressaadid tulevad `ServiceMapEntry` kihist;
- kasutaja saab valida KOV kontakti või teenuseosutaja;
- lisada mustandi salvestamine töölauale;
- lisada kopeerimine ja allalaadimine;
- e-postiga saatmine jääb hilisemaks ja peab nõudma kasutaja kinnitust.

Acceptance:

- kõik rollid näevad eelpöördumisi töölaual;
- kasutaja näeb enda koostatud eelpöördumisi;
- teenuseosutaja/spetsialist saab kokkulepitud vaates näha talle suunatud pöördumisi;
- midagi ei saadeta automaatselt ilma kinnitamiseta.

Seis pärast viimast arenduslõiku:

- lisatud `PreInquiryRecipientType` ja `PreInquiryStatus` enumid;
- lisatud `PreInquiry` Prisma mudel ja migratsioon;
- lisatud `/api/pre-inquiries` GET/POST API;
- eelpöördumiste leht laeb kasutajale nähtavad pöördumised;
- eelpöördumise vorm koostab lokaalse kirjamustandi, laseb valida adressaadi `ServiceMapEntry` kihist, salvestab mustandi ja võimaldab teksti kopeerida;
- teenuseosutajale adresseeritud eelpöördumise puhul seotakse kirje võimalusel teenuseprofiili omanikuga (`recipientOwnerId`);
- kui adressaadi e-post kuulub olemasolevale kasutajakontole, seotakse eelpöördumine selle kontoga ja adressaat näeb seda oma eelpöördumiste vaates;
- lisatud eraldi saatmiskanali mõiste: `INTERNAL` tähendab SotsiaalAI sisemist eelpöördumist kasutajakontode vahel, `EXTERNAL_EMAIL` tähendab välisele KOV/canonical/RAG andmetest pärit e-postile saadetavat kirja;
- `EXTERNAL_EMAIL` kanal ei saada praegu kirja automaatselt; hilisem saatmine peab nõudma kasutaja eraldi kinnitust ja salvestama saatmise aja;
- admin näeb API kaudu kõiki eelpöördumisi, tavakasutaja näeb enda saadetud ja talle adresseeritud kirjeid.
- eelpöördumise lehel on ette valmistatud assistendiga koostamise tööruum, kus hiljem saab olukorra põhjal KOV kontakte ja teenuseprofiile otsida ning kirja koos assistendiga koostada;
- lisatud `/api/pre-inquiries/assist` MVP endpoint, mis otsib struktureeritud `ServiceMapEntry` kihist sobivaid KOV kontakte ja teenuseosutajaid, hindab sisemise/välise kanali võimalust ning tagastab kirjamustandi;
- eelpöördumise assistendi UI saab nüüd küsida adressaadisoovitusi ja täita kirjamustandi endpointi vastuse põhjal;
- lisatud KOV kontaktide `ServiceMapEntry` sünk: `lib/serviceMap/kovContactSync.js` ja `scripts/sync-kov-service-map-entries.mjs`;
- lisatud käsud `npm run service-map:sync:kov:dry` ja `npm run service-map:sync:kov`;
- dry-run leidis olemasolevatest KOV pakettidest 42 kontakti ja plaanis 41 `ServiceMapEntry` kirjet;
- KOV sünk ei kirjuta geokodeeritud kirjet tagasi `PENDING` olekusse, kui aadress ei ole muutunud ja geokodeering on juba kinnitatud;
- sotsiaaltöötaja kontol on `acceptsPreInquiries` vastuvõtu-eelistus; ainult selle lubamisel saab sama e-postiga kasutajakonto platvormisisese eelpöördumise adressaadiks;
- teenuseosutaja teenuseprofiilil on eraldi valikud `acceptsPlatformPreInquiries` ja `acceptsEmailPreInquiries`;
- admin saab eelpöördumise lehel valida töörolli: pöörduja, sotsiaaltöötaja või teenuseosutaja.

### 7. AI/RAG teenuseosutajate kiht

Eesmärk: avaldatud teenuseprofiil muutub assistendile leitavaks.

Teha:

- koostada teenuseprofiilist struktureeritud JSON;
- koostada teenuseprofiilist lühike RAG markdown tekst;
- lisada eraldi `source_type=service_provider_profile`;
- lisada metadata: `municipality_id`, `county`, `service_categories`, `target_groups`, `service_area_municipality_ids`, `providerProfileId`, `serviceMapEntryId`;
- avaldamisel luua/uuendada teadmuskirje;
- peitmisel eemaldada või märkida mitteaktiivseks;
- assistendi vastuses eristada teenuseosutaja enda profiili KOV ametlikest allikatest.

Acceptance:

- assistent saab soovitada avaldatud teenuseosutajaid;
- mustandeid, peidetud ja ülevaatamisel profiile ei soovitata;
- allikaviide näitab, et info pärineb teenuseosutaja profiilist.

## Tehnilised piirangud ja otsused

- Teenusekaart ei tee runtime RAG search'i markerite leidmiseks.
- Teenuseosutaja ei täida koordinaate käsitsi.
- `ServiceMapEntry` tekib süsteemi poolt teenuseprofiili või KOV andmete põhjal.
- Teenuseprofiil on seotud `SERVICE_PROVIDER` kasutajaga, mitte tavalise konto profiiliga.
- Admin peab esialgu saama kõiki kolme uut funktsiooni testida.
- `CLIENT` ja `SOCIAL_WORKER` näevad eelpöördumisi ja teenusekaarti, aga mitte teenuseprofiili.
- Admin saab eelpöördumise ja teenusekaardi vaates valida, millise rolli töövaadet ta testib.

## Seotud failid

Uued või oluliselt muudetud failid:

- `components/chat/WorkspacePanel.jsx`
- `components/chat/WorkspacePanel.module.css`
- `components/workspace/WorkspaceFeaturePage.jsx`
- `components/alalehed/ChatBody.jsx`
- `components/alalehed/chat/ChatBodyView.jsx`
- `app/eelpoordumised/page.jsx`
- `app/teenusekaart/page.jsx`
- `app/teenuseprofiil/page.jsx`
- `app/api/service-provider/profile/route.js`
- `app/api/service-map/entries/route.js`
- `app/api/pre-inquiries/route.js`
- `lib/serviceProviderProfiles.js`
- `lib/preInquiries.js`
- `prisma/schema.prisma`
- `prisma/migrations/20260505203000_add_service_provider_profile_and_map_entries/migration.sql`
- `prisma/migrations/20260505212000_add_pre_inquiries/migration.sql`
- `messages/et.json`
- `messages/en.json`
- `messages/ru.json`

## Arenduslõik: ServiceMapEntry geokodeerimine

Lisatud ServiceMapEntry geokodeerimise MVP kiht:

- `lib/serviceMap/geocoding.js` sisaldab aadressi geokodeerimise adapterit ja tabelikirjete uuendamise teenust;
- `scripts/geocode-service-map-entries.mjs` käivitab geokodeerimise dry-run või rakendamise režiimis;
- lisatud käsud `npm run service-map:geocode:dry` ja `npm run service-map:geocode`;
- vaikimisi ei kutsuta välist geoteenust ja aadress jääb `PENDING` olekusse, kuni provider on seadistatud;
- toetatud on fixture-põhine MVP (`SERVICE_MAP_GEOCODER_PROVIDER=fixture` koos `SERVICE_MAP_GEOCODER_FIXTURES` või `SERVICE_MAP_GEOCODER_FIXTURE_FILE`);
- toetatud on Nominatim adapter (`SERVICE_MAP_GEOCODER_PROVIDER=nominatim`) ajutise MVP variandina, kuni Maa- ja Ruumiameti/In-ADS adapter on täpselt ühendatud;
- mitme vaste korral märgitakse kirje `AMBIGUOUS`, mitte ei valita juhuslikult esimest vastet;
- kindla vaste korral salvestatakse `normalizedAddress`, `latitude`, `longitude`, `adsObjectId`, `geocodingRaw` ja `checkedAt`;
- `NEEDS_REVIEW` või avaldatav KOV kirje tõstetakse kindla vaste korral `PUBLISHED` olekusse;
- `DRAFT` ja `HIDDEN` kirjeid ei avaldata geokodeerimise tõttu automaatselt;
- ilma seadistatud providerita ei luba rakendamise skript mitte-dry-run režiimi, et serveris ei tekiks näiliselt töödeldud, kuid geokodeerimata kirjeid.

Serveris kasutatav järjestus:

1. rakenda Prisma migratsioonid;
2. käivita `npm run service-map:sync:kov`, et KOV kontaktid kirjutada `ServiceMapEntry` tabelisse;
3. seadista geokooder või fixture;
4. kontrolli `npm run service-map:geocode:dry`;
5. rakenda `npm run service-map:geocode`.

Näidis fixture:

```json
{
  "suur-sepa 16 pärnu": {
    "normalizedAddress": "Suur-Sepa tn 16, Pärnu linn, Pärnu maakond",
    "latitude": 58.3857,
    "longitude": 24.4971,
    "adsObjectId": "ADS_TULEVANE_ID"
  }
}
```

Uued seotud failid:

- `lib/serviceMap/geocoding.js`
- `scripts/geocode-service-map-entries.mjs`

## Arenduslõik: Teenusekaardi päris kaardivaade

Lisatud Teenusekaardi esimene päris kaardivaade:

- lisatud Leafleti staatilised vendor-failid `public/vendor/leaflet`, et serveri deploy ei vajaks eraldi `npm install` sammu;
- lisatud `components/workspace/ServiceMapLeaflet.jsx`;
- lisatud `app/styles/components/service-map.css`;
- `/teenusekaart` kasutab nüüd Maa- ja Ruumiameti Eesti aluskaardi TMS kihti `kaart@GMC`;
- tile URL on muudetav env kaudu: `NEXT_PUBLIC_SERVICE_MAP_TILE_URL`;
- Leafleti JS/CSS URL-id on muudetavad env kaudu: `NEXT_PUBLIC_LEAFLET_SCRIPT_URL` ja `NEXT_PUBLIC_LEAFLET_CSS_URL`;
- atribuut on muudetav env kaudu: `NEXT_PUBLIC_SERVICE_MAP_ATTRIBUTION`;
- kaart kasutab Eesti ulatust ja piirab kasutajat Eesti kaardiruumi ümber;
- markerid tulevad ainult struktureeritud `/api/service-map/entries` andmest, mitte RAG runtime otsingust;
- markerid kuvatakse ainult kirjetel, millel on kindlad koordinaadid;
- KOV kontaktid ja teenuseosutajad on markeril visuaalselt eristatud;
- markerile vajutades avaneb kontaktinfo popup;
- vasakul on otsing, piirkonna filter, kirje tüübi filter ja tulemuste loend;
- tulemuste loendis kirjele vajutamine valib vastava markeri kaardil.

Märkus: päris markerite ilmumiseks peab serveris olema:

1. Prisma migratsioonid rakendatud;
2. KOV kontaktide sünk tehtud;
3. aadressid geokodeeritud või käsitsi kinnitatud;
4. kirjed `PUBLISHED` ja `MATCHED`/`MANUALLY_CONFIRMED` olekus.

## Kontrollid

Viimati edukalt läbitud pärast eelpöördumiste MVP lisamist:

- `npx prisma validate`
- `npx prisma generate`
- `npx eslint lib/serviceProviderProfiles.js lib/preInquiries.js app/api/service-map/entries/route.js app/api/pre-inquiries/route.js components/workspace/WorkspaceFeaturePage.jsx`
- `npm run i18n:check`
- `npm run build`

Veel vaja järgmistes lõikudes:

- migratsiooni rakendamise kontroll;
- teenuseprofiili API käsitsi kontroll admini ja teenuseosutaja rolliga.
- eelpöördumise muutmise/arhiivimise API;
- eelpöördumise adressaadiks sotsiaaltöötaja kasutajakonto valimine, kui KOV kontakt on süsteemis konkreetse kontoga seotud;
- välise e-kirja saatmise töövoog `EXTERNAL_EMAIL` kanalile koos selge kasutajakinnituse, saatmislogi ja veakäsitlusega;
- eelpöördumise allalaadimine;
- KOV kontaktide sünk;
- geokodeerimise adapter;
- AI/RAG teenuseosutajate teadmuskihi sidumine.
