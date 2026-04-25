# SotsiaalAI RAG Architecture And Roadmap

## Juhtpõhimõte

SotsiaalAI RAG otsib laialt, filtreerib rangelt, koostab kontrollitud source package'i ja kuvab allikatena ainult need allikad, millele lõplik vastus sisuliselt toetub.

RAG pipeline peab eristama nelja kihti:

1. `retrieved candidates` - kõik otsinguga leitud võimalikud allikad.
2. `selected context sources` - allikad või paketid, mis saadetakse mudelile vastuse koostamiseks.
3. `answer sources` - allikad, millele lõplik vastus sisuliselt toetub.
4. `displayed sources` - kasutajale nähtavad allikad; peavad olema `answer sources` kontrollitud alamhulk või sama hulk.

Kasutajale nähtavad `Vastuste allikad` ei tohi olla kõik otsingukandidaadid ega kõik mudelile saadetud kontekstiallikad.
Kasutajale kuvatavad allikad ei tohi sisaldada allikaid, mida vastus ei kasutanud või mida server ei kinnitanud.

## Current State vs Target State

| Area | Current | Target |
| --- | --- | --- |
| Source display | Allikapaneel sõltub valitud või salvestatud allikaloendist | Paneel kuvab ainult serveri kinnitatud `displayed_sources` |
| Retrieval | Peamiselt Chroma vektorotsing ja olemasolev ranking | Hübriidotsing, metadata, exact/title match ja vajadusel reranking |
| Attribution | Vastusepõhine allikafiltreerimine | `answer_source_ids`, `displayed_source_ids` ja `attribution_decisions` |
| Trace | Osaline RAG/chat logimine | Iga RAG-vastuse minimaalne trace ja hiljem täisobservability |
| KOV service model | Markdown/chunk-põhine korpus | Canonical item + source package |
| Metadata | Ebaühtlane allikate kirjeldus | Kontrollitud source type, authority, KOV, kehtivus ja olek |

## Evolution Principle

Süsteemi edasiarendamine ei tähenda, et praegune vana RAG pipeline peab jääma samaks. V1 eesmärk on vältida pimesi ümberkirjutamist, mitte lukustada olemasolevaid tehnilisi piire.

Legacy ühilduvus on üleminekuvahend:

- vanad vestlused ja olemasolevad allikad peavad jääma loetavaks;
- uusi kihte võib lisada adapterite või feature flag'ide taga;
- nõrgad või segased vanad vastutuspiirid võib refaktoreerida, kui uus data contract on selgem;
- vana `sources` loogika võib järk-järgult taanduda `displayed_sources`, `rag_trace` ja `attribution_decisions` kasuks;
- kui trace ja testid näitavad, et olemasolev retrieval, salvestus või UI allikaloogika on takistus, võib selle asendada, mitte ainult ümber pakkida.

Oluline põhimõte: vana süsteemi ei säilitata sellepärast, et see on olemas. Seda säilitatakse ainult nii kaua, kui see aitab turvaliselt üle minna kontrollitavamale ja usaldusväärsemale arhitektuurile.

## Evidence Policy

Iga faktiväide peab võimaluse korral tuginema kontrollitud allikale. Kõrge riskiga väited, nagu õigus, toetus, summa, tähtaeg, vorm, kontakt, abikõlblikkus või kriisiolukorra juhis, vajavad tugevat tõendusastet.

Evidence strength:

- `strong` - ametlik, kehtiv, õige KOV-i või riikliku tasandi allikas, mis vastab küsimusele otseselt.
- `medium` - asjakohane ja autoriteetne allikas, kuid osaliselt kaudne või mittetäielik.
- `weak` - taustamaterjal, metoodiline käsitlus, artikkel või praktikanäide; sobib selgituseks, kuid mitte konkreetse õiguse, summa, tähtaja, vormi või kontakti kinnitamiseks.
- `insufficient` - allikas ei kinnita väidet piisavalt.

