# RAG susteem ja admin-lehed

Kuupaev: 2026-04-10

See dokument kirjeldab SotsiaalAI praegust RAG susteemi ning `/admin/rag`
admin-alas olevaid nelja pohilehte:

1. `Dokumendid`
2. `Ingest`
3. `KOV`
4. `Organisatsioonid`

`/admin/rag` ise on tooleht, kust need neli suunda avanevad.

## 1. Milleks see RAG susteem siin projektis on

Selles repos ei ole RAG ainult yks admini lisamoodul. Sama RAG teenus toidab
mitut eri kasutusjuhtu:

- vestluse teadmistepohist vastamist
- dokumendiagendi retrievalid ja allikapohist mustandi loomist
- admini kaudu hallatavat teadmistebaasi
- KOV ja organisatsioonide kasitsi ettevalmistatud sisupakette

Peamine pohimote on:

- veebirakendus haldab kasutajavooge, admin-UI-d ja domeeniloogikat
- eraldi Python/FastAPI RAG teenus teeb chunkingu, embeddingud, registri ja
  otsingu
- koik teadmised jooksevad lopuks yhte RAG teenusesse, mitte mitmesse eri
  embeddingu pipeline'i

## 2. Arhitektuuri ylevaade

RAG susteemi peamised kihid on:

### 2.1 Next.js veebirakendus

Veebirakendus sisaldab:

- admin-vaateid `/admin/rag/*`
- proxyt `/api/rag/[...path]`, mis vahendab admini generic RAG kutsed edasi
  Python teenusesse
- domeenispetsiifilisi admin endpoint'e KOV-idele ja organisatsioonidele
- chati ja dokumendiagendi integratsiooni sama RAG teenusega

Olulised failid:

- `app/api/rag/[...path]/route.js`
- `app/api/rag/selftest/route.js`
- `lib/documents/ragService.js`
- `app/admin/rag/*`
- `components/admin/rag/*`

### 2.2 Python RAG teenus

Eraldi teenus asub kaustas `rag-service/` ja teeb:

- failide/texti analyysi
- chunkingu
- embeddingute loomise OpenAI kaudu
- Chroma persistentse vektorsalvestuse
- semantilise otsingu
- dokumentide registri halduse

Peamised endpointid:

- `GET /health`
- `GET /documents`
- `GET /documents/{doc_id}`
- `GET /documents/{doc_id}/source`
- `POST /search`
- `POST /ingest/url`
- `POST /ingest/pdf-with-metadata`
- `POST /ingest/articles`
- `POST /ingest/text`
- `POST /documents/{doc_id}/reindex`
- `POST /documents/{doc_id}/update-meta`
- `DELETE /documents/{doc_id}`

Peamine fail:

- `rag-service/main.py`

### 2.3 Proxy ja turvakiht

Generic admin-kutsed kaivad labi `/api/rag/[...path]` proxy:

- kontrollib admin-oigusi
- lisab `X-API-Key`
- rakendab rate limit'i
- piirab vaikimisi valiseid hoste
- hoiab response'id `no-store`

See on oluline, sest UI ei raagi otse RAG teenusega.

### 2.4 Domenipohised manual ingest vood

KOV ja organisatsioonide ingest ei kaigu otse generic proxy kaudu samal moel
nagu URL voi PDF ingest.

Nende puhul on voog:

1. admin laeb failid yles lokaalsesse salvestusse
2. backend valideerib failide sisu
3. backend arvutab valmisoleku ja blokeerivad probleemid
4. backend loeb vajalikud failid kokku
5. backend saadab lopliku teksti ja metadata `ragServiceRequest(..., "/ingest/text")`
   kaudu Python RAG teenusesse

See annab rohkem kontrolli kui generic ingest, sest KOV-idel ja
organisatsioonidel on kindel paketistruktuur.

## 3. Pohiandmevood

Praeguses susteemis on sisuliselt kolm eri ingest-tyypi.

