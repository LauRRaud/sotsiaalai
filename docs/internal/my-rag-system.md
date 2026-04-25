# My RAG System

See dokument kirjeldab SotsiaalAI praegust RAG-i, otsingu ja vastuse koostamise süsteemi. See ei ole sihtarhitektuur. Sihtarhitektuur ja arenduskava on eraldi failis [rag-architecture.md](./rag-architecture.md).

Praegune süsteem on peamiselt chunk- ja context-põhine RAG:

```text
kasutaja sõnum
→ chat API
→ päringu ja rolli ettevalmistus
→ otsus, kas väliseid allikaid on vaja
→ RAG päringu koostamine
→ rag-service vektorotsing Chroma andmebaasist
→ tulemuste deduplitseerimine, grupeerimine ja järjestamine
→ RAG_CONTEXT prompti
→ OpenAI vastus
→ vastusepõhine allikafiltreerimine
→ vastus + kuvatavad allikad UI-sse
→ vestluse ja allikate salvestamine
```

Oluline täpsustus: süsteemis on nüüd esimene kiht, mis püüab eristada `selected context sources` ja `displayed sources`. See ei ole veel täiuslik väitetaseme attribution, aga see on parem kui varasem loogika, kus allikapaneel võis näidata kõiki mudelile kaasa antud kontekstiallikaid.

Praegune nelja kihi seis:

```text
retrieved candidates
→ rag-service /search tagastab vektorotsingu tulemused

selected context sources
→ retrievalContextAssembler ja ragContext valivad, grupeerivad ja panevad tulemused RAG_CONTEXT-i

answer sources
→ eraldi täielikku claim-level kihti veel ei ole

displayed sources
→ sourceAttribution filtreerib lõpliku vastuse teksti põhjal, mida UI-s näidata
```

## Praegune Andmevoog

1. Kasutaja saadab sõnumi vestluse API-sse.
2. Server normaliseerib rolli, keele, ajaloo ja konteksti.
3. `sourceNeed` otsustab, kas küsimus vajab RAG allikaid.
4. `retrievalOrchestrator` koostab otsingupäringu ja saadab selle RAG teenusesse.
5. `rag-service/main.py` teeb OpenAI embeddingu ja Chroma vektorotsingu.
6. `retrievalContextAssembler` võtab otsingutulemused, deduplitseerib, grupeerib, järjestab ja koostab konteksti.
7. `promptBuilder` paneb kokku system prompti, kasutaja sõnumi ja `RAG_CONTEXT` ploki.
8. `openaiRuntime` kutsub OpenAI mudelit või striimib vastust.
9. `mainResponseHandler` võtab lõpliku vastuse ja kutsub `sourceAttribution` filtrit.
10. `responseFinalizer` ja `persistence` salvestavad vastuse ja lõplikud kuvatavad allikad.
11. Frontend võtab vastuse vastu ja näitab allikapaneelis salvestatud/saadud allikaid.

## Server: Chat API ja Orkestreerimine

### `app/api/chat/route.js`

Vestluse peamine API endpoint. Võtab vastu kasutaja sõnumi, kutsub chat runtime'i ning tagastab vastuse kas tavalise JSON-ina või streaming vastusena.

Roll süsteemis:

- chat päringu sisenemispunkt;
- autentimise, requesti ja vastuse elutsükli algus;
- suunab töö `lib/chat` moodulitesse.

### `app/api/chat/run/route.js`

Chat run endpoint. Kasutatakse vestlusjooksu või alternatiivse käivitusvoo jaoks, sõltuvalt UI ja runtime loogikast.

Roll süsteemis:

- seotud chat requesti serveripoolse käivitamisega;
- oluline kontrollida, kas see kasutab sama RAG pipeline'i või eraldi haru.

### `lib/chat/requestBootstrap.js`

Valmistab requesti serveripoolselt ette.

Roll süsteemis:

- loeb ja normaliseerib sisendi;
- seob kasutaja, rolli, vestluse id ja seaded;
- valmistab ette andmed, mida hilisem RAG ja vastuse koostamine kasutavad.

### `lib/chat/mainRouteRuntime.js`

Peamine chat route runtime'i koondkiht.

Roll süsteemis:

