// app/api/chat/conversations/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, status: 401, message: "Unauthorized" };
  return { ok: true, userId: session.user.id, isAdmin: !!session.user.isAdmin };
}

/* ---------- Utils ---------- */
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

// very light sanity check (ConversationRun.id in your schema is string, often uuid/random)
// adjust if you want stricter rules
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
      // idempotent: already deleted -> 204 No Content
      return noContent();
    }

    await prisma.conversationRun.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
    });

    // no body for idempotent delete
    return noContent();
  } catch (err) {
    return json(
      { ok: false, message: "Database error while deleting conversation", error: err?.message },
      500
    );
  }
}

/* ---------- PUT: restore from DELETED -> RUNNING ---------- */
export async function PUT(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const id = params?.id ? String(params.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);

  try {
    const existing = await prisma.conversationRun.findUnique({ where: { id } });
    const gate = ensureOwnedOrAdmin(existing, auth);
    if (!gate.ok) return json({ ok: false, message: gate.message }, gate.status);

    // If not deleted, treat as idempotent "already restored"
    if (existing.status !== "DELETED") {
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
    return json(
      { ok: false, message: "Database error while restoring conversation", error: err?.message },
      500
    );
  }
}
