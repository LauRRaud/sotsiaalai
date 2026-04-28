# SotsiaalAI RAG Architecture And Roadmap

## Juhtpõhimõte

STATUS: active principle

SotsiaalAI RAG otsib laialt, filtreerib rangelt, koostab kontrollitud source package'i ja kuvab allikatena ainult need allikad, millele lõplik vastus sisuliselt toetub.

RAG pipeline peab eristama nelja kihti:

1. `retrieved candidates` - kõik otsinguga leitud võimalikud allikad.
2. `selected context sources` - allikad või paketid, mis saadetakse mudelile vastuse koostamiseks.
3. `answer sources` - allikad, millele lõplik vastus sisuliselt toetub.
4. `displayed sources` - kasutajale nähtavad allikad; peavad olema `answer sources` kontrollitud alamhulk või sama hulk.

Kasutajale nähtavad `Vastuste allikad` ei tohi olla kõik otsingukandidaadid ega kõik mudelile saadetud kontekstiallikad.
Kasutajale kuvatavad allikad ei tohi sisaldada allikaid, mida vastus ei kasutanud või mida server ei kinnitanud.

## Current State vs Target State

STATUS: active snapshot

| Area | Current | Target |
| --- | --- | --- |
| Source display | Uued RAG vastused kasutavad backendist tulnud `displayed_sources`; legal exact juhtumid on production smoke'iga kontrollitud; legacy `sources` jääb ainult vanade sõnumite ühilduvuseks | Täielik `displayed_sources` enforcement kõigis uutes RAG vastustes ja adminis nähtav display precision ning contract violation mõõdik |
| Retrieval | V2 kasutab dense + lightweight lexical kanaleid (`title_match`, `exact_phrase`, `bm25`) ning hybrid/RRF merge'i | Tugevam hübriidotsing koos metadata filtrite, full-text/BM25 indeksi ja vajadusel mudelipõhise reranking'uga |
| Attribution | `answer_source_ids`, `displayed_source_ids`, `attribution_decisions` ja legal attribution contract on kasutusel; legal exact puhul ei kuvata valet paragrahvi; `§999` / exact missing annab `insufficient_precise_legal_source_support` signaali; V3.4A section-level attribution on productionis kinnitatud package-aware ja high-risk vastustele | Claim-level attribution kõrge riskiga väidetele ning allikakonflikti põhjendatud lahendamine |
| Trace | `rag_trace` sisaldab `query_plan`'i, retrieval kanaleid, source kihte, `legalLookupPlan`'i, `selection_strategy`'t, riskitaset, legal exact signaale, runtime `source_packages` kokkuvõtet ning V3.4A `section_attribution` signaale; source-package ja attribution smoke kinnitavad trace kihi | Täisobservability koos source package'i, latency, tokenite ja kvaliteedimõõdikutega |
| KOV service model | Jõgeva KOV RT ja KOV web/service on clean canonical reingest'iga sees; V3.0A runtime `SourcePackage` builder koondab valitud konteksti sama `canonical_item_id` + `municipality_id` põhjal package summary'ks; vastamine on veel valdavalt chunk-põhine ja package-aware answering on V3.2 | Runtime või persisted `SourcePackage` teenustele, vormidele, kontaktidele ja õiguslikule alusele |
| Metadata | V2.5 canonical contract on kasutusel; clean canonical reingest on tehtud olemasoleva korpuse piires (`national_rt`, Jõgeva KOV RT, Jõgeva KOV web/service, ajakiri `Sotsiaaltöö`); readiness audit KOV-i ja ajakirja kohta andis `blocked=0`; legacy storage jäi rollback'iks alles | Kõik tulevased korpusepered map'ivad samale source contract'ile; org/template/methodology korpuste readiness ja ingest tuleb veel eraldi teha |


### V3.0A Implementation Update 2026-04-28

STATUS: implemented and smoke-tested

- Runtime `SourcePackage` builder on rakendatud `lib/chat/sourcePackages.js`.
- Selected context põhjal koostatakse ohutu `rag_trace.source_packages` summary.
- Builder rühmitab sama `canonical_item_id` + `municipality_id` järgi.
- `ragContext` kannab edasi `resource_type` ja `sections_present`.
- Unit/regression testid läbisid.
- Source-package smoke kinnitab päris Jõgeva KOV küsimusega `rag_trace.source_packages` olemasolu.
- V3.1 DB-write smoke kinnitab `SourcePackageSnapshot` persistence'i.


## Evolution Principle

STATUS: active principle

Süsteemi edasiarendamine ei tähenda, et praegune vana RAG pipeline peab jääma samaks. V1 eesmärk on vältida pimesi ümberkirjutamist, mitte lukustada olemasolevaid tehnilisi piire.

Legacy ühilduvus on üleminekuvahend:

- vanad vestlused ja olemasolevad allikad peavad jääma loetavaks;
- uusi kihte võib lisada adapterite või feature flag'ide taga;
- nõrgad või segased vanad vastutuspiirid võib refaktoreerida, kui uus data contract on selgem;
- vana `sources` loogika võib järk-järgult taanduda `displayed_sources`, `rag_trace` ja `attribution_decisions` kasuks;
- kui trace ja testid näitavad, et olemasolev retrieval, salvestus või UI allikaloogika on takistus, võib selle asendada, mitte ainult ümber pakkida.

Oluline põhimõte: vana süsteemi ei säilitata sellepärast, et see on olemas. Seda säilitatakse ainult nii kaua, kui see aitab turvaliselt üle minna kontrollitavamale ja usaldusväärsemale arhitektuurile.

## Evidence Policy

STATUS: active policy

Iga faktiväide peab võimaluse korral tuginema kontrollitud allikale. Kõrge riskiga väited, nagu õigus, toetus, summa, tähtaeg, vorm, kontakt, abikõlblikkus või kriisiolukorra juhis, vajavad tugevat tõendusastet.

Evidence strength:

- `strong` - ametlik, kehtiv, õige KOV-i või riikliku tasandi allikas, mis vastab küsimusele otseselt.
- `medium` - asjakohane ja autoriteetne allikas, kuid osaliselt kaudne või mittetäielik.
- `weak` - taustamaterjal, metoodiline käsitlus, artikkel või praktikanäide; sobib selgituseks, kuid mitte konkreetse õiguse, summa, tähtaja, vormi või kontakti kinnitamiseks.
- `insufficient` - allikas ei kinnita väidet piisavalt.

Kõrge riskiga väiteid ei tohi esitada kindla faktina, kui nende kohta puudub `strong` evidence. Sellisel juhul peab vastus ütlema, mida allikad kinnitavad, mida nad ei kinnita ja kust infot tuleks üle kontrollida.

Ajaloolist allikat, ajakirjaartiklit, praktikalugu või arvamust ei tohi kasutada tänase kehtiva õiguse, toetuse, vormi, tähtaja või kontakti tõendusena.

## Risk-Based RAG Policy

STATUS: active policy / partially implemented

Kõik kasutajaküsimused ei vaja sama ranget retrieval'i ja attribution'i taset.

- `low risk` - üldine selgitus, metoodiline taust, mõistete seletus.
- `medium risk` - KOV teenus, taotlemise sammud, vormid, kontaktid, praktiline juhendamine.
- `high risk` - õigus, toetus, summa, tähtaeg, abikõlblikkus, kehtivus, kriisiolukord.

Kõrge riskiga küsimuste puhul peab süsteem eelistama ametlikke ja kehtivaid allikaid ning andma kindla vastuse ainult siis, kui tõendus on piisav. Kui tõendus puudub, peab vastus kasutama insufficient evidence režiimi.

## Insufficient Evidence And Source Conflict Handling

STATUS: active policy / partially implemented

Kui süsteem ei leia piisavalt tugevat allikat, peab vastus eristama:

- mida allikad kinnitavad;
- mida allikad ei kinnita;
- milline info tuleb KOV-ist, õigusaktist või ametlikust allikast üle kontrollida.

Lõppkasutajale ei tohi allikapiirangut sõnastada sisemise otsingukonteksti kaudu. Vastus ei kasuta väljendeid nagu `nähtavas kontekstis`, `RAG kontekstis`, `kontekstis ei ole`, `selles vaates ei ole` või muid tehnilisi fraase, mis viitavad mudelile saadetud kontekstile.

Kui RAG/allikad ei anna piisavat kinnitust, kasutatakse loomulikku sõnastust, näiteks:

- "Praegu kasutatud allikad ei anna sellele piisavalt täpset vastust."
- "Ma ei saa seda nende allikate põhjal kindlalt kinnitada."
- "Leitud allikad puudutavad teemat, kuid ei kinnita seda detaili."
- "Ma ei leidnud praeguse otsinguga sellele piisavalt täpset allikavastet."

Õiguslike küsimuste puhul eelistada sõnastust:

- "Ma ei leidnud praeguse otsinguga sellele piisavalt täpset õiguslikku allikakinnitust."

Oluline: süsteem ei tohi väita, et midagi ei eksisteeri ainult seetõttu, et praegune otsing või RAG seda ei leidnud. Kui täpne allikas ei tulnud esile, peab vastus ütlema, et praeguse otsinguga ei leitud piisavat kinnitust.

Kui allikad on omavahel vastuolus, ei tohi vastus vastuolu ära siluda. Vastus peab nimetama vastuolu ja eelistama kõrgema autoriteediga, kehtivamat või konkreetsema intent'iga sobivat allikat. Näiteks õigusliku küsimuse puhul on kehtiv õigusakt tugevam kui artikkel; vormi küsimuse puhul võib ametlik vorm või e-teenuse link olla tugevam kui üldine teenuseleht.

## Freshness Policy

STATUS: active policy / partially implemented

Allika värskuse nõue sõltub allikatüübist.

- KOV kontaktid ja vormid vajavad regulaarset kontrolli ning vananenud `last_checked` peab olema adminis nähtav.
- KOV teenused ja toetused vajavad kehtivuse kontrolli, eriti kui vastus puudutab taotlemist, summat, tähtaega või tingimust.
- Õigusaktide puhul tuleb eelistada kehtivusinfoga ametlikku allikat.
- Artiklid, metoodika ja praktikalood võivad olla taustaks, kuid neid ei kasutata tänase kehtiva teenuseinfo tõendusena.

## KOV Disambiguation Policy

STATUS: active policy / partially implemented

KOV on hard filter ainult siis, kui kasutaja küsimus või tööruumi kontekst annab selle kõrge kindlusega.

Kui kasutaja viitab mitmele KOV-ile, näiteks elukoht on ühes ja viibimiskoht teises, peab süsteem vältima automaatset oletust. Sellisel juhul küsib süsteem täpsustust või annab tingimusliku vastuse, mis eristab KOV-e ja ütleb, millist infot tuleb üle kontrollida.

## Legal Exact Retrieval Policy

STATUS: active / implemented / production-smoked

- Kui kasutaja nimetab õigusakti ja konkreetse paragrahvi, muutub `paragraph_number` metadata hard filteriks.
- Semantiliselt sarnane säte ei tohi asendada otseselt küsitud paragrahvi.
- Näide: `SHS § 140?` peab kasutama `paragraph_number = "140"`; `§ 160` "Paragrahvi 140 rakendamine" võib olla debug-taseme retrieved kandidaat, aga ei tohi olla `selected context` ega `displayed source`.
- `explicit_paragraph` viide võidab alati teemaankrud ja vestluse ajaloo.
- `explicit_paragraph` tuvastus ei tohi sõltuda ainult `sourceLookupRequest` heuristikast; sisendkujud nagu `SHS § 140?`, `SHS §140`, `Sotsiaalhoolekande seadus § 140`, `Sotsiaalhoolekande seaduse § 140`, `SHS paragrahv 140` ja `Sotsiaalhoolekande seadus paragrahv 140` peavad minema legal exact rajale ka siis, kui muu lookup-heuristika oleks vaikimisi nõrk.
- `topic_to_paragraphs` režiimis ei hardcodeta paragrahve; otsing toimub akti canonical metadata ja teema-termide alusel.

Production smoke confirmation:

- SHS `§ 132` ja `§ 140` RAG-service direct exact paragraph filter läbib.
- Chat `SHS § 140?` kasutab `selection_strategy = legal_exact`.
- `selected_context_details` sisaldab ainult küsitud `paragraph_number` väärtust.
- `displayed_sources` ei ole tühi ja sisaldab ainult küsitud `paragraph_number` väärtust.
- History override ei vii tagasi vana teemaankru juurde.
- `SHS § 999?` ei asendu sarnase paragrahviga ja annab `insufficient_precise_legal_source_support = true`.

## V2.5 Pre-launch Canonical Hardening

STATUS: active implementation boundary

V2.5 on kohustuslik vahekiht enne V3.

V2.5 sisaldab:

- canonical metadata contract'i;
- RAG-service täielikke `where` filtreid;
- `legalLookupPlan` loogikat;
- legal exact retrieval selection'it;
- legal attribution contract'i;
- reingest readiness'i.

