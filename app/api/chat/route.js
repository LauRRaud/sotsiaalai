// app/api/chat/route.js
import { NextResponse } from "next/server";
import { roleFromSession, normalizeRole, requireSubscription } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const ROLE_LABELS = {
  CLIENT: "eluküsimusega pöörduja",
  SOCIAL_WORKER: "sotsiaaltöö spetsialist",
  ADMIN: "administraator",
};

const ROLE_BEHAVIOUR = {
  CLIENT:
    "Selgita lihtsas eesti keeles, too praktilisi järgmisi samme, kontaktandmeid ja hoiatusi.",
  SOCIAL_WORKER:
    "Vasta professionaalselt, lisa asjakohased viited ja rõhuta, et tegu on toetusinfoga (mitte lõpliku õigusnõuga).",
};

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

/** UI-ajaloo -> OpenAI rollid (assistant/user) */
function toOpenAiMessages(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  return history
    .filter((msg) => msg && typeof msg.text === "string")
    .slice(-8)
    .map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.text,
    }));
}

/** Ühtlusta RAG vaste: toeta nii vana (metadata+text) kui uut (chunk+väljad) kuju */
function normalizeMatch(m, idx) {
  const md = m?.metadata || {};
  const title = md.title || m?.title || md.fileName || md.url || "Allikas";
  const body = m?.text || m?.chunk || "";
  const audience = md.audience || m?.audience || null;
  const url = md.url || null;
  const file = (md.source && md.source.path) || md.storedFile || null;
  const page = m?.page ?? md.page ?? null;
  const score = typeof m?.distance === "number" ? 1 - m.distance : null;

  return {
    id: m?.id || `${title}-${idx}`,
    title,
    body: (body || "").trim(),
    audience,
    url,
    file,
    page,
    score,
  };
}

/** RAG vasted üheks kontekstiplokiks */
function buildContextBlocks(matches) {
  if (!Array.isArray(matches) || matches.length === 0) return "";
  const items = matches.map(normalizeMatch);
  return items
    .map((it, i) => {
      const header = `(${i + 1}) ${it.title}${
        typeof it.score === "number" ? ` (score: ${it.score.toFixed(3)})` : ""
      }`;
      const lines = [header, it.body || "(sisukokkuvõte puudub)"];
      if (it.audience) lines.push(`Sihtgrupp: ${it.audience}`);
      if (it.url) lines.push(`Viide: ${it.url}`);
      if (!it.url && it.file) lines.push(`Fail: ${it.file}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

/** Koosta Responses API jaoks üks sisend-string (system + kontekst + ajalugu + kasutaja) */
function toResponsesInput({ history, userMessage, context, effectiveRole }) {
  const roleLabel = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  const roleBehaviour = ROLE_BEHAVIOUR[effectiveRole] || ROLE_BEHAVIOUR.CLIENT;

  const sys = `Sa oled SotsiaalAI tehisassistendina toimiv abivahend.
Vestluspartner on ${roleLabel}. ${roleBehaviour}
Kasuta üksnes allolevat konteksti; kui kontekstist ei piisa, ütle seda ausalt ja soovita sobivaid järgmisi samme.`;

  const lines = [];
  if (context && context.trim()) {
    lines.push(`KONTEKST:\n${context.trim()}\n`);
  }
  for (const m of Array.isArray(history) ? history : []) {
    const r = m.role === "assistant" ? "AI" : "USER";
    lines.push(`${r}: ${m.content}`);
  }
  lines.push(`USER: ${userMessage}`);

  return `${sys}\n\n${lines.join("\n")}\nAI:`;
}

/** OpenAI Responses API kutse (ilma 'temperature' parameetrita) */
async function callOpenAI({ history, userMessage, context, effectiveRole }) {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey });
  const input = toResponsesInput({ history, userMessage, context, effectiveRole });

  const resp = await client.responses.create({
    model: DEFAULT_MODEL,
    input,
    // NB: ära saada 'temperature' — mitmed mudelid (sh gpt-5-mini) ei toeta seda Responses API-s
  });

  const reply =
    (resp.output_text && resp.output_text.trim()) ||
    "Vabandust, ma ei saanud praegu vastust koostada.";

  return { reply };
}

export async function POST(req) {
  // Auth ja RAG dünaamiliselt (väldib bundleri jamasid)
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
  const { searchRag } = await import("@/lib/ragClient");

  // 1) payload
  let payload;
  try {
    payload = await req.json();
  } catch {
    return makeError("Keha peab olema JSON.");
  }
  const message = String(payload?.message || "").trim();
  if (!message) return makeError("Sõnum on kohustuslik.");

  const history = toOpenAiMessages(Array.isArray(payload?.history) ? payload.history : []);

  // 2) sessioon
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // jätkame; requireSubscription käsitleb vajadusel 401
  }

  // 3) roll: sessioonist tuletatud roll > payload.role; ADMIN normaliseeritakse SOCIAL_WORKER-iks
  const sessionRole = roleFromSession(session); // ADMIN / SOCIAL_WORKER / CLIENT
  const payloadRole =
    typeof payload?.role === "string" ? payload.role.toUpperCase().trim() : "";
  const pickedRole = sessionRole || payloadRole || "CLIENT";
  const normalizedRole = normalizeRole(pickedRole); // ADMIN -> SOCIAL_WORKER

  // 4) nõua tellimust (ADMIN erand)
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

  // 5) RAG filtrid: kliendile ainult CLIENT/BOTH; sots.töötaja/ADMIN näevad kõike
  const audienceFilter =
    normalizedRole === "CLIENT" ? { audience: { $in: ["CLIENT", "BOTH"] } } : undefined;

  // 6) RAG otsing (robustne: kui RAG kukub, jätkame ilma kontekstita)
  let matches = [];
  try {
    const ragResponse = await searchRag({
      query: message,
      topK: 5,
      filters: audienceFilter,
    });

    if (ragResponse?.ok) {
      matches = ragResponse?.data?.results || ragResponse?.data?.matches || [];
    }
  } catch {
    // ignore – vastame ilma kontekstita
  }

  const context = buildContextBlocks(matches);

  // 7) OpenAI vastus
  let aiResult;
  try {
    aiResult = await callOpenAI({
      history,
      userMessage: message,
      context,
      effectiveRole: normalizedRole,
    });
  } catch (err) {
    // proovi võtta OpenAI errorist selgem sõnum
    const errMessage =
      (err?.response?.data?.error?.message ||
        err?.error?.message ||
        err?.message) ??
      "OpenAI päring ebaõnnestus.";
    return makeError(errMessage, 502, { code: err?.name });
  }

  // 8) allikad vastusesse
  const sources = Array.isArray(matches)
    ? matches.map((m, i) => {
        const n = normalizeMatch(m, i);
        return {
          id: n.id,
          title: n.title,
          url: n.url || undefined,
          file: n.file || undefined,
          audience: n.audience || undefined,
          page: n.page ?? null,
        };
      })
    : [];

  return NextResponse.json({
    ok: true,
    reply: aiResult.reply,
    answer: aiResult.reply,
    sources,
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "api/chat" });
}
