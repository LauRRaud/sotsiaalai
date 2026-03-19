Tegime SotsiaalAI karjäärinõustaja agendile juurde eetilise juhtkihi, mis põhineb KNÜ 2025 karjäärispetsialisti eetikakoodeksil. See tähendab, et agent ei ole enam ainult tehniliselt hästi üles ehitatud, vaid tema tööloogika on nüüd seotud ka selgete eetiliste põhimõtetega: vastutus, usaldusväärsus ja kvaliteet, vabadus ja võrdsus ning läbipaistvus. Kood eeldab ka seda, et klient jääb oma otsustes sõltumatuks, teenus on vabatahtlik ja erapooletu ning protsessi alguses selgitatakse rolle ja koostöö viisi.

Uued failid ja loogikakihid

Me lisasime sisuliselt neli uut eetika plokki:

careerEthicsRules.js

careerPrivacyRules.ethics.js

careerHandoffRules.ethics.js

careerSystemPromptEthics.js

Nende eesmärk on tõlkida eetikakoodeks tehnilisteks reegliteks.

1. careerEthicsRules.js

Siia läksid agendi põhiväärtused ja üldised eetilised piirid:

agent vastutab teenuse kvaliteedi eest, kasutaja oma otsuste ja tegevusplaani elluviimise eest

agent on erapooletu

agent ei otsusta kasutaja eest

agent selgitab oma rolli ja piire

agent ei tohi olla manipuleeriv ega “must kast” kasutaja vaates

See peegeldab väga otseselt eetikakoodeksi väärtuste plokki.

2. careerPrivacyRules.ethics.js

Siia läksid andmekaitse ja konfidentsiaalsuse reeglid:

küsitakse ainult vajalikku infot

kasutajale selgitatakse konfidentsiaalsuse piire

andmeid ei jagata ilma kehtiva aluseta

teiste kaasamine eeldab nõusolekut

digivahendite kasutamisel tuleb arvestada andmekaitse ja turvalisusega

profile patch’i ja CV töövoog jääb minimaalse andmetöötluse põhimõtte alla

See põhineb nii eetikakoodeksil kui ka käsiraamatu konfidentsiaalsuse ja informeeritud nõusoleku osal.

3. careerHandoffRules.ethics.js

Siia lisasime eraldi eetilised handoff põhjused, mitte ainult sisulised või tehnilised. Näiteks:

alaealise nõusoleku ebaselgus

seadusest tulenev teavitamiskohustus

selge oht kliendile või teistele

huvide konflikt või topeltsuhte risk

testimine ei ole eetiliselt lubatud või piisavalt pädev

digiteenuse kvaliteet ei ole piisav

identiteet või kontekst on liiga ebakindel

vaja on teise spetsialisti koostööd

See tuli väga selgelt eetikakoodeksi klienditöö, hindamismeetodite ja digivahendite peatükkidest.

4. careerSystemPromptEthics.js

Siia läks süsteemitaseme eetiline lisa:

agent peab olema erapooletu, lugupidav ja hinnanguvaba

kasutaja autonoomia peab jääma keskseks

protsessi alguses tuleb selgitada rolli, võimalusi ja piire

kui teema vajab ametlikku otsust või inimese sekkumist, tuleb see otse välja öelda

digiteenuse kvaliteedipiir tuleb tunnistada, mitte jätta varjatuks

See sobitub eetikakoodeksi läbipaistvuse ja kliendi autonoomia põhimõtetega.

Mis muutus olemasolevas arhitektuuris

Eetika ei jäänud eraldi failidesse, vaid me ühendasime selle päriselt süsteemi sisse.

careerOrchestrator.js sai eetilise juhtkihi

Sinna lisandus:

sessiooni alguse eetiline notice, mis selgitab kasutajale teenuse rolli, andmekasutust ja piire

combined handoff logic, kus tehnilised ja eetilised handoff põhjused töötavad koos

privacy meta, mis hindab, kas andmete jagamiseks on kehtiv alus

action plan’i ja summary juurde kliendi autonoomia rõhutus, et agent ei otsusta kasutaja eest

See tähendab, et orkestreerija teeb nüüd otsuseid mitte ainult “kas infot on piisavalt”, vaid ka “kas seda on eetiline selles vormis teha”.

careerECounsellingMode.js sai eetilise e-nõustamise loogika

Sinna lisandus:

kontaktifaasis rolli ja protsessi selgitus

agreements-faasis konfidentsiaalsuse ja andmekasutuse teade

communication rules’i sisse erapooletus ja autonoomia

safety rules’i sisse digiteenuse kvaliteedipiir

privacy rules’i plokk diginõustamise jaoks

See lähtub otseselt eetikakoodeksi digivahendite ja -keskkondade osast.

Mis muutus UI-s

Me sidusime eetika ka kasutajaliidesega, et see poleks backendis peidus.

CareerAgentShell.jsx

Sinna lisandus:

EthicsNoticeCard, mis näitab sessiooni alguses teenuse raami ja eetilisi piire

HandoffCard, mis ei näita enam lihtsalt “handoff”, vaid annab:

põhjuse

arusaadava selgituse

järgmise sammu CTA

See teeb teenuse kasutajale usaldusväärsemaks, sest süsteem ei jäta muljet, nagu ta võiks kõike ise ära otsustada.

CareerDocumentPanel.jsx

Sinna lisandus:

eetiline märkus dokumendiloome kohta

selge reegel, et dokument peab põhinema kinnitatud faktidel

hoiatus, et saavutusi, kvalifikatsiooni või rolle ei tohi välja mõelda

märkus, et kasutaja peab enne kasutamist mustandi üle kontrollima

See on oluline, sest dokumentide genereerimine on üks koht, kus AI võib muidu liiga kergesti hakata “parema teksti nimel” fakte juurde looma.

Mis väärtus nüüd juurde tuli

Kui enne oli agent:

sisuliselt tugev

tehniliselt hästi läbi mõeldud

hea flow’ga

siis nüüd on ta lisaks:

eetiliselt raamitud

läbipaistvam

turvalisem

usaldusväärsem kasutaja jaoks

Kõige tähtsam muutus on see, et agenti tööloogika ütleb nüüd palju selgemalt:

mida ta tohib teha

mida ta ei tohi teha

millal peab ta edasi suunama

millal ei tohi ta tekitada näilist kindlustunnet

Kus me nüüd seisame

Praeguseks on SotsiaalAI karjäärinõustaja agendil olemas:

karjäärinõustamise protsessimudel

profiilimudel

state machine

handoff rules

minor mode

privacy rules

CV upload + parser + quality guard

action plan

dokumendimoodul

Oskuste Kompassi taxonomy layer

orchestrator

API route’id

UI kest

ja nüüd ka eetiline juhtkiht KNÜ 2025 eetikakoodeksi põhjal