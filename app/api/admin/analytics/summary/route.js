import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/auth";
import { assertAdmin } from "@/lib/authz";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function localeFromRequest(req) {
  const url = new URL(req.url);
  const fromQuery = normalizeServerLocale(url.searchParams.get("locale"));
  if (fromQuery) return fromQuery;

  const fromHeader =
    normalizeServerLocale(req.headers.get("x-ui-locale")) ||
    normalizeServerLocale(req.headers.get("x-locale")) ||
    normalizeServerLocale(req.headers.get("accept-language"));

  return fromHeader || "en";
}

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

function errorJson(messageKey, status = 400, locale = "en", extras = {}) {
  const translated = serverT(locale, messageKey, undefined, messageKey);
  return json(
    {
      ok: false,
      messageKey,
      message: translated,
      ...extras
    },
    status
  );
}

function toCountMap(rows, keyField) {
  const out = {};
  for (const row of rows || []) {
    const key = row?.[keyField];
    if (!key) continue;
    out[key] = Number(row?._count?._all || 0);
  }
  return out;
}

export async function GET(req) {
  const locale = localeFromRequest(req);
  const session = await getServerSession(authConfig).catch(() => null);
  const authz = assertAdmin(session);

  if (!authz.ok) {
    return errorJson(authz.message || "api.common.forbidden", authz.status || 403, locale);
  }

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      totalRequests,
      totalCrisis,
      noContextCount,
      ragSearchCount,
      ragDocTotal,
      ragDocFailed,
      ragDocError30d,
      ragDocsRecent,
      ragDocsByStatus,
      ragDocsByAudience,
      ragDocsByType,
      activeSubscriptions,
      newSubscriptions30d,
      canceledSubscriptions30d,
      paymentsByStatus30d,
      paidAmount30d,
      recentPayments
    ] = await Promise.all([
      prisma.chatLog.count({
        where: {
          event: "chat_request",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "crisis_detected",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "no_context",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "rag_search",
          createdAt: { gte: since }
        }
      }),
      prisma.ragDocument.count(),
      prisma.ragDocument.count({ where: { status: "FAILED" } }),
      prisma.ragDocument.count({
        where: {
          createdAt: { gte: since },
          error: { not: null }
        }
      }),
      prisma.ragDocument.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          audience: true,
          sourceUrl: true,
          fileName: true,
          insertedAt: true,
          createdAt: true,
          updatedAt: true,
          error: true
        }
      }),
      prisma.ragDocument.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.ragDocument.groupBy({ by: ["audience"], _count: { _all: true } }),
      prisma.ragDocument.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          OR: [{ validUntil: null }, { validUntil: { gt: now } }]
        }
      }),
      prisma.subscription.count({ where: { createdAt: { gte: since } } }),
      prisma.subscription.count({ where: { canceledAt: { gte: since } } }),
      prisma.payment.groupBy({
        by: ["status"],
        where: { createdAt: { gte: since } },
        _count: { _all: true }
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: since }
        },
        _sum: { amount: true }
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          provider: true,
          amount: true,
          currency: true,
          createdAt: true,
          paidAt: true
        }
      })
    ]);

    const ragLogs = await prisma.chatLog.findMany({
      where: {
        event: "rag_search",
        createdAt: { gte: since }
      },
      select: { data: true },
      orderBy: { createdAt: "desc" },
      take: 1000
    });

    let avgRagMatchCount = 0;
    let avgGroupCount = 0;
    let avgChosenGroupCount = 0;
    let total = 0;

    const groundingDistribution = {
      weak: 0,
      ok: 0,
      strong: 0
    };

    for (const row of ragLogs) {
      const data = row?.data || {};
      if (typeof data.ragMatchCount === "number") avgRagMatchCount += data.ragMatchCount;
      if (typeof data.groupCount === "number") avgGroupCount += data.groupCount;
      if (typeof data.chosenGroupCount === "number") avgChosenGroupCount += data.chosenGroupCount;

      const grounding = data.grounding;
      if (grounding === "weak" || grounding === "ok" || grounding === "strong") {
        groundingDistribution[grounding] += 1;
      }

      total += 1;
    }

    if (total > 0) {
      avgRagMatchCount /= total;
      avgGroupCount /= total;
      avgChosenGroupCount /= total;
    }

    return json({
      ok: true,
      periodDays: 30,
      totalRequests,
      totalCrisis,
      noContextCount,
      ragSearchCount,
      ragDocs: {
        total: ragDocTotal,
        failed: ragDocFailed,
        error30d: ragDocError30d,
        byStatus: toCountMap(ragDocsByStatus, "status"),
        byAudience: toCountMap(ragDocsByAudience, "audience"),
        byType: toCountMap(ragDocsByType, "type"),
        recent: ragDocsRecent
      },
      billing: {
        activeSubscriptions,
        newSubscriptions30d,
        canceledSubscriptions30d,
        paymentsByStatus30d: toCountMap(paymentsByStatus30d, "status"),
        paidAmount30d: paidAmount30d?._sum?.amount ?? "0",
        recentPayments
      },
      averages: {
        avgRagMatchCount,
        avgGroupCount,
        avgChosenGroupCount,
        groundingDistribution
      }
    });
  } catch {
    return errorJson("api.admin.analytics.summary_load_failed", 500, locale, {
      debugCode: "ADMIN_ANALYTICS_SUMMARY_GET_FAILED"
    });
  }
}