Kõrge riskiga väiteid ei tohi esitada kindla faktina, kui nende kohta puudub `strong` evidence. Sellisel juhul peab vastus ütlema, mida allikad kinnitavad, mida nad ei kinnita ja kust infot tuleks üle kontrollida.

Ajaloolist allikat, ajakirjaartiklit, praktikalugu või arvamust ei tohi kasutada tänase kehtiva õiguse, toetuse, vormi, tähtaja või kontakti tõendusena.

## Risk-Based RAG Policy

Kõik kasutajaküsimused ei vaja sama ranget retrieval'i ja attribution'i taset.

- `low risk` - üldine selgitus, metoodiline taust, mõistete seletus.
- `medium risk` - KOV teenus, taotlemise sammud, vormid, kontaktid, praktiline juhendamine.
- `high risk` - õigus, toetus, summa, tähtaeg, abikõlblikkus, kehtivus, kriisiolukord.

Kõrge riskiga küsimuste puhul peab süsteem eelistama ametlikke ja kehtivaid allikaid ning andma kindla vastuse ainult siis, kui tõendus on piisav. Kui tõendus puudub, peab vastus kasutama insufficient evidence režiimi.

## Insufficient Evidence And Source Conflict Handling

Kui süsteem ei leia piisavalt tugevat allikat, peab vastus eristama:

- mida allikad kinnitavad;
- mida allikad ei kinnita;
- milline info tuleb KOV-ist, õigusaktist või ametlikust allikast üle kontrollida.

Kui allikad on omavahel vastuolus, ei tohi vastus vastuolu ära siluda. Vastus peab nimetama vastuolu ja eelistama kõrgema autoriteediga, kehtivamat või konkreetsema intent'iga sobivat allikat. Näiteks õigusliku küsimuse puhul on kehtiv õigusakt tugevam kui artikkel; vormi küsimuse puhul võib ametlik vorm või e-teenuse link olla tugevam kui üldine teenuseleht.

## Freshness Policy

Allika värskuse nõue sõltub allikatüübist.

- KOV kontaktid ja vormid vajavad regulaarset kontrolli ning vananenud `last_checked` peab olema adminis nähtav.
- KOV teenused ja toetused vajavad kehtivuse kontrolli, eriti kui vastus puudutab taotlemist, summat, tähtaega või tingimust.
- Õigusaktide puhul tuleb eelistada kehtivusinfoga ametlikku allikat.
- Artiklid, metoodika ja praktikalood võivad olla taustaks, kuid neid ei kasutata tänase kehtiva teenuseinfo tõendusena.

## KOV Disambiguation Policy

KOV on hard filter ainult siis, kui kasutaja küsimus või tööruumi kontekst annab selle kõrge kindlusega.

Kui kasutaja viitab mitmele KOV-ile, näiteks elukoht on ühes ja viibimiskoht teises, peab süsteem vältima automaatset oletust. Sellisel juhul küsib süsteem täpsustust või annab tingimusliku vastuse, mis eristab KOV-e ja ütleb, millist infot tuleb üle kontrollida.

## Teostusjärjekord

### 1. Väike Golden Set

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

Open decision enne ingest'i: kas kasutada igas korpuseperes eraldi failinimesid või hoida failinimed ühtsed ja eristada tüüpi `collection_type` väljaga. Mõlemal juhul peab väljund jõudma samasse `source_documents`, `chunks`, `source_packages` ja `answer_sources` loogikasse.

### 5. Hard Filters

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

V1 loetakse tehtuks, kui:

- iga RAG-vastus logib `retrieved_source_ids`, `selected_context_source_ids`, `answer_source_ids`, `displayed_source_ids`, `filtered_out_source_ids`, `filter_reasons` ja `attribution_decisions`;
- allikapaneel kuvab ainult backendist tulnud `displayed_sources` või nendega seotud kinnitatud allikad;
- golden setis on vähemalt 20 testjuhtumit;
- testides on vähemalt üks juhtum, kus retrieved allikas jääb displayed allikatest välja;
- kõrge riskiga väide ei ilmu kindla faktina, kui sellel puudub `strong` evidence;
- legacy sõnumid jäävad UI-s loetavaks ka vana `sources` metadata korral;
- ingest annab vea või hoiatuse, kui kriitiline metadata puudub.

