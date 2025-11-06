// app/api/rag/selftest/route.js
import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RAW_RAG_HOST = (process.env.RAG_INTERNAL_HOST || "127.0.0.1:8000").trim();
const RAG_KEY = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();
const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 30_000);
const ALLOW_EXTERNAL = process.env.ALLOW_EXTERNAL_RAG === "1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

const LOCAL_HOST_RE = /^(127\.0\.0\.1|localhost|\[?::1\]?)(:\d+)?$/i;

function normalizeBaseFromHost(host) {
  const trimmed = String(host || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "http://127.0.0.1:8000";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}
function isLocalBaseUrl(url) {
  try {
    const parsed = new URL(url);
    return LOCAL_HOST_RE.test(parsed.host);
  } catch {
    return false;
  }
}

async function getSession() {
  const { getServerSession } = await import("next-auth/next");
  let authOptions;
  try {
    const mod = await import("@/pages/api/auth/[...nextauth]");
    authOptions = mod.authOptions || mod.default || mod.authConfig;
  } catch {
    authOptions = undefined;
  }
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

async function ragFetch(path, init = {}) {
  const base = normalizeBaseFromHost(RAW_RAG_HOST);
  if (!ALLOW_EXTERNAL && !isLocalBaseUrl(base)) {
    throw new Error(
      "RAG_INTERNAL_HOST osutab välisele aadressile. Luba see ALLOW_EXTERNAL_RAG=1 keskkonnamuutujaga."
    );
  }
  if (!RAG_KEY) {
    throw new Error("RAG_SERVICE_API_KEY on seadistamata.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);
  try {
    const headers = new Headers(init.headers);
    headers.set("X-API-Key", RAG_KEY);
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");

    const res = await fetch(`${base}${path}`, {
      method: init.method || "GET",
      body: init.body,
      cache: "no-store",
      headers,
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!res.ok) {
      const msg = data?.message || `RAG vastas koodiga ${res.status}`;
      throw new Error(msg);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function runStep(steps, name, fn) {
  const step = { name, ok: false };
  try {
    await fn();
    step.ok = true;
  } catch (err) {
    step.ok = false;
    step.error = err?.message || "Tundmatu viga";
  }
  steps.push(step);
  return step.ok;
}

export async function POST() {
  const session = await getSession();
  const authz = assertAdmin(session);
  if (!authz.ok) {
    return json({ ok: false, message: authz.message }, authz.status);
  }

  const steps = [];
  await runStep(steps, "Kontrollin RAG ühendust", async () => {
    await ragFetch("/documents?limit=1");
  });

  await runStep(steps, "Teen RAG otsingu", async () => {
    await ragFetch("/search", {
      method: "POST",
      body: JSON.stringify({ query: "tervitus", top_k: 1 }),
    });
  });

  await runStep(steps, "Kontrollin OpenAI vastust", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY on seadistamata.");
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });
    const resp = await client.responses.create({
      model: OPENAI_MODEL,
      input: "Ütle lühidalt: OK",
      temperature: 0,
    });
    const text = resp?.output_text ? resp.output_text.trim() : "";
    if (!text) throw new Error("OpenAI ei tagastanud vastust.");
    steps[steps.length - 1].detail = text.slice(0, 60);
  });

  return json({ ok: steps.every((s) => s.ok), steps });
}
