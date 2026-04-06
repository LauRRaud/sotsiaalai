# Help-režiimi tekstid

See fail koondab help-režiimi eestikeelsed tekstid ühest kohast ülevaatamiseks.

Allikad:
- `messages/et.json`
- `lib/help/chatWorkflowText.js`
- `lib/help/workflowQuestions.js`
- `lib/help/workflowPreview.js`
- `lib/help/workflowActions.js`

## Algustekstid

| Võti | Tekst | Kus kasutatakse |
| --- | --- | --- |
| `chat.empty_intro_help_request` | Tere! Võid kirjutada kohe kogu abisoovi ühe lausega. Kirjelda lühidalt, millist abi vajad, kellele, kus ja millal; ma küsin ainult puuduva üle. Tühistamiseks vajuta abisoovi ikooni. | Abisoovi režiimi avatekst |
| `chat.empty_intro_help_offer` | Tere! Võid kirjutada kohe kogu abipakkumise ühe lausega. Kirjelda lühidalt, millist abi saad pakkuda, kellele, kus ja millal; ma küsin ainult puuduva üle. Tühistamiseks vajuta abipakkumise ikooni. | Abipakkumise režiimi avatekst |

## Entry

| Võti | Tekst | Kus kasutatakse |
| --- | --- | --- |
| `chat.helpWorkflow.entry.helpOffer` | Sain aru, et soovid vormistada abipakkumise. Kas jätkame sellega? | Algne intent-kinnitus |
| `chat.helpWorkflow.entry.helpRequest` | Sain aru, et soovid vormistada abisoovi. Kas jätkame sellega? | Algne intent-kinnitus |
| `chat.helpWorkflow.entry.reprompt` | Palun vasta "jah" või "ei". | Kui kasutaja ei vasta selgelt |
| `chat.helpWorkflow.entry.cancelled` | Selge, jätame selle abikuulutuse praegu pooleli. | Kui kasutaja katkestab enne vormistamist |

## Küsimused: Abipakkumine

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.questions.offer.describe` | Palun kirjelda lühidalt, mida soovid pakkuda, kellele ja kus. |
| `chat.helpWorkflow.questions.offer.rawPlace` | Palun kirjuta, kus abi pakkuda soovid. |
| `chat.helpWorkflow.questions.offer.rawPlaceTransport` | Mis piirkonnas või millisel marsruudil saad transpordiabi pakkuda? |
| `chat.helpWorkflow.questions.offer.helpType` | Kas see abi on vabatahtlik, tasuline või oled avatud mõlemale? |
| `chat.helpWorkflow.questions.offer.compensationDetails` | Palun kirjelda lühidalt tasu tingimusi. |
| `chat.helpWorkflow.questions.offer.timeType` | Kas see abi on ühekordne, regulaarne või paindlik? |
| `chat.helpWorkflow.questions.offer.availability` | Millal saad alustada või millal see abi on saadaval? |
| `chat.helpWorkflow.questions.offer.scope` | Kas soovid lisada tingimusi või täpsustusi, näiteks mis aegadel või mis ulatuses saad aidata? |
| `chat.helpWorkflow.questions.offer.scopeTransport` | Kas saad aidata sõidutamisega, saatmisega või transpordi korraldamisega? Lisa palun lühidalt piirangud või täpsustused. |
| `chat.helpWorkflow.questions.offer.scopeDigital` | Kas digiabi toimub kohapeal või kaugelt? Kirjuta palun lühidalt, millega täpsemalt saad aidata. |
| `chat.helpWorkflow.questions.offer.scopeAdmin` | Kas saad aidata avalduste, vormide või e-teenustega? Kirjuta palun, kas abi toimub kohapeal või koos veebis. |
| `chat.helpWorkflow.questions.offer.scopeHome` | Millega saad koduabis aidata, näiteks koristamine, lihtsamad kodused tööd või muu praktiline abi? |

## Küsimused: Abisoov

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.questions.request.describe` | Palun kirjelda lühidalt, millist abi vajad, kellele ja kus. |
| `chat.helpWorkflow.questions.request.rawPlace` | Palun kirjuta, kus abi vaja on. |
| `chat.helpWorkflow.questions.request.rawPlaceTransport` | Mis piirkonnas või millisel marsruudil transpordiabi vaja on? |
| `chat.helpWorkflow.questions.request.beneficiary` | Kas see abisoov on sulle endale või kellelegi teisele? |
| `chat.helpWorkflow.questions.request.urgency` | Kui kiiresti abi vaja on: kohe, lähiajal või paindlikult? |
| `chat.helpWorkflow.questions.request.helpType` | Kas otsid vabatahtlikku abi, tasulist teenust või oled avatud mõlemale? |
| `chat.helpWorkflow.questions.request.compensationDetails` | Palun kirjelda lühidalt tasu või tasustamise eelistust. |
| `chat.helpWorkflow.questions.request.timeType` | Kas vajad seda abi ühekordselt, regulaarselt või paindlikult? |
| `chat.helpWorkflow.questions.request.availability` | Millal abi vaja on või millal võiks sellega alustada? |
| `chat.helpWorkflow.questions.request.availabilityTransport` | Millal transpordiabi vaja on? Kui soovid, lisa ka kellaaeg või nädalapäev. |
| `chat.helpWorkflow.questions.request.availabilityDigital` | Millal digiabi vaja on? Kui soovid, lisa ka, kas sobib pigem kohapeal või kaugelt. |
| `chat.helpWorkflow.questions.request.availabilityAdmin` | Millal asjaajamise või vormide abi vaja on? Kui on tähtaeg, kirjuta see ka palun juurde. |