## V1 Delivery Plan

### RAG-1: Add Golden Set Fixture

Luua 20 küsimusega testikomplekt koos oodatud allikatüüpide, keelatud allikate ja `must_not_claim` reeglitega.

Acceptance:

- olemas on vähemalt 20 testjuhtumit;
- testid katavad KOV, vormi, kontakti, ajaloolise allika, vale KOV-i, vale keele ja "allikas ei kinnita" juhtumi.

### RAG-2: Add Minimal RagTrace Object

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

Salvestada lõplikud `displayed_source_ids` assistendi sõnumi metadata'sse.

Acceptance:

- uued sõnumid sisaldavad `displayed_source_ids`;
- legacy sõnumid jäävad ühilduvaks vana `sources` loogikaga.

### RAG-5: Make Source Panel Read displayed_source_ids Only

Frontendi allikapaneel ei tohi enam ise retrieved või selected allikaid kokku korjata.

Acceptance:

- `ChatSourcesPanel.jsx` kuvab ainult backendist tulnud `displayed_sources`;
- vähemalt üks test tõendab, et retrieved allikas ei ilmu paneeli, kui seda ei kinnitatud.

### RAG-6: Add Metadata Validation To Ingest

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

Lisada test, kus otsing leiab mitu kandidaati, aga kasutajale kuvatakse ainult üks või kaks kinnitatud allikat.

Acceptance:

- testis on retrieved allikaid rohkem kui displayed allikaid;
- allikapaneel ei kuva kasutamata kandidaate.

## V1 Ja V2 Täiendavad Märkused

Need märkused täpsustavad järgmisi arendusideid. Need ei laienda automaatselt V1 kohustuslikku skoopi, vaid aitavad hiljem ticketiteks ja otsusteks jagada.

### V1 Audit Checklist

Enne V1 koodi muutmist tuleb praeguse pipeline'i vastu kontrollida:

- kust `retrieved sources` praegu tulevad;
- kus ja kuidas neist saavad `selected context sources`;
- mida `sourceAttribution.js` praegu eemaldab või alles jätab;
- mis salvestatakse `ConversationMessage.metadata.sources` sisse;
- kas streaming ja non-streaming vastused käituvad allikate osas samamoodi;
- kas frontend kogub vestlussõnumitest allikaid ise juurde;
- kas allikapaneel võib kuvada allikat, mida backend ei kinnitanud.

### V1 Backend Response Contract

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
- tulemused ühendatakse RRF või weighted merge loogikaga;
- reranking võib jääda reeglipõhiseks, kui mudelipõhine reranker ei ole veel vajalik.

V2 retrieval trace peab iga kanali eraldi nähtavaks tegema. Esimese sammuna peab ka olemasolev Chroma otsing märkima tulemused `dense` retriever'ist tulnuks ja `rag_trace.retrievers_used` peab selle salvestama. Hilisemad `exact_phrase`, `title_match`, `bm25` ja reranker'i kanalid lisanduvad samasse välja, et kvaliteedilangust või -võitu saaks mõõta, mitte aimata.

V2 esimene hübriidotsingu samm on lightweight lexical retrieval:

- `dense` jääb põhikanaliks;
- `title_match` otsib pealkirja kattuvust;
- `exact_phrase` otsib täpse fraasi kattuvust tekstis;
- leksikaalne scan on piiratud `RAG_LEXICAL_SCAN_LIMIT` ja `RAG_LEXICAL_TOP_K` väärtustega;
- leitud kanalid kantakse tulemuse `retrieval_channels` väljale ja hiljem `rag_trace.retrievers_used` alla;
- lexical kanal ei asenda BM25/full-text indeksit, vaid annab V2-s esimese mõõdetava silla päris hübriidotsingu poole.

V2 evidence score võib alguses olla reeglipõhine:

```text
authority + source_type + municipality_match + freshness + exact_title_match + risk_fit
```

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

## Data Contracts

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

V1 tuleb sisse lülitada järk-järgult:

1. `shadow mode` - uus trace ja attribution decision'id logitakse, aga UI käitumist ei muudeta.
2. `admin-only trace` - admin/debug vaates saab võrrelda retrieved, selected, answer ja displayed allikaid.
3. `partial source filtering` - allikapaneel kasutab uut loogikat valitud juhtudel või feature flag'i taga.
4. `full displayed_sources enforcement` - allikapaneel kuvab ainult serveri kinnitatud `displayed_sources`.

## Privacy Boundary For RAG Trace

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

## Open Decisions

- Kas Chroma jääb pikemaks ajaks või liigub RAG hiljem Qdranti või muu hübriidotsingut paremini toetava lahenduse peale?
- Kas BM25/full-text tuleb Postgresist, eraldi indeksist või vector DB hübriidotsingust?
- Kas `answer_sources` ja `displayed_sources` salvestatakse `ConversationMessage.metadata` sisse või eraldi tabelitesse?
- Kas `canonical_item_id` tekib ingestis automaatselt või admini kinnitusega?
- Kas source package on V1 järel runtime'i objekt, andmebaasi objekt või mõlemat?
- Kas claim-level attribution on V2 või V3 eesmärk?
- Kuidas versioonida source package'id, kui KOV teenus, vorm või kontakt muutub?