V3 `SourcePackage`'i ega claim-level attribution'it ei tohi ehitada segase legacy/canonical metadata peale.

## Pre-launch Canonical Reset Decision

STATUS: active implementation policy

- Kuna platvorm ei ole veel avalik, ei säilitata uut RAG-i ehitades vana ja uue metadata skeemi segadust.
- Legacy väljad on lubatud ainult sisendadapteris ja normalizeris.
- Uus ingest peab kirjutama canonical metadata väljad.
- Vajadusel tehakse backup + clean reingest, kuid ükski skript ei tohi production RAG storage'it automaatselt kustutada.

## V2.5 Clean Canonical Reingest

STATUS: completed for current available corpus / maintenance

2026-04-28 tehti kontrollitud clean canonical reingest töövoog:

- vana aktiivne RAG storage tõsteti legacy kausta rollback'i jaoks;
- uus `/var/lib/sotsiaalai-rag` loodi puhtalt;
- ingestiti SHS / national RT;
- ingestiti Jõgeva KOV RT;
- ingestiti Jõgeva KOV web/service;
- ingestiti ajakiri `Sotsiaaltöö`;
- legal exact smoke'id ja V2 metadata smoke'id läbisid.

Aktiivne corpus pärast reingest'i:

- `national_regulations`: 1
- `kov_regulations`: 1
- `kov_services`: 64
- `sotsiaaltoo_articles`: 638

Legacy storage:

- `/var/lib/sotsiaalai-rag.legacy.2026-04-28-0933` jäi alles rollback'i jaoks;
- seda ei kustutata enne, kui UI pärisküsimused ja täiendav smoke on kinnitanud uue storage'i stabiilsuse.

Known non-blocking recommended metadata:

- `kov_web`: `content_hash` recommended väli võib vajada hilisemat täiendust;
- `sotsiaaltoo_articles`: vanadel artiklitel võib `url_canonical` puududa, kui sisendis oli ainult `source_path` või PDF failinimi, mitte päris canonical URL;
- need ei ole required blockerid.

## ETAPP 8 Reingest Readiness

STATUS: completed / active tool

Readiness audit:

```text
npm run rag:reingest:readiness -- --root <INPUT_ROOT> --json logs/rag-reingest-readiness.json
```

Tõlgendus:

- `blocked > 0`: ära tee clean reingest'i enne parandust;
- `backfill_required > 0`: lubatud, kui normalizer/backfill suudab canonical väljad tuletada;
- `ready`: sisend on juba canonical või piisavalt täielik.

Kontrollitud tulemused:

- KOV root: `blocked = 0`, `backfill_required = 139`;
- ajakiri Sotsiaaltöö: `blocked = 0`, `backfill_required = 638`.

Runbook:

- detailne backup → clean storage → reingest → smoke → rollback juhis on failis `docs/internal/rag-clean-reingest-runbook.md`.

## P0 Known Defect: Legal Paragraph Filtering

STATUS: fixed / production-smoked

- `RAG-service /search where paragraph_number` peab päriselt filtreerima.
- `§ 140` filter ei tohi tagastada `§ 160`.
- ETAPP 1 parandas RAG-service filterikihi.
- ETAPP 3 ühendas selle `legalLookupPlan` ja query planneri kihiga.
- ETAPP 7 parandas live chat legal exact smoke'i.
- ETAPP 7.1 parandas `displayed_sources` ja exact-missing signaali.
- Production smoke'id kinnitasid, et `§ 140` ei too `§ 160` selected/displayed kihti.

## Teostusjärjekord

STATUS: historical roadmap / superseded by current V1-V2-V3 status blocks

### 1. Väike Golden Set

STATUS: done / maintenance

Kohe alguses tuleb teha umbes 20 küsimusega testikomplekt. See peab tekkima enne suuremaid RAG-i muudatusi või samas arendustsüklis koos trace'i ja allikafiltri esimese versiooniga, et iga muudatuse mõju oleks võrreldav.

Esialgsed juhtumid:

1. Mis on Võimaluste kohvik?
2. Mis oli Võimaluste kohvik 2017. aasta allika põhjal?
3. Mis on Kanep - mis on mis?
4. Leia konkreetse KOV-i koduteenus.
5. Kuidas taotleda konkreetse KOV-i sotsiaaltransporti?
6. Milline vorm on seotud konkreetse KOV-i hooldajatoetusega?
7. Kes on konkreetse teenuse kontaktisik?
8. Kas inimesel on õigus toimetulekutoetusele?
9. Mis on riikliku ja KOV tasandi info vahe selles küsimuses?
10. Küsimus, kus õige vastus on: allikas ei kinnita.
11. Küsimus, kus vana artikkel ei tohi muutuda tänaseks kehtivaks infoks.
12. Küsimus, kus ajakirjaartikkel sobib taustaks, aga mitte õiguslikuks aluseks.
13. Küsimus vale KOV-i välistamise kohta.
14. Küsimus vale keele välistamise kohta.
15. Küsimus, kus täpne pealkiri peab võitma semantilise sarnasuse.
16. Küsimus, kus vormi allikas peab olema ametlik.
17. Küsimus, kus kontakt peab tulema kontaktiallikast, mitte artiklist.
18. Pöörduja lihtkeelne küsimus.
19. Spetsialisti põhjalikum küsimus.
20. Küsimus, kus allikapaneel ei tohi näidata kõiki kandidaate.

Iga testi puhul hinnata:

- kas õige allikas leiti;
- kas vale allikas jäi välja;
- kas vastus ei väitnud rohkem kui allikas lubab;
- kas `displayed sources` on `answer sources` kinnitatud alamhulk või sama hulk;
- kas kasutajale ei kuvatud kasutamata kandidaate.

### 2. Minimaalne RAG Trace

STATUS: done / maintenance

Answer-source filtering'ut ei saa parandada pimesi. Iga RAG-vastuse juurde peab kohe logima vähemalt:

```json
{
  "retrieved_count": 0,
  "retrievers_used": [],
  "retrieved_source_ids": [],
  "selected_context_source_ids": [],
  "answer_source_ids": [],
  "displayed_source_ids": [],
  "filtered_out_source_ids": [],
  "filter_reasons": {},
  "attribution_decisions": []
}
```

See näitab, kas filter on liiga range, liiga leebe või ebajärjekindel.

### 3. Answer Sources / Displayed Sources Ausaks

STATUS: done / maintenance

Esimene prioriteet on parandada allikapaneeli loogika.

Praegune risk:

```text
retrieved candidates = displayed sources
```

Soovitud loogika:

```text
retrieved candidates
-> selected context sources
-> answer sources
-> displayed sources
```

Esimese versioonina võib süsteem nõuda, et vastuse koostamisel tagastatakse eraldi `answer_source_ids` ja `source_usage`. Hiljem saab liikuda lõigu- või väitepõhise attribution'i peale.

```json
{
  "answer_source_ids": [
    "tartu_linn_koduteenus_page",
    "tartu_linn_koduteenuse_taotlusvorm"
  ],
  "source_usage": [
    {
      "source_id": "tartu_linn_koduteenus_page",
      "usage": "supports_service_description"
    },
    {
      "source_id": "tartu_linn_koduteenuse_taotlusvorm",
      "usage": "supports_application_form"
    }
  ]
}
```

Kasutajale kuvatakse ainult serveri kinnitatud `displayed_source_ids`, mis on `answer_source_ids` alamhulk või sama hulk.

Server peab mudeli enesemärgistust kontrollima vähemalt:

- vastuse ja allika sisulise kattuvuse järgi;
- kasutaja päringu ankurterminite järgi;
- allikatüübi sobivuse järgi;
- ajakonteksti järgi, kui küsimus puudutab kehtivat või ajaloolist infot.

```json
{
  "source_id": "x",
  "decision": "display",
  "reason": "model_declared_and_context_validated"
}
```

`sourceAttribution.js` ei tohiks ainult filtreerida valmis allikaloendit, vaid peaks tagastama ka põhjendatud `attribution_decision` objektid.

### 4. Metadata Ja Source Type Korrastamine

STATUS: active / partially implemented

Miinimumväljad:

```json
{
  "source_id": "...",
  "title": "...",
  "source_type": "...",
  "authority": "...",
  "audience": ["CLIENT", "SOCIAL_WORKER"],
  "language": "et",
  "municipality": null,
  "municipality_id": null,
  "document_id": "...",
  "chunk_id": "...",
  "published_at": null,
  "last_checked": null,
  "valid_from": null,
  "valid_to": null,
  "historical": false,
  "canonical_item_id": null,
  "content_hash": "...",
  "url_canonical": "...",
  "source_status": "active"
}
```

Olulised `source_type` väärtused:

```text
national_law
kov_regulation
court_decision
state_guide
kov_service_info
official_form
application_form
web_form
pdf_form
contact_page
official_contact
service_standard
quality_guideline
methodology_guide
journal_article
practice_example
project_description
personal_story
opinion
historical_source
template
faq
partner_service_info
```

### 4.1. Source Metadata Profiles Enne Mass-Ingesti

STATUS: active design / partially implemented

KOV materjale ja suuremat korpust ei ole mõistlik andmebaasi laadida enne, kui allikapõhised metadata profiilid on kokku lepitud. Kõik allikad ei pea kasutama sama detailset skeemi, aga kõik peavad map'ima ühisele RAG source contract'ile.

Ühine minimaalne contract kõikidele allikatele:

```json
{
  "source_id": "...",
  "document_id": "...",
  "title": "...",
  "source_type": "...",
  "authority": "...",
  "language": "et",
  "audience": ["CLIENT", "SOCIAL_WORKER"],
  "published_at": null,
  "retrieved_at": "...",
  "last_checked": "...",
  "valid_from": null,
  "valid_to": null,
  "historical": false,
  "source_status": "active",
  "url": "...",
  "url_canonical": "...",
  "content_hash": "..."
}
```

`source_id` tähistab konkreetset allikat või lehte, `document_id` dokumendi versiooni või faili ning `chunk_id` ainult tükki dokumendi sees. `canonical_item_id` tekib siis, kui mitu allikat kirjeldavad sama teenust, toetust, vormi, kontakti või metoodilist objekti.

#### Ajakiri Sotsiaaltöö Ja Artiklid

Sobib tausta, metoodika, praktikanäidete ja ajaloolise konteksti jaoks. Ei tohi üksi kinnitada tänast õigust, KOV teenust, vormi, summat, tähtaega ega kontakti.

```json
{
  "source_type": "journal_article",
  "authority": "editorial",
  "journal_title": "Sotsiaaltöö",
  "issue_id": "...",
  "issue_label": "...",
  "year": 2024,
  "authors": [],
  "article_url": "...",
  "page_range": null,
  "topic": [],
  "life_event": [],
  "historical": true,
  "evidence_allowed_for": ["background", "methodology", "practice_context"],
  "evidence_not_allowed_for": ["current_law", "current_benefit", "current_form", "current_contact"]
}
```

#### KOV Kodulehed

KOV teenuse, toetuse, vormi ja kontakti info peab olema KOV-põhiselt filtreeritav. KOV allikas ei ole lihtsalt tekstilõik, vaid tulevase source package'i kandidaat.

```json
{
  "source_type": "kov_service_info",
  "authority": "KOV",
  "municipality": "Tartu linn",
  "municipality_id": "tartu_linn",
  "canonical_item_id": "tartu_linn_service_koduteenus",
  "item_type": "service",
  "service_name": "Koduteenus",
  "sections_present": ["description", "eligibility", "application", "forms", "contacts", "legal_basis"],
  "last_checked": "2026-04-25",
  "source_status": "active"
}
```

KOV kodulehe eraldi alamprofiilid:

- `kov_service_info` - teenuse või toetuse ametlik kirjeldus;
- `application_form`, `web_form`, `pdf_form` - vormid ja e-teenuse lingid;
- `official_contact` või `contact_page` - kontaktid;
- `partner_service_info` - KOV viidatud partnerteenus, mis ei ole täielikult KOV enda allikas;
- `faq` - korduma kippuvad küsimused, sobib täpsustuseks, mitte primaarseks õiguslikuks aluseks.

#### KOV Riigi Teataja Määrused

KOV määrused on tugevamad kui KOV kodulehe üldtekst, kui küsimus puudutab õigust, tingimust, summat, tähtaega või menetluskorda. Need peavad olema eraldi eristatavad tavalisest KOV veebilehest.

```json
{
  "source_type": "kov_regulation",
  "authority": "official_legal",
  "legal_level": "municipal_regulation",
  "municipality_id": "tartu_linn",
  "act_title": "...",
  "act_id": "...",
  "rt_url": "...",
  "issuer": "...",
  "adopted_at": null,
  "valid_from": null,
  "valid_to": null,
  "paragraph": null,
  "section_title": null,
  "historical": false
}
```

#### Riiklik Riigi Teataja Ja Riiklikud Juhised

