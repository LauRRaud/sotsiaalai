# RAG admin checklist

See projekt kasutab eraldi FastAPI RAG-teenust (Chroma püsisalvestus) ja veebirakendus suhtleb temaga HTTP kaudu.
RAG-teenus loob **OpenAI embeddings** (serveris), veebirakendus kasutab **OpenAI chat** mudelit vastuste koostamiseks. Ojee!


- `RAG_API_BASE` – RAG-teenuse täielik URL (nt `https://rag.sotsiaal.ai`)
- `RAG_API_KEY` – *sama* jagatud saladus, mis RAG-teenusel (päisesse `X-API-Key`)
- `RAG_MAX_UPLOAD_MB` – serveri uploadi limiit MB (nt `20`)
- `NEXT_PUBLIC_RAG_MAX_UPLOAD_MB` – sama limiit brauseri UI-teabeks
- `NEXT_PUBLIC_RAG_ALLOWED_MIME` – lubatud MIME-d UI-s (komaeraldatud)
- `OPENAI_API_KEY` – **vestluse** jaoks (api/chat)
- `OPENAI_MODEL` – vastuse mudel (nt `gpt-5-mini`)

> Jäta `RAG_ALLOWED_MIME` veebile .env-i vaid siis, kui tahad serveripoolselt piirata (upload route kontrollib seda).


- `RAG_SERVICE_API_KEY` – jagatud saladus; kui seatud, nõuab päist `X-API-Key`
- `RAG_STORAGE_DIR` – failide ja Chroma püsikataloog (vaikimisi `./storage`)
- `RAG_COLLECTION` – Chroma kollektsiooni nimi (vaikimisi `sotsiaalai`)
- `RAG_SERVER_MAX_MB` – faili max suurus MB (nt `20`)
- `RAG_ALLOWED_MIME` – lubatud MIME-d (komaeraldatud)*
- `RAG_ALLOWED_ORIGINS` – CORS päritolud (komaeraldatud, nt `https://sinu.domeen.ee`)
- `OPENAI_API_KEY` – **embeddings** jaoks (RAG-teenus)
- `RAG_EMBED_MODEL` – embeddings mudel, nt:
  - `text-embedding-3-small` (odavam, piisav) **soovitus**
  - `text-embedding-3-large` (kallim, täpsem)

Chunkimine (tokeniteadlik vaikimisi):

- `RAG_CHUNK_MODE` – `tokens` (vaikimisi) või `chars`.
- `RAG_CHUNK_TOKENS` – tokenite arv chunkis (vaikimisi `700`).
- `RAG_CHUNK_TOKENS_OVERLAP` – kattuvus tokenites (vaikimisi `120`).
- `RAG_SINGLE_CHUNK_TOKEN_LIMIT` – kui tekst on sellest piirist lühem, jäetakse üheks tükiks (vaikimisi `1200`).
- `RAG_ALWAYS_CHUNK` – `1`/`true` korral chunkitakse alati, ka lühikesed tekstid.

Märkus: kui `tiktoken` pole saadaval, kasutab teenus automaatselt tähemärkidel põhinevat chunkimist (`RAG_CHUNK_SIZE`/`RAG_CHUNK_OVERLAP`).

\* Kui jätad tühjaks, on RAG-teenuse poolt MIME piirang välja lülitatud (UI ikka filtreerib).

---


```bash
cd rag-service
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip wheel
pip install -r requirements.txt
# Sea .env vastavalt ülaltoodule (või ekspordi env-id)
uvicorn main:app --host 0.0.0.0 --port 8000

---

Veebirakenduse (frontend) RAG seaded:

- `RAG_TOP_K` – esmane kandidaatkonteksti maht RAG otsingus (vaikimisi `12`).
- `RAG_CONTEXT_GROUPS_MAX` – mitu allikagruppi jõuab LLM-i konteksti (vaikimisi `6`).
- `RAG_MMR_LAMBDA` – MMR diversifikatsiooni kaal 0..1 (vaikimisi `0.5`).
