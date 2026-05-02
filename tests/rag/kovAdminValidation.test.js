import assert from "node:assert/strict";
import test from "node:test";

import { validateKovFileContent } from "../../lib/admin/rag/kov/validation.js";

function validateSources(payload) {
  return validateKovFileContent({
    fileKey: "sourcesJson",
    text: JSON.stringify(payload),
    slug: "test-vald",
    displayName: "Test vald"
  });
}

test("KOV admin sources validation accepts v2.5 source_id/source_type shape", () => {
  const result = validateSources({
    municipality: "Test vald",
    checkedAt: "2026-04-29",
    sources: [
      {
        source_id: "home",
        source_type: "kov_homepage",
        title: "Test valla ametlik veeb",
        url: "https://example.test"
      },
      {
        source_id: "form_doc",
        source_type: "docx_form",
        title: "Taotlus",
        url_canonical: "https://example.test/form.docx"
      }
    ]
  });

  assert.equal(result.validationStatus, "VALID");
});

test("KOV admin sources validation still accepts legacy key/type shape", () => {
  const result = validateSources({
    municipality: "Test vald",
    checkedAt: "2026-04-29",
    sources: [
      {
        key: "service_page",
        type: "kov_service_info",
        title: "Teenused",
        url: "https://example.test/services"
      }
    ]
  });

  assert.equal(result.validationStatus, "VALID");
});

test("KOV admin sources validation rejects sources without identifier", () => {
  const result = validateSources({
    municipality: "Test vald",
    checkedAt: "2026-04-29",
    sources: [
      {
        source_type: "kov_homepage",
        title: "Test valla ametlik veeb",
        url: "https://example.test"
      }
    ]
  });

  assert.equal(result.validationStatus, "INVALID");
  assert.match(result.validationMessage, /source id/i);
});
