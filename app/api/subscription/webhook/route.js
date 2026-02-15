export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PaymentProvider, PaymentStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";
import { extractProviderPaymentId, mapProviderPaymentStatus, verifyWebhookSignature } from "@/lib/payments/maksekeskus";
import { logPaymentEvent } from "@/lib/payments/observability";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};
const WEBHOOK_SECRET = String(process.env.MAKSEKESKUS_WEBHOOK_SECRET || "").trim();
const WEBHOOK_ALLOW_UNSIGNED = String(process.env.SUBSCRIPTION_WEBHOOK_ALLOW_UNSIGNED || "")
  .trim()
  .toLowerCase();
const SUBSCRIPTION_WEBHOOK_RATE_LIMIT_WINDOW_MS = Number(process.env.SUBSCRIPTION_WEBHOOK_RATE_LIMIT_WINDOW_MS || 60_000);
const SUBSCRIPTION_WEBHOOK_RATE_LIMIT_MAX = Number(process.env.SUBSCRIPTION_WEBHOOK_RATE_LIMIT_MAX || 120);
const REFUNDED_ACTION = normalizeSubscriptionAction(process.env.SUBSCRIPTION_WEBHOOK_REFUNDED_ACTION, "cancel");
const CANCELED_ACTION = normalizeSubscriptionAction(process.env.SUBSCRIPTION_WEBHOOK_CANCELED_ACTION, "none");
const FAILED_ACTION = normalizeSubscriptionAction(process.env.SUBSCRIPTION_WEBHOOK_FAILED_ACTION, "none");
const FINAL_STATUSES = new Set([PaymentStatus.PAID, PaymentStatus.CANCELED, PaymentStatus.FAILED, PaymentStatus.REFUNDED]);
const OWNER_NOTIFICATION_EMAIL = String(process.env.PAYMENT_OWNER_EMAIL || "info@sotsiaal.ai")
  .trim()
  .toLowerCase();
const OWNER_NOTIFICATION_LOCALE = normalizeServerLocale(process.env.PAYMENT_OWNER_EMAIL_LOCALE) || "en";
const ownerMailer = getMailer("payment-owner-webhook");

function shouldAllowUnsignedWebhook() {
  if (WEBHOOK_ALLOW_UNSIGNED === "1" || WEBHOOK_ALLOW_UNSIGNED === "true" || WEBHOOK_ALLOW_UNSIGNED === "yes") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}

function json(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: NO_STORE_HEADERS
  });
}

function addMonths(baseDate, months) {
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + months);
  return date;
}

function parsePaidAt(payload) {
  const raw =
    payload?.paidAt ||
    payload?.paid_at ||
    payload?.transaction_time ||
    payload?.completed_at ||
    payload?.updated_at ||
    null;
  if (!raw) return new Date();
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
}

function resolveIncomingStatus(payload) {
  const candidates = [
    payload?.status,
    payload?.payment_status,
    payload?.transaction_status,
    payload?.event,
    payload?.type
  ];
  for (const candidate of candidates) {
    const mapped = mapProviderPaymentStatus(candidate);
    if (mapped) return mapped;
  }
  return null;
}

function normalizeSubscriptionAction(value, fallback) {
  const raw = String(value || "")
    .toLowerCase()
    .trim();
  if (raw === "cancel" || raw === "none") return raw;
  return fallback;
}

function actionForStatus(status) {
  if (status === PaymentStatus.REFUNDED) return REFUNDED_ACTION;
  if (status === PaymentStatus.CANCELED) return CANCELED_ACTION;
  if (status === PaymentStatus.FAILED) return FAILED_ACTION;
  return "none";
}