## V3 Target State

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
-> reranking
-> evidence policy
-> vastus
-> kinnitatud allikad
-> trace
-> testid ja admin-kontroll
```

### V3 Core Capabilities

V3 põhivõimekused:

- täielik `SourcePackage` andmemudel KOV teenuste, toetuste, vormide, kontaktide ja õigusliku aluse jaoks;
- mudelipõhine või kombineeritud reranker, mis hindab mitte ainult sarnasust, vaid tõendusväärtust;
- claim-level attribution kõrge riskiga väidetele;
- 100-300 küsimusega regressioonitestide komplekt;
- kvaliteedimõõdikud nagu `source_recall`, `source_precision`, `displayed_source_precision`, `unsupported_claim_rate`, `wrong_municipality_rate`, `stale_source_rate` ja `insufficient_evidence_correctness`;
- admini kvaliteeditöövoog vananenud, vastuoluliste, puudulike või kinnitamata allikate jaoks;
- vajadusel Qdrant või muu lahendus, kui trace näitab, et Chroma ja olemasolev otsingukiht jäävad päriselt kitsaks.

### V3 Source Package

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

V3-s liigub süsteem kõrge riskiga väidete puhul väitepõhise tõenduse poole.

```json
{
  "claim": "Koduteenust saab taotleda Tartu linnas sotsiaal- ja tervishoiuosakonna kaudu.",
  "source_id": "tartu_linn_koduteenus_page",
  "evidence_strength": "strong",
  "section": "Taotlemine"
}
```

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

V3 valmisolek ei tähenda ainult uute funktsioonide olemasolu. V3 peab olema auditeeritav, mõõdetav ja hooldatav teadmussüsteem.

Source versioning:

- iga allikas peab olema versioonitav või vähemalt `content_hash` ja `last_checked` põhiselt auditeeritav;
- vastuse trace peab näitama, millise allika seisu põhjal vastus koostati;
- vormi, kontakti või määruse muutumisel peab olema võimalik aru saada, millal vana info asendus.

Claim store:

```json
{
  "claim_id": "tartu_koduteenus_application_channel",
  "canonical_item_id": "tartu_linn_service_koduteenus",
  "claim_type": "application_step",
  "text": "Koduteenust saab taotleda Tartu linnas sotsiaal- ja tervishoiuosakonna kaudu.",
  "evidence_source_ids": [],
  "valid_from": null,
  "valid_to": null,
  "confidence": "high"
}
```

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

V3 loetakse tehtuks, kui:

- KOV teenused, toetused, vormid ja kontaktid on esindatud source package objektidena;
- kõrge riskiga väited on claim-level attribution'iga kaetud;
- allika versioon ja kehtivus on auditeeritavad;
- süsteem tuvastab ja märgib allikakonflikte;
- admin saab hallata stale, puudulikke ja vastuolulisi allikaid;
- regressioonikomplektis on vähemalt 100-300 juhtumit;
- mõõdetakse unsupported claim, wrong KOV, stale source ja displayed source precision näitajaid.

### V3 Limits

Ka V3 ei tee süsteemi eksimatuks.

- Kui KOV veebileht on puudulik, vana või segane, saab süsteem ainult ausalt öelda, et allikas ei kinnita.
- Õigusaktide ja KOV määruste kehtivust saab kontrollida paremini kui tavaliste veebilehtede ja vormide ajakohasust.
- Mõnes sotsiaaltöö juhtumis ei ole üks õige vastus; süsteem peab toetama mõtlemist, mitte otsustama inimese või organisatsiooni eest.
- KOV-info killustatus nõuab pidevat hooldust ja admini kvaliteedikontrolli.
- Platvorm ei asenda ametlikku otsust, juhtumikorraldust ega õigusnõustamist.

V3 suurim tugevus ei ole see, et süsteem leiab rohkem infot, vaid see, et ta teab, mida ta teab, mida allikas ei kinnita, millist allikat ta kasutas ja miks kasutajale just need allikad kuvati.

## Praeguse Süsteemi Failikaart

### Vestluse API Ja Orkestreerimine

- `app/api/chat/route.js` - peamine chat endpoint; ühendab bootstrap'i, töövood, RAG konteksti ja vastuse genereerimise.
- `lib/chat/requestBootstrap.js` - autentimine, sisendi normaliseerimine, ajalugu, roll, keel, greeting, töövoo olekud.
- `lib/chat/mainResponseHandler.js` - OpenAI vastuse kutsumine/streamimine, vastuse finaliseerimine, allikate filtreerimine.
- `lib/chat/workflowBranchHandlers.js` - dokumendi- ja abisoovi/abipakkumise töövoogude harud.
- `lib/chat/orchestrationPolicy.js` - otsustab üldise orkestreerimisplaani.
- `lib/chat/modeSelection.js`, `lib/chat/workflowModeRouting.js` - vestluse töörežiimi valik ja suunamine.

### Promptid Ja OpenAI Vastus

- `lib/chat/promptBuilder.js` - Responses API sisendi koostamine, RAG_CONTEXT, grounding, greeting strings, max tokenid.
- `lib/chat/openaiRuntime.js` - `callOpenAI`, `streamOpenAI`, Responses API payload.
- `lib/chat/systemPrompts/index.js` - keelepõhiste süsteemipromptide valik.
- `lib/chat/systemPrompts/et.js` - eesti süsteemiprompt.
- `lib/chat/systemPrompts/en.js` - inglise süsteemiprompt.
- `lib/chat/systemPrompts/ru.js` - vene süsteemiprompt.
- `lib/chat/systemPrompts/common.js` - promptide renderdamise abifunktsioonid.

### RAG Vajaduse Tuvastus, Otsing Ja Kontekst

- `lib/chat/sourceNeed.js` - otsustab, kas pöörde jaoks on vaja väliseid allikaid/RAG-i.
- `lib/chat/retrievalContextAssembler.js` - RAG pipeline'i keskne koostaja: päringud, filtrid, otsing, grupid, kontekst, allikad.
- `lib/chat/retrievalOrchestrator.js` - RAG päringu ehitus, source lookup tuvastus, RAG service `/search` kutsumine, dedupe.
- `lib/chat/retrievalPlanning.js` - ajatelje/aastate kaupa retrieval, temporal query'd ja juhised.
- `lib/chat/requestContext.js` - omavalitsuse, hiljutise teksti ja ajutiste dokumentide konteksti abiloogika.
- `lib/chat/ragContext.js` - match'ide normaliseerimine, grupeerimine, ranking, MMR, kontekstiplokkide renderdamine.
- `lib/chat/safety.js` - kriisi tuvastus ja grounding strength.
- `lib/chat/settings.js` - RAG ja mudeli env seadistused (`RAG_TOP_K`, `RAG_CONTEXT_GROUPS_MAX`, `RAG_API_BASE`, jne).
- `lib/chat/sourceAttribution.js` - vastusepõhine allikafiltreerimine: `answer sources` -> `displayed sources`.

### Salvestamine, Metadata Ja Allikate Kuvamine

- `lib/chat/responseFinalizer.js` - vastuse JSON/SSE finaliseerimine, allikate/attachmentide salvestus.
- `lib/chat/persistence.js` - vestluse ja assistendi sõnumi salvestus, metadata `sources`.
- `components/chat/hooks/useChatStream.js` - frontendi chat stream, `meta`, `delta`, `done`, allikate vastuvõtt.
- `components/chat/hooks/useConversationSources.js` - vestlussõnumitest allikapaneeli allikate koondamine.
- `components/chat/utils/sources.js` - allikate normaliseerimine ja label'i koostamine.
- `components/alalehed/chat/ChatSourcesPanel.jsx` - kasutajale kuvatav `Vastuste allikad` paneel.
- `components/chat/LeftRail.jsx`, `components/chat/RightRail.jsx`, `components/alalehed/chat/view/ChatMobileTopNav.jsx` - allikapaneeli nupud ja olek.

### RAG Service

- `rag-service/main.py` - FastAPI RAG service, OpenAI embeddings, Chroma, upload/search endpointid, registry ja observability headerid.
- `rag-service/requirements.txt` - RAG service Python sõltuvused.

### RAG Ingest Ja Admin

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

- `prisma/schema.prisma` - `RagDocument`, `Conversation`, `ConversationMessage`, `ConversationRun`, `ChatLog`, KOV/organization admin mudelid.
- `lib/chat/logger.js` - chat/RAG sündmuste logimine `ChatLog` tabelisse.
- `app/api/admin/analytics/summary/route.js` - RAG logide ja dokumentide admin-kokkuvõte.
- `app/api/admin/analytics/users/route.js` - kasutajapõhine RAG/chat kasutuse statistika.
- `app/api/admin/analytics/ai-costs/route.js` - AI/RAG kulude kokkuvõte.

### Testid

- `tests/chat/sourceNeed.test.js` - RAG vajaduse tuvastus.
- `tests/chat/sourceAttribution.test.js` - vastusepõhine allikafiltreerimine.
- `tests/chat/ragContextRanking.test.js` - teema vihjete põhine ranking.
- `tests/chat/promptStyle.test.js` - prompti stiil, tervitused ja ajakontekst.

## Esmane Analüüsisuund

Järgmises analüüsis vaadata järjest:

1. `sourceAttribution.js`, `mainResponseHandler.js`, `useChatStream.js`, `useConversationSources.js` - kas `displayed sources` on piisavalt aus ja kas attribution decision'id on logitavad.
2. `retrievalContextAssembler.js`, `retrievalOrchestrator.js`, `ragContext.js` - kuidas `retrieved candidates` muutuvad `selected context sources` kihiks.
3. `rag-service/main.py` - kas search toetab piisavat metadata filtering'ut, phrase/title/BM25 hübriidi ja trace'i.
4. `scripts/validate-kov-rag.mjs`, `scripts/ingest-kov-rag.mjs`, `lib/admin/rag/kov/service.js` - kas ingest toodab source package'i jaoks piisavalt struktuuri.
5. `prisma/schema.prisma` - kas andmemudel toetab source type, canonical item, answer source ja trace kihte.

## Lõppeesmärk

SotsiaalAI RAG-i eesmärk ei ole leida võimalikult palju sarnaseid tekstikatkeid, vaid koostada kontrollitud tõenduspakett, mille põhjal saab anda rolli, aja, KOV-i ja allikatüübi suhtes usaldusväärse vastuse.
