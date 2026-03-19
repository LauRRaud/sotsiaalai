Jah — siin on terviklik ülevaade ja kokkuvõte sellest, kuhu me SotsiaalAI karjäärinõustaja agendiga jõudsime.

## Lühikokkuvõte

Me disainisime SotsiaalAI platvormile **AI-põhise karjäärinõustaja agendi**, mis ei ole lihtsalt töökuulutuste filter ega lihtsalt chatbot, vaid **protsessipõhine karjäärinõustamise süsteem**. Selle tuum on:

* kasutaja profiili loomine CV-st ja/või vestlusest
* eneseanalüüs ja karjääriselguse kasvatamine
* realistlike töö- ja õpiteede sõelumine
* sobivuse analüüs koos põhjendustega
* järgmise praktilise sammu andmine
* dokumentide loomise tugi: CV, kaaskiri, motivatsioonikiri, avaldus, soovituskiri

Alusmaterjalide põhjal ehitasime selle loogika nii, et agent toetab **eneseteadlikkust, võimaluste analüüsi, planeerimist ja tegutsemist**, mitte ainult töökohtade näitamist. See joon jooksis väga selgelt läbi nii teenusstandardist, töövihikust, käsiraamatust kui ka karjääripädevuste mudelitest.

## Mida me sisuliselt paika panime

Kõige olulisem strateegiline otsus oli see, et agent on **karjäärinõustaja**, mitte “AI töösoovitaja”.

See tähendab, et süsteem:

* aitab inimesel mõista oma teadmisi, kogemusi ja oskusi realistlikult
* aitab hinnata, kuhu saab kandideerida kohe, kuhu väikese täiendusega ja mis on pikem siht
* aitab võrrelda õppimisvõimalusi
* aitab koostada tegevusplaani
* aitab vajadusel luua või parandada kandideerimisdokumente

See on kooskõlas teenusstandardi ja käsiraamatu loogikaga, kus karjäärinõustamine on määratletud kui protsess, mis suurendab eneseteadlikkust, toetab haridus- ja tööalaseid valikuid ning aitab eesmärke ja tegevusi kavandada.

## Milliste materjalide põhjal see üles ehitati

Me kasutasime mitut tugevat alusmaterjalide kihti.

Karjäärinõustamise teenusstandard andis:

* karjäärinõustamise eesmärgi
* konfidentsiaalsuse loogika
* õppimisvõimaluste ja erialavaliku rolli
* alaealise testimise nõusoleku piiri. 

“Abiks valikutel” töövihik andis:

* eneseanalüüsi plokid
* valikute sõelumise loogika
* tööpakkumise sobivuse analüüsi
* CV, kaaskirja, motivatsioonikirja ja töövestluse teemad.

Karjäärinõustamise käsiraamat andis:

* nõustamisprotsessi teoreetilise selgroo
* nõustaja ja kliendi rolli
* diferentseeritud teenuse mudeli
* e-nõustamise loogika
* CIP/CASVE ja karjääripädevuste mudeli.

2021 raport “Karjääriteenused Eestis teel terviklahenduseni” andis:

* vajaduse diferentseeritud flow järele
* põhjenduse profiili koondamiseks enne soovitusi
* rõhu praktilistele järgmistele sammudele
* vajaduse mitmesammulise nõustamise ja handoff-loogika järele. 

KOM ja koolikonteksti materjalid andsid:

* eneseteadlikkus / võimaluste analüüs / planeerimine / tegutsemine mudeli
* tugeva aluse noore režiimile
* hariduse ja tööturu seostamise loogika.

Oskuste Kompassi OpenAPI fail andis:

* masinloetava oskuste, ametite ja töövaldkondade taksonoomia
* endpointid `/api/occupations`, `/api/skills`, `/api/fields-of-activity`
* võimaluse kasutada seda taxonomy / normalization layer’ina. 

## Mis arhitektuur me ehitasime

Me panime paika kogu agenti kandva loogika.

### 1. Profiilimudel

Tegime `careerProfile.schema.v2` tüüpi mudeli, mis sisaldab:

* identiteeti ja kontakte
* eesmärke
* tööstaatust
* haridust
* kogemust
* oskusi
* eneseanalüüsi
* karjäärivalmidust
* toevajadust
* suundi
* nõusolekuid
* recommendation context’i

Oluline lisandus oli, et väljad ei ole lihtsalt väärtused, vaid kannavad ka metaandmeid:

