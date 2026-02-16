import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/auth";
import { assertAdmin } from "@/lib/authz";
import { getAnalyzeLimit, utcDayStart } from "@/lib/analyzeQuota";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";
import { prisma } from "@/lib/prisma";
import {
  MONTHLY_COST_BUDGET_EUR_PER_USER,
  COST_CHAT_REQUEST_EUR,
  COST_RAG_SEARCH_EUR,
  COST_STT_PER_AUDIO_MB_EUR,
  COST_TTS_PER_1K_CHARS_EUR
} from "@/lib/usageBudget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_PERIOD_DAYS = 30;
const MAX_PERIOD_DAYS = 180;
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const ADMIN_ANALYTICS_SHOW_FULL_EMAILS =
  String(process.env.ADMIN_ANALYTICS_SHOW_FULL_EMAILS || "")
    .trim()
    .toLowerCase() === "true" ||
  String(process.env.ADMIN_ANALYTICS_SHOW_FULL_EMAILS || "")
    .trim()
    .toLowerCase() === "1" ||
  String(process.env.ADMIN_ANALYTICS_SHOW_FULL_EMAILS || "")
    .trim()
    .toLowerCase() === "yes";

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

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function round3(value) {
  return Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;
}

function buildUsageSeed() {
  return {
    chatRequests: 0,
    ragSearches: 0,
    noContext: 0,
    crisisDetected: 0,
    sttRequests: 0,
    sttAudioBytes: 0,
    ttsRequests: 0,
    ttsChars: 0,
    analyses: 0
  };
}

function maskEmail(email) {
  const value = String(email || "").trim();
  if (!value || !value.includes("@")) return null;

  const [localRaw, domainRaw] = value.split("@");
  const local = String(localRaw || "");
  const domain = String(domainRaw || "");
  if (!local || !domain) return null;

  const localMasked =
    local.length <= 2
      ? `${local.slice(0, 1)}***`
      : `${local.slice(0, 1)}${"*".repeat(Math.min(8, Math.max(2, local.length - 2)))}${local.slice(-1)}`;

  const domainParts = domain.split(".");
  const host = String(domainParts.shift() || "");
  const tld = domainParts.join(".");
  const hostMasked =
    host.length <= 2
      ? `${host.slice(0, 1)}***`
      : `${host.slice(0, 1)}***${host.slice(-1)}`;

  if (!tld) return `${localMasked}@${hostMasked}`;
  return `${localMasked}@${hostMasked}.${tld}`;
}

function toActiveSubscription(subscription, now = new Date()) {
  if (!subscription) return false;
  if (String(subscription.status || "").toUpperCase() !== "ACTIVE") return false;
  if (!subscription.validUntil) return true;
  return new Date(subscription.validUntil).getTime() > now.getTime();
}