### 3.1 Generic ingest

Meldud yleiste admin-materjalide jaoks:

- URL ingest
- PDF + metadata ingest
- artiklite lisamine olemasoleva PDF/docId kylge

Need vood kirjutavad dokumendid RAG registrisse ja teevad need kohe
`Documents` vaates nahtavaks.

### 3.2 KOV ingest

Meldud kohalike omavalitsuste jaoks, kus sisu koostatakse enne failipaketiks.

KOV poolel on kaks eri teadmiskihti:

- KOV veebikiht
- Riigi Teataja kiht

Need ingestitakse eraldi ja neil on eraldi staatused, failid, docId-d ja
kontrollid.

### 3.3 Organisatsioonide ingest

Meldud MTU-dele, sihtasutustele, teenuseosutajatele, partneritele ja teistele
olulistele teemaveebidele.

Ka siin koostatakse enne failipakett, valideeritakse see ja alles siis
saadetakse loplik `rag.md` koos metadata'ga RAG teenusesse.

## 4. Neli admin-lehte

## 4.1 Dokumendid

Route:

- `/admin/rag/documents`

Peamine eesmark:

- olla olemasoleva RAG registri peavaade
- koondada dokumentide nimekiri, detailvaade ja dokumendihalduse baasloogika

See leht ei ole ainult lihtne list. See on jagatud kolmeks sisemiseks alaks:

- `Register`
  olemasolevad dokumendid, filtrid, detailpreview, bulk reindex
- `Allikate loogika`
  millistest hostidest, failidest ja source type'idest register praegu koosneb
- `Mallid ja reeglid`
  metadata mallide ja dokumendihalduse vaikepohja koondvaade

Pohifunktsioonid:

- otsing dokumentide seest
- filtrid sektsiooni, audience'i, allika, aasta, issue ja tagide jargi
- detailvaade valitud dokumendile
- `FILE` tyybi dokumentidel metadata muutmine modalist
- reindex yhte voi mitut dokumenti korraga
- dokumendi kustutamine
- algallika avamine

Tehniline roll susteemis:

- see leht naitab, mis on juba RAG registris olemas
- see aitab hinnata allikate kvaliteeti ja metadata seisu
- see on generic ingesti tulemi peamine kontrollpunkt

Olulised failid:

- `components/admin/rag/RagAdminDocumentsView.jsx`
- `components/admin/rag/useRagAdminController.jsx`

Peamised API-d:

- `GET /api/rag/documents`
- `POST /api/rag/documents/{doc_id}/reindex`
- `POST /api/rag/documents/{doc_id}/update-meta`
- `DELETE /api/rag/documents/{doc_id}`
- `GET /api/rag/documents/{doc_id}/source`

## 4.2 Ingest

Route:

- `/admin/rag/ingest`

Peamine eesmark:

- olla koikide generic manual ingest voogude yhine tooleht

See leht kasutab sama controllerit mis `Documents`, aga vaatab susteemi teise
nurga alt:

- `Documents` naitab, mis juba sees on
- `Ingest` tegeleb sellega, kuidas uus sisu sisse tuleb

Pohifunktsioonid:

- URL ingest
- PDF + metadata ingest
- artiklite lisamine olemasoleva `docId` juurde
- metadata JSON kontroll enne ingestit
- metadata mallide avamine ja kasutamine
- RAG selftest
- registri refresh

Ingesti alamvood:

### URL ingest

Admin sisestab:

- URL-i
- audience'i
- soovi korral pealkirja
- kirjelduse
- tagid

See saadetakse edasi endpointi:

- `POST /api/rag/ingest/url`

### PDF + metadata ingest

Admin annab:

- PDF faili
- metadata JSON faili voi tekstina JSON-i
- audience'i

Enne saatmist saab metadata kontrollida. Mallid on `public/rag-meta-templates/`
all.

Endpoint:

- `POST /api/rag/ingest/pdf-with-metadata`

### Artiklite ingest

