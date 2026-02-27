# Documents Mode

This repository includes a `Dokumendid` mode for managing private user documents, draft artifacts, and approved agent outputs.

## Assumptions

- Export storage approach: `Approach A`
  - approved artifacts stay in PostgreSQL as the source of truth
  - DOCX and PDF are generated on-demand from approved content
  - `AGENT_STORAGE_DIR` stays reserved for future snapshot storage
- Supported user upload types: `pdf`, `docx`, `txt`
- Download formats in this phase:
  - `DOCX` is implemented now
  - `PDF` is implemented now
- Multi-document work mode limits:
  - maximum selected source documents per draft: `10`
  - maximum artifact content length: `120000` characters
- Template handling:
  - only `DOCX` templates are used for export
  - supported placeholders are `{{TITLE}}`, `{{APPROVED_AT}}`, `{{ARTIFACT_TYPE}}`, `{{CONTENT_BLOCK}}`, and `{{SOURCES_BLOCK}}`
  - placeholder replacement works in `word/document.xml` and normalizes common split placeholders across Word runs
  - if template processing fails, export falls back to the standard SotsiaalAI DOCX template

## Out of Scope

- no OCR
- no RAG indexing or retrieval over uploaded documents
- no integration with the separate `Document analysis` flow
- no room-scoped documents
- no ACL-based document sharing
- access remains owner-based via `ownerId`

## Storage

Set these environment variables on the server:

```bash
DOCS_STORAGE_DIR=/var/lib/sotsiaalai-docs
AGENT_STORAGE_DIR=/var/lib/sotsiaalai-agent
```

Create the storage directories on the Linux VPS:

```bash
sudo mkdir -p /var/lib/sotsiaalai-docs/uploads
sudo mkdir -p /var/lib/sotsiaalai-agent
sudo chown -R <app-user>:<app-group> /var/lib/sotsiaalai-docs /var/lib/sotsiaalai-agent
sudo chmod 750 /var/lib/sotsiaalai-docs /var/lib/sotsiaalai-docs/uploads /var/lib/sotsiaalai-agent
```

Replace `<app-user>:<app-group>` with the actual service user that runs the frontend process, for example `ubuntu:ubuntu` or `www-data:www-data`.

Notes:

- User documents are stored on disk under `DOCS_STORAGE_DIR/uploads`.
- Agent artifacts are stored in PostgreSQL as text content and metadata.
- `AGENT_STORAGE_DIR` is reserved for future agent file outputs, snapshots, and work files.
- Stored files are private and must never be served from `public`.
- Document and artifact downloads/mutations are rate-limited server-side.
- Audit trail is written to the `DocumentAudit` database table for upload, update, delete, approve, and download events.
- Structured server logging remains as a fallback diagnostic layer if audit persistence fails.

## Approval flow

- Allowed uploads: `pdf`, `docx`, `txt`
- Maximum file size: `25 MB`
- Rename updates only the database `title`
- `storagePath` is internal only and must not be exposed to the UI
- Deletion uses `hard delete`
- Draft workflow:
  - work mode creates `AgentArtifact.status = DRAFT`
  - draft content is editable in the artifact detail page
  - source documents are linked through `AgentArtifactSourceDocument`
- Approval workflow:
  - approving sets `status = FINAL` and stores `approvedAt`
  - approved content becomes immutable
  - approval returns stable DOCX and PDF download endpoints immediately
  - the approved artifact remains re-downloadable later from `/documents` and `/documents/artifacts/[id]`

Hard delete behavior:

- Deleting a `UserDocument` removes the database row and the file from disk
- Deleting an `AgentArtifact` removes the database row
- Recovery is not supported in MVP

## Local verification

Run the Prisma client generation after schema changes:

```bash
npm run prisma:generate
```

Apply the migration in the target environment:

```bash
npm run prisma:migrate:deploy
```

Run checks:

```bash
npm run i18n:check
npm run lint
node tests/documents-access.test.mjs
node tests/documents-audit.test.mjs
node tests/docx-export.test.mjs
node tests/documents-rate-limit.test.mjs
```

## Manual test flow

1. Open `/documents`.
2. Upload a `pdf`, `docx`, or `txt` file smaller than `25 MB`.
3. Confirm the file appears under `Minu dokumendid`.
4. Rename the document and verify only the visible title changes.
5. Toggle `Kasuta töörežiimis` and verify the change persists after refresh.
6. Download the file and confirm the filename uses the document title or original name, not `storagePath`.
7. Delete the document and confirm it disappears from the UI and storage.
8. Select multiple documents with `Use in work mode` enabled and create a draft artifact.
9. Open the draft at `/documents/artifacts/[id]`, edit it, and approve it.
10. Confirm the approval notice immediately shows DOCX and PDF download links.
11. Refresh the page or return later and confirm the approved artifact is still downloadable from `/documents` and `/documents/artifacts/[id]`.
