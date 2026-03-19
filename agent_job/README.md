# SotsiaalAI Karjäärinõustaja

See dokument on karjäärinõustaja agendi `v1` tööalus. Eesmärk on, et siit saaks igal ajal tööd jätkata ilma varasema arutelu konteksti kaotamata.

## 1. Idee lühikokkuvõte

SotsiaalAI karjäärinõustaja ei ole lihtsalt tööpakkumiste bot ega CV-parandaja. See on `AI-põhine karjäärinõustamise protsess`, mis aitab kasutajal:

- mõista oma kogemust, oskusi, huvisid, väärtusi ja tööeelistusi
- sõeluda realistlikke töö- ja õppimisvõimalusi
- hinnata, miks mingi roll või õpitee sobib või ei sobi
- tuvastada puuduvad oskused ja takistused
- teha vähemalt üks konkreetne järgmine samm

Toote põhiloogika on:

`eneseanalüüs -> valikud -> töö või õpitee sobivuse analüüs -> tegevus`

See peab jääma `karjäärinõustamise protsessiks`, mitte vajuma lihtsalt tööde kuvamiseks.

## 2. Toote definitsioon

### Toote nimi

`SotsiaalAI karjäärinõustaja`

### Toote tüüp

`AI-põhine vestlusagent`, mis ühendab:

- karjäärinõustamise loogika
- CV või tausta struktureerimise
- töö- ja õpiteede sobitamise
- järgmiste sammude praktilise juhendamise

### Põhieesmärk

Aidata kasutajal:

- mõista oma profiili
- hinnata realistlikke suundi
- teha põhjendatud töö- või õppimisotsuseid
- liikuda edasi konkreetse tegevuseni

### Mida agent ei ole

- mitte lihtsalt tööpakkumiste nimekiri
- mitte ainult CV-parandaja
- mitte värbaja otsusmootor
- mitte psühhomeetriline testimissüsteem vaikimisi
- mitte anonüümne tasuta chat, sest `MVP on kontopõhine tasuline teenus`

## 3. Lähtematerjalid ja järeldused

Karjäärinõustaja spec põhineb lisaks meie enda arutelule ka `job_agent` kaustas olevatel materjalidel.

Olulisemad allikad:

- `Karjäärinõustamise teenusstandard.docx`
- `Kutseala kirjeldus.docx`
- `Abiks valikutel EE veeb reas 24-01-19.pdf`
- `KOM_kirjeldus.pdf`
- `HTM_Opilaste.pdf`
- `2021_Karjaariteenused_Eestis_teel_terviklahenduseni.pdf`
- `spetsialisti-koolitusmudel.pdf`
- `web_Teejuht-lapsevanemale_est.pdf`
- `Onepager_lapsevanematele_est_A4.pdf`
- `KNU_eetikakoodeks_2025_A4_link-1.pdf`
- `Nõusoleku vorm karjäärinõustamise testide tegemiseks (5).docx`

Nendest materjalidest tulenevad järgmised põhimõtted.

### Teenusstandardist

- karjäärinõustamise eesmärk on suurendada inimese eneseteadlikkust ja teadlikkust tööturu vajadustest
- nõustaja aitab mõista võimalusi, kavandada järgmisi samme ja neid ellu viia
- teenus katab lisaks tööle ka `erialavaliku` ja `õppimisvõimalused`
- nõustamisel võib kasutada vestlust, harjutusi, töölehti, küsimustikke ja kokkuleppel testimist
- teenuse sisu on konfidentsiaalne
- teenus võib toimuda eesti, vene ja inglise keeles ning ka digikanalites

### Kutseala kirjeldusest

- karjäärinõustaja või karjäärispetsialist aitab kliendil välja selgitada vajadused ja eeldused
- ta aitab eesmärke seada ja koostada tegevusplaani
- ta juhendab töö otsimisel ja kandideerimisel
- ta peab tundma tööturgu, palgaturgu, töövorme, õppimisvõimalusi ja digivahendeid
- see kinnitab, et `tegevusplaan`, `CV-tugi` ja `kandideerimise tugi` peavad MVP-s sees olema

### Töövihikust „Abiks valikutel“

- protsess liigub kujul `eneseanalüüs -> valikud -> tööotsing -> tööpakkumise analüüs -> CV/kaaskiri/motivatsioonikiri -> töövestlus`
- oskused tuleb jagada vähemalt kolmeks:
  - erialased oskused
  - ülekantavad oskused
  - enesejuhtimise oskused