Riiklik õigus ja riiklikud juhised annavad üldraami. Need ei tohi automaatselt asendada KOV konkreetset korda, kui küsimus puudutab kohalikku teenust või vormi.

```json
{
  "source_type": "national_law",
  "authority": "official_legal",
  "legal_level": "national_law",
  "act_title": "...",
  "act_id": "...",
  "rt_url": "...",
  "valid_from": null,
  "valid_to": null,
  "paragraph": null,
  "topic": [],
  "applies_nationally": true
}
```

Riikliku juhise puhul:

```json
{
  "source_type": "state_guide",
  "authority": "state_official",
  "publisher": "SKA | Sotsiaalministeerium | Eesti.ee | muu",
  "topic": [],
  "validity_note": null,
  "evidence_allowed_for": ["general_guidance", "state_level_process"],
  "evidence_not_allowed_for": ["municipality_specific_form", "municipality_specific_contact"]
}
```

#### Organisatsioonide Materjalid

Organisatsiooni materjal võib olla teenuseinfo, metoodika, juhend, blankett või partnerteenuse kirjeldus. Süsteem peab eristama, kas organisatsioon on ametlik teenuseosutaja, partner või lihtsalt taustmaterjali avaldaja.

```json
{
  "source_type": "partner_service_info",
  "authority": "organization",
  "organization_id": "...",
  "organization_name": "...",
  "organization_role": "service_provider",
  "service_area": [],
  "geo": null,
  "linked_municipality_ids": [],
  "contract_or_referral_basis": null,
  "audience": ["CLIENT", "SOCIAL_WORKER"],
  "evidence_allowed_for": ["service_description", "contact", "methodology"],
  "evidence_not_allowed_for": ["legal_entitlement", "municipal_decision"]
}
```

#### Mallid, Blanketid Ja Töövahendid

Mallid ja töövahendid võivad toetada dokumentide koostamist, aga nad ei kinnita iseseisvalt õigust, summat, tähtaega ega KOV korda.

```json
{
  "source_type": "template",
  "authority": "internal_or_methodology",
  "template_type": "letter | assessment | checklist | plan | form",
  "intended_role": "SOCIAL_WORKER",
  "requires_review": true,
  "evidence_allowed_for": ["drafting_support", "workflow_support"],
  "evidence_not_allowed_for": ["legal_basis", "benefit_amount", "eligibility"]
}
```

#### Metadata Failide Esialgne Jaotus

Mass-ingesti eel tuleks igale korpuseperele teha eraldi sisendfailid, mis map'itakse ühisele source contract'ile.

```text
KOV kodulehed:
- <kov>.sources.json
- <kov>.data.json
- <kov>.meta.json
- <kov>.rag.md

KOV Riigi Teataja:
- <kov>.rt.sources.json
- <kov>.rt.acts.json
- <kov>.rt.meta.json
- <kov>.rt.md

Riiklik Riigi Teataja:
- national-rt.sources.json
- national-rt.acts.json
- national-rt.meta.json

Ajakiri Sotsiaaltöö:
- sotsiaaltoo.sources.json
- sotsiaaltoo.issues.json
- sotsiaaltoo.articles.json
- sotsiaaltoo.meta.json

Organisatsioonid:
- <organization>.sources.json
- <organization>.materials.json
- <organization>.meta.json

Mallid ja töövahendid:
- templates.sources.json
- templates.items.json
- templates.meta.json
```

Open decision enne tulevaste korpuste ingest'i: kas kasutada igas korpuseperes eraldi failinimesid või hoida failinimed ühtsed ja eristada tüüpi `collection_type` väljaga. Mõlemal juhul peab väljund jõudma samasse `source_documents`, `chunks`, `source_packages` ja `answer_sources` loogikasse.

### 5. Hard Filters

STATUS: planned / partially implemented

Hard filter peab tulema enne pehmet ranking'ut ainult siis, kui filterväli on tuvastatud kõrge kindlusega. Madala kindlusega väljade puhul kasutatakse soft boost / soft penalty loogikat, et õige allikas ei kaoks enne ranking'ut.

High-confidence hard filter:

- vale keel välja, kui UI või kasutaja kontekst kinnitab keele;
- vale audience välja, kui roll on kindel;
- vale KOV välja, kui küsimus sisaldab selget KOV-i ja kontekst ei viita mitmele KOV-ile;
- aegunud allikas välja, kui küsitakse kehtivat infot;
- mitteametlik allikas välja, kui küsitakse õigust, summat, tähtaega või vormi;
- ajalooline allikas välja, kui küsimus eeldab praegust teenuseinfot.

Soft filter / boost:

- ebakindel KOV;
- ebakindel intent;
- teemad ja sünonüümid;
- allikatüübi sobivus;
- authority ja recency eelistus.

### 6. Hübriidotsing

STATUS: active / partially implemented

Soovitud kombinatsioon:

```text
exact phrase search
+ title / heading match
+ BM25 / full-text search
+ semantic vector search
+ metadata filters
```

Täpne fraas, pealkirja kattuvus ja allikatüüp peavad kaaluma rohkem kui üldine semantiline sarnasus, eriti konkreetsete nimede, artiklite, KOV teenuste ja vormide puhul.

### 7. Canonical Item + Source Package

STATUS: active design / partially implemented

Eesmärk on liikuda chunk-põhiselt RAG-ilt source package RAG-ile.

KOV teenuse pakett võiks sisaldada:

- teenus/toetus;
- kellele;
- tingimused;
- taotlemine;
- vormid;
- kontaktid;
- õiguslik alus;
- KOV / riiklik tase;
- `last_checked`;
- `valid_from` / `valid_to`;
- allikad.

Mudelile ei anta lihtsalt 12 sarnast lõiku, vaid kontrollitud tervikpakett.

Source package peab olema eraldi objekt, mitte ainult renderdatud promptitekst.

```json
{
  "package_id": "tartu_linn_service_koduteenus_package",
  "canonical_item_id": "tartu_linn_service_koduteenus",
  "package_type": "kov_service",
  "title": "Koduteenus",
  "municipality_id": "tartu_linn",
  "sections": {
    "description": [],
    "eligibility": [],
    "application": [],
    "forms": [],
    "contacts": [],
    "legal_basis": []
  },
  "source_ids": [],
  "last_checked": "2026-04-25",
  "confidence": "medium"
}
```

See sama objekt peab saama toetada RAG vastust, allikapaneeli, vormide ja kontaktide eraldi kuvamist, admini kvaliteedikontrolli ja teste.

### 8. Reranking

STATUS: planned

Reranker hindab näiteks:

- kas allikas vastab küsimusele;
- kas see sisaldab küsitud üksust;
- kas see on õiges KOV-is;
- kas see on õiges ajas;
- kas source type sobib;
- kas see dubleerib paremat allikat;
- kas see peaks minema source package'i või jääma välja.

Reranking võib olla alguses reeglipõhine ja hiljem mudelipõhine.

### 9. Täis Observability

STATUS: planned / design target

Kui põhiloogika töötab, laiendada trace täisobservability'ks:

- query intent;
- role;
- language;
- geo/KOV;
- hard filters;
- otsingupäringud;
- retrieved candidates;
- ranking scores;
- selected context sources;
- source package;
- model context;
- answer sources;
- displayed sources;
- latency;
- input/output/cached tokens;
- kasutaja tagasiside.

### 10. Suurem Regressioonitestide Komplekt

STATUS: planned

Siht:

- 100-300 küsimust;
- eri rollid;
- eri KOV-id;
- eri allikatüübid;
- õiguslikud küsimused;
- vormid;
- kontaktid;
- ajaloolised artiklid;
- praktikanäited;
- teadlikult puuduliku infoga küsimused.

Iga suurem RAG-i muudatus peab selle komplekti läbima.

## V1 Implementation Scope

STATUS: done / maintenance

V1 eesmärk ei ole kogu RAG stack ümber ehitada. V1 eesmärk on muuta olemasolev süsteem jälgitavaks ja allikate kuvamine ausaks.

V1 sisaldab:

- 20 küsimusega golden set;
- minimaalne RAG trace;
- `answer_source_ids`, `displayed_source_ids` ja `attribution_decisions`;
- `sourceAttribution.js` otsuste logimine;
- frontendis allikapaneeli sidumine ainult `displayed_source_ids` külge;
- ingest metadata miinimumväljade kontroll.

V1 ei sisalda:

- Chroma asendamist;
- täielikku Qdrant migratsiooni;
- claim-level attribution'it;
- täielikku source package andmemudelit;
- mudelipõhist rerankerit;
- täielikku hübriidotsingut kõigi allikate jaoks.

V1 on valmis, kui kasutajale nähtavad allikad ei sisalda enam otsingumüra ja iga RAG-vastuse kohta on võimalik trace'ist näha, kus allikas tekkis, valiti, kasutati või välja filtreeriti.

## V1 Acceptance Criteria

STATUS: done / maintenance

V1 loetakse tehtuks, kui:

- iga RAG-vastus logib `retrieved_source_ids`, `selected_context_source_ids`, `answer_source_ids`, `displayed_source_ids`, `filtered_out_source_ids`, `filter_reasons` ja `attribution_decisions`;
- allikapaneel kuvab ainult backendist tulnud `displayed_sources` või nendega seotud kinnitatud allikad;
- golden setis on vähemalt 20 testjuhtumit;
- testides on vähemalt üks juhtum, kus retrieved allikas jääb displayed allikatest välja;
- kõrge riskiga väide ei ilmu kindla faktina, kui sellel puudub `strong` evidence;
- legacy sõnumid jäävad UI-s loetavaks ka vana `sources` metadata korral;
- ingest annab vea või hoiatuse, kui kriitiline metadata puudub.

## V1 Delivery Plan

STATUS: done / historical

### RAG-1: Add Golden Set Fixture

STATUS: done

Luua 20 küsimusega testikomplekt koos oodatud allikatüüpide, keelatud allikate ja `must_not_claim` reeglitega.

Acceptance:

- olemas on vähemalt 20 testjuhtumit;
- testid katavad KOV, vormi, kontakti, ajaloolise allika, vale KOV-i, vale keele ja "allikas ei kinnita" juhtumi.

### RAG-2: Add Minimal RagTrace Object

STATUS: done

Luua ühtne trace objekt, mis salvestab vähemalt:

- `retrieved_source_ids`;
- `selected_context_source_ids`;
- `answer_source_ids`;
- `displayed_source_ids`;
- `filtered_out_source_ids`;
- `filter_reasons`;
- `attribution_decisions`.

Acceptance:

- iga RAG-vastus logib need väljad;
- trace on hiljem leitav debugimiseks.

### RAG-3: Return Attribution Decisions From sourceAttribution.js

STATUS: done

`sourceAttribution.js` peab tagastama lisaks kuvatavatele allikatele ka otsuste loendi.

```json
{
  "source_id": "tartu_linn_koduteenus",
  "decision": "display",
  "reason": "model_declared_and_context_validated"
}
```

Acceptance:

- iga allika kohta on otsus `display` või `hide`;
- iga `hide` otsusel on põhjus.

### RAG-4: Persist displayed_source_ids In Message Metadata

STATUS: done

Salvestada lõplikud `displayed_source_ids` assistendi sõnumi metadata'sse.

Acceptance:

- uued sõnumid sisaldavad `displayed_source_ids`;
- legacy sõnumid jäävad ühilduvaks vana `sources` loogikaga.

### RAG-5: Make Source Panel Read displayed_source_ids Only

STATUS: done

Frontendi allikapaneel ei tohi enam ise retrieved või selected allikaid kokku korjata.

Acceptance:

- `ChatSourcesPanel.jsx` kuvab ainult backendist tulnud `displayed_sources`;
- vähemalt üks test tõendab, et retrieved allikas ei ilmu paneeli, kui seda ei kinnitatud.

### RAG-6: Add Metadata Validation To Ingest

STATUS: partially implemented / active hardening

Ingest peab kontrollima miinimumvälju:

- `source_id`;
- `title`;
- `source_type`;
- `authority`;
- `language`;
- `municipality` või `municipality_id`, kui KOV-allikas;
- `last_checked`;
- `historical`;
- `source_status`.

Acceptance:

- puuduv kriitiline väli annab vea või hoiatuse;
- `source_type` peab kuuluma kontrollitud väärtuste hulka.

### RAG-7: Add Retrieved-But-Not-Displayed Regression Test

STATUS: done

Lisada test, kus otsing leiab mitu kandidaati, aga kasutajale kuvatakse ainult üks või kaks kinnitatud allikat.

Acceptance:

- testis on retrieved allikaid rohkem kui displayed allikaid;
- allikapaneel ei kuva kasutamata kandidaate.

## V1 Ja V2 Täiendavad Märkused

STATUS: mixed / historical notes and active V2 guidance

Need märkused täpsustavad järgmisi arendusideid. Need ei laienda automaatselt V1 kohustuslikku skoopi, vaid aitavad hiljem ticketiteks ja otsusteks jagada.

