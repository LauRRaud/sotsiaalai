// app/api/chat/conversations/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ---------- Auth loader ---------- */
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
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
  return { ok: true, userId: session.user.id, isAdmin: !!session.user.isAdmin };
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

/* ---------- GET: tagasta konkreetne vestlus (meta + lühike eelvaade) ---------- */
export async function GET(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const convId = params?.id ? String(params.id) : "";
  if (!convId) return json({ ok: false, message: "id on kohustuslik" }, 400);

  try {
    const row = await prisma.conversationRun.findUnique({
      where: { id: convId },
      select: {
        id: true,
        userId: true,
        status: true,
        role: true,
        text: true,
        sources: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    if (!row) return json({ ok: false, message: "Not found" }, 404);
    if (!auth.isAdmin && row.userId !== auth.userId) {
      return json({ ok: false, message: "Forbidden" }, 403);
    }
    if (row.status === "DELETED") {
      return json({ ok: false, message: "Conversation is deleted" }, 404);
    }

    const preview = (row.text || "").trim().slice(0, 200);

    return json({
      ok: true,
      conversation: {
        id: row.id,
        status: row.status,          // RUNNING | COMPLETED | ERROR
        role: row.role,              // CLIENT | SOCIAL_WORKER
        updatedAt: row.updatedAt,
        createdAt: row.createdAt,
        title: preview || "Vestlus",
        preview,
        // NB! Täisteksti ei tagasta siit — selleks kasutate /api/chat/run?convId=...
      },
    });
  } catch (err) {
    return json(
      { ok: false, message: "Database error while reading conversation", error: err?.message },
      500,
    );
  }
}

/* ---------- DELETE: soft delete (märgi DELETED + tühjenda tekst/sources) ---------- */
export async function DELETE(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const convId = params?.id ? String(params.id) : "";
  if (!convId) return json({ ok: false, message: "id on kohustuslik" }, 400);

  try {
    const existing = await prisma.conversationRun.findUnique({
      where: { id: convId },
      select: { id: true, userId: true },
    });

    if (!existing) return json({ ok: false, message: "Not found" }, 404);
    if (!auth.isAdmin && existing.userId !== auth.userId) {
      return json({ ok: false, message: "Forbidden" }, 403);
    }

    await prisma.conversationRun.update({
      where: { id: convId },
      data: {
        status: "DELETED",
        text: "",
        sources: [],
        updatedAt: new Date(),
      },
    });

    return json({ ok: true, deleted: true, id: convId });
  } catch (err) {
    return json(
      { ok: false, message: "Database error while deleting conversation", error: err?.message },
      500,
    );
  }
}
