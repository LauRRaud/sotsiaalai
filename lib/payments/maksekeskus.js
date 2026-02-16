import crypto from "node:crypto";
import { PaymentStatus } from "@/generated/prisma/client";

const MAKSEKESKUS_API_BASE = String(process.env.MAKSEKESKUS_API_BASE || process.env.MAKSEKESKUS_API_URL || "")
  .trim()
  .replace(/\/+$/, "");
const MAKSEKESKUS_API_KEY = String(process.env.MAKSEKESKUS_API_KEY || process.env.MAKSEKESKUS_SECRET_KEY || "").trim();
const MAKSEKESKUS_SHOP_ID = String(process.env.MAKSEKESKUS_SHOP_ID || process.env.MAKSEKESKUS_MERCHANT_ID || "").trim();
const MAKSEKESKUS_CHECKOUT_URL_TEMPLATE = String(process.env.MAKSEKESKUS_CHECKOUT_URL_TEMPLATE || "").trim();
const MAKSEKESKUS_TIMEOUT_MS = Number(process.env.MAKSEKESKUS_TIMEOUT_MS || 15_000);

function getCheckoutUrl(payload = {}) {
  return String(
    payload?.checkoutUrl ||
      payload?.checkout_url ||
      payload?.paymentUrl ||
      payload?.payment_url ||
      payload?.url ||
      payload?.link ||
      ""
  ).trim();
}

function getProviderPaymentId(payload = {}, fallback = "") {
  return String(
    payload?.providerPaymentId ||
      payload?.provider_payment_id ||
      payload?.transactionId ||
      payload?.transaction_id ||
      payload?.id ||
      fallback
  ).trim();
}

function normalizeLocale(locale) {
  const base = String(locale || "en")
    .toLowerCase()
    .split("-")[0]
    .trim();
  if (base === "et" || base === "ru" || base === "en") return base;
  return "en";
}

export function makeProviderPaymentId(userId = "") {
  const userPart = String(userId || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(-10);
  const rand = crypto.randomBytes(4).toString("hex");
  return `mk_${Date.now()}_${userPart || "user"}_${rand}`;
}

export function mapProviderPaymentStatus(input) {
  const raw = String(input || "")
    .toLowerCase()
    .trim();
  if (!raw) return null;
  if (["paid", "success", "succeeded", "completed", "complete", "authorized"].includes(raw)) {
    return PaymentStatus.PAID;
  }
  if (["failed", "declined", "error"].includes(raw)) {
    return PaymentStatus.FAILED;
  }
  if (["canceled", "cancelled", "voided"].includes(raw)) {
    return PaymentStatus.CANCELED;
  }
  if (["refunded", "refund"].includes(raw)) {
    return PaymentStatus.REFUNDED;
  }
  if (["pending", "initiated", "created", "processing", "in_progress"].includes(raw)) {
    return PaymentStatus.INITIATED;
  }
  if (raw.includes("refund")) return PaymentStatus.REFUNDED;
  if (raw.includes("cancel") || raw.includes("void")) return PaymentStatus.CANCELED;
  if (raw.includes("fail") || raw.includes("declin") || raw.includes("error")) return PaymentStatus.FAILED;
  if (raw.includes("success") || raw.includes("paid") || raw.includes("complete") || raw.includes("authoriz")) {
    return PaymentStatus.PAID;
  }
  if (raw.includes("pending") || raw.includes("process") || raw.includes("init")) {
    return PaymentStatus.INITIATED;
  }
  return null;
}

export function extractProviderPaymentId(payload = {}) {
  return String(
    payload?.providerPaymentId ||
      payload?.provider_payment_id ||
      payload?.reference ||
      payload?.merchant_reference ||
      payload?.transactionId ||
      payload?.transaction_id ||
      payload?.id ||
      ""
  ).trim();
}

export function verifyWebhookSignature(rawBody, receivedSignature, secret) {
  const signature = String(receivedSignature || "").trim();
  const sharedSecret = String(secret || "").trim();
  if (!sharedSecret) return true;
  if (!signature) return false;

  const digestHex = crypto.createHmac("sha256", sharedSecret).update(rawBody).digest("hex");
  const digestBase64 = crypto.createHmac("sha256", sharedSecret).update(rawBody).digest("base64");

  const candidates = [digestHex, digestBase64];
  return candidates.some((candidate) => {
    if (candidate.length !== signature.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(signature));
    } catch {
      return false;
    }
  });
}

export async function createMaksekeskusCheckout({
  providerPaymentId,
  amount,
  currency,
  locale,
  returnUrl,
  cancelUrl,
  webhookUrl,
  customerEmail,
  description
}) {
  const normalizedLocale = normalizeLocale(locale);

  if (MAKSEKESKUS_API_BASE && MAKSEKESKUS_API_KEY && MAKSEKESKUS_SHOP_ID) {
    const payload = {
      shop_id: MAKSEKESKUS_SHOP_ID,
      reference: providerPaymentId,
      amount,
      currency,
      locale: normalizedLocale,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notification_url: webhookUrl,
      description,
      customer: customerEmail ? { email: customerEmail } : undefined
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.max(1000, MAKSEKESKUS_TIMEOUT_MS));

    try {
      const response = await fetch(`${MAKSEKESKUS_API_BASE}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MAKSEKESKUS_API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const err = new Error(data?.messageKey || data?.message || "api.subscription.checkout_create_failed");
        err.status = response.status;
        err.payload = data;
        throw err;
      }

      const checkoutUrl = getCheckoutUrl(data);
      if (!checkoutUrl) {
        throw new Error("api.subscription.checkout_create_failed");
      }

      return {
        checkoutUrl,
        providerPaymentId: getProviderPaymentId(data, providerPaymentId),
        raw: data
      };
    } finally {
      clearTimeout(timer);
    }
  }

  if (MAKSEKESKUS_CHECKOUT_URL_TEMPLATE) {
    const encodedRef = encodeURIComponent(providerPaymentId);
    const checkoutUrl = MAKSEKESKUS_CHECKOUT_URL_TEMPLATE
      .replaceAll("{REFERENCE}", encodedRef)
      .replaceAll("{AMOUNT}", encodeURIComponent(String(amount)))
      .replaceAll("{CURRENCY}", encodeURIComponent(String(currency)))
      .replaceAll("{LOCALE}", encodeURIComponent(normalizedLocale));

    return {
      checkoutUrl,
      providerPaymentId,
      raw: {
        template: true
      }
    };
  }

  throw new Error("api.subscription.provider_unavailable");
}