- oluline on eraldi käsitleda:
  - huvisid
  - väärtusi
  - tööeelistusi
  - konkurentsieelist
- nõustaja ei tee otsust kliendi eest, vaid aitab kliendil otsust läbi mõelda

### KOM kirjeldusest

- karjääri kujundamise pädevused on lahti võetud neljaks põhivaldkonnaks:
  - `eneseteadlikkuse arendamine`
  - `võimaluste analüüs`
  - `planeerimine`
  - `tegutsemine`
- see nelik on tugev alus agendi `state flow` loogikale ja `self-analysis` küsimuste järjestusele
- dokument rõhutab, et karjääripädevused aitavad koguda, analüüsida ja kasutada:
  - enesekohast infot
  - haridusinfot
  - kutsealast infot
- eneseanalüüsi sisu peab katma vähemalt:
  - huvid
  - hobid
  - oskused
  - teadmised
  - võimed
  - väärtused
  - hoiakud
  - motivatsiooni
- võimaluste ja tegutsemise pool peab katma vähemalt:
  - õppimisvõimalused
  - sisseastumistingimused
  - eesmärgi seadmise
  - alternatiivide kaardistamise
  - otsustamise
  - tööotsingu
  - CV
  - motivatsioonikirja
  - kaaskirja
  - tööintervjuu
  - portfoolio
  - tegevusstrateegia elluviimise
- sellest järeldub, et agent peab toetama lisaks soovitamisele ka `karjääripädevuste arendamist`

### HTM 2025 juhendmaterjalist

- karjääri käsitletakse `elukestva haridus- ja tööalase arenguna`, mitte ainult ametivalikuna
- karjäärinõustamine on protsess, mis toetab:
  - eneseteadlikkust
  - sobivate haridus- ja tööalaste valikute tegemist
  - muutustega kohanemist
- dokument seob süsteemi kolmeks kihiks:
  - `karjääriõpe`
  - `karjääriinfo vahendamine`
  - `karjäärinõustamine`
- sellest tuleneb, et eriti `minorMode` puhul peab agent olema laiem õppija arengu toetaja, mitte ainult ametisoovitaja
- eraldi tuuakse välja kaks läbivat võtmepädevust:
  - `probleemide lahendamise oskus`
  - `muutustega toimetuleku oskus`
- need tuleb lisada profiilimudeli, `self-analysis` mooduli ja noore režiimi küsimusloogika sisse
- juhendmaterjal soovitab töömaailma ja haridusvõimaluste mõtestamisel kasutada allikaid nagu:
  - `OSKA uuringud`
  - `Oskuste Kompass`
  - `Tööjõuvajaduse baromeeter`
  - `minukarjäär.ee`
- see tugevdab arhitektuurireeglit, et `Oskuste Kompass` on eraldi `taxonomy / normalization layer`, mitte kogu agendi ainus loogika

### 2021 raportist „Karjääriteenused Eestis: teel terviklahenduseni“

- raport kinnitab, et karjääri kujundamise pädevuse keskmes on neli valdkonda:
  - `eneseteadlikkus`
  - `võimaluste analüüs`
  - `planeerimine`
  - `tegutsemine`
- see toetab otseselt agendi põhiloogikat ja kinnitab, et agent ei tohi olla lihtsalt töökuulutuste näitaja
- raporti järgi tuleb karjääriteenuseid `diferentseerida` vastavalt:
  - kasutaja karjäärivaliku kindlusele
  - karjääri kujundamise pädevusele
  - potentsiaalsetele karjäärivalikutele
- sellest järeldub, et kõigile kasutajatele ei tohi anda sama flow'd ega sama sügavusega tuge
- raport soovitab karjäärinõustamise efektiivsuse tõstmiseks koondada teenuse eeltegevusena kasutaja kohta olulise info
- see on otsene tugi sammudele:
  - `parse_profile`
  - `confirm_profile`
  - `self_analysis`
- raport rõhutab, et teenus peab olema pigem `sessiooniline protsess` kui üksik vastus:
  - soovitatakse suurendada karjäärinõustamise kordade arvu vähemalt kahele
  - individuaalset nõustamist ei tohiks asendada grupinõustamisega