## Küsimused: Ühised

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.questions.shared.contactPreference` | Kuidas soovid, et sinuga ühendust võetaks: vestluse kaudu, telefoni teel, e-posti teel või kokkuleppel? |
| `chat.helpWorkflow.questions.shared.targetGroup` | Kellele see abi on mõeldud? Näiteks eakale, täiskasvanule või puudega inimesele. |
| `chat.helpWorkflow.questions.shared.targetGroupClarifyOffer` | See küsimus on selle kohta, kellele sinu abi on mõeldud. Palun vasta näiteks: eakale, täiskasvanule või puudega inimesele. |
| `chat.helpWorkflow.questions.shared.category` | Millise abi alla see kõige paremini sobib? Näiteks transport, digiabi, koduabi või asjaajamise ja vormide abi. |
| `chat.helpWorkflow.questions.shared.title` | Panin pealkirja paika. Kui soovid teistsugust pealkirja, kirjuta see nüüd. |

## Küsimused: Asukoht

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.questions.location.confirmSingle` | Kas pead silmas omavalitsust `{municipality}`? |
| `chat.helpWorkflow.questions.location.detectedPlace` | Tuvastatud koht |
| `chat.helpWorkflow.questions.location.confirmSingleRetry` | Vasta "jah" või kirjuta õige omavalitsus või koht uuesti. |
| `chat.helpWorkflow.questions.location.confirmMany` | Leidsin mitu võimalikku omavalitsust. Millist neist mõtled? |
| `chat.helpWorkflow.questions.location.confirmManyHint` | Vasta nime või numbriga. |
| `chat.helpWorkflow.questions.location.askMunicipality` | Kas pead silmas mõnda kindlat omavalitsust või piirkonda? |

## Reflectionid

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.reflections.offerSummary` | Sain aru, et soovid pakkuda `{category}{target}{place}`. |
| `chat.helpWorkflow.reflections.requestSummary` | Sain aru, et vajad `{category}{target}{place}`. |
| `chat.helpWorkflow.reflections.locationWithMunicipality` | Märkisin asukohaks `{rawPlace}` ja omavalitsuseks `{municipality}`. |
| `chat.helpWorkflow.reflections.locationOnly` | Märkisin asukohaks `{rawPlace}`. |
| `chat.helpWorkflow.reflections.helpType` | Märkisin, et tegu on `{helpType}` abiga. |
| `chat.helpWorkflow.reflections.timeType` | Märkisin ajalisuseks `{timeType}`. |
| `chat.helpWorkflow.reflections.contactPreference` | Märkisin kontaktiviisiks `{contactPreference}`. |
| `chat.helpWorkflow.reflections.beneficiary` | Märkisin, et abi on vaja `{beneficiary}`. |
| `chat.helpWorkflow.reflections.urgency` | Märkisin kiireloomulisuseks `{urgency}`. |
| `chat.helpWorkflow.reflections.conditions` | Märkisin tingimused. |
| `chat.helpWorkflow.reflections.title` | Märkisin pealkirjaks "{title}". |

## Preview

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.preview.offerTitle` | Palun vaata abipakkumine üle. |
| `chat.helpWorkflow.preview.requestTitle` | Palun vaata abisoov üle. |
| `chat.helpWorkflow.preview.offerTypeValue` | Abipakkumine |
| `chat.helpWorkflow.preview.requestTypeValue` | Abisoov |
| `chat.helpWorkflow.preview.savePrompt` | Kui sobib, vasta „jah“. Kui ei sobi, vasta „ei“ ja kirjuta, mida soovid muuta. |
| `chat.helpWorkflow.preview.editPrompt` | Selge. Kirjuta palun, mida soovid muuta. |

