# RAG admin checklist

See projekt kasutab eraldi FastAPI RAG-teenust (Chroma püsisalvestus) ja veebirakendus suhtleb temaga HTTP kaudu.
RAG-teenus loob **OpenAI embeddings** (serveris), veebirakendus kasutab **OpenAI chat** mudelit vastuste koostamiseks.


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
