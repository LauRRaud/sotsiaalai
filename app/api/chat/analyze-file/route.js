export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { normalizeRole, requireSubscription } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getAnalyzeLimit, utcDayStart, secondsUntilUtcMidnight } from "@/lib/analyzeQuota";

const RAG_PROXY_PATH = "/api/rag/analyze";
const MAX_MB = Number(process.env.NEXT_PUBLIC_RAG_MAX_UPLOAD_MB || 50);

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

export async function POST(request) {
  // Auth + gate (CLIENT, SOCIAL_WORKER, ADMIN; same policy as chat)
  const session = await getServerSession(authConfig).catch(() => null);
  const pickedRole = (session?.user?.role || "CLIENT").toString().toUpperCase();
  const role = normalizeRole(pickedRole);
  const gate = await requireSubscription(session, role);
  if (!gate.ok) {
    return json({ ok: false, message: gate.message, redirect: gate.redirect, requireSubscription: gate.requireSubscription }, gate.status);
  }

  // Daily quota check (persistent via Prisma)
  const userId = String(session?.user?.id || "");
  const day = utcDayStart();
  const isAdmin = !!session?.user?.isAdmin || pickedRole === "ADMIN";
  const limit = getAnalyzeLimit(role, isAdmin);
  try {
    await prisma.$transaction(async (tx) => {
      // Ensure row exists
      await tx.analyzeUsage.upsert({
        where: { userId_day: { userId, day } },
        create: { userId, day, count: 0 },
        update: {},
      });
      // Try to increment only if under limit
      const updated = await tx.analyzeUsage.updateMany({
        where: { userId, day, count: { lt: limit } },
        data: { count: { increment: 1 } },
      });
      if (updated.count === 0) {
        const err = new Error("quota_exceeded");
        err.code = "QUOTA";
        throw err;
      }
    });
  } catch (e) {
    if (e?.code === "QUOTA") {
      const retry = secondsUntilUtcMidnight();
      return new NextResponse(
        JSON.stringify({ ok: false, message: "Oled täna analüüsi limiidi täis. Proovi uuesti homme." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retry) } }
      );
    }
    // other DB errors fall through to normal processing (we don't block analysis)
  }

  // Parse multipart
  let fd;
  try {
    fd = await request.formData();
  } catch {
    return json({ ok: false, message: "Viga: oodati multipart-vormi." }, 400);
  }
  const file = fd.get("file");
  if (!file || typeof file === "string") return json({ ok: false, message: "Fail on kohustuslik." }, 400);
  const sizeMB = (file.size || 0) / (1024 * 1024);
  if (sizeMB > MAX_MB) return json({ ok: false, message: `Fail on liiga suur (${sizeMB.toFixed(1)}MB > ${MAX_MB}MB).` }, 413);

  // Repackage to new FormData to forward to rag proxy
  const forward = new FormData();
  forward.append("file", file, file.name || "file");
  // optional passthroughs
  const mimeType = fd.get("mimeType");
  if (mimeType && typeof mimeType === "string") forward.append("mimeType", mimeType);
  const maxChunks = fd.get("maxChunks");
  if (maxChunks && typeof maxChunks === "string") forward.append("maxChunks", maxChunks);

  // Forward to internal RAG proxy (which adds X-API-Key)
  try {
    const res = await fetch(RAG_PROXY_PATH, { method: "POST", body: forward, cache: "no-store" });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    if (!res.ok) {
      return json({ ok: false, message: data?.message || `RAG analüüs ebaõnnestus (${res.status}).` }, res.status);
    }
    // Decorate with privacy note
    return json({ ok: true, privacy: { ephemeral: true, note: "Ei salvestata püsivalt." }, ...data });
  } catch (e) {
    return json({ ok: false, message: "RAG analüüsi teenus ei vasta." }, 502);
  }
}