## Labelid

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.labels.type` | Tüüp |
| `chat.helpWorkflow.labels.title` | Pealkiri |
| `chat.helpWorkflow.labels.description` | Kirjeldus |
| `chat.helpWorkflow.labels.primaryCategory` | Põhikategooria |
| `chat.helpWorkflow.labels.secondaryCategories` | Lisakategooriad |
| `chat.helpWorkflow.labels.municipality` | Omavalitsus |
| `chat.helpWorkflow.labels.rawPlace` | Täpsem asukoht |
| `chat.helpWorkflow.labels.targetGroups` | Sihtrühm |
| `chat.helpWorkflow.labels.helpForm` | Abi vorm |
| `chat.helpWorkflow.labels.compensationInfo` | Tasu info |
| `chat.helpWorkflow.labels.compensationPreference` | Tasu eelistus |
| `chat.helpWorkflow.labels.timeType` | Ajalisus |
| `chat.helpWorkflow.labels.availabilityOrStart` | Saadavus / algus |
| `chat.helpWorkflow.labels.availabilityForRequest` | Vajalik aeg / algus |
| `chat.helpWorkflow.labels.conditions` | Tingimused |
| `chat.helpWorkflow.labels.skillsOrBackground` | Oskused või taust |
| `chat.helpWorkflow.labels.contactPreference` | Kontaktiviis |
| `chat.helpWorkflow.labels.beneficiaryLabel` | Kellele abi vaja on |
| `chat.helpWorkflow.labels.urgency` | Kiireloomulisus |
| `chat.helpWorkflow.labels.status` | Staatus |

## Salvestus

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.saved.offer` | Aitäh! Abipakkumine on salvestatud. |
| `chat.helpWorkflow.saved.request` | Aitäh! Abisoov on salvestatud. |
| `chat.helpWorkflow.create.cancelled` | Selge, katkestasin selle abikuulutuse vormistamise. |

## Browse

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.browse.nextOffers` | Järgmisena võite kirjutada: "näita sobivaid pakkumisi". |
| `chat.helpWorkflow.browse.nextRequests` | Järgmisena võite kirjutada: "näita sobivaid abisoove". |
| `chat.helpWorkflow.browse.emptyOffers` | Sobivaid aktiivseid abipakkumisi veel ei leitud. |
| `chat.helpWorkflow.browse.emptyRequests` | Sobivaid aktiivseid abisoove veel ei leitud. |
| `chat.helpWorkflow.browse.foundOffers` | Leidsin `{count}` võimalikku pakkumist. |
| `chat.helpWorkflow.browse.foundRequests` | Leidsin `{count}` võimalikku abisoovi. |
| `chat.helpWorkflow.browse.connectHintOffers` | Kui soovite kedagi ühendada, kirjutage näiteks: "ühenda esimese pakkumisega". |
| `chat.helpWorkflow.browse.connectHintRequests` | Kui soovite kedagi ühendada, kirjutage näiteks: "ühenda esimese abisooviga". |
| `chat.helpWorkflow.browse.sourceMissingOffers` | Enne pean teadma, millise abisoovi jaoks pakkumisi vaadata. |
| `chat.helpWorkflow.browse.sourceMissingRequests` | Enne pean teadma, millise abipakkumise jaoks abisoove vaadata. |

## Connect

| Võti | Tekst |
| --- | --- |
| `chat.helpWorkflow.connect.needBrowse` | Enne ühendamist pean kõigepealt näitama sobivaid tulemusi. |
| `chat.helpWorkflow.connect.askWhich` | Kirjuta palun, millise tulemusega soovid ühendada, näiteks "ühenda 1". |
| `chat.helpWorkflow.connect.created` | Ühendus on loodud. Vestlus on nüüd leitav vestluste loendis. |
| `chat.helpWorkflow.connect.alreadyActive` | Selle kuulutuse jaoks on aktiivne match juba olemas. |
| `chat.helpWorkflow.connect.failed` | Ühenduse loomine ebaõnnestus. |

## Kus mis tekst elab koodis

- `workflowQuestions.js`
  küsib `entry.*`, `questions.*`
- `workflowPreview.js`
  kasutab `reflections.*`, `preview.*`, `labels.*`
- `workflowActions.js`
  kasutab `saved.*`, `browse.*`, `connect.*`
- `chatWorkflowText.js`
  loeb kõik need võtmed `messages/et.json` failist