### V1 Audit Checklist

STATUS: done / historical

Enne V1 koodi muutmist tuleb praeguse pipeline'i vastu kontrollida:

- kust `retrieved sources` praegu tulevad;
- kus ja kuidas neist saavad `selected context sources`;
- mida `sourceAttribution.js` praegu eemaldab või alles jätab;
- mis salvestatakse `ConversationMessage.metadata.sources` sisse;
- kas streaming ja non-streaming vastused käituvad allikate osas samamoodi;
- kas frontend kogub vestlussõnumitest allikaid ise juurde;
- kas allikapaneel võib kuvada allikat, mida backend ei kinnitanud.

### V1 Backend Response Contract

STATUS: done / maintenance

V1 peab lukustama backendist frontendile liikuva minimaalse vastusekuju.

```json
{
  "sources": [],
  "displayed_sources": [],
  "rag_trace": {
    "retrieved_source_ids": [],
    "selected_context_source_ids": [],
    "answer_source_ids": [],
    "displayed_source_ids": [],
    "filtered_out_source_ids": [],
    "filter_reasons": {},
    "attribution_decisions": []
  }
}
```

`sources` võib jääda legacy ühilduvuseks, aga uus allikapaneeli loogika peab eelistama `displayed_sources` välja.

### V1 Feature Flags And Legacy Sources

STATUS: partially completed / historical

V1 rollout võiks kasutada feature flag'e:

```text
RAG_TRACE_V1_ENABLED
RAG_ATTRIBUTION_DECISIONS_ENABLED
RAG_DISPLAYED_SOURCES_ENFORCED
```

Legacy allikate käsitlus:

- vanad sõnumid jäävad loetavaks vana `sources` metadata põhjal;
- uued sõnumid salvestavad `displayed_source_ids` ja võimalusel `rag_trace`;
- UI oskab lugeda nii vana kui uut kuju;
- analytics/debug eristab legacy ja V1 allikaloogikat.

### V1 Golden Set Schema

STATUS: done / maintenance

Golden set peab olema masinloetav, mitte ainult tekstiloend.

```json
{
  "id": "kov_koduteenus_tartu_001",
  "question": "Kuidas taotleda koduteenust Tartus?",
  "role": "CLIENT",
  "language": "et",
  "expected_source_types": ["kov_service_info", "application_form"],
  "forbidden_source_types": ["journal_article"],
  "must_mention": ["taotlus", "abivajaduse hindamine"],
  "must_not_claim": ["kindel summa, kui allikas seda ei kinnita"]
}
```

### V2 Implementation Boundary

STATUS: partially implemented / active

V2 eesmärk on parandada otsingu ja kvaliteedipoliitika tugevust ilma V3 täielikku teadmismudelit nõudmata.

V2 query planner võiks tagastada näiteks:

```json
{
  "intent": "kov_service_application",
  "risk_level": "medium",
  "language": "et",
  "role": "CLIENT",
  "municipality": {
    "id": "tartu_linn",
    "confidence": "high"
  },
  "needs": {
    "forms": true,
    "contacts": true,
    "legal_basis": true,
    "current_info": true
  }
}
```

V2 hübriidotsing võib jääda evolutsiooniliseks:

- Chroma dense retrieval jääb alles;
- exact/title match lisandub serveri või andmebaasi kihis;
- BM25/full-text lisandub eraldi kanalina;
- tulemused ühendatakse RRF/weighted merge loogikaga;
- reranking võib jääda reeglipõhiseks; mudelipõhist rerankerit kaalutakse ainult siis, kui mõõdikud näitavad vajadust.

V2 retrieval trace peab iga kanali eraldi nähtavaks tegema. Esimese sammuna peab ka olemasolev Chroma otsing märkima tulemused `dense` retriever'ist tulnuks ja `rag_trace.retrievers_used` peab selle salvestama. Hilisemad `exact_phrase`, `title_match`, `bm25` ja reranker'i kanalid lisanduvad samasse välja, et kvaliteedilangust või -võitu saaks mõõta, mitte aimata.

V2 esimene hübriidotsingu samm on lightweight lexical retrieval:

- `dense` jääb põhikanaliks;
- `title_match` otsib pealkirja kattuvust;
- `exact_phrase` otsib täpse fraasi kattuvust tekstis;
- `bm25` märgib tokenipõhise full-text kattuvuse, kui täpne fraas või pealkiri üksi ei kata päringut;
- leksikaalne scan on piiratud `RAG_LEXICAL_SCAN_LIMIT` ja `RAG_LEXICAL_TOP_K` väärtustega;
- leitud kanalid kantakse tulemuse `retrieval_channels` väljale ja hiljem `rag_trace.retrievers_used` alla;
- lexical kanal ei asenda eraldi full-text indeksit, vaid annab V2-s esimese mõõdetava silla päris hübriidotsingu poole.

V2 evidence score võib alguses olla reeglipõhine:

```text
retrieval_channel + authority + source_type + municipality_match + freshness + exact_title_match + risk_fit
```

V2 esimene ranking quality layer kasutab olemasolevat metadata't enne võimalikku hilisemat mudelipõhist reranker'it:

- `title_match` ja `exact_phrase` kanalid annavad täpsel kattuvusel ranking boost'i;
- ametlikud ja kõrgema autoriteediga `source_type` väärtused saavad eelistuse taustaallikate ees;
- `source_status=active` saab väikese eelistuse;
- `stale`, `inactive`, `archived`, `historical=true` ja `historical_source` saavad ranking penalty;
- `valid_from`, `valid_to` ja `historical` peavad liikuma retrieval match'ist selected context source'i edasi, et hilisem evidence policy saaks neid kontrollida;
- `ragRiskPolicy` liigub retrieval assembler'ist rankingusse, et `high` riskiga küsimustes tõuseksid ametlikud ja nõutud evidence source type'id taustaallikatest ette;
- see kiht ei asenda hard/soft filter policy't, vaid annab V2-s parema vaikimisi järjestuse.

V2 esimene teostatud quality-policy tükk on `RAG_RISK_POLICY`:

- küsimus klassifitseeritakse `low`, `medium` või `high` riskiks;
- riskipoliitika määrab nõutava tõendusastme (`medium` või `strong`);
- `medium` ja `high` riskiga RAG vastused saavad täiendava system instruction'i;
- riskitase ja nõutav tõendus salvestatakse `rag_trace` ning message metadata sisse;
- admin logivaates kuvatakse `rag_risk_level` ja `rag_required_evidence`.
- attribution filter kontrollib riskipoliitika põhjal ka `evidence_strength` väärtust;
- kõrge riskiga vastuses ei kuvata nõrka taustaallikat, näiteks ajakirjaartiklit, `strong` evidence allikana;
- kui ainus kandidaat ei täida nõutavat tõendusastet, jääb `displayed_sources` tühjaks ja otsus logitakse põhjusega `insufficient_evidence_strength`.

Esialgne V2 riskipoliitika:

```json
{
  "riskLevel": "high",
  "requiredEvidence": "strong",
  "preferredSourceTypes": [
    "national_law",
    "kov_regulation",
    "state_guide",
    "kov_service_info",
    "application_form",
    "official_contact"
  ],
  "insufficientEvidenceMode": true
}
```

V2 admin quality queue peaks näitama vähemalt:

- puuduv metadata;
- vana `last_checked`;
- KOV teenus ilma vormita;
- kontakt ilma ametliku allikata;
- vastuolulised allikad;
- failed ingest;
- stale source.

V2 mõõdikud:

- `displayed_source_precision`;
- `wrong_municipality_rate`;
- `stale_source_rate`;
- `unsupported_claim_rate`;
- `insufficient_evidence_correctness`.

## Arenduse Seis 2026-04-28

STATUS: current snapshot

See plokk kirjeldab hetkeseisu lokaalses arenduses ja production-smoke'iga kinnitatud seisu pärast clean canonical reingest'i.

### Seis pärast clean canonical reingest'i 2026-04-28

STATUS: production-smoked snapshot

- V2.5 canonical hardening on productionis kontrollitud.
- Legal exact retrieval + `displayed_sources` on production smoke'iga kontrollitud.
- Clean canonical reingest on tehtud olemasoleva korpuse piires.
- Aktiivses registry's on 704 kirjet:
  - `national_regulations`: 1
  - `kov_regulations`: 1
  - `kov_services`: 64
  - `sotsiaaltoo_articles`: 638
- `npm run rag:smoke:v2 -- --chat --legal-exact` ja `npm run rag:smoke:v2` läbivad.
- Legacy storage on alles rollback'i jaoks.

### V1 Praktiliselt Tehtud

STATUS: done / maintenance

- Golden set ja RAG regressioonitestid on olemas ning neid kasutatakse muudatuste kontrolliks.
- `displayed_sources`, `displayed_source_ids`, `attribution_decisions` ja `rag_trace` liiguvad backend response'i ja message metadata kaudu.
- Allikapaneeli loogika eelistab backendist tulnud kinnitatud `displayed_sources` andmeid, mitte ei kogu pimesi kõiki legacy `sources` allikaid.
- `sourceAttribution.js` tagastab kuvamise/peitmise otsused koos põhjustega.
- Streaming ja non-streaming vastuste jaoks on testid, mis kontrollivad `displayed_sources` metadata liikumist.
- RAG trace eristab retrieved, selected context, answer ja displayed source kihte.
- Legacy `sources` loogika jääb ühilduvuseks alles, aga uus rada on `displayed_sources` ja `rag_trace`.
- Uued RAG metadata objektid märgivad `rag_contract_version: "v1"` ja `source_display_mode`, et legacy ja V1 allikaloogika oleks hiljem eristatav.
- `rag_trace.selected_context_details` sanitiseeritakse lubatud tehniliste väljadeni; trace ei kopeeri täit prompti, kasutaja teksti, model context'i ega tõendilõikude sisu.
- Attribution decision reason'id on koondatud standardseks taksonoomiaks ja testiga kontrollitud.

### V2 Osaliselt Tehtud

STATUS: partially implemented / active

