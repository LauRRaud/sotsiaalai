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

// vestluse id on string; kerge sanity check
function isPlausibleId(id) {
  if (!id || typeof id !== "string") return false;
  return id.length >= 8 && id.length <= 200;
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
    const mod = await import("@/auth");
    return mod.authOptions || mod.default || mod.authConfig;
  } catch {
    return undefined;
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
    if (!auth.isAdmin && run.userId !== auth.userId) {
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