- AI-agendi tõlgendus on, et kasutajateekond peab toetama mitme sammu ja vajadusel mitme sessiooni loogikat
- raport toob kasutajate peamiste probleemidena välja:
  - info hajutatuse
  - liiga pealiskaudse või vananenud info
  - liiga vähese individuaalse lähenemise
  - liiga vähese praktilise nõu ja abi
- sellest tuleneb SotsiaalAI väärtuspakkumise tuum:
  - vähem hajutatud
  - vähem pealiskaudne
  - rohkem personaalne
  - rohkem praktiline
- raport toob eraldi esile suurema toe vajadusega sihtrühmad:
  - noored, kes ei õpi ega tööta
  - täiskasvanud, kes ei tööta
  - põhikooli järel kutseõppe valijad
  - haridusliku erivajadusega õppijad
- see tugevdab vajadust diferentseeritud `minorMode`, `readiness assessment` ja `support intensity` loogika järele
- raport rõhutab ka venekeelse nõustamise kättesaadavust ja süsteemi rollijaotust eri osapoolte vahel
- sellest järeldub, et agent ei tohi püüda kogu süsteemi asendada, vaid peab teadma, millal aktiveerida `handoff`

### Spetsialisti-koolitusmudelist

- dokument annab laiendatud kompetentsimudeli, mis rõhutab:
  - empaatiat ja aktiivset kuulamist
  - kultuurilise ja sotsiaalse tausta arvestamist
  - kaasamist ja erivajadustega arvestamist
  - tõenduspõhisust
- diginõustamise ja AI kontekstis on olulised teemad:
  - digikoostöö ja diginõustamine
  - info- ja andmepädevus
  - suhtlusbotiga nõustamine
  - personaalandmetel ja trendidel põhinevad soovitused
  - andmeõiglus, digiõigus, privaatsus, turvalisus
  - tehisintellektiga mudeldamine
- see annab otsesed kasutusjuhised:
  - `minorMode`: empaatia, kaasamine, õpistiilide arvestus, erivajaduste tundlikkus
  - `handoffRules`: erivajadused, tõenduspõhisuse puudumine, mitmetegurilised juhtumid
  - `privacyRules`: andmeõiglus, privaatsus, andmete läbipaistvus
  - `future roadmap`: digitaalsed portfooliod, prognoosid ja trendipõhised soovitused
  - `AI visioon`: digikanalis toimiv nõustamine, mis võimendab professionaalsust, mitte ei asenda seda

### Noorte ja lapsevanemate materjalidest

- karjäär on laiem kui ametivalik, see hõlmab hariduslikku ja tööalast arengut eri elurollides
- noore toetamisel tuleb vahel `avardada` valikuid ja vahel `kitsendada`
- toetav toon peab olema:
  - kuulaja ja arutleja
  - toetaja ja julgustaja
  - juhendaja ja õpetaja
  - eeskuju
- ümberotsustamine ja katsetamine tuleb käsitleda normaalse osana arengust
- sellest tuleneb `minorMode`, mis peab olema uurivam, aeglasem ja vähem survestav

### Eetikakoodeksist

- klient teeb oma otsused ise
- karjäärispetsialist peab hoidma kliendisuhet professionaalse, hinnanguvaba ja turvalisena
- küsida tohib ainult teenuseks vajalikku infot
- kliendile tuleb selgitada protsessi, rolle, privaatsuspiire ja vajadusel info jagamise aluseid
- testimine on vabatahtlik, selle eesmärk ja piirangud tuleb lahti seletada
- digikeskkonnas tuleb arvestada privaatsuse, isikutuvastuse ja teenuse kvaliteedi piiridega
- kui kvaliteetset e-teenust ei saa pakkuda, tuleb valida sobivam viis või teha handoff

### Alaealise testimise nõusoleku vormist

- alaealise isiksuse ja vaimsete võimete testimine nõuab seadusliku esindaja eelnevat nõusolekut
- testi tulemusi ei tohi edastada kolmandatele isikutele ilma aluseta
- nõusolek on tagasivõetav
- nõusoleku puudumisel võib karjäärinõustamine jätkuda, kuid `testimiseta`

### Peamised tootejäreldused

