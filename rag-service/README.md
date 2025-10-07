# SotsiaalAI RAG Service (OpenAI embeddings)

FastAPI + ChromaDB püsisalvestusega RAG-teenus. Töötleb **TXT / HTML / PDF / DOCX**, salvestab toorfaili kettale ja vektorid Chroma kollektsiooni. Autentimine toimub HTTP-päisega **`X-API-Key`** (võrreldakse env-muutujaga `RAG_SERVICE_API_KEY`).

**Embeddingu** arvutame OpenAI mudeliga (`text-embedding-3-small` või `text-embedding-3-large`), mille põhjal tehakse sarnasuspäringud Chromas.
Soovitus: **`text-embedding-3-small`** (odavam, piisava kvaliteediga enamikeks juhtudeks).

---

## API ülevaade

* `GET  /health`
  Tagastab terviseseisu (kollektsioon, mudel, dokumentide/vektorite arv).
* `POST /ingest/file`
  Keha: `{ docId, fileName, mimeType?, data(base64), title?, description?, audience? }`
* `POST /ingest/url`
  Keha: `{ docId, url, title?, description?, audience? }`
* `GET  /documents`
  Tagastab registri kirjed + ligikaudse `chunks` arvu (mitu lõiku Chromas).
* `POST /documents/{docId}/reindex`
  Taasingestab olemasolevast allikast (salvestatud fail või HTML-dump).
* `DELETE /documents/{docId}`
  Kustutab vektorid, registrikirje ja lokaalsed failid.
* `POST /search`
  Keha (näide):

  ```json
  {
    "query": "otsitav tekst",
    "top_k": 5,
    "filterDocId": "valikuline-doc-id",
    "where": {
      "audience": { "$in": ["CLIENT", "BOTH"] },
      "doc_id": "valikuline-doc-id"
    }
  }
  ```

> **`audience` väli**: `SOCIAL_WORKER` | `CLIENT` | `BOTH`.
> Salvestatakse iga lõigu metaandmetesse ja on filtritav `/search` päringus.

---

## Keskkonnamuutujad (RAG teenus)

| Key                   | Kirjeldus                                                              | Vaikimisi                |
| --------------------- | ---------------------------------------------------------------------- | ------------------------ |
| `OPENAI_API_KEY`      | OpenAI API võti (**kohustuslik** – embeddings)                         | –                        |
| `RAG_EMBED_MODEL`     | Embeddingu mudel (`text-embedding-3-small` | `text-embedding-3-large`) | `text-embedding-3-small` |
| `EMBEDDING_MODEL`     | Alternatiivne nimi (kasutatakse, kui `RAG_EMBED_MODEL` puudub)         | –                        |
| `RAG_SERVICE_API_KEY` | Kui seatud, nõuab päises `X-API-Key` sama väärtust                     | *(unset)*                |
| `RAG_STORAGE_DIR`     | Kaust toorfailidele, HTML-dumpile ja Chromale                          | `./storage`              |
| `RAG_COLLECTION`      | Chroma kollektsiooni nimi                                              | `sotsiaalai`             |
| `RAG_SERVER_MAX_MB`   | Faili maksimaalne suurus (MB)                                          | `20`                     |
| `RAG_ALLOWED_MIME`    | Lubatud MIME-d (komaeraldatud). Kui tühi, piirang puudub.              | *(piiramata)*            |
| `RAG_ALLOWED_ORIGINS` | CORS lubatud päritolud (komaeraldatud)                                 | `*`                      |

> **MIME piirang:** UI filtreerib niikuinii, aga serveripoolse range kontrolli jaoks määra `RAG_ALLOWED_MIME`.

---

## Kiire start (kohalik)

```bash
cd rag-service
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip wheel
pip install -r requirements.txt
```

Loo **`.env`** (või ekspordi env-id shellis):

```bash
# .env (näide)
OPENAI_API_KEY=sk-...
RAG_SERVICE_API_KEY=supersecret        # kui soovid X-API-Key kaitset
RAG_EMBED_MODEL=text-embedding-3-small # soovitus
RAG_STORAGE_DIR=./storage
RAG_ALLOWED_MIME=application/pdf,text/plain,text/markdown,text/html,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Käivita:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Kontrolli tervist:

```bash
curl -s http://localhost:8000/health
```

Kui `RAG_SERVICE_API_KEY` on seatud, lisa päis:

```bash
curl -s http://localhost:8000/health -H "X-API-Key: supersecret"
```

---

## Näidis `curl` päringud

**/ingest/file** (base64 payload):

```bash
b64=$(base64 -w0 ./docs/naited/karu.pdf)
curl -X POST "$RAG_API_BASE/ingest/file" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $RAG_SERVICE_API_KEY" \
  -d '{
    "docId":"doc-001",
    "fileName":"karu.pdf",
    "mimeType":"application/pdf",
    "data":"'"$b64"'",
    "title":"Metsloomad",
    "description":"Karu käsitlus",
    "audience":"BOTH"
  }'