- RAG service tagastab ja märgistab retrieval kanalid, sh `dense`, `title_match`, `exact_phrase` ja lightweight `bm25`.
- Vastete küljes liigub `retrieval_channels`; trace'is liigub `retrievers_used`.
- Riskipoliitika klassifitseerib küsimused `low`, `medium` ja `high` tasemele.
- Riskitase ja nõutav tõendus liiguvad `rag_trace` sisse.
- Ranking kasutab olemasolevat metadata't: `source_type`, `source_status`, `historical`, `retrieval_channels`, pealkirja-, fraasi- ja tokenikattuvust.
- Kõrge riskiga vastustes ei kuvata nõrka taustaallikat tugeva tõendusena.
- Lühikesed artikli järelküsimused, näiteks "Eesti", "Soome" või "OTT", ankurdatakse hiljutise assistendi allika külge.
- Sama allika järelküsimuses kasutatakse esmalt `doc_id`, `source_id` või `canonical_item_id` põhist filtrit ning seejärel fallback otsingut.
- Laiade võrdlus- ja sünteesiküsimuste puhul ei lukustata otsingut ainult eelmise artikli külge; broad query jookseb esimesena ja source-focused query jääb toetavaks.
- Multi-source selection eelistab laia sünteesi puhul eri allikaidentiteete, mitte sama dokumendi korduvaid chunk'e.
- Query Planner V2 on eraldi moodulis `lib/chat/queryPlanner.js` ja tagastab standardse plaani: päringud, filtrid, topK, selection strategy, context group target ja trace'i `query_plan`.
- `query_plan` liigub `rag_trace` sisse, et hiljem oleks näha, miks valiti `source_focused_followup`, `broad_multi_source`, `temporal`, `municipality_service_benefit_list` või muu planner mode.
- Dense ja lexical kanalid ühendatakse RRF/weighted merge loogikaga ning tulemuste küljes liiguvad `rrf_score`, `hybrid_score` ja `hybrid_rank`.
- Lightweight `bm25` kanal kannab nüüd mõõdetavaid tuning-signaale: `bm25_score`, `bm25_coverage`, `bm25_matches`, `bm25_query_tokens`, BM25 env seaded merge strategy's ning `rag_trace.hybrid_retrieval.bm25` kokkuvõte. See võimaldab päris probleemvestlustest otsustada, kas lightweight kanalist piisab või on vaja Postgres full-texti / eraldi indeksit.
- RAG source metadata contract on koondatud ühisesse helperisse ning KOV, organisatsiooni, ajakirja ja Riigi Teataja ingest/validation radades kasutatakse rangemat metadata kontrolli.
- KOV/RT/organisatsiooni metadata jaoks on lisatud dry-run backfill planner `rag:plan:metadata`, mis koostab enne mass-ingesti JSON plaani: millised V2 contract'i väljad saab olemasolevatest source/meta failidest tuletada ja millised kirjed jäävad blokkeriks.
- Ajakirja ingest dry-run oskab vanadest JSON-idest koostada V2 metadata contract'i ilma faile käsitsi muutmata ning `--plan-json` väljundiga salvestada ready/blocked/backfill plaani enne mass re-ingest'i.
- Ajakirja mass re-ingest on productionis kontrollitud `--resume` ja `--concurrency 2` töövooga; `--skip-existing` ei sobi metadata paranduse re-ingestiks, sest vanad olemasolevad dokumendid tuleb uue contract'iga üle kirjutada.
- Ajakirja ingest skriptil on RAG HTTP päringute timeout (`--request-timeout-ms`, vaikimisi 300000 ms), et RAG service'i või fetch'i hangumine ei jätaks batch'i lõputult rippuma.
- Ajakirja legacy cleanup tööriist `rag:cleanup:ajakiri-legacy` koostab RAG service registry põhjal dry-run plaani vanade `source_type=file` / `unknown` ajakirjakirjete eemaldamiseks ainult siis, kui olemas on sama pealkirja ja aasta `article_ingest` asendus.
- Legacy cleanup kustutab päriselt ainult `--delete` lipuga ja ainult `delete_duplicate` otsuseid; ebakindlad või ilma asenduseta kirjed jäävad `review_legacy` staatusesse.
- Productionis eemaldati selle tööriistaga 2026-04-26 esmalt neli kindlat ajakirja legacy duplikaati. Pärast AI ja Sloveenia artikli siht-ingesti ning kahe kinnitatud `covered_by_combined_article` mappingu lisamist eemaldati ülejäänud kolm legacy kirjet; järelkontrollis oli `legacy_file: 0`, `delete_duplicate: 0` ja `review_legacy: 0`.
- Source freshness audit on eraldi helperis ja CLI-s olemas: allikatüübi põhine kontroll leiab puuduva või aegunud `last_checked`, aegunud `valid_to`, mitteaktiivse `source_status` ja kõrge prioriteediga ülevaatusvajaduse.
- Admin analytics RAG dokumentide vaates on esimene quality queue: see kuvab freshness auditi vead ja hoiatused ning annab prioriteetse nimekirja allikatest, mis vajavad metadata või värskuse ülevaatust.
- Kui productionis on Prisma `RagDocument` tabel tühi, aga RAG service registry/Chroma sisaldab dokumente, kasutab admin analytics freshness audit fallback'ina RAG service `/documents` nimekirja. Vastuses on selleks `ragDocs.freshness.auditSource`, `ragServiceFallbackCount` ja `ragServiceFallbackError`.
- Quality queue kontrollib esimeses versioonis ka URL-i kuju, puuduvaid URL-e praeguse info tõendusallikatel, KOV teenust ilma seotud vormiallikata ning kontaktiviiteid, mis ei tule `official_contact` või `contact_page` allikatüübist.
- KOV ingest lisab item metadata külge `sections_present`, vormi-, kontakti- ja õigusliku aluse loendurid; quality queue kasutab neid source package signaale, et vormi või ametliku kontakti puudumist märkida ainult siis, kui teenuse metadata seda vajadust päriselt näitab.
- Quality queue tuvastab nüüd ka esimese source package konflikti: sama `canonical_item_id` alla ei tohi sattuda mitme erineva `municipality_id` KOV allikad ilma ülevaatuseta.
- Admin analytics mõõdab metadata contract'i completeness'i: näha on puuduvad kohustuslikud väljad, soovituslike väljade puudumine ja kui suur osa auditeeritud allikatest vastab miinimumcontract'ile.
- Metadata kvaliteet on jaotatud ka korpusepere järgi (`kov_web`, `kov_rt`, `national_rt`, `ajakiri_sotsiaaltoo`, `organizations`, `unknown`), et admin näeks, milline ingest rada toodab puuduliku contract'iga allikaid.
- Metadata kvaliteet on jaotatud ka sisendi/failitüübi järgi (`rag_md`, `kov_data_item`, `sources_json`, `meta_json`, `rt_xml`, `article_ingest` jne), et parandustöö jõuaks konkreetse ingest sisendini.
- Quality queue issue'd sisaldavad `remediation` objekti: paranduse tegevus, puuduvad väljad ja siht (`collection_family`, `source_file_type`, `source_id`, `document_id`, `canonical_item_id`). Siht sisaldab võimalusel ka `admin_href` väärtust ning admin vaade kuvab selle “Fix” veeruna.
- `admin_href` kannab nüüd parandustöö konteksti query parameetrites edasi: `remediation_action`, `fields`, `source_id`, `document_id`, `canonical_item_id`, `source_type`, `source_file_type` ja vajadusel `source_path`, `municipality` või `organization`.
- RAG admini sihtlehed loevad quality queue query parameetreid ja kuvavad parandustöö konteksti: action, parandatavad väljad ning source/document/canonical identifikaatorid.
- RAG admini parandustöö banner näitab ka `focus` ja `file_key` väärtusi, et admin näeks kohe, kas parandustöö puudutab dokumenti, lingiplokki või konkreetset failikaarti.
- RAG admin controller kasutab sama query konteksti madala riskiga eeltäitmiseks: dokumendivaate otsing saab siht-identifikaatori ning ingest PDF+metadata textarea saab metadata parandusstub'i.
- KOV ja organisatsioonide admin controllerid kasutavad quality queue query konteksti sihtkirje leidmiseks: vaade puhastab piiravad filtrid, valib õige KOV-i või organisatsiooni ning avab vajadusel lingi/detaili muutmise režiimi.
- Quality queue remediation target kannab nüüd ka töö fookust: `focus` ja võimalusel `file_key`. Admin UI märgib KOV ja organisatsiooni detailis konkreetse failikaardi või lingiploki, mida parandustöö puudutab.
- Admin analytics mõõdab kõrge riskiga RAG vastuste allikariski kahes kihis: `answer_source_stale_rate` / `answer_unknown_source_rate` näitavad vastuse tõendusallikate riski ning `displayed_source_stale_rate` / `displayed_unknown_source_rate` näitavad kasutajale kuvatud allikapaneeli riski.
- Admin analytics kuvab eraldi high-risk source risk queue tabeli, mis näitab, kas risk tuli `answer` või `displayed` kihist.
- High-risk source risk mõõdik on seotud tulevase claim-level attribution kihiga. Kui trace sisaldab `claim_attributions`, loeb analytics eraldi `claim` allikakihi ning arvutab `high_risk_claim_source_count`, `stale_claim_source_responses`, `unknown_claim_source_responses`, `claim_source_stale_rate`, `claim_unknown_source_rate` ja `claim_source_risk_readiness_rate`.
- Claim-level risk queue kirjed ei salvesta täit väiteteksti, vaid ainult piiratud tehnilisi viiteid nagu `claim_id`, `claim_type`, `evidence_strength` ja seotud `source_id`, et privaatsuspiir jääks samaks.
- Admin analytics mõõdab nüüd trace'i põhjal source display contract'i: `displayed_source_precision`, contract violation count/rate ning retrieved/selected allikate filtratsioonimäär näitavad, kas kuvatud allikad on kinnitatud answer source'id ja kui palju otsingumüra välja jäi.
- Trace kannab nüüd valitud kontekstiallikate juures ohutut KOV metadata't (`municipality_id`, `municipality_name`) ning Query Planner trace kannab oodatud KOV sihti; admin analytics arvutab nende põhjal `wrong_municipality_rate`.
- Quality queue remediation target lisab parandustöö linkidele ohutud soovitused: `suggested_source_type`, `suggested_authority`, `suggested_url`, vajadusel `suggested_last_checked` ja `suggested_source_status`.
- Admin remediation context oskab nende põhjal metadata stub'i eeltäita, näiteks `source_type`, `authority`, `last_checked`, `source_status` ja `url` väljade parandamiseks. Eeltäitmine on piiratud madala riskiga väärtustega ega kirjuta automaatselt andmeid üle.
- Assistendi vastuse stiilijuhis keelab lõppvastuses tehnilised fraasid nagu `nähtavas kontekstis`, `RAG kontekstis`, `kontekstis ei ole` ja `selles vaates ei ole`. Ebapiisava allikakinnituse korral kasutatakse loomulikku sõnastust, näiteks "Praegu kasutatud allikad ei anna sellele piisavalt täpset vastust" või õiguslike küsimuste puhul "Ma ei leidnud praeguse otsinguga sellele piisavalt täpset õiguslikku allikakinnitust."
- Admin analytics sündmuste real kuvatakse `query_plan` detailid: planner mode, query order, selection strategy, query count ja `rag_top_k`.
- Admin analytics 30 päeva kokkuvõttes arvutatakse Query Planner mode, query order ja selection strategy jaotused.
- Query Planner V2 esimene eval-fixture on olemas: see kontrollib artikli järelküsimust, laia võrdlust, KOV teenuseid/toetusi, national scope'i, teenuse tasandi liigitust, temporal päringut, source lookup'i ja default low-risk päringut.
- Query Planner V2 eval-fixture katab nüüd mitu realistlikku artikli-follow-up varianti: lühike riigiküsimus, küsimus sama artikli näidete kohta, nime/akronüümi otsing, `source_id` fallback, `canonical_item_id` fallback ning broad multi-source küsimus, mis ei tohi lukustuda ainult eelmise artikli külge.
- Sama Query Planner V2 fixture kontrollib nüüd ka retrieval orchestrator'i päringuehitust: source-focused juhtumites peab esimene päring olema filtriga ja broad multi-source juhtumites peab esimene päring jääma filtrita.
- Multi-source context selection testib nüüd ka `canonical_item_id` põhist dedupe'i: laia sünteesi puhul ei valita sama canonical item'i korduvaid dokumente enne, kui eri allikaidentiteedid on kaetud.

### Viimati Kontrollitud Testid

STATUS: current snapshot / needs refresh after each release

Viimane lokaalne kontroll:

```text
chat/RAG regressioonipakk: 66/66 passed
RAG metadata/freshness/ingest/cleanup/backfill static pack: 40/40 passed
prompt/retrieval style pack: 10/10 passed
source freshness/remediation/source quality pack: 23/23 passed
```

See ei asenda serveri smoke testi pärast deploy'd. Productionis tuleb eraldi kontrollida RAG service health'i, chat endpointi, allikapaneeli ja vähemalt üht päris vestluse artikli-follow-up juhtumit.

### V1.2 Production Smoke

STATUS: done / maintenance

V1.2 lisab production smoke skripti:

```text
npm run rag:smoke:v1
```

Skript: `scripts/smoke-rag-v1-contract.mjs`.

Käivitamiseks productioni vastu:

```text
SOTSIAALAI_SMOKE_BASE_URL=https://sotsiaal.ai
SOTSIAALAI_SMOKE_COOKIE="next-auth.session-token=..."
npm run rag:smoke:v1
```

Vajadusel saab kasutada bearer tokenit:

```text
SOTSIAALAI_SMOKE_BEARER="..."
npm run rag:smoke:v1
```

Streamingu kontrollimiseks:

```text
npm run rag:smoke:v1 -- --stream
```

Smoke kontrollib vähemalt:

- `/api/chat` health GET vastab;
- `/api/chat` RAG päring vastab edukalt;
- vastuses on `sources` ja `displayed_sources`;
- `displayed_sources.length <= sources.length`;
- RAG vastuses on `rag_contract_version: "v1"`;
- RAG vastuses on `source_display_mode`;
- RAG vastuses on `rag_trace`;
- `rag_trace.displayed_source_ids` sisaldab kuvatud allikaid;
- `rag_trace` ei sisalda täit kasutaja sõnumit, prompti, model context'i ega pikki tõendilõike.

Pärast V1.2 võib V1 lugeda arenduslikult lõpetatuks ning hoida seda maintenance/hardening režiimis. Uus RAG kvaliteediarendus liigub V2 alla.

Production kontroll 2026-04-26:

```text
npm run rag:smoke:v1
npm run rag:smoke:v1 -- --stream
```

Mõlemad smoke käsud läbisid `https://sotsiaal.ai` vastu edukalt. Kontroll kinnitas, et non-stream ja streaming `/api/chat` vastused tagastavad V1 contract'i väljad, sealhulgas `rag_contract_version`, `source_display_mode`, `rag_trace`, `sources` ja `displayed_sources`.

### V2 Production/Admin Smoke

STATUS: active / partially implemented

V2 lisab eraldi kvaliteedikihi smoke skripti:

```text
npm run rag:smoke:v2
```

Skript: `scripts/smoke-rag-v2-quality.mjs`.

Käivitamiseks productioni vastu:

```text
SOTSIAALAI_SMOKE_BASE_URL=https://sotsiaal.ai
SOTSIAALAI_SMOKE_COOKIE="next-auth.session-token=..."
npm run rag:smoke:v2
```

Vajadusel saab kasutada bearer tokenit:

```text
SOTSIAALAI_SMOKE_BEARER="..."
npm run rag:smoke:v2
```

