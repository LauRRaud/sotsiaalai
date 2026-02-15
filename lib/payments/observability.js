import { prisma } from "@/lib/prisma";

const PAYMENT_LOG_ENABLED = process.env.PAYMENT_LOG_ENABLED !== "0";
const PAYMENT_DB_LOG_ENABLED = process.env.PAYMENT_DB_LOG_ENABLED !== "0";
const MAX_VALUE_LENGTH = 300;

function clip(value) {
  const text = String(value ?? "");
  if (text.length <= MAX_VALUE_LENGTH) return text;
  return `${text.slice(0, MAX_VALUE_LENGTH)}...`;
}

function normalizePayload(payload = {}) {
  const out = {};
  for (const [key, value] of Object.entries(payload || {})) {
    if (value == null) {
      out[key] = value;
      continue;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = typeof value === "string" ? clip(value) : value;
      continue;
    }
    if (value instanceof Error) {
      out[key] = clip(value.message || value.name || "error");
      continue;
    }
    try {
      out[key] = clip(JSON.stringify(value));
    } catch {
      out[key] = clip(String(value));
    }
  }
  return out;
}

export async function logPaymentEvent(event, payload = {}) {
  if (!PAYMENT_LOG_ENABLED) return;
  const eventName = String(event || "").trim();
  if (!eventName) return;

  const normalizedPayload = normalizePayload(payload);
  const line = {
    ts: new Date().toISOString(),
    event: eventName,
    ...normalizedPayload
  };

  try {
    console.log(`[payments] ${JSON.stringify(line)}`);
  } catch {
    try {
      console.log("[payments] event", eventName);
    } catch {}
  }

  if (!PAYMENT_DB_LOG_ENABLED) return;

  try {
    await prisma.chatLog.create({
      data: {
        event: eventName,
        role: "payment",
        userId: normalizedPayload?.userId || null,
        data: normalizedPayload
      }
    });
  } catch (err) {
    try {
      console.error("[payments][db-log] failed", {
        event: eventName,
        err: err?.message
      });
    } catch {}
  }
}