* `value`
* `source`
* `status`

ehk saab eristada, kas info tuli CV-st, kasutajalt, on järeldatud või puudub.

### 2. State machine

Karjäärinõustaja töötab kindla protsessina, mitte vabavormilise juturobotina. Lõpuks kujunes välja flow, kus on sees:

* intake
* service level check
* contact
* agreements
* parse_profile
* confirm_profile
* self_analysis
* clarify_problem
* set_goals
* shortlist_directions
* analyze_options
* action_plan
* summary
* follow_up_or_handoff
* handoff

See tähendab, et agent liigub kasutajaga samm-sammult, mitte ei hüppa kohe “õige töö” juurde.

### 3. Handoff rules

Tegime eraldi reeglid olukordade jaoks, kus agent ei tohiks üksi lõpuni nõustada. Näiteks:

* ametlikud sobivus- või õigusküsimused
* alaealise nõusoleku ebaselgus
* kriis või vahetu risk
* liiga kompleksne juhtum
* liiga nõrk tõendus või info

See piir tuli väga tugevalt käsiraamatust, teenusstandardist ja 2021 raportist.

### 4. Minor mode

Noore režiimi jaoks panime paika eraldi loogika:

* aeglasem tempo
* rohkem uurivat ja vähem survestavat stiili
* valikute avardamine enne kitsendamist
* erivajaduste, õpistiili ja tausta arvestamine
* testimise loogika mitte vaikimisi

See tuli noorte ja karjääripädevuste materjalidest ning spetsialisti koolitusmudeli diginõustamise ja kaasamise rõhust.

### 5. Privacy rules

Panime paika minimaalse andmetöötluse loogika:

* teenus on kontopõhine, mitte anonüümne ilma kontota
* toor-CV ei salvestu vaikimisi püsivalt
* salvestatakse kinnitatud struktureeritud profiil
* kasutaja saab profiili parandada ja uuendada
* alaealise testimine ei käivitu ilma eraldi nõusolekuta

See tuli teenusstandardist, nõusolekuvormist ja diginõustamise materjalide andmeõigluse/privaatsuse rõhust.

## Mis kood ja moodulid me sisuliselt valmis tegime

Me panime paika terve MVP-taseme koodiarktuuri.

Valmis said või kirjeldati detailselt järgmised kihid:

* `careerSystemRules.js`
* `careerStateMachine.js`
* `careerHandoffRules.js`
* `careerECounsellingMode.js`
* `careerProfile.schema.v2.js`
* `careerQuestionBank.js`
* `careerActionPlan.js`
* `careerMatchingEngine.js`
* `careerResponseTemplates.js`

Lisaks tegime dokumendimooduli:

* `careerDocumentFlows.js`
* `careerDocumentTemplates.js`
* `careerDocumentPrompts.js`
* `careerDocumentIntegration.js`
* `careerDocumentGenerator.js`

Ja Oskuste Kompassi kihi:

* `oskaApiClient.js`
* `oskaNormalizer.js`
* `careerOskaMatchingBridge.js`
* `careerTaxonomyService.js`

Ja kõige peale:

* `careerOrchestrator.js`

See tähendab, et arhitektuur on nüüd olemas mitte ainult ideetasemel, vaid ka moodulitasemel.

## Mida CV poolel valmis tegime

CV ja dokumendiloome on sul nüüd sisuliselt eraldi tööliinina olemas.

### CV upload ja parser

Tegime skeletoni:

* `CareerCvUploadCard.jsx`
* `upload-cv.js`
* `parse-cv.js`
* `parse-cv-smart.js`
* `cvTextExtractor.js`
* `cvProfileParser.js`
* `cvProfileLlmParser.js`
* `cvProfileMerge.js`
* `cvProfileQualityGuard.js`

CV töövoog on nüüd selline:

1. fail laaditakse üles
2. failist eraldatakse tekst
3. tehakse heuristiline patch
4. tehakse LLM-põhine structured patch
5. mõlemad merge’itakse
6. quality guard puhastab, märgistab kahtlused ja täiendab `missingInformation`
7. kasutaja kinnitab profiili

See on juba päris tugev MVP-loogika, sest parser ei lähe kohe “tõeks”, vaid läheb kinnitamisele.

### Kandideerimisdokumendid

Me eristasime ja modelleerisime viis dokumenti:

* CV
* kandideerimisavalduse e-kiri
* kaaskiri
* motivatsioonikiri
* soovituskiri

