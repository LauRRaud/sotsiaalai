# SotsiaalAI karjäärinõustaja master-spec v2

See dokument kirjeldab SotsiaalAI karjäärinõustamise agendi toote- ja teenusloogikat praeguse rakenduse ning materjalide põhjal. See on V2, sest see arvestab juba olemasolevat chat-first teenust, canonical profiilimudelit, document flow'd, privacy/handoff enforcement'i ja OSKA rikastust.

## 1. Toote olemus

SotsiaalAI karjäärinõustaja on platvormisisene vestluspõhine karjääriteenus, mis aitab kasutajal:

- sõnastada oma töö-, õppe- või karjääriküsimuse
- mõtestada oma olukorda, tugevusi ja piiranguid
- võrrelda realistlikke suundi
- saada põhjendatud soovitusi
- koostada järgmisi praktilisi samme
- valmistada ette töö- ja kandideerimisdokumente
- jõuda vajadusel inimnõustaja juurde

Toode ei ole pelgalt infootsing ega töökuulutuste näitamine. See on juhitud nõustamisprotsess, mis ühendab vestluse, struktureeritud profiili, dokumentide toe ja teenusepiirid.

## 2. Teenuse mudel

Teenuse ärimudel on järgmine:

- teenus elab siin platvormil
- kasutajakogemus on chat-first
- kasutaja alustab oma sõnadega
- teenus kohandab vastuse olukorra järgi
- dokumentide loomine toimub samas voos, ilma eraldi keeruka töölaudade süsteemita
- vajadusel toimub edasi suunamine inimesele

Teenuse eesmärk ei ole asendada inimnõustajat, vaid pakkuda esmast, järjepidevat ja praktilist tuge, mis aitab kasutajal kiiremini selgusele jõuda.

## 3. Põhimõtted

Teenuse keskne loogika põhineb järgmistel põhimõtetel:

- kasutaja on oma elu ja valikute ekspert
- teenus on protsessi ekspert
- teenus ei tee inimese eest lõplikke otsuseid
- konfidentsiaalsus ja teadlik nõusolek on kohustuslikud
- dokumendid peavad põhinema kinnitatud või selgelt kasutajalt saadud andmetel
- soovitused peavad olema põhjendatavad
- teenus peab olema lihtne kasutada ilma eraldi testimismoodulita

## 4. Materjalidest tulenev raam

Teenuse loogika on kooskõlas karjäärinõustamise käsiraamatu, teenusstandardi, eetikakoodeksi, OSKA/taksonoomia suuna ja dokumendinäidistega.

Materjalidest tulenevad olulised rõhuasetused:

- karjäärinõustamine on protsess, mitte üksik vastus
- oluline on eneseteadlikkus, võimaluste analüüs, planeerimine ja tegutsemine
- konfidentsiaalsus ja nõusolek on keskne osa teenusest
- dokumentide koostamine peab lähtuma ette valmistatud ja kinnitatud andmest
- tööturu ja õppesuundade põhjendamine peab tuginema taksonoomiale ja selgitavale loogikale

## 5. Peamised kasutajad

Teenuse peamised kasutajad on:

- inimene, kes ei tea veel täpselt, mida küsida
- tööotsija
- karjääripööret kavandav täiskasvanu
- ümberõppe või täienduskoolituse kaaluj
- noor, kes vajab õppimise ja töö suuna mõtestamist
- inimene, kes vajab CV, kaaskirja või muu dokumendi tuge

Teenuse tempot ja sügavust kohandatakse vastavalt kasutaja selgusele, valmisolekule ja vajadusele.

## 6. Toote ulatus

### Teenuses peab olemas olema

- protsessipõhine vestlus
- profileerimine ja canonical profiil
- küsimuste loogika
- profiili kinnitamine
- suundade ja võimaluste analüüs
- tegevusplaan
- dokumentide koostamise tugi
- OSKA / taxonomy rikastus
- consent ja confidentiality enforcement
- handoff inimesele

### Teenuses ei pea olema

- testimismootor kui eraldi toode
- tööpakkumiste live-agregatsioon
- haridusandmeallikate live-agregatsioon
- eraldi client-side documents-haldur
- mitme paneeliga keeruline töölaud

## 7. Vestlusvoog

Teenuse põhi on juhitud state machine. Kasutajateekond liigub sisuliselt läbi järgmiste etappide:

- intake
- service level check
- kontakt ja nõusolekud
- profiili kogumine või importimine
- profiili kinnitamine
- eneseanalüüs
- probleemi või eesmärgi täpsustamine
- eesmärkide seadmine
- suundade shortlist
- valikute analüüs
- tegevusplaan
- kokkuvõte
- vajadusel follow-up või handoff

Teenuse UX peab jääma vestluslikuks. Structured UI on toetav, mitte domineeriv.

## 8. Profiilimudel

Teenuse sisemine profiilimudel peab suutma hoida vähemalt:

