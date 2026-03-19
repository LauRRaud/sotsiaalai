# Karjäärinõustamise agent

## Mis see agent on

`career-agent` on uus protsessipõhine karjäärinõustamise agent, mille tuum asub kaustas `/lib/career-agent`.

See ei ole lihtsalt üks vestlusprompt ega “matchingu assistent”, vaid samm-sammuline nõustamisagent, mis liigub läbi struktureeritud karjäärinõustamise voo ja teeb otsuseid canonical profiili, state machine'i, küsimuste loogika, policy-reeglite ja dokumendiflow'de põhjal.

Agendi eesmärk on aidata kasutajal:

- sõnastada oma olukord ja vajadus
- luua struktureeritud karjääriprofiil
- kinnitada profiili koos kasutajaga
- teha eneseanalüüsi
- leida realistlikud töö- või õpisuunad
- hinnata valikute sobivust
- saada konkreetne tegevusplaan
- avada vajadusel dokumentide loomise voog
- minna vajadusel edasi handoff'i inimesele

## Kuidas agent mõtleb

Agendi keskmes on canonical karjääriprofiil. Profiili iga oluline väli ei hoia ainult väärtust, vaid ka selle päritolu ja kindlust:

- `value`
- `source`
- `status`

Toetatud `source` tüübid:

- `from_cv`
- `from_user`
- `inferred`
- `system_derived`

Toetatud `status` tüübid:

- `confirmed`
- `unconfirmed`
- `missing`

See tähendab, et agent ei toetu lihtsalt “mingi info on olemas” loogikale, vaid suudab eristada:

- mida ütles kasutaja ise
- mida tuli CV parserist
- mida süsteem järeldas
- mis on veel kinnitamata

## Kuidas agent liigub läbi voo

Agent töötab state machine'i peal. Peamised state'id on:

- `intake`
- `service_level_check`
- `contact`
- `agreements`
- `parse_profile`
- `confirm_profile`
- `self_analysis`
- `clarify_problem`
- `set_goals`
- `shortlist_directions`
- `analyze_options`
- `action_plan`
- `summary`
- `follow_up_or_handoff`
- `handoff`

See tähendab, et agent ei hüppa kohe soovituste juurde. Ta liigub etapiviisiliselt edasi ainult siis, kui vajalikud sisendid, kinnitused ja nõusolekud on olemas.

## Mida agent praktiliselt teeb

Praeguse arhitektuuri järgi peab agent suutma:

- võtta vastu kasutaja sõnumi ja muu turn-payloadi
- kohandada CV parseri väljundi canonical profile patch'iks
- normaliseerida sisendi ühtseks runtime + profile contract'iks
- küsida igas state'is õiged küsimused
- kinnitada profiili enne sügavamat nõustamist
- shortlistida võimalikud töö- või õpisuunad
- analüüsida võimalusi matching engine'i kaudu
- pakkuda vähemalt ühe konkreetse järgmise sammu
- avada dokumentide loomise vood
- kasutada OSKA taxonomy kihti suundade ja võimaluste rikastamiseks
- jõustada privacy, ethics ja handoff reegleid enne tundlikke tegevusi

## Dokumendivood

Agent toetab dokumentide poolel vähemalt neid canonical flow'sid:

- `CV_BUILD`
- `CV_TAILOR`
- `APPLICATION_EMAIL`
- `COVER_LETTER`
- `MOTIVATION_LETTER`
- `RECOMMENDATION_HELP`

Dokumendikiht on teadlikult:

- deterministlik
- LLM-vaba template-kihis
- consent-gated
- range prepared-data contract'iga

See tähendab, et dokumente ei tohi genereerida placeholder-väärtustega ega ilma vajaliku nõusolekuta.

## Ethics ja privacy

Agendi oluline osa on see, et policy ei ela ainult promptis.

Süsteem jõustab koodis:

- privacy consenti
- document generation consenti
- job matching consenti
- testing consenti
- third-party sharing consenti
- alaealisega seotud piiranguid
- ethical handoff juhtumeid

Kui AI ei tohi või ei peaks üksi edasi nõustama, siis agent ei lähe lihtsalt “edasi”, vaid aktiveerib handoff'i või peatab tundliku sammu.

## OSKA ja taxonomy kiht

Agent kasutab eraldi taxonomy kihti, mis on ehitatud OSKA / Oskuste Kompassi kasutuseks.

Selle roll on:

- rikastada võimalikke suundi
- siduda kasutaja profiili töö- ja õpiteede taksonoomiaga
- parandada suundade shortlisti ja võimaluste analüüsi kvaliteeti

See kiht on hoitud eraldi, et matching engine ja taxonomy adapterid ei seguneks omavahel.

## Miks see moodul ehitati eraldi

Uut `career-agent` moodulit ei ehitatud vana süsteemi lappides.

See loodi puhtalt selleks, et vältida varasemate lahenduste tüüpilisi probleeme:

- canonical profile shape ja parseri patch shape segunemine
- wiring mismatch'id state machine'i ja question layer'i vahel
- document flow nimede ebajärjekindlus
- placeholder-andmetega “valmis” dokumentide tekkimine
- privacy ja ethics loogika jäämine ainult deklaratiivseks tekstiks
- liiga paljude kattuvate policy-failide teke

## Milleks see valmis on

Moodul on ehitatud nii, et seda saab hiljem ühendada olemasoleva vestlus-UI või chat-page adapteriga.

Praegu on rõhk pandud sellele, et agent oleks:

- puhta sisemise arhitektuuriga
- testitav
- modulaarne
- policy-jõustatud
- valmis hilisemaks integratsiooniks

## Kokkuvõte

`career-agent` on uus karjäärinõustamise tuummoodul, mis ühendab:

- canonical profiilimudeli
- state machine'i
- küsimuste loogika
- matching'u ja soovitused
- tegevusplaani
- dokumendivood
- taxonomy / OSKA kihi
- ethics / privacy / handoff enforcement'i

Selle eesmärk on pakkuda usaldusväärset, järjekindlat ja päriselt juhitavat AI-põhist karjäärinõustamise voogu, mida saab hiljem turvaliselt ühendada olemasoleva platvormi kasutajaliidesega.
