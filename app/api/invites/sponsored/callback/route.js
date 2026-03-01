import { NextResponse } from "next/server";
import { normalizeServerLocale } from "@/lib/i18n/serverMessages";
import { localizePath } from "@/lib/localizePath";

function mapCallbackState(rawStatus) {
  const status = String(rawStatus || "")
    .toLowerCase()
    .trim();
  if (!status) return "pending";
  if (["paid", "success", "succeeded", "completed", "ok"].includes(status)) {
    return "success";
  }
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
  const paymentState = mapCallbackState(
    url.searchParams.get("status") ||
      url.searchParams.get("payment_status") ||
      url.searchParams.get("transaction_status")
  );
  const roomId = String(url.searchParams.get("roomId") || "").trim();
  const inviteId = String(url.searchParams.get("inviteId") || "").trim();

  const target = new URL(localizePath("/vestlus", locale), req.url);
  target.searchParams.set("invitePayment", paymentState);
  if (roomId) target.searchParams.set("roomId", roomId);
  if (inviteId) target.searchParams.set("inviteId", inviteId);

  return NextResponse.redirect(target, {
    status: 302
  });
}
