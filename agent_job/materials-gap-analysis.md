# Materials Gap Analysis

See analüüs võrdleb `agent_job/materials` sisulisi põhimõtteid meie karjäärinõustamise agendiga.

## Mis on hästi kooskõlas

Käsiraamat ja teenusstandard toetavad tugevalt meie protsessipõhist lähenemist. Materjalides on karjäärinõustamine kirjeldatud kui toetav, etapiline ja eesmärgistatud protsess, kus klienti aidatakse eneseanalüüsis, valikute tegemisel ja järgmiste sammude kavandamisel. See sobib hästi meie state machine'i, küsimuste loogika ja action plan'iga.

Eetikakoodeks toetab meie privacy- ja handoff-loogikat. Konfidentsiaalsus, informeeritud nõusolek, kliendi autonoomia, võrdne kohtlemine ja piiratud info jagamine on kõik põhimõtted, mida meie agent juba koodis jõustab. See tähendab, et meie tehniline enforcement on sisuliselt materjalidega samal joonel.

Dokumendinäidised toetavad hästi CV, kaaskirja, motivatsioonikirja, avalduse ja soovituskirja voogusid. Materjalid näitavad, et dokumentidel on selge struktuur ja siht, mis õigustab meie range prepared-data lähenemist.

OSKA ja taxonomy suund on samuti kooskõlas. Materjalid rõhutavad tööturu ja haridusvõimaluste konteksti, keeleoskuse tasemeid ning kutseala kirjeldusi. See toetab meie decision logic'ut, kus suundade ja ametite põhjendamine ei ole ainult skoor, vaid ka sisuline kontekst.

## Mis on meie agendis juba tugevam

Meie agent on materjalidest detailsem tehnilises kontrollis. Ta eristab canonical profiili, kinnitamata ja kinnitatud infot, samuti käsitleb prepared data't rangelt. Materjalid kirjeldavad seda pigem inimnõustaja tasemel, mitte süsteemi kujul.

Meie agent on tugevam explainability's. Materjalid räägivad küll professionaalsest toetamisest ja soovituste andmisest, kuid meie lahendus toob välja, miks suund sobib, mis on puudu ja mis on järgmine praktiline samm.

## Mis on veel katmata või vajab teadlikku otsust

Materjalid kirjeldavad lisaks individuaalsele nõustamisele ka grupinõustamist, infotööd, e-kirja, veebi ja telefoni kaudu osutatavat teenust. Meie agent on praegu chat-first. See sobib lähteks, kuid kui tahame teenuse katvust laiemaks teha, tuleb need kanalid eraldi modelleerida.

Teenusestandard ütleb selgelt, et karjäärinõustamisel kasutatakse vajadusel teste, töölehti, harjutusi ja küsimustikke. Meie agent oskab küsimusi esitada ja nõusolekut kontrollida, kuid ei ole veel täielik testimismootor. Kui tahame seda täielikult kattuvaks teha, vajab testimise osa eraldi selgemat disaini.

Käsiraamat ja teenusstandard rõhutavad ka karjääriinfo vahendamist eraldi tööliinina. Meie agent teeb küll info vahendamist läbi matching'u ja OSKA, aga karjääriinfo spetsialisti roll ei ole veel UI-s ega voos eraldi välja joonistatud. See on pigem teadlik integratsiooniotsus kui viga.

## Kõige olulisemad järeldused

1. Materjalid kinnitavad, et meie agent on õige sisuga ja õiges suunas.
2. Suurimad nõuded, mis materjalidest tulevad, on konfidentsiaalsus, nõusolek, kliendi autonoomia ja põhjendatav nõustamine.
3. Meie agent on juba materjalidest edasi arendatud, mitte nendega vastuolus.
4. Järgmised selged täiendused on kanalite mitmekesistamine, testimise täpsem modelleerimine ja karjääriinfo vahendamise rolli täpsem eristamine.

## Lühike otsus

Materjalid ei sunni meid agendi arhitektuuri ümber tegema. Need kinnitavad pigem, et olemasolev canonical-profile + state-machine + consent-gating + explainability lähenemine on õige valik.
