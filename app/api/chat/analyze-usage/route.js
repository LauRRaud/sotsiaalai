export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { normalizeRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getAnalyzeLimit, utcDayStart, secondsUntilUtcMidnight } from "@/lib/analyzeQuota";

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

export async function GET() {
  const session = await getServerSession(authConfig).catch(() => null);
  if (!session?.user?.id) {
    return json({ ok: false, message: "Unauthorized" }, 401);
  }
  const pickedRole = (session.user.role || "CLIENT").toString().toUpperCase();
  const role = normalizeRole(pickedRole);
  const isAdmin = !!session.user.isAdmin || pickedRole === "ADMIN";
  const limit = getAnalyzeLimit(role, isAdmin);
  const day = utcDayStart();
  const record = await prisma.analyzeUsage.findUnique({
    where: { userId_day: { userId: session.user.id, day } },
    select: { count: true },
  });
  const used = record?.count || 0;
  return json({ ok: true, used, limit, resetSeconds: secondsUntilUtcMidnight() });
}