Chat trace'i V2 signaalide kontrollimiseks:

```text
npm run rag:smoke:v2 -- --chat
```

Pärast clean canonical reingest'i minimaalne kontroll:

```text
npm run rag:smoke:v2 -- --chat --legal-exact
npm run rag:smoke:v2
```

Täielikum kontroll:

```text
npm run rag:smoke:v2 -- --legal-exact
npm run rag:smoke:v2 -- --chat --legal-exact
npm run rag:smoke:legal-exact -- --all
npm run rag:smoke:v2
```

`--chat --legal-exact` on kõige olulisem legal smoke, sest see kontrollib RAG-service, chat, selected context ja displayed sources kihti.

Smoke kontrollib vähemalt:

- `/api/admin/analytics/summary` vastab admin autentimisega;
- `ragDocs.freshness.auditSource` näitab, kas freshness audit tuli Prisma `RagDocument` tabelist või RAG service `/documents` fallback'ist;
- `ragDocs.freshness.ragServiceFallbackCount` ja `ragServiceFallbackError` on olemas, et productionis oleks näha, kas fallback leidis registry dokumendid või ebaõnnestus;
- `ragDocs.freshness.summary.metadata_quality` sisaldab kokkuvõtte, collection ja file type jaotusi;
- smoke väljund näitab `freshnessReasons`, `missingRequiredFields` ja `missingRecommendedFields`, et re-ingest'i järel oleks kohe näha, kas `unknown_source_type`, `missing_last_checked` või muu metadata probleem vähenes;
- re-ingest'i kontrolliks saab smoke käsule anda lävendi, näiteks `--max-reason unknown_source_type=0 --max-reason missing_last_checked=0`;
- smoke väljundis on ka `metadataByCollection` ja `metadataByFileType`, et ajakirja, KOV, national RT või muu korpuse re-ingest'i mõju oleks eraldi mõõdetav; vajadusel saab kasutada `--min-collection-completeness ajakiri_sotsiaaltoo=0.95`;
- kvaliteedijärjekorra kirjetel on `collection_family`, `source_file_type`, `metadata_quality` ja `remediation`;
- remediation target sisaldab admin sihtlinki `admin_href`, action'it, parandatavate väljade loendit ning võimalusel `focus`/`file_key` sihti;
- `admin_href` query string sisaldab sama `focus`/`file_key` sihti, mis `remediation.target` objekt;
- `ragDocs.sourceQuality.summary` sisaldab `displayed_source_precision`, contract violation, retrieved/selected filter rate ja `wrong_municipality_rate` mõõdikuid;
- high-risk source freshness kokkuvõte ja järjekord on olemas;
- high-risk source freshness kokkuvõttes on olemas ka claim-kihi väljad: `high_risk_claim_source_count`, `stale_claim_source_responses` ja `claim_source_risk_readiness_rate`;
- `--chat` korral on `/api/chat` vastuse `rag_trace` sees `retrievers_used`, `query_plan` ja riskipoliitika signaal.

## Järgmised Plaanitavad Tööd

STATUS: active backlog

### V2 Maintenance Backlog

STATUS: active maintenance

1. Hoida smoke'id ja readiness auditid aktiivsed pärast iga reingest'i.
2. Parandada recommended `content_hash` KOV web/service allikatele.
3. Kui ajakirja artiklitele tekivad päris canonical URL-id, täita `url_canonical`; ära tee `source_path` väärtusest URL-i.
4. Teha organisatsioonide, template ja metoodikakorpuste readiness + ingest.
5. Laiendada golden set'i päris probleemvestluste põhjal.
6. Parandada artikli follow-up kvaliteeti ja BM25/full-text tuningut production näidete põhjal.
7. Hoida insufficient evidence sõnastus mittetehniline.

## V3 Roadmap And Architecture Maturity

STATUS: planned / staged implementation

V3 fookus ei ole uus otsingumootor, Qdrant migratsioon ega suur DB-migratsioon. V3 fookus on kontrollitud teadmuse kiht: `SourcePackage`, package-aware answering, tõendusrollid, claim/section attribution, admin quality workflow ja regressioonitestid.

V3 arhitektuurne küpsus tuleb sellest, et süsteem ei vali ainult õigeid chunk'e, vaid teab, mis tüüpi infot ta kasutab ja milleks seda tohib kasutada. Õigusakt, KOV määrus, KOV teenuseinfo, vorm, kontakt, juhend ja taustartikkel ei ole sama tüüpi tõendusallikad.

### V3.0A — Runtime SourcePackage Builder

STATUS: implemented and smoke-tested

V3.0A esimene praktiline skoop on runtime `SourcePackage` builder Jõgeva KOV piloodi peal. See ei ole veel persisted andmemudel ega package-aware answering, vaid kontrollkiht, mis koondab valitud kontekstiallikad sama `canonical_item_id` ja sama `municipality_id` põhjal ohutuks trace'itavaks paketiks.

Implementation status 2026-04-28:

- runtime builder on failis `lib/chat/sourcePackages.js`;
- `retrievalContextAssembler` ehitab `retrievalMeta.sourcePackages` valitud kontekstiallikatest;
- `mainResponseHandler` lisab safe kujul `rag_trace.source_packages`;
- `ragContext` kannab edasi package'i jaoks vajalikke metadata signaale nagu `resource_type` ja `sections_present`;
- testid katavad Jõgeva KOV teenuse package'i, vale KOV-i eraldi hoidmise, ajakirjaartikli välistamise current evidence sektsioonidest ja trace sanitiseerimise.

Eesmärk:

- koondada sama `canonical_item_id` ja sama `municipality_id` allikad kontrollitud paketiks;
- eristada sektsioonid `description`, `eligibility`, `application`, `forms`, `contacts`, `legal_basis`, `fees` ja `deadlines`;
- lubada KOV määrus `legal_basis` sektsioonis;
- lubada KOV service info `description`, `eligibility` ja `application` sektsioonides;
- lubada `official_contact` / `contact_page` allikad `contacts` sektsioonis;
- lubada `application_form`, `web_form` ja `pdf_form` allikad `forms` sektsioonis;
- mitte lubada `journal_article` allikat tänase õiguse, vormi, kontakti või kehtiva teenuseinfo kinnitamiseks;
- lisada `rag_trace.source_packages`;
- hoida olemasolevad legal exact smoke'id rohelisena.

Minimal `SourcePackage` kuju:

```json
{
  "package_id": "jogeva_vald_service_koduteenus_package",
  "canonical_item_id": "jogeva_vald_service_koduteenus",
  "package_type": "kov_service",
  "title": "Koduteenus",
  "municipality_id": "jogeva_vald",
  "sections": {
    "description": [],
    "eligibility": [],
    "application": [],
    "forms": [],
    "contacts": [],
    "legal_basis": [],
    "fees": [],
    "deadlines": []
  },
  "source_ids": [],
  "last_checked": "2026-04-28",
  "confidence": "medium",
  "missing_sections": []
}
```

V3.0A acceptance:

- Jõgeva teenuse või toetuse küsimus loob source package'i;
- `package.municipality_id = jogeva_vald`;
- vale KOV allikat ei panda paketti;
- KOV määrus võib minna `legal_basis` alla;
- vorm jõuab `forms` sektsiooni, kui sobiv vormiallikas on olemas;
- kontakt jõuab `contacts` sektsiooni, kui sobiv kontaktiallikas on olemas;
- ajakirjaartikkel võib olla background, aga mitte current legal/form/contact evidence;
- `rag_trace` sisaldab `source_packages` kokkuvõtet;
- legal exact smoke'id jäävad roheliseks.

V3.0A piirid:

- package ehitatakse runtime'is ainult valitud kontekstist;
- package ei ole veel persisted andmemudel;
- selected context ei ole veel täielikult package-aware, vaid package on trace'i ja järgmise arenduse kontrollkiht;
- package ei asenda legal exact retrieval'i ega displayed source attribution contract'i.

### V3.1 — Persisted SourcePackage Snapshot + Versioning

STATUS: deployed and DB-write smoke confirmed / not yet package-aware answering

SourcePackage salvestatakse snapshot'ina, mitte kohe käsitsi hallatava sisuna. Eesmärk on näha, milline pakett tekkis, millistest allikatest, millise hash'i ja versiooniga. V3.1 ei muuda veel vastust package-aware'iks; see jääb V3.2 skoobiks.

Vajalikud väljad:

- `package_id`
- `canonical_item_id`
- `municipality_id`
- `package_type`
- `title`
- `confidence`
- `package_hash`
- `last_built_at`
- `last_checked`
- `version`
- `section_summary`
- `source_membership`
- `missing_sections`
- `active`
- `status`: `active | needs_review | archived`

Oluline risk: persisted SourcePackage ei tohi muutuda "vanaks tõeks". Seetõttu peab olema version history, rebuild trigger pärast reingest'i või metadata muutust ning `needs_review` staatus, kui allikas vananeb või paketi sektsioon kaob.

Esimene V3.1 implementatsioon salvestab snapshot'i ja read-only admin loendurid. See ei lisa käsitsi sisuhaldust, claim-level attribution'it, retrieval migrationit ega package-aware answeringut.

Production confirmation:

- source package smoke lõi 3 Jõgeva KOV service package'i;
- korduv smoke ei loonud sama hash'i jaoks duplikaatversioone;
- active snapshot'id püsisid `version=1` väärtusega;
- mittetäielikud package'id märgiti korrektselt `needs_review` staatusesse.

### V3.2 — Package-Aware Answering

STATUS: implemented and production-smoked

Vastus ei tugine enam ainult valitud chunk'idele, vaid kasutab teenuse või toetuse kontrollitud SourcePackage'it.

- Kui vorm puudub, süsteem ei leiuta vormi.
- Kui kontakt puudub, süsteem ütleb, et kontaktiallikas puudub.
- Kui õiguslik alus on KOV määruses, viitab süsteem KOV määrusele.
- Kui allikas on ainult ajakirjaartikkel, ei kasutata seda tänase teenuse, vormi, kontakti või õiguse tõenduseks.

Production smoke confirmation:

- `npm run rag:smoke:source-packages -- --answering --persist` läbis;
- `rag_trace.package_aware_answering_used = true`;
- `used_package_ids`, `missing_sections_used` ja `package_displayed_source_ids` olid olemas;
- smoke kasutas Jõgeva KOV service package'e ning `missing_sections_used` sisaldas `forms`, `contacts`, `legal_basis`, `fees` ja `deadlines`;
- `SourcePackageSnapshot` persistence jäi tööle;
- `npm run rag:smoke:v2 -- --chat --legal-exact` jäi roheliseks;
- `npm run rag:smoke:v2` jäi roheliseks.

### V3.3 — Admin Review Workflow

STATUS: V3.3B admin review operations implemented at code/test level / production smoke pending

V3.3A/V3.3B lisavad `SourcePackageSnapshot` andmetele esimese admin review operatsioonikihi:

- admin saab SourcePackageSnapshot pakette listida;
- admin saab paketi detaili vaadata;
- admin näeb `missing_sections` ja arvutatud review flags signaale;
- admin saab teha `mark_reviewed` ja `archive`;
- admin saab teha `restore_active`, mis taastab vana snapshoti aktiivseks ilma mitme aktiivse versiooni konfliktita;
- admin detailis on review/audit history;
- admin saab teha ohutu `recompute` tegevuse, mis arvutab review state'i olemasoleva persisted metadata pealt uuesti;
- admin analytics näitab SourcePackage review loendureid;
- admin UI on read-only tabel minimaalse tegevusloogikaga.

See ei ole käsitsi teenuseinfo sisuhaldus. V3.3 ei luba vorme, kontakte, õiguslikku alust ega teenusekirjeldust käsitsi muuta. `status` jääb automaatseks paketikvaliteedi väljaks (`active | needs_review | archived`), `reviewStatus` on admini review töövoog (`pending | reviewed | archived`).

V3.3B kasutab action log'i ja persisted review reason detaili, kuid ei tee veel käsitsi source membership muutmist ega package sisuhaldust. V3.4 claim/section attribution jääb järgmiseks suuremaks etapiks.

### V3.4 — Claim/Section Attribution For High-Risk Answers

STATUS: V3.4A section-level attribution foundation production confirmed / post-confirmation audit active

V3.4A ei ole veel täielik claim-level attribution ega persisted claim store. See lisab esimese kitsama usalduskihi: package-aware või high-risk vastuse `rag_trace` sisaldab kompaktset `section_attribution` kokkuvõtet, mis seob `SourcePackage` sektsioonid ja `source_id` väärtused.

V3.4A trace väljad:

- `section_attribution`;
- `attribution_flags`;
- `package_attribution_checked`;
- `high_risk_attribution_checked`.

`section_attribution` kirje sisaldab ainult ohutuid tehnilisi välju: `package_id`, `section`, `source_ids`, `evidence_strength` ja `evidence_statuses`. Trace ei salvesta prompti, kasutajateksti, vastuse täisteksti, full claim text'i ega pikki allikakatkeid.

