// app/api/subscription/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { SubscriptionStatus } from "@prisma/client";

const ACTIVE_STATUS = SubscriptionStatus.ACTIVE;
const CANCELED_STATUS = SubscriptionStatus.CANCELED;

// --- utils: ühtlased vastused + no-store päised ---
function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
function ok(payload = {}, status = 200) {
  return json({ ok: true, ...payload }, status);
}
function err(message, status = 400, extras = {}) {
  return json({ ok: false, message, ...extras }, status);
}

async function requireUser(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return null;
  return { token, userId: String(token.id) };
}

function shape(subscription) {
  if (!subscription) return null;
  const now = Date.now();
  const validUntil = subscription.validUntil ? new Date(subscription.validUntil).getTime() : null;
  const daysLeft =
    validUntil && validUntil > now ? Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24)) : 0;
  const isActive = subscription.status === ACTIVE_STATUS && daysLeft > 0;
  return {
    id: subscription.id,
    status: subscription.status,
    plan: subscription.plan,
    validUntil: subscription.validUntil,
    nextBilling: subscription.nextBilling,
    canceledAt: subscription.canceledAt,
    updatedAt: subscription.updatedAt,
    // tuletatud väljad – UI abistamiseks
    isActive,
    daysLeft,
  };
}

// lihtne plaani normaliseerimine (soovi korral piira lubatute listiga)
const PLAN_MAX_LEN = 80;
function normalizePlan(v) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "kuutellimus";
  return s.length > PLAN_MAX_LEN ? s.slice(0, PLAN_MAX_LEN) : s;
}

export async function GET(request) {
  const session = await requireUser(request);
  if (!session) return err("Unauthorized", 401);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, role: true },
    });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.userId },
      orderBy: [{ updatedAt: "desc" }],
    });

    return ok({
      user,
      subscription: shape(subscription),
    });
  } catch (e) {
    console.error("subscription GET error", e);
    return err("Tellimuse päring ebaõnnestus.", 500);
  }
}

export async function POST(request) {
  const session = await requireUser(request);
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await request.json().catch(() => ({}));
    const plan = normalizePlan(body?.plan);

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setMonth(validUntil.getMonth() + 1);

    // Võta viimane tellimus — kui on olemas, uuenda; muidu loo
    const existing = await prisma.subscription.findFirst({
      where: { userId: session.userId },
      orderBy: [{ createdAt: "desc" }],
    });

    const subscription = existing
      ? await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: ACTIVE_STATUS,
            plan,
            validUntil,
            nextBilling: validUntil,
            canceledAt: null,
          },
        })
      : await prisma.subscription.create({
          data: {
            userId: session.userId,
            status: ACTIVE_STATUS,
            plan,
            validUntil,
            nextBilling: validUntil,
          },
        });

    return ok({ subscription: shape(subscription) });
  } catch (e) {
    console.error("subscription POST error", e);
    return err("Tellimuse aktiveerimine ebaõnnestus.", 500);
  }
}

export async function DELETE(request) {
  const session = await requireUser(request);
  if (!session) return err("Unauthorized", 401);

  try {
    const now = new Date();

    // Märgime kõik ACTIVE tellimused tühistatuks (idempotentne)
    await prisma.subscription.updateMany({
      where: { userId: session.userId, status: ACTIVE_STATUS },
      data: { status: CANCELED_STATUS, canceledAt: now },
    });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.userId },
      orderBy: [{ updatedAt: "desc" }],
    });

    return ok({ subscription: shape(subscription) });
  } catch (e) {
    console.error("subscription DELETE error", e);
    return err("Tellimuse tühistamine ebaõnnestus.", 500);
  }
}
