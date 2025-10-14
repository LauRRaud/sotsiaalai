// app/api/chat/run/route.js
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

/* ---------- Small helpers ---------- */
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: noStoreHeaders });
}

// vestluse id on sul string; teeme kerge sanity checki
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  return id.length >= 8 && id.length <= 200;
}

// tee kõigest igal juhul massiiv
function normalizeSources(s) {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  // kui Prisma Json tuli objektina, pane ühele reale
  return [s];
}

/* ---------- GET ---------- */
export async function GET(req) {
  const url = new URL(req.url);
  const convId = (url.searchParams.get("convId") || "").trim();

  if (!isPlausibleId(convId)) {
    return json({ ok: false, message: "convId on kohustuslik või vigane" }, 400);
  }

  // Auth (NextAuth server-session)
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  const isAdmin = !!session?.user?.isAdmin;

  if (!userId) {
    return json({ ok: false, message: "Unauthorized" }, 401);
  }

  try {
    const run = await prisma.conversationRun.findUnique({
      where: { id: convId },
      select: {
        id: true,
        userId: true,
        status: true,     // RUNNING | COMPLETED | ERROR | DELETED
        role: true,       // CLIENT | SOCIAL_WORKER
        text: true,
        sources: true,
        isCrisis: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    if (!run) {
      return json({ ok: false, message: "Not found" }, 404);
    }

    // Omaniku või Admini kontroll
    if (!isAdmin && run.userId !== userId) {
      return json({ ok: false, message: "Forbidden" }, 403);
    }

    // Kui on DELETED, kohtle nagu puuduks (UI ei peaks seda nägema)
    if (run.status === "DELETED") {
      return json({ ok: false, message: "Not found" }, 404);
    }

    return json({
      ok: true,
      convId: run.id,
      status: run.status,
      role: run.role,
      text: run.text || "",
      sources: normalizeSources(run.sources),
      isCrisis: !!run.isCrisis,
      updatedAt: run.updatedAt,
      createdAt: run.createdAt,
    });
  } catch (err) {
    return json(
      { ok: false, message: "Database error while reading run", error: err?.message },
      500
    );
  }
}