```

**/ingest/url**:

```bash
curl -X POST "$RAG_API_BASE/ingest/url" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $RAG_SERVICE_API_KEY" \
  -d '{
    "docId":"doc-002",
    "url":"https://www.riigiteataja.ee/",
    "title":"RT avaleht",
    "audience":"SOCIAL_WORKER"
  }'
```

**/documents**:

```bash
curl -s "$RAG_API_BASE/documents" -H "X-API-Key: $RAG_SERVICE_API_KEY"
```

**/documents/{id}/reindex**:

```bash
curl -X POST "$RAG_API_BASE/documents/doc-001/reindex" -H "X-API-Key: $RAG_SERVICE_API_KEY"
```

**/documents/{id} DELETE**:

```bash
curl -X DELETE "$RAG_API_BASE/documents/doc-001" -H "X-API-Key: $RAG_SERVICE_API_KEY"
```

**/search** – kliendile sobivad (`CLIENT` + `BOTH`):

```bash
curl -X POST "$RAG_API_BASE/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $RAG_SERVICE_API_KEY" \
  -d '{
    "query": "toetused lapsega peredele",
    "top_k": 5,
    "where": { "audience": { "$in": ["CLIENT", "BOTH"] } }
  }'
```

---

## Integratsioon (veebirakendusega)

Veebirakendus (Next.js) kasutab järgmisi env-e:

* `RAG_API_BASE` – selle teenuse URL (nt `https://rag.sinu-domeen.ee`)
* `RAG_API_KEY` – sama jagatud saladus, lisatakse päisesse `X-API-Key`
* `RAG_MAX_UPLOAD_MB` – serveri uploadi limiit MB (faili route kontroll)
* `NEXT_PUBLIC_RAG_MAX_UPLOAD_MB` – sama limiit, kuid UI jaoks
* `NEXT_PUBLIC_RAG_ALLOWED_MIME` – MIME-d, mida UI failivalikul lubab

> Faili nimi võib deploymentis olla lihtsalt **`.env`**; **ei pea** olema `env.local`, kui kasutad teistsugust seadistust. Oluline on, et muutujaid loetakse käituskeskkonnas.

---

## Deploy soovitused

* **Reverse proxy** (nginx/Caddy) + TLS (HTTPS).
* **Püsisalvestus**: `RAG_STORAGE_DIR` peaks olema kettal, mis säilib restartide vahel (nt eraldi maht).
* **Varundus**: varunda `storage/registry.json` ja `storage/docs/`.
* **Logid ja jälgimine**: vaata `uvicorn` logisid, lisa vajadusel `--log-level info`.
* **CORS**: piira `RAG_ALLOWED_ORIGINS` konkreetse(te)le domeenile/domeenidele.
* **Ressursipiirid**: PDF/DOCX parsingu jaoks arvestada mäluga; vajadusel kasuta tööjärjekorda.

---

## Nõuded

`requirements.txt`:

```
fastapi~=0.115
uvicorn[standard]~=0.30
chromadb~=0.5
openai~=1.109
requests>=2.31
beautifulsoup4>=4.12
pypdf>=4.2
docx2txt>=0.8
python-magic>=0.4.27
```

> `python-magic` on valikuline; kui puudub, kasutatakse faililaiendit/MIME vihjeid.

---

## KKK

**K:** Kasutan `text-embedding-3-large` – kas sobib?
**V:** Jah. Vaikimisi dokumentatsioonis soovitame `small` mudelit kulude tõttu; kvaliteedi vajadusel vali `large`.

**K:** Miks `/search` lubab `where.audience` nii stringi kui `$in`?
**V:** Et kliendile kuvada ainult `CLIENT` või `BOTH`, samas sotsiaaltöötajale ka `SOCIAL_WORKER`. Fleksibilisus aitab UI-l valida rollipõhise filtri.

**K:** Kas RAG teenus hoiab ise kasutajaid ja rolle?
**V:** Ei. Rollipõhine filtreerimine tehakse veebirakenduse API kihis (`/api/chat`), mis lisab `where.audience` filtrid RAG päringusse.
