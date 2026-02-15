import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Accel-Buffering": "no",
  Vary: "Authorization"
};

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: noStoreHeaders
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

function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  if (id.length < 8 || id.length > 200) return false;
  return /^[A-Za-z0-9._\-:+]+$/.test(id);
}

function normalizeSources(s) {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  return [s];
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

export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);

  const url = new URL(req.url);
  const convId = (url.searchParams.get("convId") || "").trim();
  if (!isPlausibleId(convId)) {
    return errorJson("api.chat.invalid_conv_id", 400);
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: convId },
      select: {
        id: true,
        userId: true,
        role: true,
        summary: true,
        lastActivityAt: true,
        createdAt: true,
        archivedAt: true
      }
    });

    if (!conversation || conversation.archivedAt) {
      return json({
        ok: false,
        notFound: true
      }, 200);
    }
    if (!auth.isAdmin && conversation.userId !== auth.userId) {
      return errorJson("api.common.forbidden", 403);
    }

    const [latestAssistant, allMessages] = await Promise.all([
      prisma.conversationMessage.findFirst({
        where: {
          conversationId: convId,
          role: "ASSISTANT"
        },
        orderBy: { createdAt: "desc" },
        select: {
          content: true,
          metadata: true,
          createdAt: true
        }
      }),
      prisma.conversationMessage.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: "asc" },
        select: {
          role: true,
          content: true,
          metadata: true,
          createdAt: true
        }
      })
    ]);

    const history = Array.isArray(allMessages)
      ? allMessages
          .map(msg => {
            const normalizedRole = msg.role === "USER" ? "user" : msg.role === "ASSISTANT" ? "ai" : null;
            if (!normalizedRole) return null;
            return {
              role: normalizedRole,
              text: msg.content || "",
              sources: normalizedRole === "ai" ? normalizeSources(msg.metadata?.sources || []) : [],
              createdAt: msg.createdAt
            };
          })
          .filter(Boolean)
      : [];

    return json({
      ok: true,
      convId: conversation.id,
      status: latestAssistant ? "COMPLETED" : "RUNNING",
      role: conversation.role,
      text: latestAssistant?.content || conversation.summary || "",
      sources: normalizeSources(latestAssistant?.metadata?.sources || []),
      isCrisis: !!latestAssistant?.metadata?.isCrisis,
      updatedAt: conversation.lastActivityAt,
      createdAt: conversation.createdAt,
      messages: history
    });
  } catch (err) {
    if (isDbOffline(err)) {
      return errorJson("api.chat.db_unavailable", 503, {
        degraded: true
      });
    }
    return errorJson("api.chat.db_error_run_read", 500, {
      error: err?.message
    });
  }
}
