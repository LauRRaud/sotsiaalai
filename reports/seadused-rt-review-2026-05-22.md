# KOV/Seadused_rt ülevaade

Kontrollitud: 2026-05-22

Kaustas `KOV/Seadused_rt` on Riigi Teataja `.akt` XML-failid, mis tekkisid Tallinna infokorje ajal. Neid ei tohiks kõiki ühte Tallinna KOV/RT faili panna, sest osa on riiklikud seadused või ministri määrused.

## Tehtud

Fail `KOV/Seadused_rt/412042025007.akt` kopeeriti kujule `KOV/kov_rt/412042025007.xml`, sest olemasolev `KOV/kov_rt/kov_rt_manifest.json` ootab Tallinna RT põhiaktina just faili `412042025007.xml`.

See vastab manifesti kirjele:

- doc_id: `kov-rt-tallinn`
- akt: `Sotsiaalhoolekandelise abi andmise kord`
- URL: `https://www.riigiteataja.ee/akt/412042025007?leiaKehtiv`
- KOV: `tallinn`

## Riiklik RT kiht

Need tuleks käsitleda riikliku õigusallikana (`collection_id: national_regulations`, `source_type: national_law`), mitte Tallinna KOV õigusaktina:

| Fail | Viide | Väljaandja | Pealkiri / märkus |
| --- | --- | --- | --- |
| `107052025017.akt` | `107052025017` | Riigikogu | Perekonnaseadus |
| `109042026003.akt` | `109042026003` | Riigikogu | Riigilõivuseadus |
| `129082025009.akt` | `129082025009` | Sotsiaalkaitseminister | riiklik määrus, pealkiri jäi XML-i kiirotsingus tühjaks |
| `130122025036.akt` | `130122025036` | Riigikogu | riiklik seadus, lühend `SÜS`, pealkiri jäi XML-i kiirotsingus tühjaks |
| `131122024023.akt` | `131122024023` | Riigikogu | Lastekaitseseadus |

Näide ingestiks:

```bash
node scripts/ingest-national-rt-xml.mjs KOV/Seadused_rt/131122024023.akt --source-url "https://www.riigiteataja.ee/akt/131122024023?leiaKehtiv"
```

## Tallinna kohalik RT kiht

Need on Tallinna kohaliku omavalitsuse määrused. Põhiakt `412042025007` kuulub olemasoleva Tallinna RT manifesti alla. Ülejäänud on kas lisatäpsustused või seotud asutuste/toetuste korrad ning neid ei tohiks automaatselt sama `kov-rt-tallinn` doc_id alla üle kirjutada.

| Fail | Viide | Väljaandja | Pealkiri / märkus | Soovitus |
| --- | --- | --- | --- | --- |
| `410092025031.akt` | `410092025031` | Tallinna Linnavolikogu | Sotsiaalteenuste osutamise tingimused ja kord | lisa Tallinna eraldi KOV legal docina, kui soovid detailsemat õiguskihti |
| `410092025033.akt` | `410092025033` | Tallinna Linnavolikogu | Sotsiaaltoetuste maksmise tingimused ja kord | lisa Tallinna eraldi KOV legal docina |
| `412042025007.akt` | `412042025007` | Tallinna Linnavolikogu | Sotsiaalhoolekandelise abi andmise kord | põhiakt, kopeeritud `KOV/kov_rt/412042025007.xml` |
| `412042025015.akt` | `412042025015` | Tallinna Linnavolikogu | pealkiri jäi XML-i kiirotsingus tühjaks | üle vaadata enne ingestit |
| `413022026026.akt` | `413022026026` | Tallinna Linnavalitsus | Sotsiaaltoetuste määrad | lisa Tallinna eraldi KOV legal docina |
| `425042025047.akt` | `425042025047` | Tallinna Linnavalitsus | Eestkoste seadmise ja teostamise kord | lisa Tallinna eraldi KOV legal docina, kui eestkoste vastuseid on vaja |
| `426022025038.akt` | `426022025038` | Tallinna Linnavolikogu | Toimetulekutoetuse määramisel aluseks võetavate eluasemekulude piirmäärad | lisa Tallinna eraldi KOV legal docina |
| `428122024033.akt` | `428122024033` | Tallinna Linnavalitsus | Tallinna Lastekodu põhimäärus | pigem asutuse/põhimääruse info; mitte üldine KOV teenuste õiguskiht |

Näide põhiakti ingestiks olemasoleva manifesti kaudu:

```bash
npm run kov:validate-rt -- --root KOV --slug tallinn
npm run kov:ingest-rt:batch -- --root KOV --slug tallinn --systemd-env sotsiaalai-rag.service
```

Näide Tallinna lisaakti eraldi ingestiks:

```bash
node scripts/ingest-national-rt-xml.mjs KOV/Seadused_rt/410092025031.akt --doc-id kov-rt-tallinn-410092025031 --source-url "https://www.riigiteataja.ee/akt/410092025031?leiaKehtiv" --municipality Tallinn --municipality-id tallinn
```

## Soovitus

1. Hoia `KOV/kov_rt/412042025007.xml` alles ja kasuta seda Tallinna admini RT staatuse korda saamiseks.
2. Ära pane riiklikke seadusi Tallinna KOV-paketti.
3. Kui soovid riiklikke seadusi RAG-is kasutada, ingestida need `national_regulations` kihti.
4. Kui soovid Tallinna õigusvastuseid täpsemaks teha, ingestida Tallinna lisaaktid eraldi doc_id-dega, mitte üle kirjutada `kov-rt-tallinn` põhiakti.