- agent peab jääma `nõustajaks`, mitte otsustajaks
- agent peab toetama ka `karjääripädevuste arengut`, mitte ainult soovituste andmist
- agent peab `diferentseerima flow'd` vastavalt kasutaja selgusele, kindlusele ja toevajadusele
- `tegevusplaan` on tuumafunktsioon, mitte lisamoodul
- `CV loomine`, `CV parandamine` ja `kandideerimise tugi` on karjäärinõustamise osa
- `haridusmoodul` peab olema esimese klassi loogikakiht
- `minorMode`, `handoffRules` ja `privacyRules` ei ole valikulised
- agenti tuleb disainida professionaalse diginõustamise standardi järgi, mitte ainult töösoovitajana
- empaatia, kaasamine ja erivajaduste arvestus peavad olema osa süsteemi käitumisest, mitte UI detail
- tõenduspõhine nõustamine on kohustuslik; ebapiisava info korral peab agent seda tunnistama või suunama edasi
- `self-analysis` peab tuginema nelikule:
  - eneseteadlikkus
  - võimaluste analüüs
  - planeerimine
  - tegutsemine
- noore režiim peab arvestama ka:
  - probleemide lahendamise oskusega
  - muutustega toimetuleku oskusega
- `parse_profile -> confirm_profile` ei ole tehniline lisasamm, vaid teenuse kvaliteedi eeltingimus
- agent peab vältima:
  - hajutatud infot
  - pealiskaudseid vastuseid
  - põhjendamata soovitusi
  - ühe sõnumi põhiseid lõppjäreldusi
- tulevikuperspektiivis peab roadmap toetama:
  - digitaalse portfoolio loomist
  - trendi- ja prognoosipõhist juhendamist
  - võrgustikupõhist või partnertegevust
- testimine peab jääma MVP-s vaikimisi välja või eraldi range nõusoleku alla

## 4. Põhiprintsiibid

### Nõustav, mitte otsustav

Agent ei otsusta kasutaja eest. Ta:

- selgitab
- võrdleb
- sõnastab riskikohad
- aitab valida järgmise sammu

### Eneseanalüüs enne sobitamist

Agent ei tohi alustada ainult tööde kuvamisest. Enne soovitusi tuleb kaardistada vähemalt:

- tugevused
- huvid
- väärtused
- tööeelistused
- ülekantavad oskused
- õppimisvalmidus
- probleemide lahendamise oskus
- muutustega toimetuleku oskus

Eneseanalüüsi küsimused tuleb järjestada loogikaga:

`eneseteadlikkus -> võimaluste analüüs -> planeerimine -> tegutsemine`

### Haridus on karjääri osa

Karjäär ei tähenda ainult tööd. Agent peab suutma:

- pakkuda realistlikke õpiteid
- võrrelda variante
- siduda õpiteed rollidega
- tuua välja, mida ametlikest allikatest kontrollida

### Minimaalne andmetöötlus

Kuigi teenus on kontopõhine, peab süsteem järgima minimaalse andmetöötluse põhimõtet:

- `toor-CV` ei salvestata vaikimisi püsivalt
- kasutajale näidatakse enne salvestamist, mida süsteem temast aru sai
- vaikimisi salvestatakse ainult `kinnitatud struktureeritud profiil`
- kasutaja peab saama profiili parandada, uuendada ja kustutada vastavalt toote reeglitele

### Policy in code, tone in prompt

Prompt juhib tooni, aga poliitikad peavad olema koodis.

Koodi tasemel peavad olema vähemalt:

- `stateMachine`
- `privacyRules`
- `minorMode`
- `handoffRules`
- `matchingEngine`
- `responseTemplates`

## 5. Kasutajasegmendid

### Täiskasvanud tööotsija

Näited:

- otsib kiiresti tööd
- soovib karjääripööret
- naaseb tööturule
- tahab aru saada, kuhu realistlikult kandideerida

### Õppimise või ümberõppe otsija

Näited:

- tahab valida eriala või koolituse
- tahab siduda õpitee tööga
- vajab hariduse ja tööturu seoste lahtimõtestamist

### Noor kasutaja

Noore režiimis peab agent olema:

- aeglasem
- uurivam
- vähem survestav
- rohkem valikuid avardav
- rohkem õppija arengu toetaja kui kiire ametisoovitaja

Noore režiimis peab agent aitama arendada ka:

- probleemide lahendamise oskust
- muutustega toimetuleku oskust

Noore puhul ei tohi testimist soovitada ilma vajaliku nõusolekuloogikata.

## 6. MVP ulatus

### MVP sees

