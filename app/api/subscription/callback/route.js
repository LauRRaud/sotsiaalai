export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { normalizeServerLocale } from "@/lib/i18n/serverMessages";
import { localizePath } from "@/lib/localizePath";
import { logPaymentEvent } from "@/lib/payments/observability";

function mapCallbackState(rawStatus) {
  const status = String(rawStatus || "")
    .toLowerCase()
    .trim();
  if (!status) return "pending";
  if (["paid", "success", "succeeded", "completed", "ok"].includes(status)) return "success";
  if (["failed", "error", "declined"].includes(status)) return "failed";
  if (["canceled", "cancelled", "aborted"].includes(status)) return "canceled";
  if (["pending", "processing", "initiated"].includes(status)) return "pending";
  return "pending";
}

function pickLocale(url, req) {
  const fromQuery = normalizeServerLocale(url.searchParams.get("locale"));
  if (fromQuery) return fromQuery;
  const fromHeader = normalizeServerLocale(req.headers.get("accept-language"));
  return fromHeader || "en";
}

export async function GET(req) {
  const url = new URL(req.url);
  const locale = pickLocale(url, req);

  const rawStatus =
    url.searchParams.get("status") ||
    url.searchParams.get("payment_status") ||
    url.searchParams.get("transaction_status");
  const paymentState = mapCallbackState(rawStatus);

  const ref =
    url.searchParams.get("reference") ||
    url.searchParams.get("providerPaymentId") ||
    url.searchParams.get("transaction_id") ||
    "";

  const target = new URL(localizePath("/tellimus", locale), req.url);
  target.searchParams.set("payment", paymentState);
  if (ref) target.searchParams.set("ref", ref);

  logPaymentEvent("subscription_callback_redirect", {
    locale,
    rawStatus: rawStatus || "",
    paymentState,
    providerPaymentId: ref || ""
  });

  return NextResponse.redirect(target, {
    status: 302
  });
}
