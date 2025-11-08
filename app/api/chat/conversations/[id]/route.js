// app/api/chat/conversations/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
const CONVERSATION_TTL_MS = Math.max(1, Number(process.env.CONVERSATION_TTL_DAYS || 90)) * 24 * 60 * 60 * 1000;
/* ---------- tiny utils ---------- */
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
function noContent() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
function isDbOffline(err) {
  return (
    err?.code === "P1001" ||
    err?.code === "P1017" ||
    err?.name === "PrismaClientInitializationError" ||
    err?.name === "PrismaClientRustPanicError"
  );
}
function conversationExpiryDate() {
  return new Date(Date.now() + CONVERSATION_TTL_MS);
}
// id on string; lubame mõistliku pikkuse
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  return id.length >= 8 && id.length <= 200;
}
function ensureOwnedOrAdmin(row, auth) {
  if (!row) return { ok: false, status: 404, message: "not-found" };
  if (auth.isAdmin) return { ok: true };
  if (row.userId !== auth.userId) return { ok: false, status: 403, message: "forbidden" };
  return { ok: true };
}
/* ---------- Auth ---------- */
async function getAuthOptions() {
  try {
    const mod = await import("@/pages/api/auth/[...nextauth]");
    return mod.authOptions || mod.default || mod.authConfig;
  } catch {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
    }
  }
}
async function requireUser() {
  try {
    const { getServerSession } = await import("next-auth/next");
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { ok: false, status: 401, message: "Unauthorized" };
    return { ok: true, userId: session.user.id, isAdmin: !!session.user.isAdmin };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}
/* ---------- GET: loe ühe vestluse meta ---------- */
export async function GET(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);
  try {
    const row = await prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        role: true,
        title: true,
        summary: true,
        lastActivityAt: true,
        archivedAt: true,
      },
    });
    const gate = ensureOwnedOrAdmin(row, auth);
    if (!gate.ok) return json({ ok: false, message: gate.message }, gate.status);
    if (row.archivedAt) {
      return json({ ok: false, message: "not-found" }, 404);
    }
    const previewSource = row.summary || "";
    return json({
      ok: true,
      conversation: {
        id: row.id,
        role: row.role,
        lastActivityAt: row.lastActivityAt,
        title: row.title || "Vestlus",
        preview: previewSource?.slice?.(0, 160) ?? "",
      },
    });
  } catch (err) {
    if (isDbOffline(err)) {
      return json(
        { ok: false, degraded: true, message: "Andmebaas pole kättesaadav." },
        503
      );
    }
    return json(
      { ok: false, message: "Database error while reading conversation", error: err?.message },
      500
    );
  }
}
/* ---------- DELETE: soft-delete (idempotent) ---------- */
export async function DELETE(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);
  try {
    const existing = await prisma.conversation.findUnique({ where: { id }, select: { userId: true, archivedAt: true } });
    const gate = ensureOwnedOrAdmin(existing, auth);
    if (!gate.ok) return json({ ok: false, message: gate.message }, gate.status);
    if (existing.archivedAt) {
      return noContent(); // idempotent
    }
    await prisma.conversation.update({
      where: { id },
      data: {
        archivedAt: new Date(),
        expiresAt: new Date(),
      },
    });
    return noContent();
  } catch (err) {
    if (isDbOffline(err)) {
      return json(
        { ok: false, degraded: true, message: "Andmebaas pole kättesaadav." },
        503
      );
    }
    return json(
      { ok: false, message: "Database error while deleting conversation", error: err?.message },
      500
    );
  }
}
/* ---------- PUT: restore arhiveeritud vestlus ---------- */
export async function PUT(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);
  try {
    const existing = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, userId: true, archivedAt: true, role: true, lastActivityAt: true },
    });
    const gate = ensureOwnedOrAdmin(existing, auth);
    if (!gate.ok) return json({ ok: false, message: gate.message }, gate.status);
    if (!existing.archivedAt) {
      return json({
        ok: true,
        conversation: {
          id: existing.id,
          role: existing.role,
          lastActivityAt: existing.lastActivityAt,
        },
      });
    }
    const row = await prisma.conversation.update({
      where: { id },
      data: {
        archivedAt: null,
        expiresAt: conversationExpiryDate(),
      },
      select: { id: true, role: true, lastActivityAt: true },
    });
    return json({ ok: true, conversation: row });
  } catch (err) {
    if (isDbOffline(err)) {
      return json(
        { ok: false, degraded: true, message: "Andmebaas pole kättesaadav." },
        503
      );
    }
    return json(
      { ok: false, message: "Database error while restoring conversation", error: err?.message },
      500
    );
  }
}
