// app/api/chat/route.js
import { NextResponse } from "next/server";

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

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini"; // pane siia päris mudel, mis sul on

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

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

async function callOpenAI({ history, userMessage, context, effectiveRole }) {
  // 🔧 dünaamiline import – väldib bundleri “e is not a function” viga
  const { default: OpenAI } = await import("openai");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey });

  const roleLabel = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  const roleBehaviour = ROLE_BEHAVIOUR[effectiveRole] || ROLE_BEHAVIOUR.CLIENT;

  const systemPrompt =
    `Sa oled SotsiaalAI tehisassistendina toimiv abivahend. ` +
    `Vestluspartner on ${roleLabel}. ${roleBehaviour} ` +
    `Kasuta üksnes allolevat konteksti; kui kontekstist ei piisa, ütle seda ausalt ` +
    `ja soovita sobivaid järgmisi samme.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...(context ? [{ role: "system", content: `Kontekst vastamiseks:\n\n${context}` }] : []),
    ...(Array.isArray(history) ? history : []),
    { role: "user", content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    temperature: 0.3,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  const reply =
    completion?.choices?.[0]?.message?.content?.trim() ||
    "Vabandust, ma ei saanud praegu vastust koostada.";
  return { reply };
}

export async function POST(req) {
  // 🔧 dünaamilised importid – next-auth ja authOptions
  const { getServerSession } = await import("next-auth/next");
  const { authOptions } = await import("@/pages/api/auth/[...nextauth]");
  // 🔧 rag-kliendi dünaamiline import
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

  // 2) sessioon (v4)
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // lubame anonüümselt jätkata
  }

  // 3) roll – sessioon > payload; ADMIN käitub nagu SOCIAL_WORKER
  const payloadRole =
    typeof payload?.role === "string" ? payload.role.toUpperCase().trim() : "";
  const allowedRoles = new Set(["CLIENT", "SOCIAL_WORKER", "ADMIN"]);
  const claimedRole = allowedRoles.has(payloadRole) ? payloadRole : "CLIENT";

  const sessionRoleRaw =
    session?.user?.role || (session?.user?.isAdmin ? "ADMIN" : null);
  const sessionRole = sessionRoleRaw
    ? String(sessionRoleRaw).toUpperCase()
    : null;

  const role = sessionRole || claimedRole;
  const normalizedRole = role === "ADMIN" ? "SOCIAL_WORKER" : role;

  // 4) RAG filtrid
  const audienceFilter =
    role === "ADMIN"
      ? undefined
      : { audience: { $in: [normalizedRole, "BOTH"] } };

  // 5) RAG otsing
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

  // 6) OpenAI vastus
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

  // 7) allikad
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