See voog on moteldud olukorraks, kus yhest alusdokumendist tahetakse eraldi
artikleid voi sisulisi alamosi registrisse tuua.

Admin annab:

- `docId`
- articles JSON faili voi teksti

Endpoint:

- `POST /api/rag/ingest/articles`

### Selftest

Selftest kontrollib kolme asja:

- kas RAG teenusega saab yhendada
- kas search endpoint vastab
- kas OpenAI Responses pool tootab

Endpoint:

- `POST /api/rag/selftest`

Olulised failid:

- `components/admin/rag/RagAdminIngestView.jsx`
- `components/admin/rag/useRagAdminController.jsx`
- `public/rag-meta-templates/*`

## 4.3 KOV

Route:

- `/admin/rag/kov`

Peamine eesmark:

- hallata kohalike omavalitsuste admin-pakette enne RAG-i saatmist

See on generic ingestist palju rangem vaade. KOV haldus eeldab, et sisu on
koostatud kindla failikomplektina ning admin kontrollib selle enne ingestit yle.

KOV poolel on kaks eri kihti:

- `KOV_WEB`
- `RT` ehk Riigi Teataja kiht

### KOV veebikihi required failid

- `{slug}.sources.json`
- `{slug}.json`
- `{slug}.meta.json`
- `{slug}.rag.md`

### RT kihi required failid

- `{slug}.rt.json`
- `{slug}.rt.md`

Pohifunktsioonid:

- KOV-ide nimekiri filtrite ja bulk actions'itega
- detailpaneel konkreetse KOV-i haldamiseks
- linkide, staatuste ja markuste muutmine
- failide upload ja eemaldamine
- failide uuesti valideerimine
- KOV veebikihi ingest
- RT kihi ingest
- light check ehk allikate muutusekontroll
- bulk revalidate / ingest / light check valitud KOV-idele

Oluline domeeniloogika:

- KOV admin seotakse `municipality` baasandmetega
- admin-kirjeid seed'itakse automaatselt omavalitsuste tabeli pealt
- valmisolek arvutatakse failide olemasolu, valideerituse ja staatuste pohjal
- KOV veebikiht ja RT kiht elavad eraldi ingest-state'ides

KOV ingesti docId mustrid:

- KOV veeb: `kov-{slug}`
- RT: `kov-rt-{slug}`

KOV ingesti kollektsioonid:

- veebikiht: `kov_services`
- RT kiht: `kov_regulations`

KOV lehe tegelik roll on olla vahekiht:

- enne ingestit: kvaliteedikontroll, failihaldus, valmisolek
- parast ingestit: staatus, viimase ingest'i aeg, errorid, muutusekontroll

Olulised failid:

- `components/admin/rag/RagAdminKovView.jsx`
- `components/admin/rag/kov/useKovAdminController.jsx`
- `lib/admin/rag/kov/service.js`
- `lib/admin/rag/kov/shared.js`
- `lib/admin/rag/kov/validation.js`

Peamised API-d:

- `GET /api/admin/rag/kov`
- `PATCH /api/admin/rag/kov/{slug}`
- `POST /api/admin/rag/kov/{slug}/files`
- `DELETE /api/admin/rag/kov/{slug}/files/{role}`
- `POST /api/admin/rag/kov/{slug}/revalidate`
- `POST /api/admin/rag/kov/{slug}/revalidate-rt`
- `POST /api/admin/rag/kov/{slug}/ingest`
- `POST /api/admin/rag/kov/{slug}/ingest-rt`
- `POST /api/admin/rag/kov/{slug}/light-check`
- `POST /api/admin/rag/kov/{slug}/light-check-rt`

## 4.4 Organisatsioonid

Route:

- `/admin/rag/organizations`

Peamine eesmark:

- hallata organisatsioonipohiseid RAG sisupakette eraldi domeenina

See vaade on moteldud:

- MTU-dele
- sihtasutustele
- teenuseosutajatele
- partneritele
- teemaveebidele
- avalikele asutustele