- CV või vestluspõhine profiili loomine
- profiili kinnitamine kasutajaga
- eneseanalüüsi küsimused
- CV loomise tugi juhul, kui kasutajal puudub CV
- olemasoleva CV parandamise, struktureerimise ja kohandamise tugi
- realistlike suundade sõelumine
- tööpakkumise sobivuse analüüs
- õppimisvõimaluste eraldi käsitlus
- järgmiste sammude soovitused
- tegevusplaani koostamine
- motivatsiooni- või kaaskirja ettevalmistuse abi
- töövestluse ettevalmistuse abi

### MVP väljas

- automaatne kandideerimine
- tööandja-poolne kandidaatide skoorimine
- psühhomeetrilised testid vaikimisi
- täielik koolide või õppekavade andmebaas
- täielik tööportaal kõigi funktsioonidega

## 7. Kohustuslik workflow

Karjäärinõustaja peab töötama järgmise state flow järgi:

`intake -> parse_profile -> confirm_profile -> self_analysis -> shortlist_directions -> analyze_opportunities -> education_explore -> action_support -> handoff`

### State'ide tähendus

- `intake`: selgitab välja eesmärgi, surve ja algse suuna
- `parse_profile`: loeb CV-st või vestlusest välja esialgse profiili
- `confirm_profile`: näitab kasutajale lühikokkuvõtet ja palub kinnitada/parandada
- `self_analysis`: küsib täpsustavaid küsimusi tugevuste, huvide, väärtuste ja tööeelistuste kohta
- `shortlist_directions`: loob realistlike suundade lühinimekirja
- `analyze_opportunities`: analüüsib tööde või rollide sobivust
- `education_explore`: analüüsib õpiteid ja õpitee-valikuid eraldi kihina
- `action_support`: annab vähemalt ühe konkreetse järgmise sammu
- `handoff`: suunab edasi, kui teema väljub agendi ohutust või pädevast tegevuspiirist

## 8. Profiilimudel v2

Kõik olulised väljad peavad kandma `kolme osa`:

- `value`
- `source`
- `status`

Näide:

```json
{
  "location": {
    "value": "Tallinn",
    "source": "from_user",
    "status": "confirmed"
  }
}
```

### Source väärtused

- `from_cv`
- `from_user`
- `inferred`
- `system_derived`

### Status väärtused

- `confirmed`
- `inferred`
- `missing`

### Tähtis reegel

Soovitused ei tohi käsitleda `inferred` infot samal tasemel nagu `confirmed` infot.

## 9. Profiili kohustuslikud plokid

### Identity

- nimi või kuvamisnimi
- vanusegrupp
- alaealisuse märge
- asukoht
- keeled
- kontaktieelistus

### Goals

See plokk tuleb kindlasti hoida profiilis eraldi.

- `primaryGoal`
- `urgency`
- `incomePressure`
- `willingnessToCompromise`
- `preferredNextStep`

Need määravad, kui “realistlik” soovitus kasutaja jaoks tegelikult on.

### Work status

- tööstaatus
- saadavus
- tööaja eelistus
- remote/hybrid/either
- liikumispiirangud
- muud piirangud

### Education

- lõpetatud õpe
- pooleliolev õpe
- sertifikaadid
- täienduskoolitused
- õppimisvalmidus
- ümberõppe huvi

### Experience

- rollid
- sektorid
- vastutused
- pausid
- vabatahtlik kogemus
- mitteformaalne kogemus

### Skills

- erialased oskused
- ülekantavad oskused
- enesejuhtimise oskused
- digioskused
- keeleoskused

### Self analysis

- tugevused
- arendamist vajavad kohad
- huvid
- väärtused
- eelistused
- konkurentsieelis

### Career directions

- rollid, mis sobivad kohe
- rollid, mis sobivad väikese täiendusega
- pikemad sihid
- sobivad õpiteed

### Recommendation context

- confidence notes
- missing information
- kasutaja kinnituse staatus

### Privacy

- konto nõutav
- toor-CV retention vaikimisi `false`
- vaikimisi salvestatakse ainult struktureeritud profiil
- enne salvestamist on vajalik profiili kinnitus

## 10. Juba tehtud skeemitöö

Repo sees on `profileSchema v2` juba loodud:

- `lib/career/profileSchema.js`
- `tests/career/profileSchema.test.js`

Skeemis on praegu olemas:

