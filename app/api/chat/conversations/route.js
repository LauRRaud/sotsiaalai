// app/api/chat/conversations/route.js
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

function normalizeRole(role) {
  const r = String(role || "CLIENT").toUpperCase().trim();
  return r === "ADMIN" ? "SOCIAL_WORKER" : (r === "SOCIAL_WORKER" || r === "CLIENT" ? r : "CLIENT");
}

/* ---------- GET: tagasta kasutaja vestlused (pagineeritult, v.a. DELETED) ----------
   Query:
     - limit: 1..50 (vaikimisi 20)
     - cursor: "timestamp_ms:id" (näiteks "1733838123456:abc-123")
*/
export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 20);
  const limit = Math.max(1, Math.min(50, Number.isFinite(limitParam) ? limitParam : 20));

  try {
    const rows = await prisma.conversationRun.findMany({
      where: {
        userId: auth.userId,
        NOT: { status: "DELETED" },
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: limit,
      select: { id: true, updatedAt: true, status: true, text: true, role: true },
    });

    const items = rows.map((r) => {
      const preview = (r.text || "").trim().slice(0, 120);
      return {
        id: r.id,
        status: r.status,
        updatedAt: r.updatedAt,
        role: r.role,
        title: preview || "Vestlus",
        preview,
      };
    });

    return json({ ok: true, conversations: items, nextCursor: null });
  } catch (err) {
    return json(
      { ok: false, message: "Database error while listing conversations", error: err?.message },
      500,
    );
  }
}

/* ---------- POST: loo/registreeri (idempotent) vestlus ----------
   Body: { id?: string, role?: "CLIENT"|"SOCIAL_WORKER"|"ADMIN" }
   - Kui id puudub, luuakse serveris random UUID.
   - ADMIN normaliseeritakse SOCIAL_WORKER-iks.
*/
export async function POST(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  let convId = String(body?.id || "").trim();
  const role = normalizeRole(body?.role);

  if (!convId) {
    // serveripoolne fallback
    try {
      const { randomUUID } = await import("node:crypto");
      convId = randomUUID();
    } catch {
      convId = String(Date.now());
    }
  }

  try {
    const row = await prisma.conversationRun.upsert({
      where: { id: convId },
      update: { userId: auth.userId, role, status: "RUNNING", updatedAt: new Date() },
      create: { id: convId, userId: auth.userId, role, status: "RUNNING", text: "" },
      select: { id: true, updatedAt: true, status: true, role: true, text: true },
    });

    return json({
      ok: true,
      conversation: {
        id: row.id,
        status: row.status,
        updatedAt: row.updatedAt,
        role: row.role,
        title: (row.text || "").slice(0, 120) || "Vestlus",
      },
    });
  } catch (err) {
    return json(
      { ok: false, message: "Database error while creating conversation", error: err?.message },
      500,
    );
  }
}