- ühendab requesti ettevalmistuse, harude valiku ja vastuse koostamise;
- aitab hoida route faili õhukesena.

### `lib/chat/mainResponseHandler.js`

Peamine vastuse koostamise ja OpenAI kutsumise handler.

Roll süsteemis:

- kontrollib, kas kontekst on olemas;
- käivitab `callOpenAI` või `streamOpenAI`;
- mitte-stream vastuses filtreerib allikad pärast mudeli vastust;
- stream vastuses kogub vastuse teksti, filtreerib allikad lõpus ja saadab need `done` eventiga;
- kutsub `finalizeAssistantReply`, et vastus ja allikad salvestada.

Praeguse answer-source paranduse keskne koht:

```text
replySources = filterSourcesForReply(aiResult.reply, sources, { query: effectiveMessage })
```

Piirang: see on vastuse teksti ja allikateksti kattuvuse põhine filter, mitte veel claim-level attribution.

### `lib/chat/workflowBranchHandlers.js`

Tegeleb eri töövoogude harudega.

Roll süsteemis:

- otsustab, millal vastus ei lähe tavapärasesse RAG + chat harusse;
- oluline, sest kõik kasutaja sõnumid ei ole tavalised RAG küsimused.

### `lib/chat/orchestrationPolicy.js`

Orkestreerimise poliitika.

Roll süsteemis:

- aitab otsustada, millist vastamise haru või töövoogu kasutada;
- mõjutab kaudselt, kas RAG üldse mängu tuleb.

### `lib/chat/modeSelection.js`

Vestluse või töörežiimi valiku loogika.

Roll süsteemis:

- aitab eristada tavavestlust, dokumenditööd, süvauuringut ja muid režiime;
- mõjutab RAG kasutamise konteksti.

### `lib/chat/workflowModeRouting.js`

Töövoo režiimide route'imine.

Roll süsteemis:

- seob valitud workflow mode'i konkreetse handleriga;
- oluline, kui osa küsimusi ei liigu läbi tavapärase RAG vastuse.

## Server: RAG Vajadus, Otsing ja Kontekst

### `lib/chat/sourceNeed.js`

Otsustab, kas kasutaja küsimus vajab väliseid allikaid.

Praegune loogika:

- tervitused ja lihtne vestlus üldjuhul RAG-i ei käivita;
- sotsiaalvaldkonna terminid koos küsimuse/protseduuri/reegli kavatsusega käivitavad RAG-i;
- seaduse, määruse, paragrahvi, Riigi Teataja või SHS mainimine käivitab RAG-i;
- allikapaneeli või RAG UI probleemi arutelu ei käivita RAG-i.

Roll süsteemis:

- esimene filter, mis hoiab ära mõttetuid otsinguid;
- vähendab olukordi, kus "tere" saab allikatega vastuse.

Piirang:

- see ei ole veel täielik intent classifier;
- ei erista piisavalt formaalselt allikatüüpe nagu `law`, `kov_service_info`, `journal_article`, `historical_source`.

### `lib/chat/retrievalOrchestrator.js`

Koostab RAG päringud ja suhtleb RAG teenusega.

Roll süsteemis:

- ehitab otsinguteksti kasutaja sõnumist ja vajadusel lähiajaloost;
- tunneb ära allika otsimise küsimusi;
- saadab `/search` päringud RAG teenusesse;
- lisab `where` filtreid, kui need on olemas;
- deduplitseerib toored RAG vasted.

Praegune otsing:

- peamiselt semantic vector search läbi RAG teenuse;
- metadata filtreid kasutatakse teatud juhtudel;
- päris BM25/full-text või eraldi exact phrase search kihti siin veel ei ole.

### `lib/chat/retrievalPlanning.js`

Abiloogika retrieval plaanide jaoks.

Roll süsteemis:

- tuvastab ajalisi päringuid;
- koostab ajapõhiseid otsingupäringuid;
- eraldab topic hint'e, mida hiljem rankingus kasutatakse.

Oluline Võimaluste kohviku tüüpi küsimustes:

- topic hint'id võivad aidata täpse teema või fraasi kõrgemale tõsta;
- siiski ei asenda see veel tugevat exact title / exact phrase searchi.

### `lib/chat/requestContext.js`

Koondab requesti lisakonteksti.