- `goals` plokk
- `value/source/status` wrapper-väljad
- profiili normaliseerijad
- vaikimisi kontopõhine privaatsusloogika

See on praeguse arenduse kõige konkreetsem valmis osa.

## 11. Soovituste väljund

Iga töö või õpitee soovitus peab sisaldama vähemalt:

- `miks sobib`
- `mis on puudu`
- `mida kasutaja saab lisaks pakkuda`
- `järgmine samm`

Soovitused ei tohi jääda abstraktseks.

### Sobivustase kasutaja vaates

Kasutajale ei näidata musta kasti protsente. Kuvatakse selgitavad tasemed:

- `tugev sobivus`
- `võimalik sobivus`
- `vajab lisasammu`

Sobitusmootor on `sisemine heuristik`, mitte lõplik tõeallikas.

Kui sisend on puudulik või madala kindlusega, peab agent seda tekstis tunnistama.

## 12. CV-loome ja tegevusplaan

Need funktsioonid peavad olema `MVP tuumas`, mitte kõrvalfunktsioonid.

### Kui kasutajal puudub CV

Agent aitab koostada `kvaliteetse algse CV` kasutaja:

- vestluse
- kogemuste
- oskuste
- hariduse
- tugevuste

põhjal.

See tähendab, et agent ei tohi eeldada, et karjäärinõustamine algab valmis dokumendist.

### Kui kasutajal on CV olemas

Agent peab aitama:

- parandada CV sisu ja struktuuri
- kohandada CV konkreetse rolli või suuna jaoks
- hinnata, kas olemasolev CV toetab realistlikult kasutaja eesmärki

CV töötlus ei ole eraldi dokumendifunktsioon, vaid osa karjäärinõustamise protsessist.

### Profiili tõlgendamine

Agent peab aitama kasutajal:

- mõista oma teadmisi ja kogemusi
- sõnastada tugevused
- sõnastada ülekantavad oskused
- hinnata realistlikult, kuhu saab kandideerida kohe
- hinnata, kuhu saab liikuda väikese täiendusega
- eristada pikemat sihti

See on oluline, et agent ei jääks lihtsalt dokumendiabiks.

### Tegevusplaan

Agent peab suutma koostada `järk-järgulise tegevusplaani`, mis võib sisaldada näiteks:

- CV parandamist
- kandideerimist
- õppimisvõimaluste võrdlemist
- oskuslünkade katmist
- töövestluseks valmistumist

Iga sessiooni lõpus peab agent andma vähemalt ühe konkreetse järgmise sammu.

## 13. Haridusmoodul

Õppimisvõimalused peavad olema `eraldi loogikakiht`, mitte lihtsalt töösoovituse kõrvalfunktsioon.

Haridusmoodul peab oskama:

- pakkuda realistlikke õpiteid
- võrrelda variante
- siduda õpiteed rollidega
- välja tuua, mida tuleb ametlikest allikatest kontrollida

MVP-s ei pea agent teadma kogu Eesti haridusmaastikku peast, aga ta peab teadma:

- õpiteede tüüpe
- millal üks või teine tee on realistlik
- mida enne valiku tegemist võrrelda

## 14. Handoff-reeglid

Agent ei tohi igas olukorras lõpuni ise nõustada.

`handoff` või piirangu märge peab aktiveeruma vähemalt siis, kui teemaks on:

- juriidilised või formaalsed õigusküsimused
- toetuste või teenuste ametlik sobivus
- vaimse tervise kriis või vahetu ohu olukord
- alaealise nõusoleku ebaselgus
- olukord, kus otsus sõltub ametlikust allikast või partneri kinnitust vajavast infost

See peab tulema `koodi` tasemele, mitte jääma ainult prompti.

## 15. Taxonomy normalization

Enne väliste andmeallikate lisamist tuleb defineerida normaliseerimiskihid vähemalt järgmistele väljadele:

- ametinimetused
- oskused
- haridustasemed
- töövormid
- keeleoskuse tasemed
- sektorid

Ilma selleta muutub matching müraseks ja ebastabiilseks.

## 16. Oskuste Kompass adapter

`Oskuste Kompass` tuleb kasutada SotsiaalAI karjäärinõustaja jaoks eraldi `taxonomy / normalization layer`-ina, mitte kirjutada seda otse kogu agendi äriloogika sisse.

Selle roll on:

