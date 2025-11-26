import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const json = (data, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });

function isAdminSession(session) {
  return !!session?.user?.isAdmin || String(session?.user?.role || "").toUpperCase() === "ADMIN";
}

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session) return json({ ok: false, message: "Auth required" }, 401);
  if (!isAdminSession(session)) return json({ ok: false, message: "Forbidden" }, 403);

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalRequests, totalCrisis, noContextCount, ragSearchCount] = await Promise.all([
    prisma.chatLog.count({ where: { event: "chat_request", createdAt: { gte: since } } }),
    prisma.chatLog.count({ where: { event: "crisis_detected", createdAt: { gte: since } } }),
    prisma.chatLog.count({ where: { event: "no_context", createdAt: { gte: since } } }),
    prisma.chatLog.count({ where: { event: "rag_search", createdAt: { gte: since } } }),
  ]);

  const ragLogs = await prisma.chatLog.findMany({
    where: { event: "rag_search", createdAt: { gte: since } },
    select: { data: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  let avgRagMatchCount = 0;
  let avgGroupCount = 0;
  let avgChosenGroupCount = 0;
  let total = 0;
  const groundingDistribution = { weak: 0, ok: 0, strong: 0 };

  for (const row of ragLogs) {
    const d = row?.data || {};
    if (typeof d.ragMatchCount === "number") avgRagMatchCount += d.ragMatchCount;
    if (typeof d.groupCount === "number") avgGroupCount += d.groupCount;
    if (typeof d.chosenGroupCount === "number") avgChosenGroupCount += d.chosenGroupCount;
    const g = d.grounding;
    if (g === "weak" || g === "ok" || g === "strong") groundingDistribution[g] += 1;
    total += 1;
  }
  if (total > 0) {
    avgRagMatchCount = avgRagMatchCount / total;
    avgGroupCount = avgGroupCount / total;
    avgChosenGroupCount = avgChosenGroupCount / total;
  }

  return json({
    ok: true,
    periodDays: 30,
    totalRequests,
    totalCrisis,
    noContextCount,
    ragSearchCount,
    averages: {
      avgRagMatchCount,
      avgGroupCount,
      avgChosenGroupCount,
      groundingDistribution,
    },
  });
}