Roll süsteemis:

- võtab arvesse vestlusajalugu;
- aitab tuvastada KOV viiteid;
- käsitleb kasutaja üles laaditud ajutist dokumendikonteksti;
- määrab kontekstieelarve ja ephemeral source label'id.

### `lib/chat/retrievalContextAssembler.js`

Paneb retrieval tulemused vastamiseks sobivaks kontekstiks.

Roll süsteemis:

- otsustab, kas väliseid allikaid kasutada;
- koostab päringud;
- kutsub `searchRagQueries`;
- grupeerib ja järjestab tulemused;
- valib konteksti minevad allikad;
- ehitab `RAG_CONTEXT` teksti;
- koostab serverisisesed source objektid UI ja attribution jaoks.

Oluline praegune detail:

- lisab allikatele `evidenceText`, mida `sourceAttribution` kasutab;
- `evidenceText` eemaldatakse enne allika kasutajale saatmist.

Piirang:

- see on veel pigem context assembler kui source package builder;
- allikapaketid ei ole veel canonical item'i põhised tervikobjektid.

### `lib/chat/ragContext.js`

RAG tulemuste normaliseerimine, grupeerimine, ranking ja prompti konteksti renderdamine.

Roll süsteemis:

- normaliseerib RAG vasted ühtseks kujuks;
- grupeerib sama dokumendi või artikli lõigud;
- teeb MMR mitmekesistamist;
- annab topic hint'ide põhjal lisaskoori;
- koostab lühiviited;
- renderdab nummerdatud `RAG_CONTEXT` blokid;
- lõikab konteksti tokeni/märgieelarve järgi.

Praegune ranking:

- kasutab embeddingu skoori;
- lisab topic hint boost'i;
- lisab väikese source quality adjust'i;
- kasutab MMR-i, et vähendada dubleerimist.

Piirang:

- ranking ei ole veel päris reranker;
- puudub tugev claim/source sobivuse hindamine enne prompti;
- exact title ja exact phrase ei ole veel eraldi otsingukihina süsteemis.

### `lib/chat/safety.js`

Ohutus- ja grounding abiloogika.

Roll süsteemis:

- aitab määrata grounding tugevust;
- mõjutab, kui rangelt mudel peab allikatega seotud faktiväiteid käsitlema.

### `lib/chat/settings.js`

RAG ja chat seadete keskne fail.

Roll süsteemis:

- hoiab `RAG_BASE`, `RAG_KEY`, `RAG_TOP_K`, `RAG_CTX_MAX_CHARS`, `CONTEXT_GROUPS_MAX` jms;
- mõjutab otsingu kandidaatide hulka ja prompti konteksti suurust.

### `lib/chat/sourceAttribution.js`

Vastusepõhine allikafiltreerimine.

Roll süsteemis:

- võtab lõpliku vastuse teksti ja konteksti valitud allikad;
- arvutab, millised allikad paistavad vastuses tegelikult kasutatud olevat;
- named-thing küsimuste puhul nõuab, et allikas kattuks kasutaja päringu ankruga;
- eemaldab `evidenceText` enne UI-sse või andmebaasi saatmist.

Näide:

```text
küsimus: "mis on võimaluste kohvik?"
→ allikas peab sisaldama "võimaluste" ja "kohvik" ankruid
→ üldine vaimse tervise või kaasamise artikkel ei tohiks allikapaneeli jääda
```

Piirang:

- see ei tõesta väitepõhiselt, milline lause millisest allikast tuli;
- kui mudel parafraseerib väga abstraktselt, võib filter olla kas liiga range või liiga leebe;
- mudel ise ei väljasta veel struktureeritud `source_id` plokke.

## Server: Promptid ja Mudeli Kutsumine

### `lib/chat/promptBuilder.js`

Koostab OpenAI sõnumid.

Roll süsteemis:

- ehitab lokaliseeritud system prompti;
- lisab `RAG_CONTEXT` ploki;
- lisab grounding sõnumi, kui allikakontekst on nõrk;
- määrab tavalised tervitused ja no-context vastused.

Oluline stiili jaoks:

- siin ja system promptides juhitakse, et assistent ei alustaks vastust kuivalt nagu "Leitud allikates...";
- kui allikas on vana projekt või ajalooline artikkel, peab mudel seda ajakonteksti mainima.

