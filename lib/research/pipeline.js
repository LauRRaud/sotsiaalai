import path from "node:path";
import { normalizeRole } from "@/lib/authz";
import { logEvent } from "@/lib/chat/logger";
import { persistAppend, persistDone, persistInit } from "@/lib/chat/persistence";
import { RAG_BASE, RAG_KEY } from "@/lib/chat/settings";
import {
  cancelResearchJob,
  isResearchCancelled,
  markResearchDone,
  markResearchFailed,
  markResearchRunning,
  publishResearchProgress,
} from "@/lib/research/jobStore";
import { resolveResearchConfig, resolveResearchModel } from "@/lib/research/settings";

function nowMs() {
  return Date.now();
}

function toLocale(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "ru") return "ru";
  if (raw === "en") return "en";
  return "et";
}

function toGeoLevel(rawLevel) {
  const value = String(rawLevel || "").trim().toUpperCase();
  if (value === "NATIONAL") return "NATIONAL";
  if (value === "MUNICIPALITY") return "MUNICIPALITY";
  if (value === "DISTRICT") return "DISTRICT";
  return "ALL";
}

function sanitizeText(value, maxChars = 1200) {
  const raw = String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!raw) return "";
  if (raw.length <= maxChars) return raw;
  return `${raw.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

function parseJsonLoose(text, fallback = null) {
  const raw = String(text || "").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {}
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {}
  }
  return fallback;
}

function mapWithConcurrency(items, concurrency, worker) {
  const list = Array.isArray(items) ? items : [];
  const limit = Math.max(1, Number(concurrency) || 1);
  const out = new Array(list.length);
  let cursor = 0;
  const runners = new Array(Math.min(limit, list.length)).fill(0).map(async () => {
    while (cursor < list.length) {
      const index = cursor++;
      out[index] = await worker(list[index], index);
    }
  });
  return Promise.all(runners).then(() => out);
}

function throwIfCancelled(job) {
  if (isResearchCancelled(job)) {
    const err = new Error("research.error.cancelled");
    err.code = "RESEARCH_CANCELLED";
    throw err;
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const err = new Error("research.error.cancelled");
    err.code = "RESEARCH_CANCELLED";
    throw err;
  }
}

async function fetchRagSearch({ query, topK, where, timeoutMs, signal }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1000, Number(timeoutMs) || 10_000));
  if (signal) {
    if (signal.aborted) controller.abort();
    signal.addEventListener(
      "abort",
      () => {
        try {
          controller.abort();
        } catch {}
      },
      { once: true }
    );
  }
  try {
    const response = await fetch(`${RAG_BASE}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(RAG_KEY ? { "X-API-Key": RAG_KEY } : {}),
      },
      body: JSON.stringify({
        query,
        top_k: topK,
        where: where || undefined,
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    const raw = await response.text().catch(() => "");
    const parsed = parseJsonLoose(raw, {});
    if (!response.ok) return [];
    return Array.isArray(parsed?.results) ? parsed.results : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function compactForPrompt(value, max = 3500) {
  const text = sanitizeText(value, max + 20);
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function buildPlannerFallback(query, config) {
  const cleaned = sanitizeText(query, 260);
  return {
    subquestions: [
      {
        id: "Q1",
        question: cleaned || "Põhiküsimus",
        query_terms: [cleaned].filter(Boolean),
      },
    ],
    success_criteria: ["Leia usaldusväärsed allikad ja vasta ainult tõendatud väidetega."],
    max_evidence_per_q: Math.min(3, config.maxSnippets),
    max_total_evidence: config.maxSnippets,
  };
}

function normalizePlanner(raw, query, config) {
  const fallback = buildPlannerFallback(query, config);
  if (!raw || typeof raw !== "object") return fallback;

  const maxSub = Math.max(1, config.maxSubquestions);
  const maxEvidencePerQ = Math.max(1, Math.min(5, Number(raw.max_evidence_per_q) || 2));
  const maxTotalEvidence = Math.max(
    2,
    Math.min(config.maxSnippets, Number(raw.max_total_evidence) || config.maxSnippets)
  );

  const subquestions = Array.isArray(raw.subquestions)
    ? raw.subquestions
        .map((item, index) => {
          const question = sanitizeText(item?.question || item?.q || "", 220);
          if (!question) return null;
          const queryTerms = Array.isArray(item?.query_terms)
            ? item.query_terms.map(v => sanitizeText(v, 160)).filter(Boolean)
            : [];
          return {
            id: sanitizeText(item?.id || `Q${index + 1}`, 16) || `Q${index + 1}`,
            question,
            query_terms: queryTerms.length ? queryTerms : [question],
          };
        })
        .filter(Boolean)
        .slice(0, maxSub)
    : [];

  const successCriteria = Array.isArray(raw.success_criteria)
    ? raw.success_criteria.map(v => sanitizeText(v, 200)).filter(Boolean).slice(0, 6)
    : [];

  return {
    subquestions: subquestions.length ? subquestions : fallback.subquestions,
    success_criteria: successCriteria.length ? successCriteria : fallback.success_criteria,
    max_evidence_per_q: maxEvidencePerQ,
    max_total_evidence: maxTotalEvidence,
  };
}

function evidenceFromResult(result, snippetMaxChars) {
  if (!result || typeof result !== "object") return null;
  const chunk = sanitizeText(result.chunk || result.text || "", snippetMaxChars);
  if (!chunk) return null;
  const sourcePath = result.url || result.source_path || result.fileName || "";
  return {
    chunkId: String(result.id || "").trim() || null,
    docId: String(result.docId || result.doc_id || "").trim() || null,
    articleId: String(result.articleId || "").trim() || null,
    title: sanitizeText(result.title || "", 180) || null,
    year: Number.isFinite(Number(result.year)) ? Number(result.year) : null,
    issueLabel: sanitizeText(result.issueLabel || result.issue || "", 40) || null,
    section: sanitizeText(result.section || "", 80) || null,
    source_path: sanitizeText(sourcePath, 300) || null,
    pageRange: sanitizeText(result.pageRange || result.pages || "", 60) || null,
    snippet: chunk,
    distance: Number.isFinite(Number(result.distance)) ? Number(result.distance) : null,
  };
}

function selectEvidenceWithDiversity(items, maxItems, docCap) {
  const list = Array.isArray(items) ? items : [];
  const byDistance = [...list].sort((a, b) => {
    const ad = Number.isFinite(a?.distance) ? a.distance : 10_000;
    const bd = Number.isFinite(b?.distance) ? b.distance : 10_000;
    return ad - bd;
  });
  const picked = [];
  const perDoc = new Map();
  for (const item of byDistance) {
    if (picked.length >= maxItems) break;
    const docId = item?.docId || item?.articleId || item?.title || item?.chunkId || "__unknown";
    const used = perDoc.get(docId) || 0;
    if (used >= docCap) continue;
    picked.push(item);
    perDoc.set(docId, used + 1);
  }
  return picked;
}

function buildAudienceWhere(outputStyle) {
  return outputStyle === "SOCIAL_WORKER"
    ? { audience: { $in: ["SOCIAL_WORKER", "BOTH"] } }
    : { audience: { $in: ["CLIENT", "BOTH"] } };
}

function geoVariants(geo) {
  const level = toGeoLevel(geo?.level);
  if (level === "DISTRICT") return ["DISTRICT", "MUNICIPALITY", "NATIONAL"];
  if (level === "MUNICIPALITY") return ["MUNICIPALITY", "NATIONAL"];
  if (level === "NATIONAL") return ["NATIONAL"];
  return ["ALL"];
}

function buildWhereForGeo({ outputStyle, collectionIds, geo, variant }) {
  const where = {
    ...buildAudienceWhere(outputStyle),
  };
  const collectionId = Array.isArray(collectionIds) ? String(collectionIds[0] || "").trim() : "";
  if (collectionId) where.collection_id = collectionId;

  if (variant === "NATIONAL") {
    where.jurisdiction_level = { $in: ["NATIONAL"] };
    return where;
  }

  if (variant === "MUNICIPALITY") {
    const municipalityId = String(geo?.municipality_id || "").trim();
    const municipalityName = String(geo?.municipality_name || "").trim();
    if (municipalityId) where.municipality_id = municipalityId;
    else if (municipalityName) where.municipality_name = municipalityName;
    where.jurisdiction_level = { $in: ["MUNICIPALITY", "CITY_GOVERNMENT"] };
    return where;
  }

  if (variant === "DISTRICT") {
    const districtId = String(geo?.district_id || "").trim();
    const districtName = String(geo?.district_name || "").trim();
    const municipalityId = String(geo?.municipality_id || "").trim();
    const municipalityName = String(geo?.municipality_name || "").trim();
    if (districtId) where.district_id = districtId;
    else if (districtName) where.district_name = districtName;
    if (municipalityId) where.municipality_id = municipalityId;
    else if (municipalityName) where.municipality_name = municipalityName;
    where.jurisdiction_level = { $in: ["DISTRICT", "MUNICIPALITY", "CITY_GOVERNMENT"] };
    return where;
  }

  return where;
}

function normalizeResearchOutput(raw, evidence) {
  const data = raw && typeof raw === "object" ? raw : {};
  const evidenceIds = new Set((Array.isArray(evidence) ? evidence : []).map(item => item.id));
  const normalized = {
    summary: [],
    findings: [],
    gaps: [],
    next_actions: [],
    evidence: Array.isArray(evidence) ? evidence : [],
  };

  normalized.summary = Array.isArray(data.summary)
    ? data.summary.map(v => sanitizeText(v, 260)).filter(Boolean).slice(0, 6)
    : [];
  normalized.gaps = Array.isArray(data.gaps)
    ? data.gaps.map(v => sanitizeText(v, 260)).filter(Boolean).slice(0, 10)
    : [];
  normalized.next_actions = Array.isArray(data.next_actions)
    ? data.next_actions.map(v => sanitizeText(v, 260)).filter(Boolean).slice(0, 8)
    : [];

  const findings = Array.isArray(data.findings) ? data.findings : [];
  for (const item of findings) {
    const claim = sanitizeText(item?.claim || "", 320);
    if (!claim) continue;
    const refs = Array.isArray(item?.evidence_refs)
      ? Array.from(
          new Set(
            item.evidence_refs.map(v => String(v || "").trim()).filter(v => v && evidenceIds.has(v))
          )
        )
      : [];
    const confidenceRaw = String(item?.confidence || "").trim().toLowerCase();
    const confidence = confidenceRaw === "high" || confidenceRaw === "low" ? confidenceRaw : "medium";
    if (!refs.length) {
      normalized.gaps.push(`${claim} (insufficient evidence)`);
      continue;
    }
    normalized.findings.push({
      claim,
      evidence_refs: refs,
      confidence,
    });
  }

  if (!normalized.summary.length && normalized.findings.length) {
    normalized.summary = normalized.findings.slice(0, 2).map(item => item.claim);
  }
  if (!normalized.next_actions.length) {
    normalized.next_actions = ["Täpsusta vajadusel teema ulatust või piirkonda, et saada täpsemad viited."];
  }

  return normalized;
}

function formatConfidence(confidence, locale) {
  if (locale === "en") {
    if (confidence === "high") return "high";
    if (confidence === "low") return "low";
    return "medium";
  }
  if (locale === "ru") {
    if (confidence === "high") return "высокая";
    if (confidence === "low") return "низкая";
    return "средняя";
  }
  if (confidence === "high") return "kõrge";
  if (confidence === "low") return "madal";
  return "keskmine";
}

function renderReportText(report, locale, targetStyle) {
  const i18n =
    locale === "en"
      ? {
          title: "Deep Research",
          targetPrefix: "Formatted for",
          summary: "Summary",
          findings: "Findings",
          gaps: "Unverified or missing",
          next: "Next actions",
          refs: "Evidence references",
          confidence: "confidence",
          targetWorker: "social work specialist",
          targetClient: "help-seeker",
        }
      : locale === "ru"
        ? {
            title: "Глубокое исследование",
            targetPrefix: "Формат для",
            summary: "Кратко",
            findings: "Ключевые выводы",
            gaps: "Что не подтверждено",
            next: "Следующие шаги",
            refs: "Ссылки на доказательства",
            confidence: "уверенность",
            targetWorker: "специалиста по социальной работе",
            targetClient: "обращающегося за поддержкой",
          }
        : {
            title: "Süvauuring",
            targetPrefix: "Vormistus",
            summary: "Kokkuvõte",
            findings: "Põhipunktid",
            gaps: "Mis jäi tõendamata",
            next: "Järgmised sammud",
            refs: "Tõendiviited",
            confidence: "kindlus",
            targetWorker: "sotsiaaltöö spetsialistile",
            targetClient: "eluküsimusega pöördujale",
          };

  const target = targetStyle === "SOCIAL_WORKER" ? i18n.targetWorker : i18n.targetClient;
  const lines = [`${i18n.title}`, `${i18n.targetPrefix}: ${target}`, "", `${i18n.summary}`];

  for (const item of report.summary) lines.push(`- ${item}`);

  lines.push("", `${i18n.findings}`);
  if (!report.findings.length) {
    lines.push("-");
  } else {
    for (const finding of report.findings) {
      const refs = finding.evidence_refs.join(", ");
      lines.push(`- ${finding.claim} (${i18n.confidence}: ${formatConfidence(finding.confidence, locale)}; ${refs})`);
    }
  }

  lines.push("", `${i18n.gaps}`);
  for (const item of report.gaps.length ? report.gaps : ["-"]) lines.push(item === "-" ? item : `- ${item}`);

  lines.push("", `${i18n.next}`);
  for (const item of report.next_actions) lines.push(`- ${item}`);

  if (Array.isArray(report.evidence) && report.evidence.length) {
    lines.push("", `${i18n.refs}`);
    for (const ev of report.evidence) {
      const title = ev.title || ev.docId || ev.id;
      const pagePart = ev.pageRange ? `, ${ev.pageRange}` : "";
      lines.push(`- ${ev.id}: ${title}${pagePart}`);
    }
  }
  return lines.join("\n").trim();
}

function toConversationSources(evidence) {
  if (!Array.isArray(evidence)) return [];
  return evidence.map(item => {
    const sourcePath = String(item.source_path || "").trim();
    const isHttp = /^https?:\/\//i.test(sourcePath);
    return {
      id: item.id,
      title: item.title || item.docId || item.id,
      url: isHttp ? sourcePath : undefined,
      fileName: !isHttp && sourcePath ? path.basename(sourcePath) : undefined,
      section: item.section || undefined,
      year: Number.isFinite(item.year) ? item.year : undefined,
      issueLabel: item.issueLabel || undefined,
      pageRange: item.pageRange || undefined,
      short_ref: item.id,
      source_type: "rag",
    };
  });
}

async function callJsonModel({ systemPrompt, userPrompt, maxOutputTokens, signal }) {
  let OpenAI;
  try {
    ({ default: OpenAI } = await import("openai"));
  } catch (err) {
    throw new Error(err?.message || "research.error.openai_missing");
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("research.error.openai_key_missing");
  const client = new OpenAI({ apiKey });
  const model = resolveResearchModel();
  const response = await client.responses.create({
    model,
    max_output_tokens: maxOutputTokens,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ],
    ...(signal?.aborted ? {} : {}),
  });
  const text = String(response?.output_text || "").trim();
  const outputTokens = Number(response?.usage?.output_tokens || 0) || 0;
  return { text, outputTokens };
}

async function runPlanner({ query, locale, config, payload, signal }) {
  const localeHint = locale === "en" ? "English" : locale === "ru" ? "Russian" : "Estonian";
  const systemPrompt =
    "You are a research planner. Return strict JSON only. Do not include markdown or prose.";
  const userPrompt = `Create a compact research plan for a RAG-only deep research request.
Language: ${localeHint}
Output style target: ${payload.output_style}
Profile: ${config.profile}
Max subquestions: ${config.maxSubquestions}
Allowed fields:
{
  "subquestions":[{"id":"Q1","question":"...","query_terms":["..."]}],
  "success_criteria":["..."],
  "max_evidence_per_q":2,
  "max_total_evidence":${config.maxSnippets}
}
Rules:
- keep 2..${config.maxSubquestions} subquestions unless query is very narrow.
- keep query_terms concise.
- JSON only.

Query:
${compactForPrompt(query, 1200)}`;
  const modelResult = await callJsonModel({
    systemPrompt,
    userPrompt,
    maxOutputTokens: Math.min(500, config.maxOutputTokens),
    signal,
  });
  const parsed = parseJsonLoose(modelResult.text, null);
  return {
    planner: normalizePlanner(parsed, query, config),
    tokens: modelResult.outputTokens,
  };
}

async function retrieveEvidence({ planner, payload, config, signal }) {
  const variants = geoVariants(payload.geo);
  const retrievalGaps = [];
  let selectedVariant = variants[0];
  let selectedEvidence = [];

  for (let variantIndex = 0; variantIndex < variants.length; variantIndex += 1) {
    const variant = variants[variantIndex];
    const where = buildWhereForGeo({
      outputStyle: payload.output_style,
      collectionIds: payload.collection_ids,
      geo: payload.geo,
      variant,
    });
    const perQuestion = await mapWithConcurrency(
      planner.subquestions,
      config.retrievalConcurrency,
      async subquestion => {
        const queries = (Array.isArray(subquestion.query_terms) ? subquestion.query_terms : [])
          .map(v => sanitizeText(v, 180))
          .filter(Boolean)
          .slice(0, config.queriesPerSubquestion);
        if (!queries.length) queries.push(subquestion.question);

        const allResults = [];
        for (const q of queries) {
          throwIfAborted(signal);
          const hits = await fetchRagSearch({
            query: q,
            topK: config.ragTopK,
            where,
            timeoutMs: config.ragTimeoutMs,
            signal,
          });
          allResults.push(...hits);
        }
        const dedup = new Map();
        for (const hit of allResults) {
          const ev = evidenceFromResult(hit, config.maxCharsPerSnippet);
          if (!ev) continue;
          const key = ev.chunkId || `${ev.docId || "doc"}:${ev.snippet.slice(0, 80)}`;
          if (!dedup.has(key)) dedup.set(key, ev);
        }
        return selectEvidenceWithDiversity(
          Array.from(dedup.values()),
          planner.max_evidence_per_q,
          config.docDiversityCap
        );
      }
    );

    const merged = [];
    const mergedSeen = new Set();
    for (const list of perQuestion) {
      for (const item of Array.isArray(list) ? list : []) {
        const key = item.chunkId || `${item.docId || "doc"}:${item.snippet.slice(0, 80)}`;
        if (mergedSeen.has(key)) continue;
        mergedSeen.add(key);
        merged.push(item);
      }
    }
    selectedEvidence = selectEvidenceWithDiversity(
      merged,
      Math.min(config.maxSnippets, planner.max_total_evidence),
      config.docDiversityCap
    );
    selectedVariant = variant;
    const enough = selectedEvidence.length >= Math.min(4, config.maxSnippets);
    if (enough || variantIndex === variants.length - 1) break;
    const nextVariant = variants[variantIndex + 1];
    if (nextVariant) {
      if (variant === "DISTRICT" && nextVariant === "MUNICIPALITY") {
        retrievalGaps.push("Piirkondlikke (linnaosa) tõendeid oli vähe; ulatust laiendati KOV tasemele.");
      } else if (nextVariant === "NATIONAL") {
        retrievalGaps.push("Kohalikke tõendeid oli vähe; ulatust laiendati riiklikule tasemele.");
      }
    }
  }

  const evidence = selectedEvidence.map((item, index) => ({
    id: `E${index + 1}`,
    docId: item.docId || "",
    articleId: item.articleId || "",
    chunkId: item.chunkId || "",
    title: item.title || "",
    year: item.year,
    issueLabel: item.issueLabel || "",
    section: item.section || "",
    source_path: item.source_path || "",
    pageRange: item.pageRange || "",
    snippet: sanitizeText(item.snippet, config.maxCharsPerSnippet),
  }));

  return {
    evidence,
    retrievalGaps,
    variantUsed: selectedVariant,
  };
}

async function runSynthesis({ query, payload, planner, evidence, locale, config, signal }) {
  const localeHint = locale === "en" ? "English" : locale === "ru" ? "Russian" : "Estonian";
  const evidenceTable = evidence
    .map(item => {
      const title = item.title || item.docId || item.id;
      const year = Number.isFinite(item.year) ? item.year : "";
      const section = item.section || "";
      const page = item.pageRange || "";
      const header = `${item.id} | ${title} | ${year} | ${section} | ${page}`.trim();
      return `${header}\n${compactForPrompt(item.snippet, config.maxCharsPerSnippet)}`;
    })
    .join("\n\n");

  const systemPrompt =
    "You synthesize evidence into a decision-ready report. Return strict JSON only.";
  const userPrompt = `Build final report in ${localeHint}.
Output style target: ${payload.output_style}
Focus flags: ${(Array.isArray(payload.focus) && payload.focus.length ? payload.focus.join(", ") : "none")}
Success criteria: ${(planner.success_criteria || []).join(" | ")}

Return JSON only:
{
  "summary":[string],
  "findings":[{"claim":string,"evidence_refs":["E1"],"confidence":"low|medium|high"}],
  "gaps":[string],
  "next_actions":[string]
}

Rules:
- Every finding must include at least one valid evidence ref.
- Never invent refs.
- Unknown or weakly supported info must go to gaps.
- Keep response concise and practical.

Question:
${compactForPrompt(query, 1300)}

Evidence:
${evidenceTable}`;

  const modelResult = await callJsonModel({
    systemPrompt,
    userPrompt,
    maxOutputTokens: config.maxOutputTokens,
    signal,
  });
  return {
    output: parseJsonLoose(modelResult.text, null),
    tokens: modelResult.outputTokens,
  };
}

export async function runDeepResearchJob(job) {
  const startedAtMs = nowMs();
  const payload = job?.payload || {};
  const locale = toLocale(payload.ui_locale);
  const config = resolveResearchConfig(payload.profile);
  const timeBudgetMs = config.timeBudgetMs;
  const deadlineMs = startedAtMs + timeBudgetMs;
  const metrics = {
    profile: config.profile,
    planning_ms: 0,
    retrieval_ms: 0,
    synthesis_ms: 0,
    total_ms: 0,
    evidence_count: 0,
    gaps_count: 0,
    output_tokens: 0,
    geo_variant: null,
  };

  const ensureBudget = () => {
    if (nowMs() > deadlineMs) {
      const err = new Error("research.error.timeout");
      err.code = "RESEARCH_TIMEOUT";
      throw err;
    }
  };

  try {
    markResearchRunning(job);
    throwIfCancelled(job);

    if (payload.persist && payload.convId && payload.userId) {
      await persistInit({
        convId: payload.convId,
        userId: payload.userId,
        role: normalizeRole(payload.userRole || payload.output_style || "CLIENT"),
        userMessage: payload.query,
      });
    }

    publishResearchProgress(job, { stage: "planning", index: 1, total: 3 });
    const planningStart = nowMs();
    const plannerResult = await runPlanner({
      query: payload.query,
      locale,
      config,
      payload,
      signal: job.abortController.signal,
    });
    metrics.planning_ms = nowMs() - planningStart;
    metrics.output_tokens += plannerResult.tokens || 0;
    ensureBudget();
    throwIfCancelled(job);

    publishResearchProgress(job, { stage: "retrieving", index: 2, total: 3 });
    const retrievalStart = nowMs();
    const retrievalResult = await retrieveEvidence({
      planner: plannerResult.planner,
      payload,
      config,
      signal: job.abortController.signal,
    });
    metrics.retrieval_ms = nowMs() - retrievalStart;
    metrics.evidence_count = retrievalResult.evidence.length;
    metrics.geo_variant = retrievalResult.variantUsed;
    ensureBudget();
    throwIfCancelled(job);

    publishResearchProgress(job, { stage: "synthesizing", index: 3, total: 3 });
    const synthStart = nowMs();
    const synthesisResult = await runSynthesis({
      query: payload.query,
      payload,
      planner: plannerResult.planner,
      evidence: retrievalResult.evidence,
      locale,
      config,
      signal: job.abortController.signal,
    });
    metrics.synthesis_ms = nowMs() - synthStart;
    metrics.output_tokens += synthesisResult.tokens || 0;

    const normalized = normalizeResearchOutput(
      {
        ...(synthesisResult.output || {}),
        gaps: [...(Array.isArray(synthesisResult.output?.gaps) ? synthesisResult.output.gaps : []), ...retrievalResult.retrievalGaps],
      },
      retrievalResult.evidence
    );
    metrics.gaps_count = normalized.gaps.length;
    metrics.total_ms = nowMs() - startedAtMs;

    const reportText = renderReportText(normalized, locale, payload.output_style);
    const sources = toConversationSources(normalized.evidence);

    if (payload.persist && payload.convId && payload.userId) {
      await persistAppend({
        convId: payload.convId,
        userId: payload.userId,
        fullText: reportText,
      });
      await persistDone({
        convId: payload.convId,
        userId: payload.userId,
        status: "COMPLETED",
        finalText: reportText,
        sources,
        attachments: [],
        isCrisis: false,
      });
    }

    await logEvent("research_run", {
      userId: payload.userId,
      role: payload.output_style,
      profile: config.profile,
      totalMs: metrics.total_ms,
      planningMs: metrics.planning_ms,
      retrievalMs: metrics.retrieval_ms,
      synthesisMs: metrics.synthesis_ms,
      evidenceCount: metrics.evidence_count,
      gapsCount: metrics.gaps_count,
      outputTokens: metrics.output_tokens,
      geoVariant: metrics.geo_variant,
      queryLength: String(payload.query || "").length,
    });

    markResearchDone(
      job,
      {
        report: normalized,
        report_text: reportText,
        sources,
      },
      metrics
    );
  } catch (error) {
    metrics.total_ms = nowMs() - startedAtMs;
    const message =
      error?.code === "RESEARCH_CANCELLED"
        ? "research.error.cancelled"
        : error?.code === "RESEARCH_TIMEOUT"
          ? "research.error.timeout"
          : String(error?.message || "research.error.failed");
    if (error?.code === "RESEARCH_CANCELLED" || isResearchCancelled(job)) {
      cancelResearchJob(job, "research.error.cancelled");
      return;
    }
    markResearchFailed(job, message, metrics);
  }
}
