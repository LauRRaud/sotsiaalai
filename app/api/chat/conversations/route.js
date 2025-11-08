// app/api/chat/conversations/route.js
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const CONVERSATION_TTL_DAYS = Number(process.env.CONVERSATION_TTL_DAYS || 90);
const CONVERSATION_TTL_MS = Math.max(1, CONVERSATION_TTL_DAYS) * 24 * 60 * 60 * 1000;

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
  if (r === "ADMIN") return "SOCIAL_WORKER";
  return r === "SOCIAL_WORKER" || r === "CLIENT" ? r : "CLIENT";
}

function encodeCursor(row) {
  try {
    const pin = row.isPinned ? 1 : 0;
    const ms = row.lastActivityAt instanceof Date ? row.lastActivityAt.getTime() : new Date(row.lastActivityAt).getTime();
    if (!Number.isFinite(ms)) return null;
    return `${pin}:${ms}:${row.id}`;
  } catch {
    return null;
  }
}
function parseCursor(token) {
  if (!token || typeof token !== "string") return null;
  const [pinPart, msPart, id] = token.split(":");
  if (!id) return null;
  const ms = Number(msPart);
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  const isPinned = pinPart === "1";
  return { isPinned, date, id };
}
function trimPreview(text = "", max = 160) {
  if (!text) return "";
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}
function fallbackTitle(text = "") {
  const normalized = trimPreview(text, 160);
  if (!normalized) return null;
  const sentence = normalized.split(/[.!?]/)[0]?.trim();
  if (sentence && sentence.length >= 3) return sentence;
  return normalized;
}
function conversationExpiryDate() {
  return new Date(Date.now() + CONVERSATION_TTL_MS);
}

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
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

function isDbOffline(err) {
  return (
    err?.code === "P1001" ||
    err?.code === "P1017" ||
    err?.name === "PrismaClientInitializationError" ||
    err?.name === "PrismaClientRustPanicError"
  );
}

/* =========================================================================
   GET: pagineeritud nimekiri (v.a. archived)
   ========================================================================= */
export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 30);
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitParam) ? limitParam : 30));
  const cursorToken = url.searchParams.get("cursor");
  const parsedCursor = parseCursor(cursorToken);
  const roleParam = url.searchParams.get("role");
  const roleFilter = roleParam ? normalizeRole(roleParam) : null;

  const baseWhere = {
    userId: auth.userId,
    archivedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    ...(roleFilter ? { role: roleFilter } : {}),
  };

  let where = baseWhere;
  if (parsedCursor) {
    const cursorFilters = [];
    if (parsedCursor.isPinned) {
      cursorFilters.push({ isPinned: false });
    }
    cursorFilters.push({
      isPinned: parsedCursor.isPinned,
      OR: [
        { lastActivityAt: { lt: parsedCursor.date } },
        {
          AND: [{ lastActivityAt: parsedCursor.date }, { id: { lt: parsedCursor.id } }],
        },
      ],
    });
    where = {
      AND: [baseWhere, { OR: cursorFilters }],
    };
  }

  try {
    const rows = await prisma.conversation.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { lastActivityAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      select: {
        id: true,
        title: true,
        summary: true,
        lastActivityAt: true,
        isPinned: true,
        role: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true },
        },
      },
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const items = pageRows.map((row) => {
      const previewSource = row.messages?.[0]?.content || row.summary || "";
      const preview = trimPreview(previewSource);
      const title = row.title || fallbackTitle(previewSource) || "Vestlus";
      return {
        id: row.id,
        title,
        preview,
        lastActivityAt: row.lastActivityAt,
        isPinned: row.isPinned,
        role: row.role,
      };
    });
    const last = pageRows.at(-1);
    const nextCursor = hasMore && last ? encodeCursor(last) : null;
    return json({ ok: true, conversations: items, nextCursor });
  } catch (err) {
    console.error("[chat/conversations GET] failed", err);
    if (isDbOffline(err)) {
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
   POST: loo vestlus (idempotent kasutaja piires)
   ========================================================================= */
export async function POST(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  let convId = String(body?.id || "").trim();
  if (!convId) {
    try {
      convId = randomUUID();
    } catch {
      convId = String(Date.now());
    }
  }
  const role = normalizeRole(body?.role);
  const title =
    typeof body?.title === "string" && body.title.trim() ? body.title.trim().slice(0, 160) : null;

  try {
    const existing = await prisma.conversation.findUnique({
      where: { id: convId },
      select: { userId: true },
    });
    if (existing && existing.userId !== auth.userId) {
      return json({ ok: false, message: "Conversation already exists." }, 409);
    }

    const now = new Date();
    const expiry = conversationExpiryDate();
    const row = existing
      ? await prisma.conversation.update({
          where: { id: convId },
          data: {
            role,
            archivedAt: null,
            lastActivityAt: now,
            expiresAt: expiry,
            ...(title ? { title } : {}),
          },
          select: { id: true, title: true, lastActivityAt: true, role: true },
        })
      : await prisma.conversation.create({
          data: {
            id: convId,
            userId: auth.userId,
            role,
            title,
            lastActivityAt: now,
            expiresAt: expiry,
          },
          select: { id: true, title: true, lastActivityAt: true, role: true },
        });

    return json({
      ok: true,
      conversation: {
        id: row.id,
        title: row.title || "Vestlus",
        lastActivityAt: row.lastActivityAt,
        role: row.role,
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
