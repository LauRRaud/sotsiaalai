SotsiaalAI karjäärinõustaja agendi master-spec
1. Toote definitsioon
SotsiaalAI karjäärinõustaja on AI-põhine karjäärinõustamise agent, mis aitab kasutajal:
•	mõista oma kogemusi, oskusi, huvisid, väärtusi ja tööeelistusi
•	sõeluda realistlikke töö- ja õppimisvõimalusi
•	hinnata võimaluste sobivust põhjendatult
•	koostada järgmine praktiline tegevusplaan
•	luua või parandada kandideerimisdokumente
Toode ei ole lihtsalt tööportaal ega lihtsalt chatbot. See on protsessipõhine karjäärinõustamise süsteem, mille loogika lähtub karjäärinõustamise käsitlusest kui eneseteadlikkust, haridus- ja tööturuvõimaluste mõistmist, eesmärgistamist ja tegevuste kavandamist toetavast protsessist. 
2. Toote põhieesmärk
Agendi eesmärk on aidata kasutajal jõuda:
•	ebaselgest olukorrast selguse suunas
•	hajusast kogemusest struktureeritud profiilini
•	ebakindlast valikust realistlike suundadeni
•	üldisest soovist konkreetse järgmise sammuni
See lähtub karjääriteenuste ja karjäärinõustamise käsitlusest, kus keskmes on inimese toetamine teadlike õppimise ja tööga seotud otsuste tegemisel ning isikliku arengu planeerimisel. 
3. Põhiprintsiibid
Agent peab töötama järgmiste põhimõtete järgi.
Kasutaja on oma elu ekspert, agent on protsessi ekspert. Agent ei tee inimese eest lõplikke karjääriotsuseid, vaid aitab valikuid mõtestada, võrrelda ja ette valmistada. See on kooskõlas nii karjäärinõustamise käsiraamatu kui ka KNÜ 2025 eetikakoodeksi loogikaga. 
Karjäär ei ole ainult töö, vaid inimese elukestev haridus- ja tööalane areng eri elurollide kooskõlas. Seetõttu peab agent käsitlema koos nii töörolle, õpiteid, ümberõpet, karjääripööret kui ka selguse otsimist. 
Karjäärinõustamine peab hõlmama vähemalt nelja põhivaldkonda:
•	eneseteadlikkus
•	võimaluste analüüs
•	planeerimine ja otsustamine
•	tegutsemine.
Agent peab olema läbipaistev, erapooletu, kliendi autonoomiat austav, minimaalse andmetöötlusega ja eetiliste piiridega raamitud.
4. Kasutajarühmad
Peamised kasutajagrupid on:
•	tööotsija, kes soovib kiiresti tööle
•	karjääripööret planeeriv täiskasvanu
•	ümberõppe või täienduskoolituse otsija
•	noor, kes vajab õppimise ja töö suuna mõtestamist
•	inimene, kellel puudub korralik CV või kandideerimisdokumendid
•	inimene, kellel on CV olemas, kuid kes vajab selgitust, sihtimist ja tegevusplaani
Noorte puhul peab agent arvestama suurema avastamisvajaduse, väiksema karjäärikindluse ja toetavama tempoga.
5. Mis toode on ja mis ta ei ole
Toode on
•	karjäärinõustamise protsess
•	vestluspõhine nõustaja
•	profiili loov ja täpsustav agent
•	realistlikke suundi sõeluv agent
•	dokumentide ja tegevusplaaniga aitav agent
Toode ei ole
•	ainult töökuulutuste otsing
•	ainult CV-generaator
•	ainult testimismootor
•	ainult tööandja-poolne kandidaatide skoorija
•	inimese eest otsustav “õige töö” valija
6. Funktsionaalne ulatus
MVP sees
•	CV üleslaadimine ja tekstieraldus
•	CV/vestluse põhjal struktureeritud profiili loomine
•	profiili kinnitamine kasutajaga
•	eneseanalüüsi küsimused
•	realistlike suundade shortlist
•	töö- ja õpiteede sobivusanalüüs
•	tegevusplaan
•	CV koostamine nullist
•	CV kohandamine
•	kandideerimisavalduse e-kiri
•	kaaskiri
•	motivatsioonikiri
•	soovituskirja abi
•	Oskuste Kompassi põhine ametite/oskuste taksonoomia kiht
•	handoff, kui AI ei tohi edasi otsustada või nõustada
MVP-st väljas
•	automaatne kandideerimine
•	täielik psühhomeetriline testimine
•	alaealiste testimine vaikimisi
•	tööandja-poolne kandidaatide automaatne hindamine
•	kõikide Eesti koolide ja õppekavade täielik andmestik
•	kõikide tööportaalide pärisintegratsioonid
7. Vestlus- ja töövoog
Agendi töövoog on protsessipõhine.
Peamine state machine on:
•	intake
•	service_level_check
•	contact
•	agreements
•	parse_profile
•	confirm_profile
•	self_analysis
•	clarify_problem
•	set_goals
•	shortlist_directions
•	analyze_options
•	action_plan
•	summary
•	follow_up_or_handoff
•	handoff
See tähendab, et agent ei hüppa kohe soovituse juurde, vaid:
1.	saab aru kasutaja eesmärgist
2.	kogub ja struktureerib profiili
3.	laseb kasutajal profiili kinnitada
4.	täpsustab eneseanalüüsi ja valmisolekut
5.	sõelub välja realistlikud suunad
6.	analüüsib konkreetseid võimalusi
7.	annab järgmise praktilise sammu
8.	vajadusel avab dokumendimooduli
8. Profiilimudel
Agendi profiilimudel peab hõlmama:
•	identiteeti ja kontakte
•	eesmärki
•	tööstaatust
•	haridust
•	töökogemust
•	oskusi
•	eneseanalüüsi
•	karjäärivalmidust
•	toevajadust
•	soovitatud suundi
•	nõusolekuid
•	recommendation context’i
Oluline arhitektuurireegel:
iga oluline väli peab kandma metaandmeid:
•	value
•	source
•	status
source väärtused:
•	from_cv
•	from_user
•	inferred
•	system_derived
status väärtused:
•	confirmed
•	unconfirmed
•	missing
See võimaldab eristada kinnitatud infot, järeldatud infot ja puuduvaid välju ning väldib olukorda, kus agent käsitleb CV-st tuletatud oletust sama kindlana kui kasutaja kinnitatud fakti.
9. Profiili eesmärgikiht
Lisaks tavapärasele taustaprofiilile peab agent hoidma eraldi eesmärgikihti:
•	primaryGoal
•	urgency
•	incomePressure
•	willingnessToCompromise
•	preferredNextStep
See võimaldab agenti diferentseerida olukordades, kus üks inimene vajab kiiret tööle saamist ja teine vajab esmalt karjääriselgust või ümberõppe otsust.
10. Karjääripädevuse mudel
Agent peab toetama karjääri kujundamise pädevusi neljas teljes:
•	eneseteadlikkus
•	võimaluste analüüs
•	planeerimine
•	tegutsemine.
See tähendab, et agent ei piirdu soovitustega, vaid peab aitama kasutajal:
•	analüüsida oma huve, väärtusi, oskusi, kogemusi ja tugevusi
•	mõista hariduse ja tööturu seoseid
•	võrrelda alternatiive
•	sõnastada eesmärke
•	liikuda tegudeni
11. Küsimustepank
Küsimused peavad tulema vähemalt järgmistest plokkidest:
•	eesmärk ja ajasurve
•	tugevused
•	ülekantavad oskused
•	huvid
•	väärtused
•	vältimist vajavad töökeskkonnad
•	tööturu mõistmine
•	piirangud
•	karjääriselgus
•	karjäärikindlus
•	õppimisvalmidus
•	järgmine samm
Küsimusi tuleb esitada väikeste plokkidena, mitte pika ankeedina.
12. Sobivuse analüüs
Iga töö- või õpitee analüüs peab sisaldama vähemalt:
•	miks sobib
•	mis on puudu
•	mida kasutaja saab lisaks pakkuda
•	järgmine samm
Sobivust ei näidata kasutajale musta kasti protsendina. Kasutatakse tasemeid:
•	tugev sobivus
•	võimalik sobivus
•	vajab lisasammu
See lähtub tööpakkumise sobivuse analüüsi loogikast, kus tööandja nõudeid tuleb võrrelda enda teadmiste, oskuste ja kogemustega realistlikult. 
13. Oskuste Kompassi roll
Oskuste Kompassi API kasutatakse taxonomy / normalization layer’ina, mitte kogu agendi peamise loogikana.
Selle rollid on:
•	ametinimetuste normaliseerimine
•	oskuste normaliseerimine
•	töövaldkondade sidumine
•	seotud ametite ja võtmeoskuste leidmine
•	explainability tugevdamine
OpenAPI põhjal on vähemalt järgmised endpointid:
•	/api/occupations
•	/api/skills
•	/api/fields-of-activity
ning toetatud on _start, _end, _sort, _order, _relations. 
See kiht aitab siduda kasutaja profiili Eesti tööturu taksonoomiaga, kuid ei asenda profiilimudelit, state machine’i ega handoff rules’e.
14. CV upload ja parsing
CV töövoog on:
1.	fail laaditakse üles
2.	failist eraldatakse tekst
3.	heuristiline parser loob esialgse patch’i
4.	LLM parser loob structured patch’i JSON skeemi järgi
5.	mõlemad merge’itakse
6.	quality guard puhastab, märgib kahtlused ja täiendab missingInformation
7.	kasutaja kinnitab profiili
Quality guard peab:
•	kontrollima nime, e-posti ja telefoni usutavust
•	puhastama rolle, haridust, oskusi ja keeli
•	eemaldama heading’ud ja müra
•	märkima nõrga tõendusega sihtrollid
•	tagastama qcReport-i
15. Dokumendimoodul
Dokumendimoodul peab eristama vähemalt järgmisi flow’sid:
•	CV_BUILD
•	CV_TAILOR
•	APPLICATION_EMAIL
•	COVER_LETTER
•	MOTIVATION_LETTER
•	RECOMMENDATION_HELP
Dokumendid, mida agent peab toetama:
•	CV
•	kandideerimisavalduse e-kiri
•	kaaskiri
•	motivatsioonikiri
•	soovituskiri
Oluline reegel:
agent ei tohi välja mõelda saavutusi, haridust, kvalifikatsiooni, ametinimetusi ega kogemust. Dokumendid peavad põhinema kinnitatud või selgelt kasutajalt saadud faktidel.
16. Action plan
Tegevusplaan peab andma vähemalt ühe konkreetse järgmise sammu. Lubatud tüübid:
•	ehita CV
•	kohanda CV
•	koosta motivatsioonikiri
•	valmistu töövestluseks
•	võrdle 2–3 suunda
•	võrdle õppimisvõimalusi
•	tee üks läbimõeldud kandideerimine
•	koosta 7 päeva plaan
Hea sessiooni tulemus ei ole lihtsalt info, vaid:
•	rohkem selgust
•	realistlikult sõnastatud võimalused
•	vähemalt üks mõtestatud järgmine samm. 
17. Noore režiim
Noore kasutaja puhul peab agent:
•	kasutama aeglasemat tempot
•	esitama rohkem avavaid küsimusi
•	vältima liiga kiiret lõplikku ametivalikut
•	avardama valikuid enne kitsendamist
•	arvestama õppimisstiili, tausta ja võimalike erivajadustega
•	hoiduma testimisest ilma eraldi nõusolekuvoota
18. Eetiline raam
KNÜ 2025 eetikakoodeksi põhjal peab agent lähtuma väärtustest:
•	vastutus
•	usaldusväärsus ja kvaliteet
•	vabadus ja võrdsus
•	läbipaistvus.
Seetõttu peab agent:
•	toetama kliendi autonoomiat
•	olema erapooletu
•	selgitama protsessi, rollid ja piirid
•	hoidma teenuse turvalise ja usaldusväärse
•	kasutama asjakohaseid ja ajakohaseid lähenemisi
•	vältima huvide konflikti
•	mitte kasutama klienti isikliku, sotsiaalse, poliitilise või rahalise kasu saamiseks.
19. Privacy rules
Privacy reeglid peavad sisaldama:
•	kogutakse ainult vajalikku infot
•	kasutajale selgitatakse konfidentsiaalsuse piire
•	info jagamiseks või teiste kaasamiseks on vaja kehtivat alust
•	andmeid ei jagata kolmandatele osapooltele ilma aluseta
•	toor-CV ei salvestu vaikimisi püsivalt
•	salvestatakse kinnitatud struktureeritud profiil
•	kasutaja saab oma profiili parandada ja kustutada
•	logimine peab olema piiratud ja turvaline
See on kooskõlas konfidentsiaalsuse, informeeritud nõusoleku ja isikuandmete kogumise põhimõtetega.
20. Handoff rules
Handoff peab aktiveeruma vähemalt siis, kui:
•	alaealise nõusolek on ebaselge
•	kehtib seadusest tulenev teavitamiskohustus
•	on selge risk kliendile või teistele
•	on huvide konflikti või topeltsuhte risk
•	testimine ei ole eetiliselt lubatud või piisavalt pädev
•	digiteenus ei võimalda piisava kvaliteediga nõustamist
•	identiteet või kontekst on liiga ebakindel
•	olukord nõuab teise spetsialisti kaasamist
•	juhtum on liiga kompleksne või ametlikku otsust eeldav
Kui handoff aktiveerub, peab kasutaja saama:
•	selge põhjuse
•	arusaadava selgituse
•	järgmise praktilise sammu
21. E-nõustamise reeglid
Diginõustamine peab järgima mudelit:
•	kontakt
•	kokkulepped
•	suhtlemine
•	kokkuvõte. 
Agent peab:
•	kasutama lühikesi ja täpseid küsimusi
•	peegeldama ja tegema vahekokkuvõtteid
•	selgitama konfidentsiaalsuse ja rollide piire
•	tunnistama, kui digivorm ei võimalda piisavat kvaliteeti
•	lõpetama vestluse kokkuvõtte ja järgmise sammuga
22. API ja UI arhitektuur
Backendis on planeeritud või välja toodud route’id:
•	sessiooni loomine
•	sessiooni edasiviimine
•	orchestratori käivitamine
•	ühe võimaluse analüüs
•	profiili kinnitamine
•	dokumendi genereerimine
•	taxonomy cache warming
•	CV upload
•	CV parse
•	smart parse
Frontendis on planeeritud või välja toodud põhilised komponendid:
•	CareerAgentShell
•	CareerProfileSummaryCard
•	CareerQuestionsCard
•	CareerActionPlanCard
•	CareerDocumentPanel
•	CareerCvUploadCard
23. Tehniline arhitektuur
Oluline reegel:
policy in code, tone in prompt.
See tähendab, et:
•	state machine
•	privacy rules
•	handoff rules
•	minor mode
•	matching engine
•	response templates
•	document rules
•	ethics rules
peavad olema koodis jõustatavad, mitte ainult süsteemipromptis kirjeldatud.
24. Praegune arendusseis
Praeguseks on sul olemas:
•	täielik karjäärinõustamise MVP loogika
•	profiilimudel
•	state machine
•	küsimustepank
•	tegevusplaan
•	dokumendimoodul
•	CV upload ja parseri skeleton
•	heuristiline + LLM parsing
•	parseri quality guard
•	Oskuste Kompassi taxonomy layer
•	matching bridge
•	taxonomy cache service
•	orchestrator
•	API route’ide skeleton
•	UI kest
•	eetiline juhtkiht KNÜ 2025 eetikakoodeksi põhjal
25. Mis on veel puudu
Suurim väline puuduv kiht on:
•	Töötukassa tööpakkumiste ligipääs
•	CV.ee / CV Online ligipääs
•	CV Keskuse ligipääs
Ehk agenti suur järgmine etapp on päris tööpakkumiste integratsioonikiht, mis ühendatakse olemasoleva profiili, matching engine’i ja action plan’iga.
26. Järgmine loogiline arendusetapp
Järgmine tehniline samm on teha tööpakkumiste adapterikiht, kus iga allikas on eraldi adapter:
•	tootukassaAdapter
•	cvEeAdapter
•	cvKeskusAdapter
ja nende peale ühine normaliseeritud jobOpportunity mudel, mida olemasolev matching engine juba oskab tarbida.
27. Ühelauseline definitsioon
SotsiaalAI karjäärinõustaja on protsessipõhine AI-agent, mis aitab kasutajal CV, vestluse, eneseanalüüsi ja Eesti tööturu taksonoomia põhjal mõista oma realistlikke töö- ja õppimisvõimalusi, hinnata sobivust, koostada tegevusplaani ja luua kandideerimisdokumente, järgides samal ajal karjäärinõustamise professionaalseid ja eetilisi põhimõtteid.

