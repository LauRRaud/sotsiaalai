# Materials Requirements

See dokument koondab karjäärinõustamise materjalidest lähtuvad nõuded meie agendile ning märgib ära, mis on juba kaetud ja mis ei ole praegu otseselt vajalik.

## Juba olemas

- Protsessipõhine nõustamine, mitte üksik prompt või ühe sammu assistent.
- Canonical profiil, kus oluline info on struktureeritud ja eristatav päritolu ning kinnituse järgi.
- Küsimuste loogika, mis toetab järk-järgulist info kogumist ja profiili täpsustamist.
- Profiili kinnitamise samm enne sügavamat soovituste või tegevusplaani koostamist.
- Konfidentsiaalsuse, nõusoleku ja kolmandatele osapooltele info jagamise kontroll.
- Testide ja tundlike tegevuste puhul consent-gating.
- Alaealise puhul guardian consent.
- Jõustatud handoff, kui nõustamine ei peaks või ei saa ainult AI-ga jätkuda.
- Dokumendivoogude koostamine prepared-data põhiselt, mitte placeholder-andmetega.
- Karjääri- ja tööinfo sidumine taksonoomia ja OSKA kontekstiga.
- Explainable matching, kus soovitusel on põhjendus, mitte ainult skoor.
- Mitmekeelne tugi vähemalt eesti, vene ja inglise keeles.
- Selge dokumentide töövoog CV, kaaskirja, motivatsioonikirja, soovituskirja ja avalduse jaoks.

## Endiselt vajalik

- Rollipõhine või kanali-põhine kohandumine backendis ja sisemises loogikas, kui hiljem laiendame teenust üle chat-first kanali.
- OSKA ja muu taxonomy rikastuse kasutamine suundade, ametite ja õpiteede põhjendamiseks.
- Selge käsitlus sellest, kuidas kasutaja saab karjäärivoogu oma sõnadega käivitada.
- Selge viis, kuidas kasutaja näeb, et workflow on aktiivne.
- Info andmise ja nõustamise eristus ainult sisemises loogikas, mitte eraldi nähtavate töövoogudena.

## Ei ole praegu otseselt vaja

- Täielik multi-channel teenuse modelleerimine ühes ja samas UI-s.
- Terviklik testimismootor koos eraldi testide haldusega.
- Eraldi spetsialistide töölaud või karjäärinõustaja admin-vaade.
- Täielik analüütika ja teenuse kvaliteedi dashboard.
- Live integratsioonid väliste tööpakkumiste või haridusandmeallikatega, kui need ei ole veel osa esmaversioonist.
- Eraldi documents-haldur kliendi jaoks, kui dokumendi töövoog töötab juba vestluse ja olemasoleva dokumendi koostamise lehe kaudu.

## Täpsustus testide kohta

Materjalid ütlevad, et teste võib nõustamises kasutada ja et alaealiste puhul on vajalik guardian consent. See tähendab, et meil peab olema consent-gating ja võimalus testidega seotud tegevusi piirata.

See ei tähenda, et me peaksime praegu ehitama täismahulise testimismootori. Praeguses versioonis piisab sellest, et:
- agent oskab testimisega seotud tegevusi ära tunda
- agent oskab consent'i kontrollida
- UI ja backend oskavad vajadusel testiga seotud voo peatada või edasi suunata

## Materjalidest tulenevad otsused

1. Agendi keskne disain peab jääma protsessipõhiseks.
2. Nõusolek ja konfidentsiaalsus on enforcement, mitte ainult tekst promptis.
3. Dokumendid peavad lähtuma ettevalmistatud andmest.
4. Soovitused peavad olema põhjendatavad ja seotud oskuste ning taksonoomiaga.
5. Praegune chat-first UX on sobiv lähtepunkt, kuid teenuse kirjeldus on laiem kui ainult chat.

## Kokkuvõte

Materjalid kinnitavad olemasolevat arhitektuurisuunda. Praegu on kõige olulisemad nõuded juba kaetud ning otseselt puudu on pigem kanalite laiendamine ja teenuse rolliloogika täpsem eristus. Täismahus testimismootor ei ole esimese versiooni jaoks vajalik, küll aga peab testidega seotud consent-gating olemas olema.