### `lib/chat/systemPrompts/index.js`

Valib keelepõhise system prompti.

Roll süsteemis:

- ühendab ET/EN/RU promptifailid;
- tagab, et vastuse stiil ja grounding juhised tuleksid õiges keeles.

### `lib/chat/systemPrompts/et.js`

Eestikeelne system prompt.

Roll süsteemis:

- määrab eestikeelse vastamise stiili;
- keelab kuiva otsingustaatuse stiili;
- nõuab RAG_CONTEXT-i kasutamist faktiväidete puhul;
- juhib ajalooliste/projekti tüüpi allikate ajakonteksti;
- ütleb, et vana algatust ei tohi esitada praegu tegutseva teenusena, kui kontekst seda ei kinnita.

### `lib/chat/systemPrompts/en.js`

Ingliskeelne system prompt.

Roll süsteemis:

- sama roll inglise keeles.

### `lib/chat/systemPrompts/ru.js`

Venekeelne system prompt.

Roll süsteemis:

- sama roll vene keeles.

### `lib/chat/systemPrompts/common.js`

Promptide ühine alus.

Roll süsteemis:

- jagatud promptitekst või abistruktuur keelte vahel.

### `lib/chat/openaiRuntime.js`

OpenAI mudelikutsed.

Roll süsteemis:

- kutsub mudelit tavalise vastuse jaoks;
- kutsub mudelit streaming vastuse jaoks;
- kasutab `promptBuilder` koostatud sõnumeid.

Piirang:

- mudelilt ei nõuta veel struktureeritud vastust kujul `answer_blocks + source_ids`;
- seetõttu tehakse answer-source filtering praegu serveris heuristiliselt pärast vastuse valmimist.

## Server: Salvestamine ja Logimine

### `lib/chat/responseFinalizer.js`

Viimistleb assistendi vastuse.

Roll süsteemis:

- salvestab vastuse;
- seob vastusega allikad, manused ja metadata;
- uuendab vestluse sõnumeid.

### `lib/chat/persistence.js`

Vestluse jooksu ja sõnumite salvestamine.

Roll süsteemis:

- loob/jätkab vestluse run'i;
- salvestab kasutaja ja assistendi sõnumid;
- salvestab assistendi vastuse juurde `sources` JSON-i.

Praegune oluline punkt:

- pärast `sourceAttribution` lisamist peaks siia jõudma juba filtreeritud `replySources`, mitte kõik retrieval kandidaadid.

### `lib/chat/logger.js`

Chat logimise abikiht.

Roll süsteemis:

- logib chat sündmusi ja vigu;
- praegu ei ole see veel täis RAG trace süsteem.

### `app/api/internal/rag-cost-usage/route.js`

RAG embeddingu ja otsingu kulukasutuse peegeldus.

Roll süsteemis:

- RAG teenus saab siia saata embeddingu kasutuse infot;
- aitab näha RAG teenuse tokeni/kulu infot.

Piirang:

- see ei ole sama asi mis täielik RAG observability trace.

## RAG Teenus

### `rag-service/main.py`

Eraldi FastAPI RAG teenus.

Roll süsteemis:

- hoiab Chroma persistent collectionit;
- võtab faile/URL-e vastu ja chunkib neid;
- arvutab OpenAI embeddingud;
- salvestab chunkid Chromasse;
- pakub `/search` endpointi;
- rakendab Chroma metadata `where` filtreid;
- tagastab otsingutulemused Node chat serverile;
- logib embeddingu kasutust ja mõningast observability infot.

Praegune `/search` loogika:

```text
query
→ OpenAI embedding
→ Chroma collection.query
→ optional metadata where filter
→ top_k tulemused
→ tulemused koos document text + metadata + distance
```

Praegused metadata filtrid, mida teenus tunneb:

- `audience`
- `doc_id`
- `authors`
- `tags`
- `tag_tokens`
- `year`
- `collection_id`
- `country`
- `county`
- `jurisdiction_level`
- `municipality_name`
- `municipality_id`
- `district_name`
- `district_id`
- `item_type`
- `content_status`
- `resource_type`
- `checked_at`

Piirangud:

