import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
function isDbOffline(err) {
  return (
    err?.code === "P1001" ||
    err?.code === "P1017" ||
    err?.name === "PrismaClientInitializationError" ||
    err?.name === "PrismaClientRustPanicError"
  );
}
function parseCursor(token) {
  if (!token || typeof token !== "string") return null;
  const [msPart, id] = token.split(":");
  const ms = Number(msPart);
  if (!Number.isFinite(ms) || !id) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return { date, id };
}
function encodeCursor(row) {
  try {
    const ms = row.createdAt instanceof Date ? row.createdAt.getTime() : new Date(row.createdAt).getTime();
    if (!Number.isFinite(ms)) return null;
    return `${ms}:${row.id}`;
  } catch {
    return null;
  }
}
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  return id.length >= 8 && id.length <= 200;
}

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

export async function GET(req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  if (!isPlausibleId(id)) return json({ ok: false, message: "id invalid" }, 400);

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 50);
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitParam) ? limitParam : 50));
  const beforeToken = url.searchParams.get("before");
  const beforeCursor = parseCursor(beforeToken);

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, userId: true, archivedAt: true },
    });
    if (!conversation || conversation.archivedAt) {
      return json({ ok: false, message: "not-found" }, 404);
    }
    if (!auth.isAdmin && conversation.userId !== auth.userId) {
      return json({ ok: false, message: "forbidden" }, 403);
    }

    const baseWhere = { conversationId: id };
    const cursorWhere = beforeCursor
      ? {
          OR: [
            { createdAt: { lt: beforeCursor.date } },
            { AND: [{ createdAt: beforeCursor.date }, { id: { lt: beforeCursor.id } }] },
          ],
        }
      : null;

    const rows = await prisma.conversationMessage.findMany({
      where: cursorWhere ? { AND: [baseWhere, cursorWhere] } : baseWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      select: {
        id: true,
        role: true,
        content: true,
        metadata: true,
        createdAt: true,
      },
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const items = [...pageRows].reverse().map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      metadata: row.metadata,
      createdAt: row.createdAt,
    }));
    const oldest = items[0];
    const nextCursor = hasMore && oldest ? encodeCursor(oldest) : null;

    return json({ ok: true, items, nextCursor });
  } catch (err) {
    if (isDbOffline(err)) {
      return json(
        { ok: false, degraded: true, message: "Andmebaas pole kättesaadav." },
        503
      );
    }
    return json(
      { ok: false, message: "Database error while loading messages", error: err?.message },
      500
    );
  }
}
