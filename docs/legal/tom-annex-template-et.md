# TOM Lisa

Kuupäev: 2026-03-15

## Eesmärk

Käesolev lisa kirjeldab SotsiaalAI tehnilisi ja korralduslikke turvameetmeid
("TOM-id"), mida rakendatakse isikuandmete töötlemisel organisatsiooni ja
SotsiaalAI vahelise andmetöötluslepingu, teenuslepingu või muu siduva
õigusliku raamistiku alusel.

See lisa on mõeldud kasutamiseks lepingu lisana. See ei kirjelda täielikku
sisevõrgu arhitektuuri ega muid turvatundlikke üksikasju, vaid annab piisava
ülevaate rakendatavatest meetmetest, et hinnata nende sobivust GDPR artiklite
28 ja 32 kontekstis.

## Kohaldamisala

Käesolev lisa hõlmab isikuandmete töötlemist SotsiaalAI platvormis, sealhulgas
kontohaldust, autentimist, vestlusi, ruume, abiandmete töövooge, dokumentide
haldust, dokumendi koostamist, dokumendi analüüsi, süvauuringut,
häälefunktsioone, tellimuste haldust ning nende töövoogude toimimiseks vajalikke
tehnilisi tugiteenuseid.

## Üldpõhimõte

SotsiaalAI rakendab riskipõhiseid tehnilisi ja korralduslikke meetmeid, mille
eesmärk on tagada isikuandmete konfidentsiaalsus, terviklus, käideldavus ja
taastatavus ning vähendada loata ligipääsu, andmekao, väärkasutuse,
muutmise või avalikustamise riski.

## 1. Krüpteeritud ühendused ja andmekaitse

- SotsiaalAI kasutab andmeedastuseks krüpteeritud ühendusi, sealhulgas HTTPS-i
  ja muid asjakohaseid transpordikihi kaitsemeetmeid.
- Saladused, autentimisvõtmed ja muud tundlikud süsteemiparameetrid hoitakse
  eraldi rakenduse lähtekoodist ning piiratud ligipääsuga keskkonnas.
- Isikuandmeid sisaldavad autentimis- ja kinnituskirjed, nagu PIN-i räsi,
  ühekordsed koodid ja ajutised sisselogimistokenid, ei salvestata lihttekstina
  juhul, kui selleks puudub selge tehniline vajadus.
- SotsiaalAI rakendab mõistlikke meetmeid, et vähendada andmete juhusliku lekke,
  loata avalikustamise või valesti adresseeritud töötlemise riski.

## 2. Ligipääsukontroll ja rollipõhisus

- Ligipääs isikuandmetele on piiratud rolli, tööfunktsiooni ja süsteemivajaduse
  põhimõttel.
- Platvorm rakendab kasutajarollidest lähtuvaid õiguskontrolle, et piirata
  andmete nähtavust ja tegevusi vastavalt konkreetsele töövoole.
- Administraatori funktsioone ja muid kõrgendatud õigusi kasutatakse piiratud
  ulatuses ning nende kasutus peab olema põhjendatud.
- SotsiaalAI piirab sisemist ligipääsu tootmisandmetele ainult nendele
  isikutele, kellel on selleks tööalane vajadus.

## 3. Logimine ja audit

- SotsiaalAI rakendab tehnilisi ja turbelogisid, et tuvastada vigu,
  kuritarvitusi, töökindluse probleeme ning turbesündmusi.
- Vajaduse korral säilitatakse auditikirjeid toimingute, dokumentide või
  maksetöötluse kontrollimiseks.
- Logimine toimub ulatuses, mis on vajalik süsteemi turvalisuse, töökindluse,
  probleemide lahendamise ja vastavuse tagamiseks.
- Ligipääs logidele on piiratud ning logisid ei kasutata turunduslikuks
  profileerimiseks.

## 4. Varundus ja taastamine

- SotsiaalAI rakendab mõistlikke varundus- ja taastamismeetmeid, et vähendada
  andmekao ja teenuse katkemise riski.
- Varundusmehhanismid peavad toetama teenuse taastamist pärast tehnilist riket
  või intsidenti.
- Taastamisprotseduurid vaadatakse perioodiliselt üle ning vajaduse korral
  testitakse nende toimivust.

## 5. Haavatavuste haldus ja uuendused

- SotsiaalAI rakendab tarkvara, sõltuvuste ja infrastruktuuri ajakohastamise
  protsessi, et vähendada teadaolevate haavatavuste riski.
- Turvaparandused, kriitilised uuendused ja asjakohased konfiguratsioonimuudatused
  rakendatakse mõistliku aja jooksul vastavalt riski tasemele.