- otsing on põhimõtteliselt vektorotsing;
- puudub eraldi BM25/full-text indeks;
- puudub serveripoolne exact phrase või exact title search kiht;
- puudub reranker;
- hard filterid sõltuvad sellest, kas Node pool saadab piisava `where` filtri ja kas metadata on olemas.

### `rag-service/requirements.txt`

RAG teenuse Python sõltuvused.

Roll süsteemis:

- määrab FastAPI, Chroma, OpenAI ja parsinguga seotud paketid.

## Ingest ja Admin RAG

### `scripts/ingest-kov-rag.mjs`

KOV RAG andmete ingest skript.

Roll süsteemis:

- valmistab KOV teenuste/toetuste/regulatsioonide info RAG teenusele;
- seob KOV metadata;
- oluline tulevase source package ja hard filter süsteemi jaoks.

### `scripts/validate-kov-rag.mjs`

KOV RAG andmete valideerimine.

Roll süsteemis:

- kontrollib, kas KOV RAG andmed on struktuurselt korras;
- koht, kuhu saab lisada metadata kvaliteedi kontrolle.

### `scripts/ingest-national-rt-xml.mjs`

Riigi Teataja / riiklike õigusaktide ingest.

Roll süsteemis:

- toob õigusakti või regulatsiooni kihid RAG-i;
- oluline õiguse, määruse ja paragrahvi küsimuste jaoks.

### `scripts/ingest-ajakiri-sotsiaaltoo.mjs`

Ajakirja Sotsiaaltöö artiklite ingest.

Roll süsteemis:

- toob ajakirjaartiklid RAG andmebaasi;
- oluline praktika, tausta, persoonilugude ja ajalooliste algatuste jaoks.

Piirang:

- ajakirjaartiklid võivad sattuda allikaks ka siis, kui tegelikult oleks vaja ametlikku teenuseinfot, kui source type / hard filter ei ole piisav.

### `scripts/reindex-rag-documents.mjs`

RAG dokumentide uuesti indekseerimine.

Roll süsteemis:

- aitab olemasolevaid dokumente uuesti RAG teenusesse laadida;
- vajalik, kui metadata või chunkimise loogika muutub.

### `lib/admin/rag/kov/service.js`

KOV admin teenus.

Roll süsteemis:

- haldab KOV RAG andmeid admin poolel;
- käivitab ingest/revalidate tegevusi;
- valmistab ette KOV allikate metadata.

### `lib/admin/rag/kov/validation.js`

KOV andmete valideerimine admin kihis.

Roll süsteemis:

- kontrollib KOV failide ja metadata kvaliteeti;
- sobiv koht source type, KOV, valid_from/valid_to ja canonical item nõuete tugevdamiseks.

### `lib/admin/rag/kov/rtXml.js`

KOV või RT XML töötlemise abiloogika.

Roll süsteemis:

- aitab õigusakti XML andmeid lugeda ja RAG jaoks vormistada.

### `lib/admin/rag/kov/shared.js`

KOV RAG jagatud konstandid ja helperid.

Roll süsteemis:

- ühised tüübid, staatused, nimetused või konfiguratsioonid KOV RAG admin kihis.

### `lib/admin/rag/kov/storage.js`

KOV RAG failide ja oleku salvestus.

Roll süsteemis:

- haldab KOV admin failide füüsilist või serveripoolset hoiustamist.

### `lib/admin/rag/kov/api.js`

KOV RAG admin API abikiht.

Roll süsteemis:

- ühendab route'id ja admin service loogika.

### `lib/admin/rag/organizations/service.js`

Organisatsioonide RAG admin teenus.

Roll süsteemis:

- haldab organisatsioonipõhiseid RAG allikaid;
- oluline, kui allikad ei ole ainult KOV või riiklikud.

### `lib/admin/rag/organizations/validation.js`

Organisatsiooni RAG andmete valideerimine.

Roll süsteemis:

- kontrollib organisatsioonide failide ja metadata sobivust.

### `app/api/admin/rag/**`

Admin API route'id RAG andmete haldamiseks.

Roll süsteemis:

- KOV, organisatsiooni, dokumentide, ingestimise, revalideerimise ja failide endpointid;
- kasutajaliidese admin vaade tugineb nendele.

### `components/admin/rag/**`

