// app/api/chat/route.js
import { NextResponse } from "next/server";
import { roleFromSession, normalizeRole, requireSubscription } from "@/lib/authz";
import { pickReplyLang, langStrings, toResponsesInput, buildResponsesPayload } from "@/lib/chat/promptBuilder";
import {
  collapsePages,
  groupMatches,
  diversifyGroupsMMR,
  buildContextWithBudget,
  makeShortRef,
} from "@/lib/chat/ragContext";
import { detectCrisis, isGreeting, groundingStrength } from "@/lib/chat/safety";
import { persistInit, persistAppend, persistDone } from "@/lib/chat/persistence";
import { logEvent } from "@/lib/chat/logger";
import { RAG_TOP_K, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA, RAG_CTX_MAX_CHARS, RAG_BASE, RAG_KEY } from "@/lib/chat/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ------------------------- Helpers ------------------------- */
function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}
const logInfo = (event, payload = {}) => {
  try {
    console.info("[chat]", event, payload);
  } catch {}
};
const logError = (event, payload = {}) => {
  try {
    console.error("[chat]", event, payload);
  } catch {}
};
function toOpenAiMessages(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  return history
    .filter((msg) => msg && typeof msg.text === "string")
    .slice(-8)
    .map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: String(msg.text).slice(0, 2000),
    }));
}
/** Kasutaja küsib allikaid/viiteid? (et/ru/en võtmesõnad) */
function detectSourcesRequest(history = [], message = "") {
  const sourcesText = [];
  if (typeof message === "string") sourcesText.push(message);
  if (Array.isArray(history)) {
    for (const h of history) {
      const role = String(h?.role || "").toLowerCase();
      if (role === "user" || role === "client") {
        sourcesText.push(h?.text || h?.content || "");
      }
    }
  }
  const txt = sourcesText.join(" ").toLowerCase();
  // eesti: allik, viide; inglise: source, cite, citation; vene: источник, ссылк
  return /\b(allik|viide|source|cite|citation|источник|ссылк)\w*\b/.test(txt);
}
/* ---- Language detection & strings ---------------------------------- */
/* lang helpers moved */
/* RAG context helpers moved */
/* ------------------------- RAG search ------------------------- */
async function searchRagDirect({ query, topK = RAG_TOP_K, filters }) {
  const body = { query, top_k: topK, where: filters || undefined };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(`${RAG_BASE}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(RAG_KEY ? { "X-API-Key": RAG_KEY } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: controller.signal,
  });
  clearTimeout(t);
  let data = null;
  try {
    const raw = await res.text();
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    return [];
  }
  return Array.isArray(data?.results) ? data.results : [];
}

async function callOpenAI({ history, userMessage, context, effectiveRole, grounding, includeSources, replyLang, isCrisis }) {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const client = new OpenAI({ apiKey });
  const input = toResponsesInput({
    history,
    userMessage,
    context,
    effectiveRole,
    grounding,
    includeSources,
    replyLang,
    isCrisis,
  });
  const payload = buildResponsesPayload(input, { stream: false });
  const resp = await client.responses.create(payload);
  const reply =
    (resp.output_text && resp.output_text.trim()) ||
    "Vabandust, ma ei saanud praegu vastust koostada.";
  return { reply };
}

async function streamOpenAI({ history, userMessage, context, effectiveRole, grounding, includeSources, replyLang, isCrisis }) {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const client = new OpenAI({ apiKey });
  const input = toResponsesInput({
    history,
    userMessage,
    context,
    effectiveRole,
    grounding,
    includeSources,
    replyLang,
    isCrisis,
  });
  const payload = buildResponsesPayload(input, { stream: true });
  const stream = await client.responses.stream(payload);
  async function* iterator() {
    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        yield { type: "delta", text: event.delta || "" };
      } else if (event.type === "response.error") {
        throw new Error(event.error?.message || "OpenAI stream error");
      } else if (event.type === "response.completed") {
        yield { type: "done" };
      }
    }
  }
  return iterator();
}

/* persistence moved */
/* ------------------------- Page range normalizer ------------------------- */
function normalizePageRangeString(s = "") {
  return s.replace(/\s*[-–—]\s*/g, "-").trim();
}

/* ------------------------- Route Handler ------------------------- */
export async function POST(req) {
  // Auth loader
  const { getServerSession } = await import("next-auth/next");
  let authOptions;
  try {
    ({ authOptions } = await import("@/pages/api/auth/[...nextauth]"));
  } catch {
    try {
      const mod = await import("@/auth");
      authOptions = mod.authConfig || mod.authOptions || mod.default;
    } catch {
      authOptions = undefined;
    }
  }

  // 1) payload
  let payload;
  try {
    payload = await req.json();
  } catch {
    return makeError("Keha peab olema JSON.");
  }
  const message = String(payload?.message || "").trim();
  if (!message) return makeError("Sõnum on kohustuslik.");
  const rawHistory = Array.isArray(payload?.history) ? payload.history : [];
  const history = toOpenAiMessages(rawHistory);
  const wantStream = !!payload?.stream;
  const persist = !!payload?.persist;
  const convId = (payload?.convId && String(payload.convId)) || null;
  const uiLocale = typeof payload?.uiLocale === "string" ? payload.uiLocale : undefined;
  const ephemeralChunks = Array.isArray(payload?.ephemeralChunks)
    ? payload.ephemeralChunks.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim())
    : [];
  const ephemeralSource = (payload?.ephemeralSource && typeof payload.ephemeralSource === "object") ? payload.ephemeralSource : null;
  const combineSources = payload?.combineSources === true;
  const forceSources =
    payload?.forceSources === true || payload?.includeSources === true || payload?.showSources === true;
  const includeSources = forceSources || detectSourcesRequest(rawHistory, message);

  // 2) sessioon
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {}
  const userId = session?.user?.id || null;

  // 3) roll
  const sessionRole = roleFromSession(session); // ADMIN / SOCIAL_WORKER / CLIENT
  const payloadRole = typeof payload?.role === "string" ? payload.role.toUpperCase().trim() : "";
  const pickedRole = sessionRole || payloadRole || "CLIENT";
  const normalizedRole = normalizeRole(pickedRole); // ADMIN -> SOCIAL_WORKER

  // 4) nõua tellimust
  const gate = await requireSubscription(session, normalizedRole);
  if (!gate.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: gate.message,
        requireSubscription: gate.requireSubscription,
        redirect: gate.redirect,
      },
      { status: gate.status }
    );
  }

  // 4.1) keeleotsus
  const replyLang = pickReplyLang({ userMessage: message, uiLocale });
  const L = langStrings(replyLang, normalizedRole);
  const isCrisis = detectCrisis(message);
  const hasHistory = Array.isArray(rawHistory) && rawHistory.length > 0;

  logInfo("request.start", {
    ts: new Date().toISOString(),
    userId,
    role: normalizedRole,
    isCrisis,
    hasHistory,
    hasEphemeral: !!ephemeralChunks.length,
  });
  await logEvent("chat_request", {
    userId,
    role: normalizedRole,
    isCrisis,
    hasHistory,
    hasEphemeralDoc: !!ephemeralChunks.length,
    messageLength: message.length,
    convId,
  });
  if (isCrisis) {
    logInfo("crisis.detected", { role: normalizedRole, hasHistory, fromRag: false });
  }

  // 4.5) varajane tervitusfiltri haru - ainult siis, kui kasutaja ISE tervitas
  const greeting = isGreeting(message);
  if (greeting && !isCrisis && !hasHistory) {
    const reply =
      normalizedRole === "SOCIAL_WORKER" ? L.greetingWorker : L.greetingClient;

    if (persist && convId && userId) {
      await persistInit({
        convId,
        userId,
        role: normalizedRole,
        sources: [],
        isCrisis,
        userMessage: message,
      });
      await persistAppend({ convId, userId, fullText: reply });
      await persistDone({
        convId,
        userId,
        status: "COMPLETED",
        finalText: reply,
        sources: [],
        isCrisis,
      });
    }

    if (!wantStream) {
      return NextResponse.json({
        ok: true,
        reply,
        answer: reply,
        sources: [],
        isCrisis,
        convId: convId || undefined,
      });
    }

    const enc = new TextEncoder();
    const sse = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            enc.encode(`event: meta\ndata: ${JSON.stringify({ sources: [], isCrisis })}\n\n`)
          );
          controller.enqueue(
            enc.encode(`event: delta\ndata: ${JSON.stringify({ t: reply })}\n\n`)
          );
          // mikro-flush, et tervituse tükk läheks KOHE teele

          controller.enqueue(enc.encode(`event: done\ndata: {}\n\n`));
        } finally {
          try { controller.close(); } catch {}
        }
      },
    });

    return new Response(sse, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // 5) RAG filtrid – auditoorium
  const audienceFilter =
    (payload?.audience === "CLIENT" || normalizedRole === "CLIENT")
      ? { audience: { $in: ["CLIENT", "BOTH"] } }
      : { audience: { $in: ["SOCIAL_WORKER", "BOTH"] } };

  // 6) RAG otsing
  let matches = [];
  let groupedMatches = [];
  let chosen = [];
  let budgeted = { text: "", used: [] };
  if (!ephemeralChunks.length || combineSources) {
    try {
      matches = await searchRagDirect({ query: message, topK: RAG_TOP_K, filters: audienceFilter });
    } catch (err) {
      logError("rag.search.error", { err: err?.message, role: normalizedRole, userId });
      await logEvent("rag_error", {
        userId,
        role: normalizedRole,
        isCrisis,
        message: err?.message || "rag search error",
      });
    }
    groupedMatches = groupMatches(matches);
    chosen = diversifyGroupsMMR(groupedMatches, CONTEXT_GROUPS_MAX, DIVERSIFY_LAMBDA);
    budgeted = buildContextWithBudget(chosen);
  }
  // Ephemeral document context (if provided)
  const ragContext = budgeted.text;
  let docContext = "";
  if (ephemeralChunks && ephemeralChunks.length) {
    const joined = ephemeralChunks.join("\n---\n");
    const maxEphemeral = Math.max(500, Math.floor(RAG_CTX_MAX_CHARS * 0.35));
    docContext = joined.slice(0, maxEphemeral).trim();
  }
  const contextParts = [];
  if (docContext) {
    contextParts.push(`USER DOCUMENT:\n${docContext}`);
  }
  if (!docContext) {
    if (ragContext) contextParts.push(ragContext);
  } else if (combineSources && ragContext) {
    contextParts.push(ragContext);
  }
  const context = contextParts.filter(Boolean).join("\n\n");
  const grounding = groundingStrength(groupedMatches);
  const hadDocContext = !!docContext;
  const hadRagContext = !!ragContext;

  logInfo("rag.afterSearch", {
    rawMatches: matches.length,
    groups: groupedMatches.length,
    grounding,
    mmrSelected: chosen.length,
  });
  await logEvent("rag_search", {
    userId,
    role: normalizedRole,
    isCrisis,
    ragMatchCount: matches.length,
    groupCount: groupedMatches.length,
    chosenGroupCount: chosen.length,
    grounding,
    hadDocContext,
    hadRagContext,
  });
  if (isCrisis) {
    await logEvent("crisis_detected", {
      userId,
      role: normalizedRole,
      hasHistory,
      hadRagContext,
    });
  }

  // 7) allikad (meta) – UI-le
  const docSources =
    ephemeralChunks && ephemeralChunks.length
      ? [
          {
            id: "user-document",
            title: "(Laetud dokument)",
            url: undefined,
            file: undefined,
            fileName: typeof ephemeralSource?.fileName === "string" ? ephemeralSource.fileName : undefined,
            audience: undefined,
            pageRange: undefined,
            authors: undefined,
            issueLabel: undefined,
            issueId: undefined,
            journalTitle: undefined,
            section: undefined,
            year: undefined,
            pages: undefined,
            short_ref: "(laetud dokument)",
          },
        ]
      : [];

  const ragSources = (budgeted.used.length ? budgeted.used : chosen).map((entry, idx) => {
    const pageNumbers = Array.isArray(entry.pages) ? entry.pages : [];
    const pageRanges = Array.isArray(entry.pageRanges)
      ? Array.from(new Set(entry.pageRanges.filter(Boolean)))
      : [];
    const pageTextRaw = (pageRanges.length ? pageRanges.join(", ") : collapsePages(pageNumbers)).trim();
    const pageText = normalizePageRangeString(pageTextRaw);
    const short_ref_text = (makeShortRef(entry, pageText) || "").trim();
    return {
      id: entry.key || entry.docId || entry.articleId || entry.url || entry.fileName || `source-${idx}`,
      title: entry.title,
      url: entry.url || undefined,
      file: undefined,
      fileName: entry.fileName || undefined,
      audience: entry.audience || undefined,
      pageRange: pageText || undefined,
      authors: Array.isArray(entry.authors) && entry.authors.length ? entry.authors : undefined,
      issueLabel: entry.issueLabel || undefined,
      issueId: entry.issueId || undefined,
      journalTitle: entry.journalTitle || undefined,
      section: entry.section || undefined,
      year: entry.year || undefined,
      pages: pageNumbers.length ? pageNumbers : undefined,
      short_ref: short_ref_text || undefined,
    };
  });

  let sources;
  if (docSources.length && combineSources) {
    sources = [...docSources, ...ragSources];
  } else if (docSources.length) {
    sources = docSources;
  } else {
    sources = ragSources;
  }

  // 7.5) Kui konteksti ei leitud, vasta õiges keeles
  if (!context || !context.trim()) {
    const out = isCrisis ? L.crisisNoCtx : L.noContext;
    logInfo("branch.noContext", {
      role: normalizedRole,
      isCrisis,
      ragReturned: matches.length > 0,
      hadDocContext: !!docContext,
    });
    await logEvent("no_context", {
      userId,
      role: normalizedRole,
      isCrisis,
      hadRagResults: matches.length > 0,
      hadDocContext: !!docContext,
    });

    if (persist && convId && userId) {
      await persistInit({
        convId,
        userId,
        role: normalizedRole,
        sources,
        isCrisis,
        userMessage: message,
      });
      await persistAppend({ convId, userId, fullText: out });
      await persistDone({
        convId,
        userId,
        status: "COMPLETED",
        finalText: out,
        sources,
        isCrisis,
      });
    }

    if (!wantStream) {
      return NextResponse.json({
        ok: true,
        reply: out,
        answer: out,
        sources,
        isCrisis,
        convId: convId || undefined,
      });
    }

    const enc = new TextEncoder();
    const sse = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(enc.encode(`event: meta\ndata: ${JSON.stringify({ sources, isCrisis })}\n\n`));
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ t: out })}\n\n`));
          // mikro-flush, et esimene tükk ei jääks klompi

          controller.enqueue(enc.encode(`event: done\ndata: {}\n\n`));
        } finally {
          try { controller.close(); } catch {}
        }
      },
    });

    return new Response(sse, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // püsitus
  if (persist && convId && userId) {
    await persistInit({
      convId,
      userId,
      role: normalizedRole,
      sources,
      isCrisis,
      userMessage: message,
    });
  }

  // --- A) JSON (mitte-streamiv) ---
  if (!wantStream) {
    try {
      const aiResult = await callOpenAI({
        history,
        userMessage: message,
        context,
        effectiveRole: normalizedRole,
        grounding,
        includeSources,
        replyLang,
        isCrisis,
      });
      if (persist && convId && userId) {
        await persistAppend({ convId, userId, fullText: aiResult.reply });
        await persistDone({
          convId,
          userId,
          status: "COMPLETED",
          finalText: aiResult.reply,
          sources,
          isCrisis,
        });
      }
      return NextResponse.json({
        ok: true,
        reply: aiResult.reply,
        answer: aiResult.reply,
        sources,
        isCrisis,
        convId: convId || undefined,
      });
    } catch (err) {
      const errMessage =
        (err?.response?.data?.error?.message || err?.error?.message || err?.message) ??
        "OpenAI päring ebaõnnestus.";
      logError("openai.call.error", {
        err: errMessage,
        stack: err?.stack,
        userId,
        role: normalizedRole,
        isCrisis,
        messageLength: message.length,
      });
      await logEvent("openai_error", {
        userId,
        role: normalizedRole,
        isCrisis,
        message: errMessage,
        messageLength: message.length,
      });
      if (persist && convId && userId) await persistDone({ convId, userId, status: "ERROR" });
      return makeError(errMessage, 502, { code: err?.name });
    }
  }

  // --- B) STREAM (SSE) ---
  const enc = new TextEncoder();
  let clientGone = false;
  let heartbeatTimer = null;
  let accumulated = "";

  const sse = new ReadableStream({
    async start(controller) {
      try {
        req.signal?.addEventListener("abort", () => {
          clientGone = true;
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
        });
      } catch {}

      heartbeatTimer = setInterval(() => {
        if (!clientGone) {
          try {
            controller.enqueue(enc.encode(`: keepalive\n\n`));
          } catch {
            clientGone = true;
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
        }
      }, 15000);

      // meta alguses
      if (!clientGone) {
        try {
          controller.enqueue(
            enc.encode(`event: meta\ndata: ${JSON.stringify({ sources, isCrisis })}\n\n`)
          );
        } catch {
          clientGone = true;
        }
      }

      try {
        const iter = await streamOpenAI({
          history,
          userMessage: message,
          context,
          effectiveRole: normalizedRole,
          grounding,
          includeSources,
          replyLang,
          isCrisis,
        });

        for await (const ev of iter) {
          if (ev.type === "delta" && ev.text) {
            accumulated += ev.text;
            if (!clientGone) {
              try {
                controller.enqueue(
                  enc.encode(`event: delta\ndata: ${JSON.stringify({ t: ev.text })}\n\n`)
                );


              } catch {
                clientGone = true;
              }
            }

          } else if (ev.type === "done") {
            if (persist && convId && userId) {
              await persistAppend({ convId, userId, fullText: accumulated });
              await persistDone({
                convId,
                userId,
                status: "COMPLETED",
                finalText: accumulated,
                sources,
                isCrisis,
              });
            }
            if (!clientGone) {
              try {
                controller.enqueue(enc.encode(`event: done\ndata: {}\n\n`));
              } catch {}
            }
          }
        }
      } catch (e) {
        if (!clientGone) {
          try {
            controller.enqueue(
              enc.encode(
                `event: error\ndata: ${JSON.stringify({ message: e?.message || "stream error" })}\n\n`
              )
            );
          } catch {}
        }
        logError("openai.stream.error", {
          err: e?.message,
          stack: e?.stack,
          userId,
          role: normalizedRole,
          isCrisis,
          messageLength: message.length,
        });
        await logEvent("openai_error", {
          userId,
          role: normalizedRole,
          isCrisis,
          message: e?.message || "openai stream error",
          messageLength: message.length,
        });
        if (persist && convId && userId) await persistDone({ convId, userId, status: "ERROR" });
      } finally {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        if (!clientGone) {
          try {
            controller.close();
          } catch {}
        }
      }
    },
  });

  return new Response(sse, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "api/chat" });
}