- identiteeti ja kontakte
- eesmärki
- tööstaatust
- haridust
- töökogemust
- oskusi
- huve
- väärtusi
- piiranguid
- valmisolekut ja ajasurvet
- soovitatud suundi
- nõusolekuid
- recommendation context'i

Oluline reegel:
iga oluline väli peab kandma metaandmeid `value`, `source` ja `status`, et oleks võimalik eristada:

- kasutajalt saadud infot
- CV-st saadud infot
- süsteemi järeldust
- puuduvaid või kinnitamata välju

## 9. Profiili eesmärgikiht

Lisaks taustprofiilile peab teenus hoidma eesmärgikihti, mis kirjeldab:

- primaryGoal
- urgency
- incomePressure
- willingnessToCompromise
- preferredNextStep

See aitab eristada olukordi, kus kasutaja vajab:

- kiiret tööle jõudmist
- karjääriselgust
- ümberõpet
- kandideerimisabi

## 10. Küsitluse ja vestluse loogika

Teenuse küsimused peavad koguma infot vähemalt järgmistes plokkides:

- eesmärk ja ajasurve
- tugevused
- ülekantavad oskused
- huvid
- väärtused
- piirangud
- tööeelistused
- karjääriselgus
- karjäärikindlus
- õppimisvalmidus
- järgmine samm

Küsimusi tuleb esitada väikeste osadena, mitte pika ankeedina.

Kasutaja peab saama vastata ka vabatekstiga. Inline nupud ja valikud on lubatud, aga ainult abiks, mitte ainsaks sisendivormiks.

## 11. Sobivuse ja suundade analüüs

Iga soovitus või suund peab sisaldama vähemalt:

- miks sobib
- mis on puudu
- mida kasutaja saab lisaks pakkuda
- järgmine samm

Sobivust ei esitata musta kasti protsendina. Kasutatakse selgeid tasemeid ja põhjendusi.

OSKA / taxonomy kiht aitab:

- normaliseerida ametinimetusi
- siduda oskusi ja valdkondi
- leida seotud ameteid
- tugevdada explainability't

## 12. Dokumendivoog

Teenuse dokumentide osa peab toetama vähemalt järgmisi flow'sid:

- CV_BUILD
- CV_TAILOR
- APPLICATION_EMAIL
- COVER_LETTER
- MOTIVATION_LETTER
- RECOMMENDATION_HELP

Dokumendivoog peab:

- küsima puuduvaid sisendeid
- kontrollima consent'i
- töötama prepared-data põhiselt
- vältima väljamõeldud fakte
- lubama tulemuse allalaadimist või jätkamist samas töövoos

## 13. Konfidentsiaalsus ja consent

Teenuses peab olema jõustatud:

- konfidentsiaalsus
- nõusolek
- kolmandatele osapooltele info jagamise kontroll
- alaealise guardian consent
- tundlike tegevuste eraldi kontroll
- handoff, kui AI ei peaks edasi otsustama

Kui vajalik consent puudub, peab teenus peatama tundliku sammu ega tohi jätkata vaikimisi.

## 14. Roll ja channel

Teenus on praegu chat-first ja jääb selleks ka ärimudeli vaates.

See tähendab:

- kasutaja näeb üht vestlusvoogu
- info andmine ja nõustamine on sisemiselt eristatavad, kuid mitte eraldi nähtavad töövood
- teenus ei vaja eraldi testide või admin töölauda esmaversioonis
- tulevane multi-channel laiendus peab olema võimalik, kuid ei ole esmase teenuse eeltingimus

## 15. Mitmekeelsus

Teenuse kasutajaliides ja tekstikiht peavad toetama vähemalt:

- eesti
- vene
- inglise

Mitmekeelsus peab olema olemas nii küsimustes, vastustes, dokumentide juhistes kui ka teenuse selgitustes.

## 16. Kvaliteedinõuded

Teenuse väljund peab olema:

- selge
- inimlik
- põhjendatav
- mitte liialt tehniline
- konfidentsiaalne
- professionaalne

Teenuse kvaliteet tähendab ka seda, et:

- kasutaja ei pea teadma sisemist tehnilist arhitektuuri
- agent ei tohi näida kindlam kui tegelik andmestik lubab
- kui infot napib, siis teenus küsib juurde

## 17. MVP piirid

Praeguse versiooni jaoks ei ole vaja:

- täismahus testimissüsteemi
- live tööpakkumiste integratsioone
- live haridusandmeallikaid
- eraldi documents-haldurit kõigile rollidele
- keerukat mitme paneeliga töölauda

Küll aga peab olemas olema:

- hästi juhitud vestlus
- struktureeritud profiil
- dokumenditugi
- taxonomy / OSKA põhjenduskiht
- consent ja handoff

## 18. Kokkuvõte

SotsiaalAI karjäärinõustaja on chat-first, struktureeritud ja põhjendatav karjääriteenus. See toetab kasutajat töö- ja õppevalikutes, aitab koostada dokumente ning suudab vajadusel suunata inimese edasi inimesele. Teenuse disain on kooskõlas karjäärinõustamise materjalide, eetikareeglite ja praktilise teenusloogikaga.
