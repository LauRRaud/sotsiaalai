# RAG admin checklist

1. Set the environment variables listed in `env.example`.
2. Point `RAG_API_BASE` to the FastAPI instance running on the VPS (for example `https://rag.sotsiaal.ai`).
3. If you want shared-secret protection, set `RAG_API_KEY` both in the web app and the RAG service so the `X-API-Key` header is verified.
4. Keep `RAG_MAX_UPLOAD_MB` and `NEXT_PUBLIC_RAG_MAX_UPLOAD_MB` in sync (default 20 MB).
5. Deploy the service located in `rag-service/` to the VPS and start it (see that folder's README for detailed steps).
6. When uploading content in the admin UI, choose the **Sihtgrupp** (“Sotsiaaltöö spetsialist”, “Eluküsimusega pöörduja” või “Mõlemad”); vestlusassistent filtreerib tulemusi selle järgi.
7. Open the chosen port on the VPS firewall or expose it through an existing reverse proxy.
8. Test connectivity with `curl https://rag.your-domain.tld/health` and verify it returns `{ "status": "ok" }`.

> VPS access: `ubuntu@uvn-72-147.tll01.zonevs.eu` (add the provided public key to `~/.ssh/authorized_keys`).

9. Verify that the `/search` endpoint responds: `curl -X POST "$RAG_API_BASE/search" -H "Content-Type: application/json" -H "X-API-Key: ..." -d '{"query":"test"}'`.
10. Add the OpenAI keys (`OPENAI_API_KEY`, `OPENAI_MODEL`) on the server so `/api/chat` can call OpenAI.
