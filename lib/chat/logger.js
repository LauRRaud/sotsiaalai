import { prisma } from "@/lib/prisma";
export async function logEvent(event, payload = {}) {
  if (!event) return;
  try {
    await prisma.chatLog.create({
      data: {
        event,
        role: payload.role || null,
        userId: payload.userId || null,
        data: payload
      }
    });
  } catch (err) {
    try {
      console.error("[chat][logEvent] failed", {
        event,
        err: err?.message
      });
    } catch {}
  }
}