Missing sections on deterministlikult trace'is nähtavad. Kui `forms`, `contacts`, `legal_basis`, `fees` või `deadlines` puudub, tekib vastava sektsiooni kirje `evidence_strength = "missing"`, `evidence_statuses = ["missing_section"]` ja `source_ids = []`.

Legal exact rada on opt-out. `legal_exact` ja `legal_exact_paragraph` päringud ei kasuta SourcePackage section attribution'it ning nende `displayed_sources` enforcement jääb legal exact lepingusse.

V3.4B-sse jäävad täielik claim-level attribution, claim hashing, admin claim analytics ja võimalik persisted claim store.

Post-confirmation audit layer:

- admin SourcePackage detail kuvab ohutut section attribution summary't, missing sections signaale, evidence strength/status väärtusi, attribution flags infot ja review reasons loetavas kujus;
- Jõgeva SourcePackage gap report kontrollib persisted snapshot'ite põhjal, millistel pakettidel puuduvad `forms`, `contacts`, `legal_basis`, `fees` või `deadlines`;
- raport eristab esialgselt põhjuseid `input_missing`, `mapping_missing`, `source_type_mismatch`, `inactive_or_historical` ja `unknown`;
- eesmärk on parandada package completeness enne V3.4B claim-level attribution'it.

Käsk:

```text
npm run rag:report:jogeva-sourcepackage-gaps -- --json logs/jogeva-sourcepackage-gap-report.json
```

Kõrge riskiga väited seotakse konkreetse allika, SourcePackage'i sektsiooni või claim attribution'iga.

Kõrge riskiga väited:

- õigus;
- toetus;
- summa;
- tähtaeg;
- vorm;
- kontakt;
- abikõlblikkus;
- menetlus;
- kriisiolukorra juhis.

Trace ei pea salvestama täit väiteteksti. Piisab ohututest väljadest:

- `claim_id`;
- `claim_type`;
- `package_id`;
- `section`;
- `source_ids`;
- `evidence_strength`.

### V3.5 — Larger Regression System

STATUS: planned

Pärast package-aware answering ja high-risk attribution kihti kasvatatakse regressioonikomplekt 100–300 testini.

Testid peavad kontrollima:

- õige KOV;
- õige paragrahv;
- õige source type;
- current vs historical evidence;
- displayed sources ainult kinnitatud allikatest;
- missing section käsitlus;
- insufficient evidence;
- `journal_article` ei muutu current legal/form/contact evidence'iks.

### V3.6 — Multi-KOV Rollout In Waves

STATUS: planned

Kõiki KOV-e ei paketeerita korraga.

Soovitatud laiendamine:

1. Jõgeva pilot.
2. 3–5 eri suurusega KOV-i.
3. 10–15 KOV-i.
4. Suurem korpus.
5. Täiskorpus.

Iga laine järel tuleb kontrollida:

- readiness audit;
- package build;
- package quality;
- legal exact smoke;
- V2 metadata smoke;
- manual UI küsimused;
- wrong municipality rate;
- displayed source precision.

### V3.7 — Optional Retrieval/Index Technology Review

STATUS: optional / future technology decision

V3.7 ei ole kohustuslik arendusetapp ega tipptaseme tingimus.

Uut otsingumootorit, Qdranti, tugevamat BM25 indeksit, rerankerit või eraldi SourcePackage index'it kaalutakse ainult siis, kui V3.0–V3.6 mõõdikud näitavad, et olemasolev retrieval/index kiht piirab kvaliteeti, recall'i, latency't või skaleerumist.

Kui olemasolev Chroma + lexical/BM25 kiht toetab SourcePackage pipeline'i piisavalt hästi, jääb V3.7 tegemata või lükkub tuleviku tehnoloogiauuenemiseks.

### Architecture Maturity Definition

STATUS: design criterion

SotsiaalAI RAG-i võib lugeda arhitektuuriliselt tipptasemele jõudnuks siis, kui iga kõrge riskiga vastuse puhul on automaatselt jälgitav:

- milline intent, riskitase, KOV või õigusraam tuvastati;
- millised allikad leiti;
- millised allikad valiti;
- milline SourcePackage koostati;
- millised package sektsioonid olid olemas või puudu;
- millised allikad konkreetseid olulisi väiteid kinnitasid;
- miks mõni allikas välja jäeti;
- miks just need allikad kasutajale kuvati;
- kas admin saab puuduse parandada;
- kas regressioonitestid püüavad kinni vale KOV-i, vale paragrahvi, vale allikatüübi ja kasutamata allika kuvamise.

Tipptase ei tule ainult uuest otsingumootorist. Tipptase tuleb sellest, et süsteem kontrollib teadmuse struktuuri, allikatüüpe, tõendusrolle, väiteid, kuvatavaid allikaid ja kvaliteediprobleeme.

## Data Contracts

STATUS: active contract / evolving

Pipeline'is liikuvad põhiobjektid peavad olema eristatavad:

- `RetrievalCandidate` - otsingukanalist leitud allikas või chunk koos score'i ja metadata'ga.
- `SelectedContext` - mudelile saadetav kontrollitud kontekstiosa.
- `SourcePackage` - canonical item'i ümber koostatud tervikpakett.
- `AnswerSource` - allikas, mida vastus deklareerib kasutatuks.
- `DisplayedSource` - serveri kinnitatud kasutajale nähtav allikas.
- `AttributionDecision` - otsus allika kuvamise või peitmise kohta koos põhjusega.
- `RagTrace` - retrieval'i, attribution'i, filtering'u ja kuvamise tehniline jälg.

Need objektid ei tohi segada `source_id`, `document_id`, `chunk_id` ja `canonical_item_id` tähendust.

## Rollout Plan

STATUS: partially completed / historical

V1 tuleb sisse lülitada järk-järgult:

1. `shadow mode` - uus trace ja attribution decision'id logitakse, aga UI käitumist ei muudeta.
2. `admin-only trace` - admin/debug vaates saab võrrelda retrieved, selected, answer ja displayed allikaid.
3. `partial source filtering` - allikapaneel kasutab uut loogikat valitud juhtudel või feature flag'i taga.
4. `full displayed_sources enforcement` - allikapaneel kuvab ainult serveri kinnitatud `displayed_sources`.

## Privacy Boundary For RAG Trace

STATUS: active policy

RAG trace peab vaikimisi salvestama tehnilised otsused ja allikaidentifikaatorid, mitte kogu kasutaja sisendit, täit model context'i ega delikaatseid juhtumikirjeldusi.

Trace võib salvestada:

- source id-d;
- attribution decisions;
- filter reasons;
- retrieval counts;
- source type;
- risk level;
- latency;
- token usage.

Trace ei peaks vaikimisi salvestama:

- täit kasutaja küsimust, kui see sisaldab tundlikku isikuinfot;
- kogu mudelile saadetud konteksti;
- kasutaja faile või dokumentide sisu;
- delikaatseid kliendiandmeid.

Kui detailsem debug-logi on arenduses ajutiselt vajalik, peab see olema piiratud ligipääsuga ja ajaliselt piiratud.

## Remaining Open Decisions

STATUS: active decisions

- Kas `answer_sources` ja `displayed_sources` salvestatakse `ConversationMessage.metadata` sisse või eraldi tabelitesse?
- Kas `canonical_item_id` tekib ingestis automaatselt või admini kinnitusega?
- Milline on persisted `SourcePackage` täpne DB schema V3.1-s?
- Milline rebuild trigger strategy valida pärast reingest'i, source metadata muutust või stale source signaali?
- Kuidas admin review workflow piirata nii, et see ei muutuks käsitsi sisuhalduseks?
- Milline on claim text privacy mudel: `text_hash` vs excerpt-free `claim_id`?
- Millal laiendada multi-KOV rollout 3-5 KOV-ilt 10-15 KOV-ile?
- V3.7 retrieval/index technology review on optional: Chroma, Postgres full-text, tugevam BM25, reranker, Qdrant või eraldi SourcePackage index vaadatakse üle ainult siis, kui mõõdikud näitavad vajadust.

## V3 Conceptual Target State

STATUS: conceptual / superseded by V3 Roadmap And Architecture Maturity

See plokk kirjeldab V3 üldist kontseptsiooni. Konkreetne staged roadmap ja prioriteedid on plokis `V3 Roadmap And Architecture Maturity`. Kui tekib vastuolu, kehtib roadmap'i plokk.

V3 tähendab SotsiaalAI RAG-is küpset tootetasemel teadmussüsteemi, mitte ainult parandatud otsingut.

```text
V1 = tee praegune RAG kontrollitavaks
V2 = tee otsing ja kvaliteedipoliitika paremaks
V3 = tee teadmussüsteem struktureeritud, tõendatavaks ja skaleeritavaks
```

V3-s ei ole RAG enam ainult:

```text
küsimus -> otsing -> paar lõiku -> AI vastus
```

vaid:

```text
küsimus
-> rolli, riski, KOV-i ja teema tuvastus
-> hübriidotsing ja metadata filtrid
-> source package
-> evidence policy
-> vastus
-> kinnitatud allikad
-> trace
-> testid ja admin-kontroll
```

### V3 Core Capabilities

STATUS: design target

V3 põhivõimekused:

- täielik `SourcePackage` andmemudel KOV teenuste, toetuste, vormide, kontaktide ja õigusliku aluse jaoks;
- claim-level attribution kõrge riskiga väidetele;
- 100-300 küsimusega regressioonitestide komplekt;
- kvaliteedimõõdikud nagu `source_recall`, `source_precision`, `displayed_source_precision`, `unsupported_claim_rate`, `wrong_municipality_rate`, `stale_source_rate` ja `insufficient_evidence_correctness`;
- admini kvaliteeditöövoog vananenud, vastuoluliste, puudulike või kinnitamata allikate jaoks;
- optional retrieval/index technology review ainult siis, kui trace ja regressioonid näitavad, et olemasolev otsingukiht jääb kvaliteedi, recall'i, latency või skaleerumise piiranguks.

### V3 Source Package

STATUS: design target

V3-s on KOV teenus või toetus struktureeritud objekt, mitte ainult hulk chunk'e.

```json
{
  "canonical_item_id": "tartu_linn_service_koduteenus",
  "type": "kov_service",
  "title": "Koduteenus",
  "municipality_id": "tartu_linn",
  "sections": {
    "description": {},
    "eligibility": {},
    "application": {},
    "forms": [],
    "contacts": [],
    "legal_basis": [],
    "fees": {},
    "deadlines": {}
  },
  "source_ids": [],
  "last_checked": "2026-04-25",
  "status": "active",
  "confidence": "high"
}
```

See võimaldab küsida otse:

- mis teenus see on;
- kellele see kehtib;
- kuidas taotleda;
- milline vorm on õige;
- kes on kontakt;
- mis on õiguslik alus;
- kas info on kehtiv;
- millised allikad seda kinnitavad.

### V3 Claim-Level Attribution

STATUS: design target

V3-s liigub süsteem kõrge riskiga väidete puhul väitepõhise tõenduse poole.

```json
{
  "claim_id": "claim_1",
  "claim_type": "eligibility_or_assessment",
  "text_hash": "...",
  "package_id": "jogeva_vald_service_koduteenus_package",
  "section": "eligibility",
  "source_ids": ["..."],
  "evidence_strength": "strong"
}
```

Trace ja claim attribution ei salvesta täit väiteteksti, prompti ega kasutaja teksti. Kasutatakse piiratud tehnilisi viiteid nagu `claim_id`, `claim_type`, `text_hash`, `package_id`, `section`, `source_ids` ja `evidence_strength`.

Claim-level attribution on eriti oluline järgmiste väidete puhul:

- õigus;
- toetus;
- summa;
- tähtaeg;
- abikõlblikkus;
- kontakt;
- vorm;
- kehtivus;
- KOV-spetsiifiline tingimus.

### V3 Maturity Notes

STATUS: design target

V3 valmisolek ei tähenda ainult uute funktsioonide olemasolu. V3 peab olema auditeeritav, mõõdetav ja hooldatav teadmussüsteem.

Source versioning:

- iga allikas peab olema versioonitav või vähemalt `content_hash` ja `last_checked` põhiselt auditeeritav;
- vastuse trace peab näitama, millise allika seisu põhjal vastus koostati;
- vormi, kontakti või määruse muutumisel peab olema võimalik aru saada, millal vana info asendus.

Claim store:

```json
{
  "claim_id": "claim_1",
  "claim_type": "application_step",
  "text_hash": "...",
  "package_id": "jogeva_vald_service_koduteenus_package",
  "section": "application",
  "source_ids": ["..."],
  "evidence_strength": "strong"
}
```

Claim store ja trace ei salvesta täit väiteteksti, prompti ega kasutaja teksti. Vajadusel kasutatakse `text_hash` väärtust, et sama väidet tehniliselt võrrelda ilma sisu logimata.

