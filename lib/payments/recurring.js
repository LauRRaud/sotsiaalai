import {
  BillingMethodStatus,
  BillingMode,
  PaymentKind,
  PaymentProvider,
  SubscriptionStatus
} from "@/generated/prisma/client";

const MAX_RETRY_COUNT = Math.max(0, Number(process.env.SUBSCRIPTION_RENEWAL_MAX_RETRY_COUNT || 3));

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

export function isRecurringBillingEnabled() {
  const raw = String(process.env.SUBSCRIPTION_RECURRING_ENABLED || "")
    .trim()
    .toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export function getSubscriptionBillingMode() {
  return isRecurringBillingEnabled() ? BillingMode.RECURRING : BillingMode.ONE_OFF;
}

export function getInitialSubscriptionPaymentKind() {
  return PaymentKind.SUBSCRIPTION_INITIAL;
}

export function getInviteSponsoredPaymentKind() {
  return PaymentKind.INVITE_SPONSORED;
}

export function getRenewalPaymentKind() {
  return PaymentKind.SUBSCRIPTION_RENEWAL;
}

export function getRetryScheduleDays() {
  const raw = String(process.env.SUBSCRIPTION_RENEWAL_RETRY_DAYS || "1,3,5").trim();
  const values = raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0);
  return values.length ? values : [1, 3, 5];
}

export function computeNextRetryAt(failedAt, retryCount = 0) {
  const base = asDate(failedAt) || new Date();
  const schedule = getRetryScheduleDays();
  const index = Math.max(0, Math.min(schedule.length - 1, Number(retryCount || 0)));
  return addDays(base, schedule[index]);
}

export function shouldCancelAfterRetryCount(retryCount = 0) {
  return Number(retryCount || 0) >= MAX_RETRY_COUNT;
}

export function extractRecurringToken(payload = {}) {
  return String(
    payload?.recurringToken ||
      payload?.recurring_token ||
      payload?.card_token ||
      payload?.token ||
      payload?.payment_token ||
      ""
  ).trim();
}

export function extractRecurringMandateId(payload = {}) {
  return String(
    payload?.mandateId ||
      payload?.mandate_id ||
      payload?.agreementId ||
      payload?.agreement_id ||
      payload?.recurringId ||
      payload?.recurring_id ||
      ""
  ).trim();
}

export function extractProviderCustomerId(payload = {}) {
  return String(
    payload?.customerId ||
      payload?.customer_id ||
      payload?.customer?.id ||
      ""
  ).trim();
}

export function buildBillingMethodLabel(payload = {}) {
  const brand = String(payload?.cardBrand || payload?.card_brand || payload?.card?.brand || "").trim();
  const last4 = String(payload?.cardLast4 || payload?.card_last4 || payload?.card?.last4 || "").trim();
  if (brand && last4) return `${brand} •••• ${last4}`;
  if (last4) return `Card •••• ${last4}`;
  return "";
}

export function buildRecurringPaymentReference(subscriptionId = "") {
  const suffix = String(subscriptionId || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(-10);
  return `mk_renew_${Date.now()}_${suffix || "sub"}`;
}

export function getDueRecurringSubscriptionWhere(now = new Date()) {
  return {
    status: SubscriptionStatus.ACTIVE,
    billingMode: BillingMode.RECURRING,
    billingInterval: "MONTHLY",
    billingMethod: {
      status: BillingMethodStatus.ACTIVE,
      provider: PaymentProvider.MAKSEKESKUS
    },
    OR: [{ nextBilling: null }, { nextBilling: { lte: now } }]
  };
}
