# Materials vs Agent

See võrdlus põhineb `agent_job/materials` sisul ja praegusel karjäärinõustamise agendi arhitektuuril. Fookus on sellel, kas materjalid toetavad meie agendi loogikat ja kus on veel võimalikku täiendamist.

## Mis klapib hästi

Karjäärinõustamise käsiraamat ja teenusstandard sobivad hästi agendi protsessiloogikaga. Materjalid kirjeldavad nõustamist kui etapiviisilist tegevust, kus esmalt selgitatakse olukord, seejärel toetatakse eneseanalüüsi, valikute tegemist ja järgmiste sammude kavandamist. See on kooskõlas agendi state machine'i, küsimuste loogika ja action plan'i lähenemisega.

Eetikakoodeks toetab väga selgelt meie privacy- ja handoff-loogikat. Seal rõhutatakse konfidentsiaalsust, kliendi autonoomiat, läbipaistvust, võrdset kohtlemist ja professionaalse vastutuse põhimõtteid. Agent jõustab need põhimõtted koodis, mitte ainult promptis, seega on suund materjalidega hästi kooskõlas.

Nõusoleku vorm testimiseks kinnitab, et alaealiste puhul peab testimine toimuma seadusliku esindaja nõusolekul ning tulemuste jagamine on piiratud. See sobib otseselt meie agendi consent-gating'uga ja toetab eraldi testimise ning dokumentide genereerimise piiranguid.

Dokumendinäidised on karjääridokumendi voogude jaoks väga sobivad. CV, kaaskiri, motivatsioonikiri, avaldus ja soovituskiri annavad täpse sisulise raami, mille järgi on lihtne ehitada deterministlikke dokumendimalle ja prepared-data kontrakti. See ühtib meie dokumendikihtide lähenemisega.

## Kus agent on materjalidest ees

Meie agent on praegu tugevam tehnilises kontrollis kui materjalide narratiivne kirjeldus. Materjalid räägivad peamiselt inimnõustaja tööpõhimõtetest, meie agent aga rakendab neid põhimõtteid struktureeritud profiili, küsimuspanga, sobivusmootori, taxonomy rikastuse ja dokumentide voogude kaudu. See on sisuliselt sama teenuse loogika, aga automatiseeritud ja rangemalt normaliseeritud kujul.

Agentil on ka tugevam explainability kiht kui materjalid otseselt ette kirjutavad. Materjalid rõhutavad küll toetamist ja suunamist, kuid meie agent oskab konkreetselt näidata, miks mingi suund sobib, mis on puudu ja milline samm järgmisena võtta. See on loogiline edasiarendus, mitte vastuolu.

Taxonomy ja OSKA rikastus ei ole materjalides nii detailselt lahti kirjutatud, nagu meie agent seda kasutab. See tähendab, et agent kasutab materjale pigem teenuse raamina ning OSKA-t eraldi sisulise rikastusallikana.

## Kus on veel ruumi täpsustamiseks

Materjalid viitavad ka grupinõustamisele, e-kirjale, veebi- ja telefoninõustamisele. Praegune agent on aga chat-first ja keskendub ühe vestluse protsessile. See ei ole probleem, kuid kui hiljem tahame teenust laiendada, tuleb need kanalid eraldi mõtestada.

Käsiraamatus ja koolitusmudelis on tugev teooria- ja kompetentsiraam, kuid need materjalid ei ütle otseselt, kuidas AI-agent peab käituma. Seepärast on meie agendis vajalik eraldi tehniline kontroll, et teooria ei jääks ainult tekstiks, vaid muutuks käitumisreegliteks.

Mõned taustmaterjalid, nagu uuringud ja lastevanemate juhendid, on pigem kõrvalkontekst kui otsene runtime-lähteallikas. Need on kasulikud sihtrühma ja teenuse laiemaks mõistmiseks, aga neid ei peaks otse agendi sisemisse loogikasse sisse kirjutama.

## Kokkuvõte

Materjalid toetavad hästi meie agendi põhisuunda: struktureeritud karjäärinõustamine, eetiline ja konfidentsiaalne töö, consent-gating, dokumentide ettevalmistus ja kliendi toetamine konkreetse järgmise sammuga.

Meie agent on nende materjalide pealt juba edasi arendatud tehnilise rakendusena, mis lisab:

1. canonical profiili
2. state machine'i
3. küsimuste ja vastuste struktureeritud töötluse
4. OSKA/taxonomy rikastuse
5. deterministlikud dokumendivood
6. koodis jõustatud privacy ja handoff reeglid

Seega on materjalid ja agent omavahel kooskõlas. Materjalid annavad teenuse ja eetika raami, agent annab selle raami toimivasse süsteemi.
