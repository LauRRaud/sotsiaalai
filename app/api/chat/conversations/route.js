// app/api/chat/conversations/route.js
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
function normalizeRole(role) {
  const r = String(role || "CLIENT").toUpperCase().trim();
  if (r === "ADMIN") return "SOCIAL_WORKER"; // ADMIN mapitakse mudelis sotsiaaltöötajaks
  return r === "SOCIAL_WORKER" || r === "CLIENT" ? r : "CLIENT";
}
/* ---------- Auth loader ---------- */
async function getAuthOptions() {
  // Püüa esmalt NextAuth klassikaline asukoht
  try {
    const mod = await import("@/pages/api/auth/[...nextauth]");
    return mod.authOptions || mod.default || mod.authConfig;
  } catch {
    // App routeri /auth fallback
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
    if (!session?.user?.id) {
      return { ok: false, status: 401, message: "Unauthorized" };
    }
    return {
      ok: true,
      userId: session.user.id,
      isAdmin: !!session.user.isAdmin,
    };
  } catch {
    // Kui NextAuth pole üldse konfitud
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}
/* ---------- Cursor helpers (epochMs:id) ---------- */
function encodeCursor(d, id) {
  try {
    const ms = d instanceof Date ? d.getTime() : Number(new Date(d).getTime());
    if (!Number.isFinite(ms)) return null;
    return `${ms}:${id}`;
  } catch {
    return null;
  }
}
function parseCursor(cur) {
  if (!cur || typeof cur !== "string") return null;
  const [msStr, id] = cur.split(":");
  const ms = Number(msStr);
  if (!Number.isFinite(ms) || !id) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return { date, id };
}
/* ---------- Prisma error guard ---------- */
function isDbOffline(err) {
  return (
    err?.code === "P1001" || // Can't reach database server
    err?.code === "P1017" || // Server closed the connection
    err?.name === "PrismaClientInitializationError" ||
    err?.name === "PrismaClientRustPanicError"
  );
}
/* =========================================================================
   GET: pagineeritud nimekiri (v.a. DELETED)
   Query:
     - limit: 1..50 (vaikimisi 20)
     - cursor: "epochMs:id"
     - role: CLIENT | SOCIAL_WORKER | ADMIN (valikuline filter – ADMIN->SOCIAL_WORKER)
   ========================================================================= */
export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);
  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 20);
  const limit = Math.max(1, Math.min(50, Number.isFinite(limitParam) ? limitParam : 20));
  const cursorToken = url.searchParams.get("cursor");
  const parsed = parseCursor(cursorToken);
  const roleParam = url.searchParams.get("role");
  const roleFilter = roleParam ? normalizeRole(roleParam) : null;
  // page-size + 1, et tuvastada kas on nextCursor
  const take = limit + 1;
  try {
    const baseWhere = {
      userId: auth.userId,
      NOT: { status: "DELETED" },
      ...(roleFilter ? { role: roleFilter } : {}),
    };
    // Kursori loogika: sort on (updatedAt desc, id desc).
    // Järgmise lehe jaoks võtame ridu, mille (updatedAt,id) < kursori (lexicographic desc).
    const where = parsed
      ? {
          AND: [
            baseWhere,
            {
              OR: [
                { updatedAt: { lt: parsed.date } },
                { AND: [{ updatedAt: parsed.date }, { id: { lt: parsed.id } }] },
              ],
            },
          ],
        }
      : baseWhere;
    const rows = await prisma.conversationRun.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take,
      select: {
        id: true,
        updatedAt: true,
        status: true,
        text: true,
        role: true,
      },
    });
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const items = pageRows.map((r) => {
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
    const last = pageRows.at(-1);
    const nextCursor = hasMore && last ? encodeCursor(last.updatedAt, last.id) : null;
    return json({ ok: true, conversations: items, nextCursor });
  } catch (err) {
    console.error("[chat/conversations GET] failed", err);
    if (isDbOffline(err)) {
      // Degraaditud režiim – tagasta tühi komplekt, et UI jätkaks tööga
      return json({
        ok: true,
        conversations: [],
        nextCursor: null,
        degraded: true,
        message: "Vestlusi ei õnnestu andmebaasist laadida (ühendus puudub).",
      });
    }
    return json(
      { ok: false, message: "Database error while listing conversations", error: err?.message },
      500,
    );
  }
}
/* =========================================================================
   POST: loo/registreeri (idempotent) vestlus
   Body: { id?: string, role?: "CLIENT"|"SOCIAL_WORKER"|"ADMIN" }
   - Kui id puudub, luuakse serveris UUID (fallbackina timestamp).
   - ADMIN normaliseeritakse SOCIAL_WORKER-iks.
   ========================================================================= */
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
      update: {
        userId: auth.userId,
        role,
        status: "RUNNING",
        updatedAt: new Date(),
      },
      create: {
        id: convId,
        userId: auth.userId,
        role,
        status: "RUNNING",
        text: "",
      },
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
    console.error("[chat/conversations POST] failed", err);
    return json(
      { ok: false, message: "Database error while creating conversation", error: err?.message },
      500,
    );
  }
}
