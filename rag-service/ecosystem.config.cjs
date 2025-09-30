module.exports = {
  apps: [{
    name: "rag-service",
    script: ".venv/bin/python",
    args: "-m uvicorn main:app --host 127.0.0.1 --port 8000",
    cwd: "/home/ubuntu/apps/sotsiaalai/rag-service",
    env: {
      RAG_SERVICE_API_KEY: "4t44b556bJNUISHDjiosd888484",
      RAG_STORAGE_DIR: "./storage",
      RAG_COLLECTION: "sotsiaalai",
      RAG_EMBED_MODEL: "all-MiniLM-L6-v2"
    }
  }]
}
