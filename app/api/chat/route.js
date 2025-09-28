import { NextResponse } from "next/server";
import OpenAI from "openai";
import { searchRag } from "@/lib/ragClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

let openaiClient = null;
function getOpenAIClient() {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

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
      const title = match?.metadata?.title || match?.metadata?.fileName || match?.metadata?.url || "Allikas";
      const source = match?.metadata?.url || match?.metadata?.storedHtml || match?.metadata?.storedFile || "";
      const audience = match?.metadata?.audience;
      const body = (match?.text || "").trim();
      const distance = typeof match?.distance === "number" ? ` (score: ${(1 - match.distance).toFixed(3)})` : "";
      const lines = [
        `${header} ${title}${distance}`,
        body ? body : "(sisukokkuvõte puudub)",
      ];
      if (audience) {
        lines.push(`Sihtgrupp: ${audience}`);
      }
      if (source) {
        lines.push(`Viide: ${source}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

async function callOpenAI({ history, userMessage, context, role }) {
  const client = getOpenAIClient();
  const messages = [];

  const effectiveRole = role === "ADMIN" ? "SOCIAL_WORKER" : role || "CLIENT";
  const roleLabel = ROLE_LABELS[effectiveRole] || ROLE_LABELS.CLIENT;
  const roleBehaviour = ROLE_BEHAVIOUR[effectiveRole] || ROLE_BEHAVIOUR.CLIENT;

  const systemPrompt = `Sa oled SotsiaalAI tehisassistendina toimiv abivahend. Vestluspartner on ${roleLabel}. ${roleBehaviour} Kasuta üksnes allolevat konteksti; kui kontekstist ei piisa, ütle seda ausalt ja soovita sobivaid järgmisi samme.`;
  messages.push({ role: "system", content: systemPrompt });

  if (context) {
    messages.push({
      role: "system",
      content: `Kontekst vastamiseks:\n\n${context}`,
    });
  }

  if (history.length) {
    messages.push(...history);
  }

  messages.push({ role: "user", content: userMessage });

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    temperature: 0.3,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  const choice = completion?.choices?.[0]?.message?.content?.trim();
  return {
    reply: choice || "Vabandust, ma ei saanud praegu vastust koostada.",
  };
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch (_) {
    return makeError("Keha peab olema JSON.");
  }

  const message = String(payload?.message || "").trim();
  if (!message) {
    return makeError("Sõnum on kohustuslik.");
  }

  const historyInput = Array.isArray(payload?.history) ? payload.history : [];
  const history = toOpenAiMessages(historyInput);

  const rawRole = typeof payload?.role === "string" ? payload.role.toUpperCase().trim() : "";
  const allowedRoles = new Set(["CLIENT", "SOCIAL_WORKER", "ADMIN"]);
  const role = allowedRoles.has(rawRole) ? rawRole : "CLIENT";
  const normalizedRole = role === "ADMIN" ? "SOCIAL_WORKER" : role;

  const audienceFilter = role === "ADMIN"
    ? undefined
    : { audience: { $in: [normalizedRole, "BOTH"] } };

  const ragResponse = await searchRag({ query: message, topK: 5, filters: audienceFilter });
  if (!ragResponse?.ok) {
    const ragMessage = ragResponse?.message || "RAG teenus ei vastanud.";
    return makeError(ragMessage, ragResponse?.status || 502);
  }

  const matches = ragResponse?.data?.matches || [];
  const context = buildContextBlocks(matches);

  let aiResult;
  try {
    aiResult = await callOpenAI({ history, userMessage: message, context, role });
  } catch (err) {
    const errMessage = err?.message || "OpenAI päring ebaõnnestus.";
    return makeError(errMessage, 502, { code: err?.name });
  }

  return NextResponse.json({
    ok: true,
    reply: aiResult.reply,
    sources: matches.map((match) => ({
      id: match.id,
      title: match?.metadata?.title || match?.metadata?.fileName || match?.metadata?.url,
      url: match?.metadata?.url,
      file: match?.metadata?.storedFile,
      audience: match?.metadata?.audience,
    })),
  });
}
