# Server Operations Notes

## Production Host

SSH shortcuts:

```bash
ssh sotsiaalai
ssh ubuntu@uvn-72-147.tll01.zonevs.eu
```

Application directory:

```bash
cd /home/ubuntu/apps/sotsiaalai
```

## Service Restarts

Restart RAG service:

```bash
sudo systemctl restart sotsiaalai-rag.service
sudo systemctl status sotsiaalai-rag.service --no-pager
```

Restart frontend service:

```bash
sudo systemctl restart sotsiaalai-frontend.service
sudo systemctl status sotsiaalai-frontend.service --no-pager
```

Restart deep research worker:

```bash
sudo systemctl restart sotsiaalai-research-worker.service
sudo systemctl status sotsiaalai-research-worker.service --no-pager
```

When deep research code changes, restart both `sotsiaalai-frontend.service` and
`sotsiaalai-research-worker.service`. Restart `sotsiaalai-rag.service` when the
retrieval service, index, or RAG environment changes.