RAG admin kasutajaliides.

Roll süsteemis:

- KOV ja organisatsioonide RAG andmete haldus;
- dokumentide staatused;
- ingestimise ja valideerimise UI.

## Frontend: Vestlus ja Allikate Kuvamine

### `components/chat/hooks/useChatStream.js`

Vestluse saatmise ja streaming vastuse hook.

Roll süsteemis:

- saadab kasutaja sõnumi API-sse;
- loeb SSE `delta` evente;
- loeb `done` eventist lõplikud `sources`;
- uuendab UI sõnumit lõplike allikatega.

Oluline praegune detail:

- streaming vastuses ei kuvata enam algset kontekstiallikate nimekirja kohe;
- lõplikud allikad tulevad pärast vastuse valmimist `done` eventiga.

### `components/chat/hooks/useConversationSources.js`

Koondab vestluses nähtavad allikad.

Roll süsteemis:

- võtab assistendi sõnumite `sources` väljad;
- filtreerib välja upload/ephemeral allikad;
- loob allikapaneeli jaoks koondatud nimekirja;
- eristab viimase vastuse allikaid ja kogu vestluse allikaid.

Piirang:

- UI usaldab serverist tulnud `sources` välja;
- kui server salvestab liiga laia allikaloendi, kuvab UI selle ikkagi.

### `components/chat/utils/sources.js`

Allikate vormindamise utiliidid.

Roll süsteemis:

- normaliseerib allikaobjektid;
- vormindab allika label'i;
- koondab leheküljenumbrid;
- teeb ajakirjaartikli, faili või URL-i põhjal kasutajasõbraliku pealkirja.

### `components/alalehed/chat/ChatSourcesPanel.jsx`

Allikapaneeli UI komponent.

Roll süsteemis:

- näitab kasutajale "Vastuste allikad";
- kasutab frontend hookide koondatud allikaloendit.

### `components/chat/LeftRail.jsx`

Vasak külgpaneel vestluse UI-s.

Roll süsteemis:

- sisaldab vestluse navigeerimise ja/või seotud paneelide UI-d;
- võib mõjutada, kuidas allikapaneelile ligi pääseb.

### `components/chat/RightRail.jsx`

Parem külgpaneel vestluse UI-s.

Roll süsteemis:

- seotud abipaneelide, allikate või kontekstipaneelide kuvamisega.

### `components/alalehed/chat/view/ChatMobileTopNav.jsx`

Mobiilivaate ülemine navigeerimine.

Roll süsteemis:

- annab mobiilis ligipääsu vestluse kõrvalpaneelidele, sh allikatele.

## Andmebaas

### `prisma/schema.prisma`

Andmebaasi skeem.

RAG-iga seotud olulisemad mudelid:

```text
RagDocument
ConversationRun
Conversation
ConversationMessage
ChatLog
```

### `RagDocument`

Admini poolt hallatud RAG dokumentide register.

Praegused olulised väljad:

- `title`
- `description`
- `type`
- `status`
- `audience`
- `sourceUrl`
- `fileName`
- `mimeType`
- `fileSize`
- `remoteId`
- `metadata`
- `authors`
- `issueId`
- `issueLabel`
- `year`
- `articleId`
- `section`
- `pages`
- `pageRange`
- `journalTitle`

Piirang:

- `RagSourceType` on praegu ainult `FILE` ja `URL`;
- valdkondlikud source type'id nagu `law`, `kov_service_info`, `journal_article`, `historical_source` on pigem metadata sees, mitte tugevalt skeemis;
- puudub eraldi `canonical_item_id` või source package mudel.

### `ConversationRun`

Vestluse jooksu hetkeseis.

Roll süsteemis:

- hoiab jooksva vastuse teksti, staatust ja `sources` JSON-i;
- kasulik poolelioleva või streaming vastuse oleku jaoks.

### `ConversationMessage`

Vestluse sõnumid.

Roll süsteemis:

- salvestab kasutaja ja assistendi sõnumid;
- assistendi sõnumi metadata saab sisaldada allikaid.

Piirang:

- puudub eraldi tabel `AnswerSource`, `Claim`, `RagTrace` või `DisplayedSource`;
- allikad on praegu JSON metadata/sources kujul, mitte auditeeritav relatsiooniline attribution kiht.