- SotsiaalAI võib kasutada seiret, monitooringut ja muid tehnilisi kontrollimeetmeid,
  et avastada turbeprobleeme või ebatavalist käitumist.

## 6. Intsidentide käsitlus ja rikkumiste teavitus

- SotsiaalAI hoiab protsessi turbeintsidentide tuvastamiseks, haldamiseks,
  mõju hindamiseks ja kõrvaldamiseks.
- Isikuandmetega seotud rikkumise kahtluse või kinnituse korral hinnatakse
  rikkumise ulatust, mõjutatud andmeid, võimalikke tagajärgi ja vajalikke
  kaitsemeetmeid.
- Kui SotsiaalAI tegutseb volitatud töötlejana, teavitab ta vastutavat töötlejat
  isikuandmete rikkumisest põhjendamatu viivituseta pärast rikkumisest teada
  saamist, välja arvatud juhul, kui seadus nõuab teisiti.

## 7. Alamvolitatud töötlejate kontroll

- SotsiaalAI kasutab teenuse osutamiseks ainult selliseid alamvolitatud
  töötlejaid või teenusepakkujaid, kelle kasutamine on vajalik teenuse
  osutamiseks või tugifunktsioonide tagamiseks.
- Alamvolitatud töötlejate kasutamisel rakendab SotsiaalAI lepingulisi,
  tehnilisi ja korralduslikke kontrollimehhanisme, et tagada andmekaitse
  kohustuste järgimine.
- Olulisemate teenusepakkujate kategooriad hõlmavad muu hulgas makseteenuseid,
  tehisintellekti- ja kõneteenuseid, e-posti teenuseid, hostingut, logimist
  ja monitooringut.

## 8. Andmete säilitamine ja kustutus

- SotsiaalAI rakendab säilitamis- ja kustutusreegleid, et andmeid ei hoitaks
  kauem, kui see on vajalik töötlemise eesmärgi, teenuse töövoo, turvalisuse
  või õigusliku kohustuse täitmiseks.
- Erinevatele andmekategooriatele võivad kehtida erinevad säilitustähtajad,
  näiteks kontoga seotud andmed, vestlusajalugu, ruumide andmed, dokumendid,
  auditikirjed ja maksetega seotud kirjed.
- Aegunud andmed kustutatakse, kärbitakse või muudetakse kättesaamatuks
  vastavalt süsteemi retention-loogikale ja kohaldatavatele reeglitele.

## 9. Hostingupiirkond / serveri piirkond

- SotsiaalAI kirjeldab lepingus või selle lisas, millises piirkonnas teenuse
  põhihosting üldjuhul toimub.
- Vajaduse korral täpsustatakse, kas peamine hosting asub Eestis, mujal EL-is
  või EMP-s, või kasutatakse mitut piirkonda.
- Turvatundlikke üksikasju, nagu sisevõrgu skeemid, konkreetsed IP-aadressid
  või detailsed tulemüürireeglid, ei pea käesolevas lisas avaldama.

## 10. EL/EMP või võimalikud välisülekanded

- Kui isikuandmeid töödeldakse või tehakse kättesaadavaks väljaspool EL-i või
  EMP-d, tugineb SotsiaalAI sobivale õiguslikule ülekandemehhanismile, näiteks
  Euroopa Komisjoni piisavusotsusele või standardsetele lepingutingimustele.
- Vajaduse korral rakendatakse täiendavaid kaitsemeetmeid, arvestades töötlemise
  laadi, riske ja teenusepakkuja rolli.
- Vastutavale töötlejale antakse mõistliku taotluse korral lisateavet nende
  kaitsemeetmete kohta ulatuses, mis ei ohusta turvalisust ega riku teiste
  lepingute või seaduste piiranguid.

## 11. Regulaarne testimine ja ülevaatus

- SotsiaalAI vaatab turvameetmed perioodiliselt üle ning ajakohastab neid
  vastavalt tehnoloogia, riskide, teenuse funktsioonide ja õigusnõuete muutumisele.
- Vajaduse korral testitakse meetmete toimivust, sealhulgas taastatavust,
  õiguskontrollide toimimist ja muude asjakohaste kaitsemeetmete piisavust.
- Turvameetmete ülevaatus võib toimuda sisemiste kontrollide, tehniliste
  auditite, sündmuste analüüsi või muude asjakohaste hindamiste kaudu.

## Lepingu täpsustused

Käesolev lisa on üldine TOM-i kirjeldus. Konkreetse organisatsioonikliendi puhul
võib lisa täpsustada või täiendada, kui lepingu ese, töödeldavad andmeliigid,
serveripiirkond, alamvolitatud töötlejate ring või muud olulised asjaolud seda
vajavad.
