import test from "node:test";
import assert from "node:assert/strict";

import {
  isTerminalResearchJobStatus,
  normalizeGeo,
  normalizeSources,
  pollResearchJobUntilTerminal,
  translateDeepResearchError,
} from "../../components/chat/hooks/deepResearchClient.js";

test("normalizeGeo keeps supported ids and falls back to ALL", () => {
  assert.deepEqual(
    normalizeGeo({
      level: "municipality",
      municipalityId: "kov-123",
      municipality_name: "Haapsalu linn",
      districtId: "district-9",
      district_name: "Kesklinn",
    }),
    {
      level: "MUNICIPALITY",
      country: "EE",
      municipality_id: "kov-123",
      municipality_name: "Haapsalu linn",
      district_id: "district-9",
      district_name: "Kesklinn",
    }
  );

  assert.equal(normalizeGeo({ level: "broken" }).level, "ALL");
});

test("normalizeSources strips unusable rows and normalizes numeric year", () => {
  assert.deepEqual(
    normalizeSources([
      null,
      { title: "Raport", year: "2025", source_type: "file" },
      { foo: "bar" },
    ]),
    [
      {
        id: undefined,
        title: "Raport",
        url: undefined,
        fileName: undefined,
        section: undefined,
        year: 2025,
        issueLabel: undefined,
        pageRange: undefined,
        short_ref: undefined,
        source_type: "file",
      },
    ]
  );
});

test("translateDeepResearchError falls back when key is unknown", () => {
  const t = key => (key === "research.error.timeout" ? "Aegus" : key);
  assert.equal(translateDeepResearchError("research.error.timeout", t), "Aegus");
  assert.equal(
    translateDeepResearchError("research.error.unknown", t),
    "chat.deep_research.error_generic"
  );
});

test("isTerminalResearchJobStatus recognizes terminal states", () => {
  assert.equal(isTerminalResearchJobStatus("done"), true);
  assert.equal(isTerminalResearchJobStatus("error"), true);
  assert.equal(isTerminalResearchJobStatus("cancelled"), true);
  assert.equal(isTerminalResearchJobStatus("running"), false);
});

test("pollResearchJobUntilTerminal resolves once persisted job becomes done", async () => {
  const responses = [
    { ok: true, body: { ok: true, job: { status: "running" } } },
    {
      ok: true,
      body: {
        ok: true,
        job: {
          status: "done",
          result: {
            report_text: "Valmis raport",
            sources: [{ title: "Allikas" }],
          },
        },
      },
    },
  ];
  let calls = 0;
  const fetchImpl = async () => {
    const next = responses[Math.min(calls, responses.length - 1)];
    calls += 1;
    return {
      ok: next.ok,
      async json() {
        return next.body;
      },
    };
  };

  const job = await pollResearchJobUntilTerminal("job-1", {
    fetchImpl,
    intervalMs: 0,
    maxAttempts: 3,
  });

  assert.equal(calls, 2);
  assert.equal(job.status, "done");
  assert.equal(job.result.report_text, "Valmis raport");
});

test("pollResearchJobUntilTerminal surfaces final backend message key", async () => {
  const fetchImpl = async () => ({
    ok: false,
    async json() {
      return { messageKey: "research.error.not_found" };
    },
  });

  await assert.rejects(
    pollResearchJobUntilTerminal("job-404", {
      fetchImpl,
      intervalMs: 0,
      maxAttempts: 1,
    }),
    error => error?.message === "research.error.not_found"
  );
});

test("pollResearchJobUntilTerminal tolerates temporary missing jobs", async () => {
  const responses = [
    { ok: false, status: 404, body: { messageKey: "research.error.not_found" } },
    { ok: false, status: 404, body: { messageKey: "research.error.not_found" } },
    { ok: true, status: 200, body: { ok: true, job: { status: "running" } } },
    { ok: true, status: 200, body: { ok: true, job: { status: "done", result: { report_text: "OK" } } } },
  ];
  let calls = 0;
  const fetchImpl = async () => {
    const next = responses[Math.min(calls, responses.length - 1)];
    calls += 1;
    return {
      ok: next.ok,
      status: next.status,
      async json() {
        return next.body;
      },
    };
  };

  const job = await pollResearchJobUntilTerminal("job-delayed", {
    fetchImpl,
    intervalMs: 0,
    maxAttempts: 5,
    tolerateNotFoundAttempts: 2,
  });

  assert.equal(calls, 4);
  assert.equal(job.status, "done");
});
