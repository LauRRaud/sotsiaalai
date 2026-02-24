import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPdfBufferFromText,
  createWordBufferFromText
} from "@/lib/chat/exportDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  if (id.length < 8 || id.length > 200) return false;
  return /^[A-Za-z0-9._\-:+]+$/.test(id);
}

function parseFormat(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .trim();
  if (normalized === "pdf") return "pdf";
  if (normalized === "word" || normalized === "doc" || normalized === "docx") {
    return "word";
  }
  return null;
}

function sanitizeFileBase(value, fallback = "sotsiaalai-summary") {
  const raw = String(value || "")
    .toLowerCase()
    .trim();
  const cleaned = raw
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!cleaned) return fallback;
  return cleaned.slice(0, 80);
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
    if (!session?.user?.id) {
      return { ok: false };
    }
    return {
      ok: true,
      userId: String(session.user.id),
      isAdmin: !!session.user.isAdmin
    };
  } catch {
    return { ok: false };
  }
}

function jsonError(messageKey, status) {
  return NextResponse.json(
    {
      ok: false,
      messageKey,
      message: messageKey
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0"
      }
    }
  );
}

export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return jsonError("api.common.unauthorized", 401);

  const url = new URL(req.url);
  const convId = String(url.searchParams.get("convId") || "").trim();
  const messageId = String(url.searchParams.get("messageId") || "").trim();
  const format = parseFormat(url.searchParams.get("format"));
  if (!isPlausibleId(convId) || !isPlausibleId(messageId)) {
    return jsonError("api.chat.invalid_id", 400);
  }
  if (!format) {
    return jsonError("api.common.invalid_request", 400);
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: convId },
      select: {
        id: true,
        userId: true,
        archivedAt: true
      }
    });
    if (!conversation || conversation.archivedAt) {
      return jsonError("api.chat.not_found", 404);
    }
    if (!auth.isAdmin && conversation.userId !== auth.userId) {
      return jsonError("api.common.forbidden", 403);
    }

    const msg = await prisma.conversationMessage.findFirst({
      where: {
        id: messageId,
        conversationId: convId,
        role: "ASSISTANT"
      },
      select: {
        content: true
      }
    });
    if (!msg?.content?.trim()) {
      return jsonError("api.chat.not_found", 404);
    }

    const fileBase = sanitizeFileBase(
      String(url.searchParams.get("fileName") || "")
    );
    if (format === "pdf") {
      const pdf = createPdfBufferFromText(msg.content);
      return new NextResponse(pdf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
          "Cache-Control": "private, no-store"
        }
      });
    }

    const word = createWordBufferFromText(msg.content, "SotsiaalAI summary");
    return new NextResponse(word, {
      status: 200,
      headers: {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileBase}.doc"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (err) {
    console.error("[chat export GET] failed", err);
    return jsonError("api.common.server_error", 500);
  }
}

