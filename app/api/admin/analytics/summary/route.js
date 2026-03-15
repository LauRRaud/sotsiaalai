import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/auth";
import { assertAdmin } from "@/lib/authz";
import { buildPaymentAlerts, buildPaymentPipelineFromCounts } from "@/lib/admin/payment-alerts";
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

function countDistinct(rows, keyField) {
  return Array.isArray(rows) ? rows.filter(row => row?.[keyField] != null).length : 0;
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
      sttRequestCount,
      ttsRequestCount,
      ragErrorCount,
      openAiErrorCount,
      conversationTotal,
      activeConversations30d,
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
      recentPayments,
      paymentEventInitStartedCount,
      paymentEventCheckoutCreatedCount,
      paymentEventInitFailedCount,
      paymentEventCallbackSuccessCount,
      paymentEventCallbackPendingCount,
      paymentEventCallbackFailedCount,
      paymentEventCallbackCanceledCount,
      paymentEventWebhookProcessedCount,
      paymentEventWebhookPaidCount,
      paymentEventWebhookFailedStatusCount,
      paymentEventWebhookCanceledStatusCount,
      paymentEventWebhookRefundedStatusCount,
      paymentEventWebhookErrorCount,
      paymentEventWebhookInvalidSignatureCount,
      paymentEventWebhookInvalidPayloadCount,
      paymentEventWebhookRateLimitedCount,
      helpRequestsOpen,
      helpOffersOpen,
      helpRequests30d,
      helpOffers30d,
      helpMatches30d,
      helpMatchesByStatus,
      roomsTotal,
      roomMessages30d,
      activeRooms30dRows,
      pendingInvites,
      sponsoredInvites30d,
      activeSponsoredMembers,
      documentsTotal,
      documents30d,
      artifactsDraft,
      artifactsFinal,
      artifactCreates30d,
      artifactApprovals30d,
      documentAuditActions30d,
      frameworkAcceptancesTotal,
      frameworkAcceptances30d,
      frameworkAcceptancesSigned30d,
      recentFrameworkAcceptances
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
      prisma.chatLog.count({
        where: {
          event: "stt_request",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "tts_request",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "rag_error",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "openai_error",
          createdAt: { gte: since }
        }
      }),
      prisma.conversation.count(),
      prisma.conversation.count({
        where: {
          archivedAt: null,
          lastActivityAt: { gte: since }
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
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_init_started",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_init_checkout_created",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_init_failed",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_callback_redirect",
          createdAt: { gte: since },
          data: {
            path: ["paymentState"],
            equals: "success"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_callback_redirect",
          createdAt: { gte: since },
          data: {
            path: ["paymentState"],
            equals: "pending"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_callback_redirect",
          createdAt: { gte: since },
          data: {
            path: ["paymentState"],
            equals: "failed"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_callback_redirect",
          createdAt: { gte: since },
          data: {
            path: ["paymentState"],
            equals: "canceled"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_processed",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_processed",
          createdAt: { gte: since },
          data: {
            path: ["resultStatus"],
            equals: "PAID"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_processed",
          createdAt: { gte: since },
          data: {
            path: ["resultStatus"],
            equals: "FAILED"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_processed",
          createdAt: { gte: since },
          data: {
            path: ["resultStatus"],
            equals: "CANCELED"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_processed",
          createdAt: { gte: since },
          data: {
            path: ["resultStatus"],
            equals: "REFUNDED"
          }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_failed",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_invalid_signature",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_invalid_payload",
          createdAt: { gte: since }
        }
      }),
      prisma.chatLog.count({
        where: {
          event: "subscription_webhook_rate_limited",
          createdAt: { gte: since }
        }
      }),
      prisma.helpRequest.count({
        where: {
          status: { in: ["OPEN", "MATCHED"] }
        }
      }),
      prisma.helpOffer.count({
        where: {
          status: { in: ["OPEN", "MATCHED"] }
        }
      }),
      prisma.helpRequest.count({
        where: {
          createdAt: { gte: since }
        }
      }),
      prisma.helpOffer.count({
        where: {
          createdAt: { gte: since }
        }
      }),
      prisma.helpMatch.count({
        where: {
          createdAt: { gte: since }
        }
      }),
      prisma.helpMatch.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: since }
        },
        _count: { _all: true }
      }),
      prisma.room.count(),
      prisma.roomMessage.count({
        where: {
          createdAt: { gte: since },
          deletedAt: null
        }
      }),
      prisma.roomMessage.groupBy({
        by: ["roomId"],
        where: {
          createdAt: { gte: since },
          deletedAt: null
        },
        _count: { _all: true }
      }),
      prisma.invite.count({
        where: {
          status: "PENDING_PAYMENT"
        }
      }),
      prisma.invite.count({
        where: {
          paymentMode: "SPONSORED_BY_HOST",
          createdAt: { gte: since }
        }
      }),
      prisma.roomMember.count({
        where: {
          billingSource: "SPONSORED_BY_HOST",
          leftAt: null
        }
      }),
      prisma.userDocument.count(),
      prisma.userDocument.count({
        where: {
          createdAt: { gte: since }
        }
      }),
      prisma.agentArtifact.count({
        where: {
          status: "DRAFT"
        }
      }),
      prisma.agentArtifact.count({
        where: {
          status: "FINAL"
        }
      }),
      prisma.agentArtifact.count({
        where: {
          createdAt: { gte: since }
        }
      }),
      prisma.agentArtifact.count({
        where: {
          approvedAt: { gte: since }
        }
      }),
      prisma.documentAudit.groupBy({
        by: ["action"],
        where: {
          createdAt: { gte: since }
        },
        _count: { _all: true }
      }),
      prisma.frameworkAcceptance.count(),
      prisma.frameworkAcceptance.count({
        where: {
          acceptedAt: { gte: since }
        }
      }),
      prisma.frameworkAcceptance.count({
        where: {
          acceptedAt: { gte: since },
          signedDocumentDownloadedAt: { not: null }
        }
      }),
      prisma.frameworkAcceptance.findMany({
        orderBy: { acceptedAt: "desc" },
        take: 20,
        select: {
          id: true,
          frameworkKey: true,
          frameworkVersion: true,
          acceptanceType: true,
          acceptanceSource: true,
          roleAtAcceptance: true,
          locale: true,
          acceptedAt: true,
          reviewDocumentOpenedAt: true,
          signedDocumentDownloadedAt: true,
          document: {
            select: {
              id: true,
              title: true
            }
          },
          user: {
            select: {
              id: true,
              email: true
            }
          }
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

    const paymentPipeline30d = buildPaymentPipelineFromCounts({
      initStarted: paymentEventInitStartedCount,
      checkoutCreated: paymentEventCheckoutCreatedCount,
      initFailed: paymentEventInitFailedCount,
      callbackSuccess: paymentEventCallbackSuccessCount,
      callbackPending: paymentEventCallbackPendingCount,
      callbackFailed: paymentEventCallbackFailedCount,
      callbackCanceled: paymentEventCallbackCanceledCount,
      webhookProcessed: paymentEventWebhookProcessedCount,
      webhookPaid: paymentEventWebhookPaidCount,
      webhookFailed: paymentEventWebhookFailedStatusCount,
      webhookCanceled: paymentEventWebhookCanceledStatusCount,
      webhookRefunded: paymentEventWebhookRefundedStatusCount,
      webhookError: paymentEventWebhookErrorCount,
      webhookInvalidSignature: paymentEventWebhookInvalidSignatureCount,
      webhookInvalidPayload: paymentEventWebhookInvalidPayloadCount,
      webhookRateLimited: paymentEventWebhookRateLimitedCount
    });
    const paymentAlerts30d = buildPaymentAlerts(paymentPipeline30d);

    return json({
      ok: true,
      periodDays: 30,
      totalRequests,
      totalCrisis,
      noContextCount,
      ragSearchCount,
      chat: {
        conversationsTotal: conversationTotal,
        activeConversations30d,
        sttRequests30d: sttRequestCount,
        ttsRequests30d: ttsRequestCount,
        ragErrors30d: ragErrorCount,
        openAiErrors30d: openAiErrorCount
      },
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
        recentPayments,
        paymentPipeline30d,
        paymentAlerts30d
      },
      help: {
        openRequests: helpRequestsOpen,
        openOffers: helpOffersOpen,
        newRequests30d: helpRequests30d,
        newOffers30d: helpOffers30d,
        matches30d: helpMatches30d,
        matchesByStatus30d: toCountMap(helpMatchesByStatus, "status")
      },
      collaboration: {
        roomsTotal,
        activeRooms30d: countDistinct(activeRooms30dRows, "roomId"),
        roomMessages30d,
        pendingInvites,
        sponsoredInvites30d,
        activeSponsoredMembers
      },
      documents: {
        total: documentsTotal,
        uploaded30d: documents30d,
        draftArtifacts: artifactsDraft,
        finalArtifacts: artifactsFinal,
        created30d: artifactCreates30d,
        approved30d: artifactApprovals30d,
        actions30d: toCountMap(documentAuditActions30d, "action"),
        frameworkAcceptances: {
          total: frameworkAcceptancesTotal,
          accepted30d: frameworkAcceptances30d,
          signedDownloaded30d: frameworkAcceptancesSigned30d,
          recent: recentFrameworkAcceptances
        }
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
