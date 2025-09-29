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

/** RAG vasted üheks kontekstiplokiks */
function buildContextBlocks(matches) {
  if (!Array.isArray(matches) || matches.length === 0) return "";
  return matches
    .map((match, idx) => {
      const header = `(${idx + 1})`;
      const title =
        match?.metadata?.title ||
        match?.metadata?.fileName ||
        match?.metadata?.url ||
        "Allikas";
      const source =
        match?.metadata?.url ||
        match?.metadata?.storedHtml ||
        match?.metadata?.storedFile ||
        "";
      const audience = match?.metadata?.audience;
      const body = (match?.text || "").trim();
      const distance =
        typeof match?.distance === "number"
          ? ` (score: ${(1 - match.distance).toFixed(3)})`
          : "";
      const lines = [
        `${header} ${title}${distance}`,
        body ? body : "(sisukokkuvõte puudub)",
      ];
      if (audience) lines.push(`Sihtgrupp: ${audience}`);
      if (source) lines.push(`Viide: ${source}`);
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

/** OpenAI Responses API kutse (sobib gpt-5-mini'le) */
async function callOpenAI({ history, userMessage, context, effectiveRole }) {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey });
  const input = toResponsesInput({ history, userMessage, context, effectiveRole });

  const resp = await client.responses.create({
    model: DEFAULT_MODEL,
    input,
    temperature: 0.3,
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
    // kui kasutad App Routeri authi (auth.js)
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

  const history = toOpenAiMessages(
    Array.isArray(payload?.history) ? payload.history : []
  );

  // 2) sessioon (lubame ka anonüümselt, aga vestluseks nõuame login'i)
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

  // 6) RAG otsing
  const ragResponse = await searchRag({
    query: message,
    topK: 5,
    filters: audienceFilter,
  });
  if (!ragResponse?.ok) {
    const ragMessage = ragResponse?.message || "RAG teenus ei vastanud.";
    const status = ragResponse?.auth ? 502 : ragResponse?.status || 502;
    return makeError(ragMessage, status);
  }
  const matches = ragResponse?.data?.matches || [];
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
    const errMessage = err?.message || "OpenAI päring ebaõnnestus.";
    return makeError(errMessage, 502, { code: err?.name });
  }

  // 8) allikad vastusesse
  const sources = matches.map((m) => ({
    id: m.id,
    title: m?.metadata?.title || m?.metadata?.fileName || m?.metadata?.url,
    url: m?.metadata?.url,
    file: m?.metadata?.storedFile,
    audience: m?.metadata?.audience,
    page: m?.metadata?.page ?? m?.page ?? null,
  }));

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
