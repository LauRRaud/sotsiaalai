# Career Agent

## Mis agenti me arendame

Arendame uut protsessipõhist karjäärinõustamise agenti kaustas `/lib/career-agent`.

See ei ole lihtsalt üks prompt või soovituste generaator. Tegemist on samm-sammulise nõustamisagendiga, mis liigub läbi karjäärinõustamise voo ja teeb otsuseid canonical profiili, state machine'i, policy-reeglite ning struktureeritud küsimuste põhjal.

Agendi põhiülesanded:

- võtta vastu kasutaja sisend ja CV-st või vestlusest saadud canonical profiiliandmed
- luua ja hoida struktureeritud karjääriprofiili, kus väljad kannavad `value`, `source` ja `status` metaandmeid
- liikuda läbi nõustamisvoo state machine'i abil
- küsida õigeid küsimusi õiges etapis
- teha suundade shortlist ja sobivusanalüüs
- koostada vähemalt üks konkreetne järgmine samm
- avada vajadusel dokumendiflow
- jõustada privacy-, ethics- ja handoff-reegleid koodis
- kasutada OSKA / Oskuste Kompassi taxonomy kihti matchingu ja rikastuse toetamiseks

## Põhiarhitektuur

Moodul on ehitatud puhta kihistusena.

`/lib/career-agent/profile`
- canonical profiilimudel ja helperid
- parseri patch ei ole canonical profiil
- profiiliväljad kasutavad `source` ja `status` meta-contract'i

`/lib/career-agent/core`
- state machine
- question bank
- matching engine
- action plan
- response templates
- orchestrator

`/lib/career-agent/documents`
- dokumentide flow'd
- deterministic template'id
- document generator
- integration layer

`/lib/career-agent/taxonomy`
- OSKA API client
- normalizer
- taxonomy service
- OSKA matching bridge

`/lib/career-agent/ethics`
- privacy rules
- handoff rules
- ethical handoff rules
- e-counselling mode logic

`/lib/career-agent/adapters`
- sisendadapterid, mis valmistavad turn payload'i puhtalt ette enne orchestratori kasutust

## Olulised põhimõtted

- canonical profile shape määrati enne parserit, orchestratorit ja UI integratsiooni
- vana ja uus loogika ei segune
- policy ei ela ainult promptis, vaid enforcement-koodis
- document flow'd ei tohi minna edasi placeholder-andmetega
- consent gating peab töötama enne tundlikke tegevusi
- matching ja response kihid peavad toetama canonical entry-shape'e
- moodul peab olema hiljem ühendatav olemasoleva chat-page adapteriga, kuid UI integratsiooni praegu ei tehta

## Praeguseks valmis suuremad osad

- canonical career profile schema ja helperid
- state machine koos agreements, handoff ja stabiilse flow-loogikaga
- question bank koos `CONFIRM_PROFILE` sammuga
- matching engine, mis toetab canonical list- ja object-entry kujusid
- action plan koos consent-aware document suggestion loogikaga
- response templates canonical suunaobjektide ja affirmative küsimuste toega
- document flows, templates, generator ja integration layer
- OSKA API klient, normalizer, taxonomy service ja matching bridge
- privacy, handoff ja ethical handoff enforcement
- e-counselling mode, mis arvestab ainult relevantseid privacy action'eid
- orchestrator, mis seob kogu flow kokku
- turn input adapter, mis normaliseerib sisendi puhtaks mooduli contract'iks

## Mida see agent lõpuks võimaldab

MVP tasemel peab agent suutma:

- võtta vastu CV ja vestluse põhjal profiiliandmeid
- kinnitada profiili kasutajaga
- teha eneseanalüüsi
- shortlistida realistlikke suundi
- analüüsida töö- ja õpiteede sobivust
- pakkuda tegevusplaani
- avada dokumendivood nagu `CV_BUILD`, `CV_TAILOR`, `APPLICATION_EMAIL`, `COVER_LETTER`, `MOTIVATION_LETTER`, `RECOMMENDATION_HELP`
- suunata inimesele edasi, kui AI ei tohi või ei peaks üksi jätkama

## Kokkuvõte

`career-agent` on uus modulaarne karjäärinõustamise tuum, mille eesmärk on pakkuda usaldusväärset, protsessipõhist ja policy-jõustatud nõustamisvoogu.

See moodul on ehitatud nii, et hiljem saaks selle ühendada olemasoleva vestlus-UI külge, ilma et canonical profiili-, privacy-, matching- või dokumentide loogika peaks uuesti ümber tegema.