function asIso(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function canSendOwnerNotification(result) {
  return Boolean(result?.updated) && Boolean(result?.paymentId) && Boolean(result?.status);
}

async function sendOwnerPaymentWebhookNotification({ providerPaymentId, status, paymentId, subscriptionAction }) {
  const to = OWNER_NOTIFICATION_EMAIL;
  const from = String(process.env.EMAIL_FROM || process.env.SMTP_FROM || "").trim();
  if (!to || !to.includes("@")) {
    logPaymentEvent("subscription_webhook_owner_email_skipped", {
      paymentId,
      providerPaymentId,
      status,
      reason: "recipient_missing"
    });
    return;
  }
  if (!from) {
    logPaymentEvent("subscription_webhook_owner_email_skipped", {
      paymentId,
      providerPaymentId,
      status,
      reason: "email_from_missing"
    });
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      paidAt: true,
      user: {
        select: {
          id: true,
          email: true
        }
      },
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          validUntil: true,
          canceledAt: true
        }
      }
    }
  });

  const adminUrl = `${(resolveBaseUrl() || "").replace(/\/+$/, "")}/admin/analytics`;
  const values = {
    status: String(status || payment?.status || ""),
    providerPaymentId: String(providerPaymentId || ""),
    paymentId: String(payment?.id || paymentId || ""),
    userEmail: String(payment?.user?.email || ""),
    userId: String(payment?.user?.id || ""),
    amount: String(payment?.amount ?? ""),
    currency: String(payment?.currency || ""),
    paidAt: asIso(payment?.paidAt),
    createdAt: asIso(payment?.createdAt),
    subscriptionId: String(payment?.subscription?.id || ""),
    subscriptionPlan: String(payment?.subscription?.plan || ""),
    subscriptionStatus: String(payment?.subscription?.status || ""),
    subscriptionValidUntil: asIso(payment?.subscription?.validUntil),
    subscriptionCanceledAt: asIso(payment?.subscription?.canceledAt),
    subscriptionAction: String(subscriptionAction || "none"),
    eventTime: new Date().toISOString(),
    adminUrl
  };

  await ownerMailer.sendMail({
    to,
    from,
    subject: serverT(OWNER_NOTIFICATION_LOCALE, "email.payment.owner_webhook.subject", values),
    text: serverT(OWNER_NOTIFICATION_LOCALE, "email.payment.owner_webhook.text", values),
    html: serverT(OWNER_NOTIFICATION_LOCALE, "email.payment.owner_webhook.html", values)
  });

  logPaymentEvent("subscription_webhook_owner_email_sent", {
    paymentId: values.paymentId,
    providerPaymentId: values.providerPaymentId,
    status: values.status,
    subscriptionAction: values.subscriptionAction,
    to
  });
}

async function activateSubscriptionFromPayment(tx, payment) {
  const existing = await tx.subscription.findUnique({
    where: { id: payment.subscriptionId },
    select: {
      id: true,
      validUntil: true
    }
  });
  if (!existing) return null;

  const now = new Date();
  const anchor =
    existing.validUntil && new Date(existing.validUntil).getTime() > now.getTime() ? new Date(existing.validUntil) : now;
  const validUntil = addMonths(anchor, 1);

  return tx.subscription.update({
    where: { id: existing.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      validUntil,
      nextBilling: validUntil,
      canceledAt: null
    },
    select: {
      id: true,
      status: true,
      validUntil: true,
      nextBilling: true
    }
  });
}

async function cancelSubscriptionFromPayment(tx, payment) {
  if (!payment?.subscriptionId) return null;
  await tx.subscription.updateMany({
    where: {
      id: payment.subscriptionId,
      status: SubscriptionStatus.ACTIVE
    },
    data: {
      status: SubscriptionStatus.CANCELED,
      canceledAt: new Date()
    }
  });
  return tx.subscription.findUnique({
    where: {
      id: payment.subscriptionId
    },
    select: {
      id: true,
      status: true,
      validUntil: true,
      nextBilling: true,
      canceledAt: true,
      plan: true,
      userId: true,
      updatedAt: true,
      createdAt: true
    }
  });
}

