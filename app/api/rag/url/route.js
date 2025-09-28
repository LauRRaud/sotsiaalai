// app/api/rag/url/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/authz";
import { pushUrlToRag } from "@/lib/ragClient";
import dns from "node:dns/promises";
import { isIP } from "node:net";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AUDIENCE_VALUES = new Set(["SOCIAL_WORKER", "CLIENT", "BOTH"]);

class UrlSafetyError extends Error {
  constructor(message, status = 400, extras = {}) {
    super(message);
    this.status = status;
    this.extras = extras;
  }
}

function normalizeAudience(value) {
  if (!value) return null;
  const str = String(value).toUpperCase().trim();
  return AUDIENCE_VALUES.has(str) ? str : null;
}

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

function sanitizeUrl(value) {
  try {
    if (!value) return null;
    const parsed = new URL(String(value).trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function isPrivateAddress(address) {
  if (!address) return false;
  if (address.startsWith("127.")) return true;
  if (address === "0.0.0.0" || address === "255.255.255.255") return true;

  const parts = address.split(".").map((p) => Number(p));
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }

  const lower = address.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fd")) return true;   // unique local
  return false;
}

async function assertPublicUrl(urlString) {
  const parsed = new URL(urlString);
  const hostname = parsed.hostname;
  if (!hostname) throw new UrlSafetyError("URL-l puudub host.");

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
    return;
  }

  try {
    const records = await dns.lookup(hostname, { all: true });
    const forbidden = records.some((record) => isPrivateAddress(record.address));
    if (forbidden) throw new UrlSafetyError("Privaatvõrgu URL-e ei saa indekseerida.");
  } catch (err) {
    if (err?.code === "ENOTFOUND" || err?.code === "EAI_AGAIN") {
      throw new UrlSafetyError("URL hosti ei õnnestunud lahendada.");
    }
    if (err instanceof UrlSafetyError) throw err;
    throw new UrlSafetyError("URL-i kontroll ebaõnnestus.", 400, { code: err?.code });
  }
}

export async function POST(req) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session)) return makeError("Ligipääs keelatud", 403);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return makeError("Keha peab olema JSON.");
  }

  const url = sanitizeUrl(payload?.url);
  if (!url) return makeError("Palun sisesta korrektne URL.");

  try {
    await assertPublicUrl(url);
  } catch (err) {
    if (err instanceof UrlSafetyError) {
      return makeError(err.message, err.status, err.extras);
    }
    throw err;
  }

  const title = String(payload?.title || url).trim().slice(0, 255);
  const description = payload?.description ? String(payload.description).trim().slice(0, 2000) : null;
  const audience = normalizeAudience(payload?.audience);
  if (!audience) return makeError("Palun vali sihtgrupp.");

  const adminId = session?.user?.id || session?.userId || null;

  const doc = await prisma.ragDocument.create({
    data: {
      title,
      description,
      type: "URL",
      status: "PENDING",
      sourceUrl: url,
      adminId,
      audience,
      metadata: {
        origin: "url",
        requestedAt: new Date().toISOString(),
        audience,
      },
    },
  });

  const ragResult = await pushUrlToRag({
    docId: doc.id,
    url,
    title,
    description,
    audience,
  });

  if (!ragResult?.ok) {
    const failed = await prisma.ragDocument.update({
      where: { id: doc.id },
      data: {
        status: "FAILED",
        error: ragResult?.message || "RAG server ei vastanud.",
      },
    });
    return makeError(
      ragResult?.message || "RAG serveriga ühendus ebaõnnestus.",
      ragResult?.status || 502,
      { doc: failed }
    );
  }

  const updated = await prisma.ragDocument.update({
    where: { id: doc.id },
    data: {
      status: ragResult.data?.status || "PROCESSING",
      remoteId: ragResult.data?.remoteId || null,
      insertedAt: ragResult.data?.insertedAt ? new Date(ragResult.data.insertedAt) : null,
      error: null,
    },
  });

  return NextResponse.json({ ok: true, doc: updated, rag: ragResult.data });
}