Organisatsiooni required core failid:

- `{slug}.sources.json`
- `{slug}.json`
- `{slug}.meta.json`
- `{slug}.rag.md`

Lisaks voib olla:

- attachments ehk lisafailid

Pohifunktsioonid:

- organisatsioonide tabel koos filtritega
- detailvaade pysiandmete muutmiseks
- crawl readiness staatus
- core file paketi ylevaade
- core failide upload, download, remove
- lisafailide haldus
- core failide revalidate
- yksik- ja bulk ingest

Valmisoleku loogika:

- `PLANNED` = alles planeeritud
- `REVIEW` = vajab ylevaatust
- `READY` = sisupakett ja staatus lubavad ingestit

Package summary eristab:

- kas failid on puudu
- kas failid on vigased
- kas koik core failid on olemas ja valiidse sisuga
- kas organisatsioon on ingestiks markitud valmis

Organisatsiooni ingesti docId:

- `organization-{slug}`

Organisatsiooni ingesti kollektsioon:

- `organization_resources`

Olulised failid:

- `components/admin/rag/RagAdminOrganizationsView.jsx`
- `components/admin/rag/organizations/useOrganizationAdminController.jsx`
- `lib/admin/rag/organizations/service.js`
- `lib/admin/rag/organizations/shared.js`
- `lib/admin/rag/organizations/validation.js`

Peamised API-d:

- `GET /api/admin/rag/organizations`
- `PATCH /api/admin/rag/organizations/{slug}`
- `POST /api/admin/rag/organizations/{slug}/files`
- `DELETE /api/admin/rag/organizations/{slug}/files/{fileId}`
- `POST /api/admin/rag/organizations/{slug}/revalidate`
- `POST /api/admin/rag/organizations/{slug}/ingest`
- `POST /api/admin/rag/organizations/ingest`

## 5. Kuidas need neli lehte omavahel seotud on

Neid tasub vaadata kui yht admin-workflow'd, mitte nelja eraldiseisvat ekraani.

### Dokumendid

Vastus kysimusele:

- mis on RAG registris juba olemas

### Ingest

Vastus kysimusele:

- kuidas uus yleine sisu RAG registrisse sisse tuua

### KOV

Vastus kysimusele:

- kuidas hallata omavalitsuste spetsiaalset, failipaketil pohinevat sisukihti

### Organisatsioonid

Vastus kysimusele:

- kuidas hallata organisatsioonide spetsiaalset, failipaketil pohinevat sisukihti

Teisisonu:

- `Documents` ja `Ingest` katavad generic admin-RAG flow'd
- `KOV` ja `Organisatsioonid` katavad spetsialiseeritud sisupaketid

## 6. Mida see admin-ala praegu EI tee

Oluline piir:

- KOV ja organisatsioonide algne korje ei toimu siin vaates automaatselt
- admin ei crawli ise kogu veebi otsast lopuni
- see ala haldab valmis voi poolvalmis pakette, kontrollib neid ja saadab need
  teadlikult RAG-i

See on tahtlik. Praegune admin-susteem on:

- kvaliteedi filter
- ingesti juhtimispunkt
- registri kontrollvaade

mitte yleine automaatcrawl platform.

## 7. Luhike kokkuvote

SotsiaalAI RAG susteem koosneb eraldi Python RAG teenusest ja Next.js
admin/veebikihist, mis selle teenusega suhtleb.

`/admin/rag` neli pohilehte jagavad vastutuse nii:

- `Dokumendid` = registri ja olemasoleva sisu haldus
- `Ingest` = generic manual ingest vood
- `KOV` = omavalitsuste kahekihiline failipohine ingestihaldus
- `Organisatsioonid` = organisatsioonide failipohine ingestihaldus

Koik neli kokku moodustavad admini tootsoo, mille kaudu saab RAG teadmistebaasi
vaadata, kontrollida, ette valmistada ja sihiparaselt uuendada.