- ametinimetuste normaliseerimine
- oskuste normaliseerimine
- töövaldkondade sidumine
- explainability toetamine
- vabatekstis kirjeldatud ametite ja oskuste tõlgendamine
- kasutaja profiili rikastamine
- seotud ametite, oskuste ja töövaldkondade leidmine
- soovituste põhjendamine ja selgitamine

Oluline reegel:

- Oskuste Kompass aitab normaliseerida ja põhjendada
- lõplik karjäärinõustamise loogika jääb SotsiaalAI enda profiilimudelisse, state machine'i, matching engine'i ja handoff-reeglitesse
- Oskuste Kompass ei ole kogu karjäärinõustaja mootor
- see ei asenda `profileSchema`-t, `stateMachine`-i, `matchingEngine`-it ega `handoffRules`-e
- see on abikiht, mis aitab agenti targemaks, järjekindlamaks ja paremini põhjendavaks teha

Praktiliselt tähendab see, et agent saab:

- tõlkida kasutaja vabateksti standardsemateks ametiteks ja oskusteks
- leida seotud ametid, võtmeoskused, töövaldkonnad ja võimalikud ettevalmistusnõuded
- selgitada, miks mingi roll sobib või mis oskus on puudu
- siduda kasutaja profiili realistlikumalt tööturu taksonoomiaga

Lühikokkuvõte:

- `jah`, seda süsteemi saab ja tasub kasutada agendi ehitamisel
- aga `eraldi adapterkihina`, mitte agendi ainsa loogikana

Arenduses kasutatav OpenAPI kirjeldus on nüüd olemas siin:

- `agent_job/openapi.json`

Praegune adapterkiht elab siin:

```txt
lib/career/
  oskaApiClient.js
  oskaNormalizer.js
  oskaMapper.js
  oskaCache.js
```

Need moodulid on mõeldud hoidma `Oskuste Kompassi` kasutuse lahus ülejäänud äriloogikast.

## 17. Soovitatud failistruktuur

Sihttasemel võiks karjäärimoodul elada siin:

```txt
lib/career/
  profileSchema.js
  oskaApiClient.js
  oskaNormalizer.js
  oskaMapper.js
  oskaCache.js
  stateMachine.js
  handoffRules.js
  privacyRules.js
  minorMode.js
  matchingEngine.js
  educationEngine.js
  responseTemplates.js
  systemPrompt.js
```

Vajadusel lisanduvad hiljem ka:

```txt
components/career/
app/api/career/
tests/career/
```

## 18. Praegune järg

See on kõige olulisem osa, et tööd saaks hiljem jätkata.

### Mis on tehtud

- karjäärinõustaja idee on vormistatud protsessipõhiseks tooteks
- on otsustatud, et see ei ole tööbot, vaid karjäärinõustamise mootor
- on lukustatud `goals` plokk
- on lukustatud `value/source/status` väljaloogika
- on lukustatud kontopõhine minimaalse andmetöötluse põhimõte
- on loodud `profileSchema v2`
- on loodud `stateMachine`
- on loodud `handoffRules`
- on loodud `privacyRules`
- on loodud `minorMode`
- on loodud `matchingEngine`
- on loodud `responseTemplates`
- on loodud `Oskuste Kompassi` adapterkiht:
  - `oskaApiClient`
  - `oskaMapper`
  - `oskaNormalizer`
  - `oskaCache`

### Mis on järgmine konkreetne töö

`6. systemPrompt`

See tähendab:

- luua `lib/career/systemPrompt.js`
- siduda prompt juba tehtud moodulitega:
  - `stateMachine`
  - `responseTemplates`
  - `handoffRules`
  - `privacyRules`
  - `minorMode`
- hoida promptis ainult toon, nõustamisstiil ja vastuse struktuur
- vältida seda, et ärireeglid või turvapoliitikad jääksid ainult prompti sisse

### Täpne järjekord pärast seda

1. `systemPrompt`
2. `API contract`
3. `UI flow`

## 19. Jätkamise juhis järgmisele sessioonile

Kui selle ideega jätkata, siis järgmine töö peaks algama sellest lausest:

> Jätkame SotsiaalAI karjäärinõustaja tööga faili `agent_job/README.md` järgi ja teeme nüüd `systemPrompt`.

See dokument on mõeldud olema `single source of truth` seni, kuni moodulid on täielikult realiseeritud.