## Testid

### `tests/chat/sourceNeed.test.js`

Testib, millal RAG allikaid kasutada.

Roll süsteemis:

- kaitseb selle eest, et tavalised vestlusfraasid ei käivitaks RAG-i;
- kontrollib, et sotsiaalvaldkonna päringud allikaid vajaksid.

### `tests/chat/sourceAttribution.test.js`

Testib vastusepõhist allikafiltreerimist.

Roll süsteemis:

- kontrollib, et õige allikas jääks alles;
- kontrollib, et semantiliselt sarnased, aga vastust mitte toetavad allikad jääksid välja;
- katab "Võimaluste kohvik" tüüpi nimelise küsimuse ankruloogikat.

### `tests/chat/ragContextRanking.test.js`

Testib RAG tulemuste rankingut.

Roll süsteemis:

- kontrollib, et topic hint'idega otsesem vaste tõuseks üldise müra ette.

### `tests/chat/promptStyle.test.js`

Testib prompti stiili.

Roll süsteemis:

- kontrollib, et promptid ei suunaks assistenti liiga kuiva "leitud allikates" stiili;
- kontrollib ajaloolise/projekti ajakonteksti juhiseid.

## Mis On Praegu Olemas

Olemas:

- RAG vajaduse heuristika;
- OpenAI embedding + Chroma vektorotsing;
- metadata `where` filtrite tehniline tugi RAG teenuses;
- tulemuste deduplitseerimine;
- dokumentide/artiklite grupeerimine;
- topic hint ranking;
- MMR mitmekesistamine;
- konteksti eelarvega `RAG_CONTEXT`;
- prompti grounding juhised;
- vastusepõhine allikafiltreerimine;
- frontend allikapaneel;
- RAG dokumendi register andmebaasis;
- KOV, RT, ajakirja ja organisatsiooni ingest/admin kihid.

Poolik:

- `answer sources` kiht on heuristiline, mitte väitetasemel;
- metadata on olemas, aga mitte piisavalt standardiseeritud;
- hard filterid on osalised;
- KOV/riiklik/ajakiri/allikatüüp eristus ei ole veel piisavalt tugev;
- trace on hajus, mitte üks terviklik RAG auditikirje;
- testid on olemas, aga golden set on veel väike ja käsitsi mõeldud.

Puudub või vajab ehitamist:

- BM25/full-text otsing;
- exact phrase ja exact title search;
- formaalne query intent detection;
- source type / authority klassifikatsioon skeemis või tugevas metadata kihis;
- canonical item'id;
- source package builder;
- reranker;
- mudeli struktureeritud `answer_blocks + source_ids` väljund;
- claim-level attribution;
- minimaalne RAG trace iga vastuse kohta;
- 20 küsimusega golden set;
- hiljem 100-300 küsimusega regressioonitestid.

## Praeguse Süsteemi Suurimad Riskid

1. Vektorotsing võib tuua semantiliselt sarnase, aga sisuliselt vale allika.
2. Kui metadata on puudulik, ei saa hard filterid valesid allikaid välja võtta.
3. Ajakirjaartikkel võib sattuda allikaks seal, kus vaja on kehtivat ametlikku infot.
4. Vana projekt või ajalooline algatus võib muutuda vastuses kogemata praeguseks teenuseks.
5. Allikapaneel on nüüd parem, aga mitte veel täielikult tõenduspõhine.
6. Ilma RAG trace'ita on raske pärast aru saada, kas viga tekkis otsingus, rankingus, kontekstis, mudelis või allikate kuvamises.

## Kõige Olulisem Järgmine Parandus

Järgmine praktiline samm ei ole kohe kogu RAG ümber ehitada. Kõige mõistlikum on lisada minimaalne RAG trace ja väike golden set.

Minimaalne trace võiks salvestada:

```json
{
  "retrieved_count": 0,
  "retrieved_source_ids": [],
  "selected_context_source_ids": [],
  "answer_source_ids": [],
  "displayed_source_ids": [],
  "filtered_out_source_ids": [],
  "filter_reasons": {}
}
```

See teeks nähtavaks, kas praegune `sourceAttribution` filter töötab õigesti või peidab/kuvab valesid allikaid.

