# SotsiaalAI veebiplatvorm

SotsiaalAI on Next.js põhine veebiplatvorm, mis pakub rollipõhist tuge:  
- **Eluküsimusega pöördujale** – lihtsad juhised toetuste, teenuste ja õiguste kohta.  
- **Spetsialistile** – usaldusväärsed ülevaated seadustest, praktikast ja metoodikast.  

Platvormil on integreeritud ligipääsukontroll, tellimuste haldus (Maksekeskus) ja OpenAI integratsioon (plaanis lisada).

---

## 🚀 Arendus

Klooni repo ja installi sõltuvused:

```bash
git clone https://github.com/LauRRaud/sotsiaali-veeb.git
cd sotsiaali-veeb
npm install
```

## 🧠 RAG andmebaas

Admini jaoks on "Meist" vaates RAG haldusala, mis suhtleb teenusega, mille endpointid on `/ingest/file`, `/ingest/url`, `/ingest/reindex` ja `/search`. Konfigureeri järgmised keskkonnamuutujad (`.env` või deploy keskkonnas):

```
RAG_API_BASE=https://your-rag-host.example.com
RAG_API_KEY=...
RAG_MAX_UPLOAD_MB=20
RAG_ALLOWED_MIME=application/pdf,text/plain,text/markdown,text/html,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
RAG_API_TIMEOUT_MS=45000
NEXT_PUBLIC_RAG_MAX_UPLOAD_MB=20
```

Näidis FastAPI teenus asub kaustas `rag-service/`. Käivita see VPS-is ning suuna keskkonnamuutujad sellele aadressile. Materjali lisamisel vali sihtgrupp ("Sotsiaaltöö spetsialist", "Eluküsimusega pöörduja" või "Mõlemad"), et assistent saaks vestluspartneri rolli järgi õigeid allikaid filtreerida.

## 🤖 Chat-assistent

Chat-leht `/vestlus` kasutab admini lisatud materjale, küsides konteksti RAG teenusest ja kutsudes OpenAI mudelit.

Lisa `.env` faili:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
```

Seejärel töötab API route `/api/chat`, mis:

1. võtab kasutaja sõnumi ja vestlusajaloo;
2. pärib konteksti `search` endpointilt (Chroma), kasutades rollipõhist filtrit;
3. koostab prompti ja küsib OpenAI mudelit (vaikimisi `gpt-5-mini`, vajadusel muuda `OPENAI_MODEL` env-is);
4. tagastab vastuse koos allikaviidetega, mida chat-leht kuvab.

> NB! Hoia OpenAI API võti ainult serveri keskkonnas – ära lisa seda kliendikoodi.
