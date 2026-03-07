import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { resolveSessionRoleState } from "@/lib/authz";
import {
  normalizeConversationRole as normalizeRole,
  resolveConversationListRoleFilter,
  resolveConversationWriteRole
} from "@/lib/chat/conversationRoles";
import { prisma } from "@/lib/prisma";
import { enforceChatRateLimit, readChatRateLimit } from "@/lib/chat-api-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const CONVERSATION_TTL_DAYS = Number(process.env.CONVERSATION_TTL_DAYS || 90);
const CONVERSATION_TTL_MS = Math.max(1, CONVERSATION_TTL_DAYS) * 24 * 60 * 60 * 1000;
const CHAT_RATE_LIMIT_WINDOW_MS = readChatRateLimit(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000, 1000);
const CHAT_CONVERSATIONS_GET_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CONVERSATIONS_GET_MAX, 90);
const CHAT_CONVERSATIONS_POST_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CONVERSATIONS_POST_MAX, 30);

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}

function errorJson(messageKey, status, extras = {}) {
  return json({
    ok: false,
    messageKey,
    message: messageKey,
    ...extras
  }, status);
}

function isPlausibleConversationId(id) {
  if (!id || typeof id !== "string") return false;
  if (id.length < 8 || id.length > 200) return false;
  return /^[A-Za-z0-9._\-:+]+$/.test(id);
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
  const firstSep = token.indexOf(":");
  if (firstSep <= 0) return null;
  const secondSep = token.indexOf(":", firstSep + 1);
  if (secondSep <= firstSep + 1) return null;
  const pinPart = token.slice(0, firstSep);
  const msPart = token.slice(firstSep + 1, secondSep);
  const id = token.slice(secondSep + 1);
  if (!isPlausibleConversationId(id)) return null;
  const ms = Number(msPart);
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  const isPinned = pinPart === "1" ? true : pinPart === "0" ? false : null;
  if (isPinned === null) return null;
  return {
    isPinned,
    date,
    id
  };
}

function trimPreview(text = "", max = 160) {
  if (!text) return "";
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > max ? `${normalized.slice(0, max - 1)}...` : normalized;
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

async function requireUser() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return {
        ok: false,
        status: 401,
        message: "api.common.unauthorized"
      };
    }
    return {
      ok: true,
      session,
      userId: session.user.id,
      isAdmin: !!session.user.isAdmin,
      role: normalizeRole(session?.user?.role || (session?.user?.isAdmin ? "SOCIAL_WORKER" : "CLIENT"))
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "api.common.unauthorized"
    };
  }
}

function isDbOffline(err) {
  return err?.code === "P1001" || err?.code === "P1017" || err?.name === "PrismaClientInitializationError" || err?.name === "PrismaClientRustPanicError";
}

export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);
  const rateLimitResponse = enforceChatRateLimit(req, {
    scope: "conversations_get",
    userId: auth.userId,
    limit: CHAT_CONVERSATIONS_GET_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (rateLimitResponse) return rateLimitResponse;

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || 30);
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitParam) ? limitParam : 30));
  const cursorToken = url.searchParams.get("cursor");
  const parsedCursor = parseCursor(cursorToken);
  const roleState = resolveSessionRoleState(auth.session, req.cookies);
  const roleParam = url.searchParams.get("role");
  const roleFilter = resolveConversationListRoleFilter(roleParam, roleState.effectiveRole);

  const baseWhere = {
    userId: auth.userId,
    archivedAt: null,
    OR: [
      { expiresAt: null },
      {
        expiresAt: {
          gt: new Date()
        }
      }
    ],
    ...(roleFilter ? { role: roleFilter } : {})
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
        {
          lastActivityAt: {
            lt: parsedCursor.date
          }
        },
        {
          AND: [
            { lastActivityAt: parsedCursor.date },
            {
              id: {
                lt: parsedCursor.id
              }
            }
          ]
        }
      ]
    });
    where = {
      AND: [
        baseWhere,
        {
          OR: cursorFilters
        }
      ]
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
          select: {
            content: true
          }
        }
      }
    });

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const items = pageRows.map(row => {
      const previewSource = row.messages?.[0]?.content || row.summary || "";
      const preview = trimPreview(previewSource);
      const title = row.title || fallbackTitle(previewSource) || null;
      return {
        id: row.id,
        title,
        preview,
        lastActivityAt: row.lastActivityAt,
        isPinned: row.isPinned,
        role: row.role
      };
    });
    const last = pageRows.at(-1);
    const nextCursor = hasMore && last ? encodeCursor(last) : null;
    return json({
      ok: true,
      conversations: items,
      nextCursor
    });
  } catch (err) {
    console.error("[chat/conversations GET] failed", err);
    if (isDbOffline(err)) {
      return json({
        ok: true,
        conversations: [],
        nextCursor: null,
        degraded: true,
        messageKey: "api.chat.db_unavailable",
        message: "api.chat.db_unavailable"
      });
    }
    return errorJson("api.chat.db_error_conversations_list", 500, {
      code: "DB_ERROR_CONVERSATIONS_LIST"
    });
  }
}

export async function POST(req) {
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);
  const rateLimitResponse = enforceChatRateLimit(req, {
    scope: "conversations_post",
    userId: auth.userId,
    limit: CHAT_CONVERSATIONS_POST_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (rateLimitResponse) return rateLimitResponse;

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  let convId = String(body?.id || "").trim();
  if (convId && !isPlausibleConversationId(convId)) {
    return errorJson("api.chat.invalid_conv_id", 400);
  }
  if (!convId) {
    try {
      convId = randomUUID();
    } catch {
      convId = String(Date.now());
    }
  }

  const roleState = resolveSessionRoleState(auth.session, req.cookies);
  const requestedRole =
    body?.role == null || body?.role === ""
      ? null
      : normalizeRole(body?.role);
  const role = resolveConversationWriteRole({
    requestedRole,
    effectiveRole: roleState.effectiveRole,
    isAdmin: auth.isAdmin,
    sessionRole: auth.role
  });
  const title = typeof body?.title === "string" && body.title.trim() ? body.title.trim().slice(0, 160) : null;

  try {
    const existing = await prisma.conversation.findUnique({
      where: { id: convId },
      select: {
        userId: true
      }
    });
    if (existing && existing.userId !== auth.userId) {
      return errorJson("api.chat.conversation_exists", 409);
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
            ...(title ? { title } : {})
          },
          select: {
            id: true,
            title: true,
            lastActivityAt: true,
            role: true
          }
        })
      : await prisma.conversation.create({
          data: {
            id: convId,
            userId: auth.userId,
            role,
            title,
            lastActivityAt: now,
            expiresAt: expiry
          },
          select: {
            id: true,
            title: true,
            lastActivityAt: true,
            role: true
          }
        });

    return json({
      ok: true,
      conversation: {
        id: row.id,
        title: row.title || null,
        lastActivityAt: row.lastActivityAt,
        role: row.role
      }
    });
  } catch (err) {
    console.error("[chat/conversations POST] failed", err);
    return errorJson("api.chat.db_error_conversation_create", 500, {
      code: "DB_ERROR_CONVERSATION_CREATE"
    });
  }
}