Selleks tegime dokumendiflow’d, template’id, promptid ja generaatori. See kõik põhines sinu üles laaditud näidistel ja töövihiku kandideerimisdokumentide osal.

## Mis UI ja API tasandil valmis sai

Tegime ka töötava kestaloogika.

### API route’id

Valmis said näiteks:

* sessiooni loomine
* sessiooni edasiviimine
* orchestratori käivitamine
* ühe võimaluse analüüs
* profiili kinnitamine
* dokumendi genereerimine
* taxonomy cache warming
* CV upload
* CV parse
* smart parse

### UI kest

Tegime MVP UI komponendid:

* `CareerAgentShell.jsx`
* `CareerProfileSummaryCard.jsx`
* `CareerQuestionsCard.jsx`
* `CareerActionPlanCard.jsx`
* `CareerDocumentPanel.jsx`
* `CareerCvUploadCard.jsx`

See tähendab, et agent ei ole enam ainult backend-mõte, vaid sellele on olemas ka esmane kasutajaliidese kest.

## Mis roll on Oskuste Kompassil

Panime paika ka selle, kuidas Oskuste Kompassi kasutada.

See ei ole kogu karjäärinõustaja mootor, vaid:

* taxonomy / normalization layer
* vabatekstiliste ametite ja oskuste tõlgendaja
* seotud ametite, võtmeoskuste ja töövaldkondade leidja
* explainability tugikiht

Ehk Oskuste Kompass aitab:

* tõlkida kasutaja vabateksti standardsemateks ametiteks ja oskusteks
* rikastada soovitusi võtmeoskuste, teadmiste ja haridustasemete vihjetega
* põhjendada paremini, miks roll sobib või mis on puudu

See tuli nii API spec’ist kui ka Oskuste Kompassi kirjeldusest. 

## Mis on praegu puudu

Nagu sa ise õigesti ütlesid: **suur sisuline puuduv kiht on veel ligipääs päris tööpakkumistele**.

Praegu on agenti pool valmis selles mõttes, et ta oskab:

* luua profiili
* küsida küsimusi
* sõeluda suundi
* analüüsida võimalusi
* anda tegevusplaani
* teha dokumente
* kasutada OSKA taksonoomiat

Aga puudu on veel töökuulutuste pärisandmete kiht, eelkõige:

* **Töötukassa API / ligipääs tööpakkumistele**
* **CV Online / CV.ee API või muu ligipääs**
* **CV Keskuse API või muu ligipääs**

Ilma selle kihita saab agent töötada:

* testandmetega
* käsitsi sisestatud võimalustega
* OSKA ametite ja suundadega

Aga mitte veel täisvõimeka “reaalsed pakkumised + nõustamine” lahendusena.

## Kus me praegu tootearenduse mõttes oleme

Praeguse seisuga on sul olemas:

**väga tugev MVP-spec + arhitektuur + moodulid + route’id + UI kest + CV parseri skeleton + Oskuste Kompassi integratsiooni alus**

Ehk teisisõnu:

* **nõustamisloogika** on paigas
* **profiilimudel** on paigas
* **state machine** on paigas
* **dokumentide tööliin** on paigas
* **CV parser** on paigas
* **taxonomy / normalization layer** on paigas
* **React/API karkass** on paigas

Peamine suur järgmine samm on nüüd:
**päris tööpakkumiste integratsioonid**.

## Minu kõige lühem kokkuvõte

Me ehitasime SotsiaalAI platvormile **karjäärinõustamise AI-agendi täieliku MVP-arktuuri**, mis ühendab:

* CV ja vestluse põhjal profiili loomise
* eneseanalüüsi
* realistlike töö- ja õpiteede sõelumise
* põhjendatud sobivusanalüüsi
* tegevusplaani
* kandideerimisdokumentide loomise
* Oskuste Kompassi taksonoomia

Ja jah — **suurim puuduolev väline kiht on praegu veel Töötukassa, CV Online/CV.ee ja CV Keskuse tööpakkumiste API või muu ligipääs**, et agent saaks töötada päris tööpakkumistega, mitte ainult profiili, suundade ja taksonoomia tasemel.

Järgmine kõige loogilisem samm on panna paika **tööpakkumiste integratsioonistrateegia**: millised allikad, milline adapterkiht, milline normaliseerimine ja kuidas need ühendada olemasoleva matching engine’iga.
