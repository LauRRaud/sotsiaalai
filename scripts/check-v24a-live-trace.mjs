import prisma from "../lib/prisma.js";

const CASES = [
  {
    id: "overview_lastekaitse",
    userIncludes: "Mis on murekohad lastekaitses?",
    expectedMode: "overview_synthesis",
    evidencePackage: true
  },
  {
    id: "comparison_koduteenus_tugiisik",
    userIncludes: "Mis vahe on koduteenusel ja tugiisikuteenusel?",
    expectedMode: "comparison",
    evidencePackage: true,
    displayedParagraphsOnly: ["17", "23"]
  },
  {
    id: "legal_exact_shs_42",
    userIncludes: "Mis ütleb SHS § 42?",
    expectedMode: "explicit_paragraph",
    evidencePackage: false
  },
  {
    id: "kov_kuusalu_koduteenus",
    userIncludes: "Millised on Kuusalu valla koduteenuse tingimused?",
    expectedMode: "municipality_service_benefit_list",
    evidencePackage: false,
    packageAware: true
  }
];

function normalize(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function paragraphNumber(source = {}) {
  return String(
    source.paragraph_number ||
    source.paragraphNumber ||
    source.metadata?.paragraph_number ||
    source.metadata?.paragraphNumber ||
    ""
  ).trim();
}

function modeOf(trace = {}) {
  return String(trace?.query_plan?.mode || trace?.query_plan?.question_planner?.mode || "").trim();
}

function summarizePair(userMessage, assistantMessage) {
  const metadata = assistantMessage?.metadata && typeof assistantMessage.metadata === "object"
    ? assistantMessage.metadata
    : {};
  const trace = metadata.rag_trace || {};
  const displayedSources = Array.isArray(metadata.displayed_sources) ? metadata.displayed_sources : [];
  return {
    userMessageId: userMessage?.id,
    assistantMessageId: assistantMessage?.id,
    conversationId: assistantMessage?.conversationId,
    createdAt: assistantMessage?.createdAt,
    userPreview: String(userMessage?.content || "").slice(0, 180),
    mode: modeOf(trace),
    selection_strategy: trace?.query_plan?.selection_strategy || null,
    evidence_package_present: !!trace.evidence_package,
    evidence_package_mode: trace.evidence_package?.mode || null,
    package_aware_answering_used: trace.package_aware_answering_used === true,
    displayed_source_ids: trace.displayed_source_ids || [],
    displayed_paragraph_numbers: displayedSources.map(paragraphNumber).filter(Boolean),
    displayed_titles: displayedSources.map(source => source.title || source.label || source.source_id || source.id).filter(Boolean)
  };
}

function evaluateCase(testCase, pair) {
  if (!pair) {
    return {
      id: testCase.id,
      ok: false,
      error: "matching_recent_conversation_pair_not_found"
    };
  }
  const summary = summarizePair(pair.user, pair.assistant);
  const errors = [];
  if (testCase.expectedMode && summary.mode !== testCase.expectedMode) {
    errors.push(`mode_expected_${testCase.expectedMode}_got_${summary.mode || "missing"}`);
  }
  if (typeof testCase.evidencePackage === "boolean" && summary.evidence_package_present !== testCase.evidencePackage) {
    errors.push(`evidence_package_expected_${testCase.evidencePackage}_got_${summary.evidence_package_present}`);
  }
  if (typeof testCase.packageAware === "boolean" && summary.package_aware_answering_used !== testCase.packageAware) {
    errors.push(`package_aware_expected_${testCase.packageAware}_got_${summary.package_aware_answering_used}`);
  }
  if (Array.isArray(testCase.displayedParagraphsOnly)) {
    const actual = [...new Set(summary.displayed_paragraph_numbers)].sort();
    const expected = [...testCase.displayedParagraphsOnly].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push(`displayed_paragraphs_expected_${expected.join("_")}_got_${actual.join("_") || "none"}`);
    }
  }
  return {
    id: testCase.id,
    ok: errors.length === 0,
    errors,
    summary
  };
}

async function main() {
  const take = Number(process.argv.find(arg => arg.startsWith("--take="))?.split("=")[1] || 500);
  const messages = await prisma.conversationMessage.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      conversationId: true,
      role: true,
      content: true,
      metadata: true,
      createdAt: true
    }
  });
  const chronological = [...messages].reverse();
  const previousUserByConversation = new Map();
  const pairs = [];

  for (const message of chronological) {
    if (message.role === "USER") {
      previousUserByConversation.set(message.conversationId, message);
      continue;
    }
    if (message.role === "ASSISTANT") {
      const user = previousUserByConversation.get(message.conversationId);
      if (user) pairs.push({ user, assistant: message });
    }
  }

  const results = CASES.map(testCase => {
    const needle = normalize(testCase.userIncludes);
    const pair = [...pairs].reverse().find(item => normalize(item.user.content).includes(needle));
    return evaluateCase(testCase, pair);
  });

  const ok = results.every(result => result.ok);
  console.log(JSON.stringify({
    ok,
    checked_recent_messages: messages.length,
    results
  }, null, 2));

  await prisma.$disconnect();
  if (!ok) process.exitCode = 1;
}

main().catch(async error => {
  await prisma.$disconnect().catch(() => {});
  console.error(JSON.stringify({
    ok: false,
    error: error?.message || String(error)
  }, null, 2));
  process.exitCode = 1;
});
