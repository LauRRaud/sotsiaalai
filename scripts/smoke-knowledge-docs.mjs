#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

import {
  buildKnowledgeDocIngestPayload,
  loadKnowledgeMetadataFiles,
  validateKnowledgeMetadata
} from "./lib/knowledge-docs.mjs";

const SAMPLE_DOC_ID = "sm-terviseprobleemiga-laste-perede-hea-tava-2025";

function usage() {
  return [
    "Usage:",
    "  npm run knowledge:smoke -- --root \"C:\\Users\\rauds\\Desktop\\SotsiaalAI\\Andmebaasi\\uuringud ja juhendid\"",
    "",
    "Checks the knowledge-doc metadata contract and RAG ingest payload shape without ingesting anything."
  ].join("\n");
}

function parseArgs(argv = []) {
  const args = {
    root: "",
    help: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--root") args.root = argv[++index] || "";
    else throw new Error(`Unknown option: ${arg}`);
  }
  return args;
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.root) throw new Error("Pass --root <path>.");

  const root = path.resolve(args.root);
  const metadataFiles = await loadKnowledgeMetadataFiles(root);
  const validated = metadataFiles.map(item => ({
    file: item.fileName,
    result: validateKnowledgeMetadata(item.data || {}, { root })
  }));
  const guidelines = validated.filter(item => item.result.metadata.document_kind === "guideline");
  assertCondition(guidelines.length > 0, "expected at least one guideline");

  const sample = validated.find(item => item.result.metadata.docId === SAMPLE_DOC_ID);
  assertCondition(sample, `sample metadata ${SAMPLE_DOC_ID} not found`);
  assertCondition(sample.result.ok, `sample metadata validation failed: ${sample.result.errors.join("; ")}`);

  const metadata = sample.result.metadata;
  assertCondition(metadata.collection_id === "national_guidelines", "sample collection_id must be national_guidelines");
  assertCondition(metadata.source_type === "official_guideline", "sample source_type must be official_guideline");
  assertCondition(metadata.evidence_role === "practice_guidance", "sample evidence_role must be practice_guidance");
  assertCondition(metadata.disallowed_claim_types.includes("legal_entitlement"), "sample must disallow legal_entitlement");
  assertCondition(metadata.disallowed_claim_types.includes("benefit_amount"), "sample must disallow benefit_amount");
  assertCondition(
    metadata.sectionIndex.some(section => section.section_id === "ametniku-sekkumise-eetika" || /Ametniku sekkumise eetika/u.test(section.title || "")),
    "sample sectionIndex must include Ametniku sekkumise eetika"
  );
  assertCondition(await exists(sample.result.sourceFilePath), "sample source_path file must exist");

  const payload = buildKnowledgeDocIngestPayload(metadata);
  assertCondition(payload.doc_id === SAMPLE_DOC_ID, "ingest payload doc_id mismatch");
  assertCondition(payload.metadata.collection_id === "national_guidelines", "ingest metadata collection mismatch");
  assertCondition(payload.metadata.source_type === "official_guideline", "ingest metadata source_type mismatch");
  assertCondition(payload.metadata.legal_basis === false, "knowledge guideline must not be legal_basis");
  assertCondition(payload.chunks.length >= metadata.sectionIndex.length, "ingest payload must include section chunks");
  assertCondition(payload.chunks.every(chunk => chunk.metadata.legal_basis === false), "chunks must not be legal_basis");
  assertCondition(payload.chunks.every(chunk => chunk.metadata.collection_id !== "kov_services"), "chunks must not use kov_services");

  console.log(JSON.stringify({
    ok: true,
    root,
    guideline_count: guidelines.length,
    sample_doc_id: SAMPLE_DOC_ID,
    sample_ingest_ready: true,
    section_count: metadata.sectionIndex.length,
    payload_chunk_count: payload.chunks.length,
    collection_id: metadata.collection_id,
    source_type: metadata.source_type,
    evidence_role: metadata.evidence_role,
    disallowed_claim_types: metadata.disallowed_claim_types
  }, null, 2));
}

main().catch((error) => {
  console.error(`[knowledge:smoke] ${error?.message || String(error)}`);
  process.exitCode = 1;
});