export async function GET(req) {
  const locale = localeFromRequest(req);
  const session = await getServerSession(authConfig).catch(() => null);
  const authz = assertAdmin(session);

  if (!authz.ok) {
    return errorJson(authz.message || "api.common.forbidden", authz.status || 403, locale);
  }

  try {
    const now = new Date();
    const url = new URL(req.url);
    const params = url.searchParams;

    const limitRaw = Number(params.get("limit"));
    const offsetRaw = Number(params.get("offset"));
    const daysRaw = Number(params.get("days"));
    const q = String(params.get("q") || "").trim();

    const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : DEFAULT_LIMIT));
    const offset = Math.max(0, Number.isFinite(offsetRaw) ? offsetRaw : 0);
    const periodDays = Math.min(MAX_PERIOD_DAYS, Math.max(1, Number.isFinite(daysRaw) ? daysRaw : DEFAULT_PERIOD_DAYS));
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const sinceDay = utcDayStart(since);

    const userWhere = q
      ? {
          OR: [{ email: { contains: q, mode: "insensitive" } }, { id: { contains: q, mode: "insensitive" } }]
        }
      : {};

    const [totalUsers, users] = await Promise.all([
      prisma.user.count({ where: userWhere }),
      prisma.user.findMany({
        where: userWhere,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          isAdmin: true,
          createdAt: true
        }
      })
    ]);

    if (!users.length) {
      return json({
        ok: true,
        periodDays,
        totalUsers,
        items: [],
        totals: {
          estimatedCostEur: 0,
          paidAmountEur: 0
        },
        costModel: {
          chatRequestEur: COST_CHAT_REQUEST_EUR,
          ragSearchEur: COST_RAG_SEARCH_EUR,
          sttPerAudioMbEur: COST_STT_PER_AUDIO_MB_EUR,
          ttsPer1kCharsEur: COST_TTS_PER_1K_CHARS_EUR,
          monthlyBudgetEur: round2(MONTHLY_COST_BUDGET_EUR_PER_USER),
          currency: "EUR"
        }
      });
    }

    const userIds = users.map(user => user.id);

    const [
      usageEventRows,
      usageAmountRows,
      analyzeRows,
      subscriptions,
      paidByUser
    ] = await Promise.all([
      prisma.chatLog.groupBy({
        by: ["userId", "event"],
        where: {
          userId: { in: userIds },
          createdAt: { gte: since },
          event: {
            in: ["chat_request", "rag_search", "no_context", "crisis_detected", "stt_request", "tts_request"]
          }
        },
        _count: { _all: true }
      }),
      prisma.chatLog.findMany({
        where: {
          userId: { in: userIds },
          createdAt: { gte: since },
          event: { in: ["stt_request", "tts_request"] }
        },
        select: {
          userId: true,
          event: true,
          data: true
        }
      }),
      prisma.analyzeUsage.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          day: { gte: sinceDay }
        },
        _sum: { count: true }
      }),
      prisma.subscription.findMany({
        where: { userId: { in: userIds } },
        orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          userId: true,
          status: true,
          plan: true,
          validUntil: true,
          nextBilling: true,
          canceledAt: true,
          createdAt: true
        }
      }),
      prisma.payment.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          status: "PAID",
          paidAt: { gte: since }
        },
        _sum: { amount: true }
      })
    ]);

    const usageByUser = Object.fromEntries(userIds.map(userId => [userId, buildUsageSeed()]));

    for (const row of usageEventRows) {
      const userId = row?.userId;
      const event = String(row?.event || "");
      const count = Number(row?._count?._all || 0);
      if (!userId || !usageByUser[userId]) continue;

      if (event === "chat_request") usageByUser[userId].chatRequests = count;
      if (event === "rag_search") usageByUser[userId].ragSearches = count;
      if (event === "no_context") usageByUser[userId].noContext = count;
      if (event === "crisis_detected") usageByUser[userId].crisisDetected = count;
      if (event === "stt_request") usageByUser[userId].sttRequests = count;
      if (event === "tts_request") usageByUser[userId].ttsRequests = count;
    }

    for (const row of usageAmountRows) {
      const userId = row?.userId;
      if (!userId || !usageByUser[userId]) continue;

      if (row.event === "stt_request") {
        const size = Number(row?.data?.fileSizeBytes || 0);
        if (Number.isFinite(size) && size > 0) usageByUser[userId].sttAudioBytes += size;
      }

      if (row.event === "tts_request") {
        const chars = Number(row?.data?.textLength || 0);
        if (Number.isFinite(chars) && chars > 0) usageByUser[userId].ttsChars += chars;
      }
    }

    for (const row of analyzeRows) {
      const userId = row?.userId;
      if (!userId || !usageByUser[userId]) continue;
      usageByUser[userId].analyses = Number(row?._sum?.count || 0);
    }

    const latestSubscriptionByUser = {};
    for (const row of subscriptions) {
      if (!row?.userId) continue;
      if (!latestSubscriptionByUser[row.userId]) latestSubscriptionByUser[row.userId] = row;
    }

    const paidByUserMap = {};
    for (const row of paidByUser) {
      if (!row?.userId) continue;
      paidByUserMap[row.userId] = Number(row?._sum?.amount || 0);
    }

    let totalEstimatedCost = 0;
    let totalPaidAmount = 0;

    const items = users.map(user => {
      const usage = usageByUser[user.id] || buildUsageSeed();
      const latestSubscription = latestSubscriptionByUser[user.id] || null;
      const sttAudioMb = usage.sttAudioBytes > 0 ? usage.sttAudioBytes / (1024 * 1024) : 0;

      const chatCost = usage.chatRequests * COST_CHAT_REQUEST_EUR;
      const ragCost = usage.ragSearches * COST_RAG_SEARCH_EUR;
      const sttCost = sttAudioMb * COST_STT_PER_AUDIO_MB_EUR;
      const ttsCost = (usage.ttsChars / 1000) * COST_TTS_PER_1K_CHARS_EUR;
      const totalCost = chatCost + ragCost + sttCost + ttsCost;
      const paidAmount = Number(paidByUserMap[user.id] || 0);
      const budget = Number(MONTHLY_COST_BUDGET_EUR_PER_USER || 0);
      const remainingBudget = Math.max(0, budget - totalCost);
      const utilizationPct = budget > 0 ? Math.min(100, (totalCost / budget) * 100) : 0;

      totalEstimatedCost += totalCost;
      totalPaidAmount += paidAmount;

      return {
        userId: user.id,
        email: ADMIN_ANALYTICS_SHOW_FULL_EMAILS ? user.email || null : maskEmail(user.email),
        role: user.role,
        isAdmin: !!user.isAdmin,
        createdAt: user.createdAt,
        subscription: latestSubscription
          ? {
              id: latestSubscription.id,
              status: latestSubscription.status,
              plan: latestSubscription.plan,
              validUntil: latestSubscription.validUntil,
              nextBilling: latestSubscription.nextBilling,
              canceledAt: latestSubscription.canceledAt,
              createdAt: latestSubscription.createdAt,
              isActive: toActiveSubscription(latestSubscription, now)
            }
          : null,
        limits: {
          analyzeDaily: getAnalyzeLimit(String(user.role || "CLIENT").toUpperCase(), !!user.isAdmin)
        },
        usage: {
          chatRequests: usage.chatRequests,
          ragSearches: usage.ragSearches,
          noContext: usage.noContext,
          crisisDetected: usage.crisisDetected,
          sttRequests: usage.sttRequests,
          sttAudioMb: round3(sttAudioMb),
          ttsRequests: usage.ttsRequests,
          ttsChars: usage.ttsChars,
          analyses: usage.analyses
        },
        costs: {
          chatEur: round2(chatCost),
          ragEur: round2(ragCost),
          sttEur: round2(sttCost),
          ttsEur: round2(ttsCost),
          totalEur: round2(totalCost),
          currency: "EUR"
        },
        budget: {
          monthlyEur: round2(budget),
          remainingEur: round2(remainingBudget),
          utilizationPct: round2(utilizationPct)
        },
        paidAmount30dEur: round2(paidAmount)
      };
    });

    return json({
      ok: true,
      periodDays,
      totalUsers,
      items,
      totals: {
        estimatedCostEur: round2(totalEstimatedCost),
        paidAmountEur: round2(totalPaidAmount)
      },
      costModel: {
        chatRequestEur: COST_CHAT_REQUEST_EUR,
        ragSearchEur: COST_RAG_SEARCH_EUR,
        sttPerAudioMbEur: COST_STT_PER_AUDIO_MB_EUR,
        ttsPer1kCharsEur: COST_TTS_PER_1K_CHARS_EUR,
        monthlyBudgetEur: round2(MONTHLY_COST_BUDGET_EUR_PER_USER),
        currency: "EUR"
      }
    });
  } catch {
    return errorJson("api.admin.analytics.users_load_failed", 500, locale, {
      debugCode: "ADMIN_ANALYTICS_USERS_GET_FAILED"
    });
  }
}
