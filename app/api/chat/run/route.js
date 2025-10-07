// app/api/chat/run/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

export async function GET(req) {
  const url = new URL(req.url);
  const convId = url.searchParams.get("convId");

  if (!convId) {
    return NextResponse.json(
      { ok: false, message: "convId on kohustuslik" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Auth (NextAuth server-session)
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  const isAdmin = !!session?.user?.isAdmin;

  if (!userId) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Võta jooksva run'i seis
  const run = await prisma.conversationRun.findUnique({
    where: { id: convId },
  });

  if (!run) {
    return NextResponse.json(
      { ok: false, message: "Not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Omaniku või Admini kontroll
  if (!isAdmin && run.userId !== userId) {
    return NextResponse.json(
      { ok: false, message: "Forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      convId: run.id,
      status: run.status,        // RUNNING | COMPLETED | ERROR
      role: run.role,            // CLIENT | SOCIAL_WORKER | ADMIN(normaliseeritud serveris)
      text: run.text || "",
      sources: Array.isArray(run.sources) ? run.sources : run.sources ?? [],
      updatedAt: run.updatedAt,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
