// app/api/chat/run/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ---------- common headers & helpers ---------- */
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Accel-Buffering": "no",
  Vary: "Authorization",
};

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: noStoreHeaders });
}

function isDbOffline(err) {
  return (
    err?.code === "P1001" ||
    err?.code === "P1017" ||
    err?.name === "PrismaClientInitializationError" ||
    err?.name === "PrismaClientRustPanicError"
  );
}

// vestluse id sanity check (paindlik, aga välistab tühjad/jama)
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  if (id.length < 8 || id.length > 200) return false;
  // lubame enamiku URL-sõbralikke IDsid; väldi kontrollimatuid binäärmärke
  return /^[A-Za-z0-9._\-:+]+$/.test(id);
}

// tee kõigest igal juhul massiiv
function normalizeSources(s) {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  return [s]; // Prisma JSON võib olla objekt – pane massiivi
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
    if (!session?.user?.id) return { ok: false, status: 401, message: "Unauthorized" };
    return { ok: true, userId: session.user.id, isAdmin: !!session.user.isAdmin };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

/* ---------- GET: loe ühe run'i hetkeseis ----------
Query:
  - convId: string (kohustuslik)
Vastus:
  { ok, convId, status, role, text, sources[], isCrisis, updatedAt, createdAt }
-------------------------------------------------------------------------- */
export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const url = new URL(req.url);
  const convId = (url.searchParams.get("convId") || "").trim();

  if (!isPlausibleId(convId)) {
    return json({ ok: false, message: "convId on kohustuslik või vigane" }, 400);
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
        archivedAt: true,
      },
    });

    if (!conversation || conversation.archivedAt) {
      return json({ ok: false, notFound: true }, 200);
    }

    if (!auth.isAdmin && conversation.userId !== auth.userId) {
      return json({ ok: false, message: "Forbidden" }, 403);
    }

    const latestAssistant = await prisma.conversationMessage.findFirst({
      where: { conversationId: convId, role: "ASSISTANT" },
      orderBy: { createdAt: "desc" },
      select: { content: true, metadata: true, createdAt: true },
    });

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
    });
  } catch (err) {
    if (isDbOffline(err)) {
      return json(
        { ok: false, degraded: true, message: "Andmebaas pole kättesaadav." },
        503
      );
    }
    return json(
      { ok: false, message: "Database error while reading run", error: err?.message },
      500
    );
  }
}
