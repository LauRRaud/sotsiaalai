import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceChatRateLimit, readChatRateLimit } from "@/lib/chat-api-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const CONVERSATION_TTL_MS = Math.max(1, Number(process.env.CONVERSATION_TTL_DAYS || 90)) * 24 * 60 * 60 * 1000;
const CHAT_RATE_LIMIT_WINDOW_MS = readChatRateLimit(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60_000, 1000);
const CHAT_CONVERSATION_GET_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CONVERSATION_GET_MAX, 90);
const CHAT_CONVERSATION_PUT_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CONVERSATION_PUT_MAX, 30);
const CHAT_CONVERSATION_DELETE_RATE_LIMIT_MAX = readChatRateLimit(process.env.CHAT_RATE_LIMIT_CONVERSATION_DELETE_MAX, 30);

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

function noContent() {
  return new Response(null, {
    status: 204,
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

function isDbOffline(err) {
  return err?.code === "P1001" || err?.code === "P1017" || err?.name === "PrismaClientInitializationError" || err?.name === "PrismaClientRustPanicError";
}

function conversationExpiryDate() {
  return new Date(Date.now() + CONVERSATION_TTL_MS);
}

function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  return id.length >= 8 && id.length <= 200;
}

function ensureOwnedOrAdmin(row, auth) {
  if (!row) return { ok: false, status: 404, message: "api.chat.not_found" };
  if (auth.isAdmin) return { ok: true };
  if (row.userId !== auth.userId) return { ok: false, status: 403, message: "api.common.forbidden" };
  return { ok: true };
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
    if (!session?.user?.id) return {
      ok: false,
      status: 401,
      message: "api.common.unauthorized"
    };
    return {
      ok: true,
      userId: session.user.id,
      isAdmin: !!session.user.isAdmin
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "api.common.unauthorized"
    };
  }
}

export async function GET(req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);
  const rateLimitResponse = enforceChatRateLimit(req, {
    scope: "conversation_get",
    userId: auth.userId,
    limit: CHAT_CONVERSATION_GET_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  if (!isPlausibleId(id)) return errorJson("api.chat.invalid_id", 400);

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
        archivedAt: true
      }
    });
    const gate = ensureOwnedOrAdmin(row, auth);
    if (!gate.ok) return errorJson(gate.message, gate.status);

    if (row.archivedAt) {
      return errorJson("api.chat.not_found", 404);
    }

    const previewSource = row.summary || "";
    return json({
      ok: true,
      conversation: {
        id: row.id,
        role: row.role,
        lastActivityAt: row.lastActivityAt,
        title: row.title || null,
        preview: previewSource?.slice?.(0, 160) ?? ""
      }
    });
  } catch (err) {
    if (isDbOffline(err)) {
      return errorJson("api.chat.db_unavailable", 503, {
        degraded: true
      });
    }
    return errorJson("api.chat.db_error_conversation_read", 500, {
      error: err?.message
    });
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);
  const rateLimitResponse = enforceChatRateLimit(req, {
    scope: "conversation_delete",
    userId: auth.userId,
    limit: CHAT_CONVERSATION_DELETE_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  if (!isPlausibleId(id)) return errorJson("api.chat.invalid_id", 400);

  try {
    const existing = await prisma.conversation.findUnique({
      where: { id },
      select: {
        userId: true,
        archivedAt: true
      }
    });
    const gate = ensureOwnedOrAdmin(existing, auth);
    if (!gate.ok) return errorJson(gate.message, gate.status);

    if (existing.archivedAt) {
      return noContent();
    }

    await prisma.conversation.update({
      where: { id },
      data: {
        archivedAt: new Date(),
        expiresAt: new Date()
      }
    });
    return noContent();
  } catch (err) {
    if (isDbOffline(err)) {
      return errorJson("api.chat.db_unavailable", 503, {
        degraded: true
      });
    }
    return errorJson("api.chat.db_error_conversation_delete", 500, {
      error: err?.message
    });
  }
}

export async function PUT(req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);
  const rateLimitResponse = enforceChatRateLimit(req, {
    scope: "conversation_put",
    userId: auth.userId,
    limit: CHAT_CONVERSATION_PUT_RATE_LIMIT_MAX,
    windowMs: CHAT_RATE_LIMIT_WINDOW_MS
  });
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams?.id ? String(resolvedParams.id).trim() : "";
  if (!isPlausibleId(id)) return errorJson("api.chat.invalid_id", 400);

  try {
    const existing = await prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        archivedAt: true,
        role: true,
        lastActivityAt: true
      }
    });
    const gate = ensureOwnedOrAdmin(existing, auth);
    if (!gate.ok) return errorJson(gate.message, gate.status);

    if (!existing.archivedAt) {
      return json({
        ok: true,
        conversation: {
          id: existing.id,
          role: existing.role,
          lastActivityAt: existing.lastActivityAt
        }
      });
    }

    const row = await prisma.conversation.update({
      where: { id },
      data: {
        archivedAt: null,
        expiresAt: conversationExpiryDate()
      },
      select: {
        id: true,
        role: true,
        lastActivityAt: true
      }
    });
    return json({
      ok: true,
      conversation: row
    });
  } catch (err) {
    if (isDbOffline(err)) {
      return errorJson("api.chat.db_unavailable", 503, {
        degraded: true
      });
    }
    return errorJson("api.chat.db_error_conversation_restore", 500, {
      error: err?.message
    });
  }
}
