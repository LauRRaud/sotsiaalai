// app/api/subscription/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { SubscriptionStatus } from "@prisma/client";

const ACTIVE_STATUS = SubscriptionStatus.ACTIVE;
const CANCELED_STATUS = SubscriptionStatus.CANCELED;

// --- ühtlased vastused ---
function ok(payload = {}, status = 200) {
  return NextResponse.json({ ok: true, ...payload }, { status });
}
function err(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

async function requireUser(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return null;
  return { token, userId: String(token.id) };
}

function shape(subscription) {
  if (!subscription) return null;
  return {
    id: subscription.id,
    status: subscription.status,
    plan: subscription.plan,
    validUntil: subscription.validUntil,
    nextBilling: subscription.nextBilling,
    canceledAt: subscription.canceledAt,
    updatedAt: subscription.updatedAt,
  };
}

export async function GET(request) {
  const session = await requireUser(request);
  if (!session) return err("Unauthorized", 401);

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
}

export async function POST(request) {
  const session = await requireUser(request);
  if (!session) return err("Unauthorized", 401);

  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setMonth(validUntil.getMonth() + 1);

  const body = await request.json().catch(() => ({}));
  const plan = typeof body?.plan === "string" && body.plan.trim() ? body.plan.trim() : "kuutellimus";

  // Võta “viimane” tellimus — kui on olemas, uuendame; muidu loome
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
}

export async function DELETE(request) {
  const session = await requireUser(request);
  if (!session) return err("Unauthorized", 401);

  const now = new Date();

  // Märgime kõik ACTIVE tellimused tühistatuks (fail-safe)
  await prisma.subscription.updateMany({
    where: { userId: session.userId, status: ACTIVE_STATUS },
    data: { status: CANCELED_STATUS, canceledAt: now },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.userId },
    orderBy: [{ updatedAt: "desc" }],
  });

  return ok({ subscription: shape(subscription) });
}