export async function POST(request) {
  const ip = getRequestIpFromRequest(request);
  const limiter = consumeRateLimit(
    `subscription:webhook:${ip}`,
    SUBSCRIPTION_WEBHOOK_RATE_LIMIT_MAX,
    SUBSCRIPTION_WEBHOOK_RATE_LIMIT_WINDOW_MS
  );
  if (!limiter.allowed) {
    logPaymentEvent("subscription_webhook_rate_limited", {
      ip
    });
    return json(
      {
        ok: false,
        messageKey: "api.common.rate_limited",
        message: "api.common.rate_limited"
      },
      429
    );
  }

  const rawBody = await request.text().catch(() => "");
  if (!rawBody) {
    logPaymentEvent("subscription_webhook_invalid_payload", {
      ip,
      reason: "empty_body"
    });
    return json(
      {
        ok: false,
        messageKey: "api.subscription.webhook_invalid_payload",
        message: "api.subscription.webhook_invalid_payload"
      },
      400
    );
  }

  const signature =
    request.headers.get("x-maksekeskus-signature") ||
    request.headers.get("x-signature") ||
    request.headers.get("x-webhook-signature") ||
    "";
  if (!WEBHOOK_SECRET && !shouldAllowUnsignedWebhook()) {
    logPaymentEvent("subscription_webhook_signature_unconfigured", {
      ip
    });
    return json(
      {
        ok: false,
        messageKey: "api.subscription.webhook_signature_unconfigured",
        message: "api.subscription.webhook_signature_unconfigured"
      },
      503
    );
  }
  if (!verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
    logPaymentEvent("subscription_webhook_invalid_signature", {
      ip
    });
    return json(
      {
        ok: false,
        messageKey: "api.subscription.webhook_signature_invalid",
        message: "api.subscription.webhook_signature_invalid"
      },
      401
    );
  }

  let payload = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    logPaymentEvent("subscription_webhook_invalid_payload", {
      ip,
      reason: "invalid_json"
    });
    return json(
      {
        ok: false,
        messageKey: "api.subscription.webhook_invalid_payload",
        message: "api.subscription.webhook_invalid_payload"
      },
      400
    );
  }

  const providerPaymentId = extractProviderPaymentId(payload);
  const nextStatus = resolveIncomingStatus(payload);
  if (!providerPaymentId || !nextStatus) {
    logPaymentEvent("subscription_webhook_invalid_payload", {
      ip,
      reason: "missing_fields",
      providerPaymentId: providerPaymentId || "",
      incomingStatus: payload?.status || payload?.payment_status || payload?.transaction_status || ""
    });
    return json(
      {
        ok: false,
        messageKey: "api.subscription.webhook_invalid_payload",
        message: "api.subscription.webhook_invalid_payload"
      },
      400
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: {
          provider_providerPaymentId: {
            provider: PaymentProvider.MAKSEKESKUS,
            providerPaymentId
          }
        },
        select: {
          id: true,
          status: true,
          subscriptionId: true
        }
      });

      if (!payment) {
        return {
          notFound: true
        };
      }

      const sameStatus = payment.status === nextStatus;
      if (sameStatus) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            raw: {
              source: "maksekeskus_webhook",
              payload
            }
          }
        });
        return {
          idempotent: true,
          paymentId: payment.id,
          status: payment.status
        };
      }

      if (FINAL_STATUSES.has(payment.status) && nextStatus !== PaymentStatus.REFUNDED) {
        return {
          ignored: true,
          paymentId: payment.id,
          status: payment.status
        };
      }

      const paidAt = nextStatus === PaymentStatus.PAID ? parsePaidAt(payload) : null;
      const subscriptionAction = nextStatus === PaymentStatus.PAID ? "activate" : actionForStatus(nextStatus);
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          ...(paidAt ? { paidAt } : {}),
          raw: {
            source: "maksekeskus_webhook",
            payload,
            subscriptionAction
          }
        },
        select: {
          id: true,
          status: true,
          subscriptionId: true
        }
      });

      let subscription = null;
      if (nextStatus === PaymentStatus.PAID) {
        subscription = await activateSubscriptionFromPayment(tx, updatedPayment);
      } else if (subscriptionAction === "cancel") {
        subscription = await cancelSubscriptionFromPayment(tx, updatedPayment);
      }

      return {
        updated: true,
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        subscription,
        subscriptionAction
      };
    });

    if (result?.notFound) {
      logPaymentEvent("subscription_webhook_payment_not_found", {
        providerPaymentId
      });
      return json({
        ok: true,
        ignored: true,
        messageKey: "api.subscription.payment_not_found",
        message: "api.subscription.payment_not_found"
      });
    }

    logPaymentEvent("subscription_webhook_processed", {
      providerPaymentId,
      resultStatus: result?.status || "",
      subscriptionAction: result?.subscriptionAction || "none",
      updated: Boolean(result?.updated),
      idempotent: Boolean(result?.idempotent),
      ignored: Boolean(result?.ignored)
    });

    if (canSendOwnerNotification(result)) {
      try {
        await sendOwnerPaymentWebhookNotification({
          providerPaymentId,
          status: result?.status,
          paymentId: result?.paymentId,
          subscriptionAction: result?.subscriptionAction
        });
      } catch (notifyError) {
        logPaymentEvent("subscription_webhook_owner_email_failed", {
          paymentId: result?.paymentId || "",
          providerPaymentId,
          status: result?.status || "",
          error: notifyError
        });
      }
    }

    return json({
      ok: true,
      ...result
    });
  } catch (error) {
    console.error("subscription webhook error", error);
    logPaymentEvent("subscription_webhook_failed", {
      providerPaymentId,
      error
    });
    return json(
      {
        ok: false,
        messageKey: "api.subscription.webhook_process_failed",
        message: "api.subscription.webhook_process_failed"
      },
      500
    );
  }
}
