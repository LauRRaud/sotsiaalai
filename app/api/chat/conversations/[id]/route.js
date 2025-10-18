// app/api/chat/conversations/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

// ConversationRun.id on string; lubame mõistliku pikkuse
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

  const id = params?.id ? String(params.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);

  try {
    const row = await prisma.conversationRun.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        updatedAt: true,
        status: true,
        role: true,
        text: true,
      },
    });
    const gate = ensureOwnedOrAdmin(row, auth);
    if (!gate.ok) return json({ ok: false, message: gate.message }, gate.status);

    return json({
      ok: true,
      conversation: {
        id: row.id,
        status: row.status,
        role: row.role,
        updatedAt: row.updatedAt,
        title: (row.text || "").trim().slice(0, 120) || "Vestlus",
        preview: (row.text || "").trim().slice(0, 120),
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

  const id = params?.id ? String(params.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);

  try {
    const existing = await prisma.conversationRun.findUnique({ where: { id } });
    const gate = ensureOwnedOrAdmin(existing, auth);
    if (!gate.ok) return json({ ok: false, message: gate.message }, gate.status);

    if (existing.status === "DELETED") {
      return noContent(); // idempotent
    }

    await prisma.conversationRun.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
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

/* ---------- PUT: restore DELETED -> RUNNING (idempotent) ---------- */
export async function PUT(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const id = params?.id ? String(params.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);

  try {
    const existing = await prisma.conversationRun.findUnique({ where: { id } });
    const gate = ensureOwnedOrAdmin(existing, auth);
    if (!gate.ok) return json({ ok: false, message: gate.message }, gate.status);

    if (existing.status !== "DELETED") {
      // idempotent: juba "mitte-deleted"
      return json({
        ok: true,
        conversation: {
          id: existing.id,
          status: existing.status,
          updatedAt: existing.updatedAt,
        },
      });
    }

    const row = await prisma.conversationRun.update({
      where: { id },
      data: { status: "RUNNING", updatedAt: new Date() },
      select: { id: true, status: true, updatedAt: true },
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
