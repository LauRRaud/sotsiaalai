# Materials Findings

See on sisuline kokkuvõte sellest, mida `agent_job/materials` tähendab meie karjäärinõustamise agendi jaoks.

## 1. Karjäärinõustamine on protsess, mitte üks vastus

Käsiraamat ja teenusstandard kinnitavad, et karjäärinõustamine ei ole üks staatiline soovitus. See on vestluspõhine ja etapiline protsess, kus:

1. selgitatakse olukord
2. toetatakse eneseanalüüsi
3. tehakse valikuid ja otsuseid
4. kavandatakse järgmisi samme

See on kooskõlas meie agendi state machine'i ja küsimuspõhise vooga.

## 2. Nõustaja roll on toetav, mitte otsustaja

Eetikakoodeks ja teenusstandard rõhutavad, et klient on oma otsustes sõltumatu. Nõustaja loob tingimused, selgitab võimalusi, aitab mõtestada ja hoiab protsessi ausana. Agent peab seetõttu:

1. selgitama, mitte suruma
2. põhjendama soovitusi
3. hoidma kasutaja autonoomiat
4. vältima lubadusi tulemuste kohta

See toetab meie explainable matching'u ja action plan'i loogikat.

## 3. Konfidentsiaalsus ja consent on keskne osa

Materjalid kinnitavad, et karjäärinõustamine on konfidentsiaalne ning andmete jagamine eeldab selget nõusolekut. Alaealiste puhul tuleb testimine siduda seadusliku esindaja nõusolekuga.

See sobib otse meie agendi:

1. privacy gating'uga
2. document generation consent'iga
3. testing consent'iga
4. handoff'i ja blocked action'i loogikaga

## 4. Dokumentide koostamine peab olema ettevalmistatud ja sihitud

CV, kaaskirja, motivatsioonikirja, avalduse ja soovituskirja näidised näitavad, et dokumendid ei ole lihtsalt tekstiplokid. Neil on kindel struktuur, eesmärk ja tonaalsus.

See tähendab meie agendi jaoks:

1. dokumendivood peavad kasutama prepared data't
2. puuduvaid sisendeid tuleb küsida enne mustandi loomist
3. dokumendi tulem peab olema selgelt eristatav soovitusest

## 5. Töö sisu ja karjäärivalikud tuleb siduda tööturu kontekstiga

Materjalid rõhutavad tööturu vajadusi, õppimisvõimalusi, töötingimusi ja keeleoskuse tasemeid. See toetab meie taxonomy- ja OSKA-lahendust.

Praktiliselt tähendab see, et agent peaks:

1. siduma suunad ja ametid realistliku töö-/õppekontekstiga
2. arvestama töötingimusi ja keelenõudeid
3. kasutama taksonoomiat mitte dekoratsioonina, vaid põhjenduse osana

## 6. Teenus on laiem kui ainult üks kanal

Materjalid räägivad ka telefonist, veebist, e-kirjast, grupinõustamisest ja kohapealsest teenusest. Meie agent on praegu chat-first, kuid need materjalid meenutavad, et lõpplahendus ei pea jääma ainult ühte kanalisse.

See tähendab, et arhitektuuris tasub hoida:

1. vestluse-põhist põhivoogu
2. võimalust saata kasutaja vajadusel teise kanalisse
3. rollipõhist downstream käitumist

## 7. Mida see meie agendi jaoks tähendab

Materjalid kinnitavad, et meie agent on õigel rajal, kui ta:

1. töötab protsessina, mitte ühe promptina
2. hoiab profiili canonical kujul
3. eristab kinnitatud ja kinnitamata infot
4. jõustab consent'i ja privacy reegleid koodis
5. teeb explainable soovitusi
6. oskab dokumente koostada alles siis, kui sisend on piisav

## Kokkuvõte

Kõige olulisem järeldus on lihtne: materjalid toetavad meie agendi arhitektuuri, mitte ei nõua selle ümberkirjutamist. Need kinnitavad, et õige lahendus on struktureeritud, eetiline, nõusolekupõhine ja põhjendatav karjäärinõustamise agent, mitte lihtsalt tekstigeneraator.
