// app/api/rag-admin/documents/route.js
import { NextResponse } from "next/server";
import { normalizeRagBase } from "@/lib/rag";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RAG_TIMEOUT_MS = Number(process.env.RAG_TIMEOUT_MS || 12_000);

/* ---------- headers & json helper ---------- */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};
const json = (data, status = 200) =>
  NextResponse.json(data, { status, headers: NO_STORE });

/* ---------- Auth helpers ---------- */
  async function getAuthOptions() {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
    }
  }
async function requireAdmin() {
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  const isAdmin =
    !!session?.user?.isAdmin ||
    String(session?.user?.role || "").toUpperCase() === "ADMIN";
  if (!session?.user?.id) return { ok: false, status: 401, message: "Logi sisse." };
  if (!isAdmin) return { ok: false, status: 403, message: "Pole õigusi." };
  return { ok: true, userId: session.user.id, session };
}

/* ---------- RAG helpers (valikuline chunkide toomine) ---------- */
const normBase = normalizeRagBase;
async function fetchDocCountFromRag(ragBase, apiKey, remoteId) {
  if (!ragBase || !apiKey || !remoteId) return null;
  const url = `${ragBase}/documents/${encodeURIComponent(remoteId)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return Number.isFinite(data?.chunks) ? data.chunks : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/* ---------- GET ---------- */
export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") || 50))
  );

  const { prisma } = await import("@/lib/prisma");

  let rows = [];
  try {
    rows = await prisma.ragDocument.findMany({
      take: limit,
      orderBy: [{ updatedAt: "desc" }],
      include: {
        admin: { select: { email: true } }, // kui seos on olemas; kui mitte, ei tee paha
      },
    });
  } catch (err) {
    return json(
      { ok: false, message: "Andmebaasi viga dokumentide laadimisel.", error: err?.message },
      500
    );
  }

  // Valikuline: proovi tuua chunkide arv RAG-ist (kui env on olemas).
  const ragBaseEnv = normBase(process.env.RAG_API_BASE || "");
  const ragKey = (process.env.RAG_SERVICE_API_KEY || process.env.RAG_API_KEY || "").trim();

  // Piira samaaegseid RAG päringuid (lihtne throttling)
  const CONCURRENCY = 4;
  const queue = rows.map((row) => async () => {
    const remoteId = row.remoteId || row.id;
    const chunks = await fetchDocCountFromRag(ragBaseEnv, ragKey, remoteId);
    return { id: row.id, chunks };
  });

  const results = [];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const job = queue.shift();
      if (!job) break;
      results.push(await job());
    }
  });
  await Promise.all(workers);
  const chunksMap = new Map(results.map((r) => [r.id, r.chunks]));

  const out = rows.map((d) => {
    const status = d.status || "COMPLETED";
    const base = {
      id: d.id,
      docId: d.id,
      remoteId: d.remoteId || null,
      status,
      title: d.title || null,
      description: d.description || null,
      type: d.type || (d.sourceUrl ? "URL" : "FILE"),
      fileName: d.fileName || null,
      sourceUrl: d.sourceUrl || d.url || null,
      mimeType: d.mimeType || null,
      audience: d.audience || "BOTH",
      authors: d.authors || null,
      journalTitle: d.journalTitle || null,
      createdAt: d.createdAt || null,
      updatedAt: d.updatedAt || null,
      lastIngested: d.insertedAt || d.lastIngested || null,
      insertedAt: d.insertedAt || null,
      fileSize: d.fileSize || null,
      error: d.error || null,
      admin: d.admin ? { email: d.admin.email } : null,
    };
    const chunks = chunksMap.get(d.id);
    return typeof chunks === "number" ? { ...base, chunks } : base;
  });

  return json(out);
}
