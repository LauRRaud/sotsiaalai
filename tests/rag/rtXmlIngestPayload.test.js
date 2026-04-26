import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildRtXmlIngestPayload
} from "../../lib/admin/rag/kov/rtXml.js";

test("auto-detects municipal RT XML as KOV regulation", async () => {
  const xmlText = await readFile("KOV/Jogeva/jogeva-vald/406112024020.xml", "utf8");
  const payload = buildRtXmlIngestPayload({
    xmlText,
    sourceFile: "406112024020.xml",
    sourcePath: "KOV/Jogeva/jogeva-vald/406112024020.xml",
    sourceUrl: "https://www.riigiteataja.ee/akt/406112024020",
    docId: "jogeva-vald-rt-406112024020"
  });

  assert.equal(payload.doc_id, "jogeva-vald-rt-406112024020");
  assert.equal(payload.metadata.source_type, "kov_regulation");
  assert.equal(payload.metadata.collection_id, "kov_regulations");
  assert.equal(payload.metadata.jurisdiction_level, "MUNICIPALITY");
  assert.equal(payload.metadata.municipality_name, "Jõgeva vald");
  assert.equal(payload.metadata.municipality_id, "jogeva_vald");
  assert.equal(payload.metadata.authority, "official_legal");
  assert.equal(payload.metadata.act_reference, "406112024020");
  assert.equal(payload.chunks[0].metadata.source_type, "kov_regulation");
  assert.equal(payload.chunks[0].metadata.municipality_id, "jogeva_vald");
});

test("keeps national RT XML in national law collection", async () => {
  const xmlText = await readFile("KOV/130122025029.xml", "utf8");
  const payload = buildRtXmlIngestPayload({
    xmlText,
    sourceFile: "130122025029.xml",
    sourcePath: "KOV/130122025029.xml",
    sourceUrl: "https://www.riigiteataja.ee/akt/130122025029",
    docId: "national-rt-130122025029"
  });

  assert.equal(payload.doc_id, "national-rt-130122025029");
  assert.equal(payload.metadata.source_type, "national_law");
  assert.equal(payload.metadata.collection_id, "national_regulations");
  assert.equal(payload.metadata.jurisdiction_level, "NATIONAL");
  assert.equal(payload.metadata.municipality_name, null);
  assert.equal(payload.metadata.municipality_id, undefined);
});