Temporal reasoning:

- süsteem peab eristama praegu kehtivat infot, ajaloolist infot ja aastal X kehtinud infot;
- vana artikkel võib olla metoodiline taust, aga mitte tänase toetuse, vormi, tähtaja või kontakti tõendus;
- kui kasutaja küsib ajaloolist infot, ei tohi süsteem seda automaatselt tänaseks infoks muuta.

Source conflict resolution:

- kui teenuseleht ja määrus on õigusliku väite puhul vastuolus, eelistatakse kehtivat määrust või seadust;
- kui vorm ja teenuseleht erinevad taotlemiskanali osas, märgitakse vastuolu ja suunatakse kontrollima KOV-ist;
- vastuolu ei tohi vastuses ära siluda.

Knowledge operations:

- admin peab nägema stale allikaid, katkisi linke, muutunud vorme ja puudulikku metadata't;
- source package peab olema vajadusel käsitsi kinnitatav;
- admin peab saama märkida, et allikas on ainult taust, mitte tõendus;
- vastuoluline allikapaar peab jõudma ülevaatuse järjekorda.

Reproducible answers:

- V3 trace peab võimaldama taastada query planner output'i, valitud allikad, source package'i versiooni, prompt contract'i, mudeli versiooni ja lõplikud `displayed_sources`;
- täielikku tundlikku kasutajasisendit ei pea selleks vaikimisi salvestama.

Domain ontology:

- `koduteenus`, `koduhooldus` ja `abi kodus` peavad olema seostatavad mõisted;
- `hooldajatoetus`, `hoolduse seadmine` ja `puudega isiku hooldaja toetus` tuleb eristada;
- `sotsiaaltransport`, `invatransport`, `sõiduteenus` ja transport ravile võivad olla eri KOV-ides erineva sisuga;
- riiklik toetus ja KOV toetus peavad olema eraldi kategooriad.

V3 evaluation gates:

```text
displayed_source_precision >= 0.95
wrong_municipality_rate <= 0.02
unsupported_claim_rate <= 0.05
stale_source_rate high-risk answers <= 0.01
insufficient_evidence_correctness >= 0.90
```

Need numbrid on algsed sihid, mitte lõplikud lepingulised lubadused. Oluline on, et V3 kvaliteeti mõõdetakse, mitte ei hinnata ainult tunde järgi.

### V3 Acceptance Criteria

STATUS: design target

V3 loetakse tehtuks, kui:

- KOV teenused, toetused, vormid ja kontaktid on esindatud source package objektidena;
- kõrge riskiga väited on claim-level attribution'iga kaetud;
- allika versioon ja kehtivus on auditeeritavad;
- süsteem tuvastab ja märgib allikakonflikte;
- admin saab hallata stale, puudulikke ja vastuolulisi allikaid;
- regressioonikomplektis on vähemalt 100-300 juhtumit;
- mõõdetakse unsupported claim, wrong KOV, stale source ja displayed source precision näitajaid.

### V3 Limits

STATUS: design target

Ka V3 ei tee süsteemi eksimatuks.

- Kui KOV veebileht on puudulik, vana või segane, saab süsteem ainult ausalt öelda, et allikas ei kinnita.
- Õigusaktide ja KOV määruste kehtivust saab kontrollida paremini kui tavaliste veebilehtede ja vormide ajakohasust.
- Mõnes sotsiaaltöö juhtumis ei ole üks õige vastus; süsteem peab toetama mõtlemist, mitte otsustama inimese või organisatsiooni eest.
- KOV-info killustatus nõuab pidevat hooldust ja admini kvaliteedikontrolli.
- Platvorm ei asenda ametlikku otsust, juhtumikorraldust ega õigusnõustamist.

V3 suurim tugevus ei ole see, et süsteem leiab rohkem infot, vaid see, et ta teab, mida ta teab, mida allikas ei kinnita, millist allikat ta kasutas ja miks kasutajale just need allikad kuvati.

## Praeguse Süsteemi Failikaart

STATUS: reference / active map

### Vestluse API Ja Orkestreerimine

STATUS: reference / active code map

- `app/api/chat/route.js` - peamine chat endpoint; ühendab bootstrap'i, töövood, RAG konteksti ja vastuse genereerimise.
- `lib/chat/requestBootstrap.js` - autentimine, sisendi normaliseerimine, ajalugu, roll, keel, greeting, töövoo olekud.
- `lib/chat/mainResponseHandler.js` - OpenAI vastuse kutsumine/streamimine, vastuse finaliseerimine, allikate filtreerimine.
- `lib/chat/workflowBranchHandlers.js` - dokumendi- ja abisoovi/abipakkumise töövoogude harud.
- `lib/chat/orchestrationPolicy.js` - otsustab üldise orkestreerimisplaani.
- `lib/chat/modeSelection.js`, `lib/chat/workflowModeRouting.js` - vestluse töörežiimi valik ja suunamine.

### Promptid Ja OpenAI Vastus

STATUS: reference / active code map

- `lib/chat/promptBuilder.js` - Responses API sisendi koostamine, RAG_CONTEXT, grounding, greeting strings, max tokenid.
- `lib/chat/openaiRuntime.js` - `callOpenAI`, `streamOpenAI`, Responses API payload.
- `lib/chat/systemPrompts/index.js` - keelepõhiste süsteemipromptide valik.
- `lib/chat/systemPrompts/et.js` - eesti süsteemiprompt.
- `lib/chat/systemPrompts/en.js` - inglise süsteemiprompt.
- `lib/chat/systemPrompts/ru.js` - vene süsteemiprompt.
- `lib/chat/systemPrompts/common.js` - promptide renderdamise abifunktsioonid.

### RAG Vajaduse Tuvastus, Otsing Ja Kontekst

STATUS: reference / active code map

- `lib/chat/sourceNeed.js` - otsustab, kas pöörde jaoks on vaja väliseid allikaid/RAG-i.
- `lib/chat/retrievalContextAssembler.js` - RAG pipeline'i keskne koostaja: võtab planneri otsuse, käivitab otsingu, koostab konteksti ja allikad.
- `lib/chat/queryPlanner.js` - Query Planner V2: koostab RAG päringud, filtrid, topK, selection strategy, context group target ja `query_plan` trace'i.
- `lib/chat/retrievalOrchestrator.js` - RAG päringu ehitus, source lookup tuvastus, RAG service `/search` kutsumine, dedupe.
- `lib/chat/retrievalPlanning.js` - ajatelje/aastate kaupa retrieval, temporal query'd ja juhised.
- `lib/chat/requestContext.js` - omavalitsuse, hiljutise teksti ja ajutiste dokumentide konteksti abiloogika.
- `lib/chat/ragContext.js` - match'ide normaliseerimine, grupeerimine, ranking, MMR, kontekstiplokkide renderdamine.
- `lib/chat/safety.js` - kriisi tuvastus ja grounding strength.
- `lib/chat/settings.js` - RAG ja mudeli env seadistused (`RAG_TOP_K`, `RAG_CONTEXT_GROUPS_MAX`, `RAG_API_BASE`, jne).
- `lib/chat/sourceAttribution.js` - vastusepõhine allikafiltreerimine: `answer sources` -> `displayed sources`.

### Salvestamine, Metadata Ja Allikate Kuvamine

STATUS: reference / active code map

- `lib/chat/responseFinalizer.js` - vastuse JSON/SSE finaliseerimine, allikate/attachmentide salvestus.
- `lib/chat/persistence.js` - vestluse ja assistendi sõnumi salvestus, metadata `sources`.
- `components/chat/hooks/useChatStream.js` - frontendi chat stream, `meta`, `delta`, `done`, allikate vastuvõtt.
- `components/chat/hooks/useConversationSources.js` - vestlussõnumitest allikapaneeli allikate koondamine.
- `components/chat/utils/sources.js` - allikate normaliseerimine ja label'i koostamine.
- `components/alalehed/chat/ChatSourcesPanel.jsx` - kasutajale kuvatav `Vastuste allikad` paneel.
- `components/chat/LeftRail.jsx`, `components/chat/RightRail.jsx`, `components/alalehed/chat/view/ChatMobileTopNav.jsx` - allikapaneeli nupud ja olek.

### RAG Service

STATUS: reference / active code map

- `rag-service/main.py` - FastAPI RAG service, OpenAI embeddings, Chroma, upload/search endpointid, registry ja observability headerid.
- `rag-service/requirements.txt` - RAG service Python sõltuvused.

### RAG Ingest Ja Admin

STATUS: reference / active code map

- `scripts/ingest-kov-rag.mjs` - KOV RAG pakettide ingest.
- `scripts/validate-kov-rag.mjs` - KOV `sources.json`, `data.json`, `meta.json`, `rag.md` valideerimine.
- `scripts/ingest-national-rt-xml.mjs` - riikliku Riigi Teataja XML ingest.
- `scripts/ingest-ajakiri-sotsiaaltoo.mjs` - Sotsiaaltöö ajakirja artiklite ingest.
- `scripts/reindex-rag-documents.mjs` - dokumentide reindex.
- `lib/admin/rag/kov/service.js` - KOV admin, failid, kontroll, ingest, metadata.
- `lib/admin/rag/kov/validation.js` - KOV failide valideerimine.
- `lib/admin/rag/kov/rtXml.js` - KOV/Riigi Teataja XML parser ja chunk'id.
- `lib/admin/rag/kov/shared.js`, `storage.js`, `api.js` - KOV admini abikihid.
- `lib/admin/rag/organizations/service.js` - organisatsioonide RAG admin ja ingest.
- `lib/admin/rag/organizations/validation.js` - organisatsiooni failide valideerimine.
- `app/api/admin/rag/**` - RAG admin API endpointid KOV, organisatsioonide ja national RT jaoks.

### Andmebaas Ja Logid

STATUS: reference / active code map

- `prisma/schema.prisma` - `RagDocument`, `Conversation`, `ConversationMessage`, `ConversationRun`, `ChatLog`, KOV/organization admin mudelid.
- `lib/chat/logger.js` - chat/RAG sündmuste logimine `ChatLog` tabelisse.
- `app/api/admin/analytics/summary/route.js` - RAG logide ja dokumentide admin-kokkuvõte.
- `app/api/admin/analytics/users/route.js` - kasutajapõhine RAG/chat kasutuse statistika.
- `app/api/admin/analytics/ai-costs/route.js` - AI/RAG kulude kokkuvõte.

### Testid

STATUS: reference / active test map

- `tests/chat/queryPlanner.test.js` - Query Planner V2 plaani, filtrite, broad/source-focused käitumise ja KOV laiendatud päringute testid.
- `tests/fixtures/query-planner-v2-cases.json` - Query Planner V2 eval-fixture planner mode'ide ja filtrite regressiooniks.
- `tests/chat/sourceNeed.test.js` - RAG vajaduse tuvastus.
- `tests/chat/retrievalOrchestrator.test.js` - RAG päringute, follow-up source anchoring'u, hübriidkanalite ja source filter merge'i testid.
- `tests/chat/sourceAttribution.test.js` - vastusepõhine allikafiltreerimine.
- `tests/chat/ragTraceMetadata.test.js` - `rag_trace`, allikakihtide ja `query_plan` metadata testid.
- `tests/chat/ragContextRanking.test.js` - teema vihjete põhine ranking.
- `tests/chat/conversationSources.test.js` - allikapaneeli jaoks sõnumitest allikate kogumise ja `displayed_sources` eelistamise testid.
- `tests/chat/promptStyle.test.js` - prompti stiil, tervitused ja ajakontekst.

## Esmane Analüüsisuund

STATUS: historical / superseded by current V2 backlog

Järgmises analüüsis vaadata järjest:

1. `sourceAttribution.js`, `mainResponseHandler.js`, `useChatStream.js`, `useConversationSources.js` - kas `displayed sources` on piisavalt aus ja kas attribution decision'id on logitavad.
2. `retrievalContextAssembler.js`, `retrievalOrchestrator.js`, `ragContext.js` - kuidas `retrieved candidates` muutuvad `selected context sources` kihiks.
3. `rag-service/main.py` - kas search toetab piisavat metadata filtering'ut, phrase/title/BM25 hübriidi ja trace'i.
4. `scripts/validate-kov-rag.mjs`, `scripts/ingest-kov-rag.mjs`, `lib/admin/rag/kov/service.js` - kas ingest toodab source package'i jaoks piisavalt struktuuri.
5. `prisma/schema.prisma` - kas andmemudel toetab source type, canonical item, answer source ja trace kihte.

## Lõppeesmärk

STATUS: active principle

SotsiaalAI RAG-i eesmärk ei ole leida võimalikult palju sarnaseid tekstikatkeid, vaid koostada kontrollitud tõenduspakett, mille põhjal saab anda rolli, aja, KOV-i ja allikatüübi suhtes usaldusväärse vastuse.
