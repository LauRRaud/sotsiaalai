// app/api/invites/[id]/accept/route.js
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_ACCEPT = 20;
const SPONSORED_MEMBER_LIMIT = 50;
const ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION =
  process.env.ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION !== "false";

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

async function requireUser() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return { ok: false, status: 401, message: "Unauthorized" };
    return {
      ok: true,
      userId: session.user.id,
      role: session.user.role,
      isAdmin: !!session.user.isAdmin,
      email: session.user.email,
    };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("base64");
}

const rateBuckets = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > limit) throw fail(429, "Liiga palju päringuid, proovi hiljem uuesti.");
}

async function hasActiveSubscriptionTx(trx, userId) {
  if (!userId) return false;
  const now = new Date();
  const sub = await trx.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    select: { id: true },
  });
  return Boolean(sub);
}

function fail(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

async function hasSponsorCapacity(trx, roomId) {
  const count = await trx.roomMember.count({
    where: { roomId, billingSource: "SPONSORED_BY_HOST", leftAt: null },
  });
  return count < SPONSORED_MEMBER_LIMIT;
}

export async function POST(_req, { params }) {
  const tokenRaw = params?.id;
  if (!tokenRaw) return json({ ok: false, message: "Missing token" }, 400);

  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);
  const userEmailRow = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { email: true },
  });
  const userEmail = (auth.email || userEmailRow?.email || "").trim().toLowerCase();

  const tokenHash = hashToken(tokenRaw);

  try {
    rateLimit(`invites:accept:${auth.userId}`, RATE_LIMIT_ACCEPT, RATE_LIMIT_WINDOW_MS);
    const result = await prisma.$transaction(async (trx) => {
      await trx.$queryRaw`SELECT 1 FROM "Invite" WHERE "tokenHash" = ${tokenHash} FOR UPDATE`;
      const invite = await trx.invite.findUnique({
        where: { tokenHash },
        include: { room: true },
      });
      if (!invite) throw fail(404, "Invite not found", "INVITE_NOT_FOUND");

      const now = new Date();
      if (invite.status !== "SENT" || invite.expiresAt <= now) {
        throw fail(410, "Invite expired", "INVITE_EXPIRED");
      }
      if (invite.useCount >= invite.maxUses) {
        throw fail(410, "Invite already used", "INVITE_EXHAUSTED");
      }

      if (invite.inviteeEmail) {
        const inviteEmail = invite.inviteeEmail.trim().toLowerCase();
        if (!userEmail || inviteEmail !== userEmail) {
          throw fail(403, "Invite email mismatch", "INVITE_EMAIL_MISMATCH");
        }
      }

      const userActive = auth.role === "ADMIN" ? true : await hasActiveSubscriptionTx(trx, auth.userId);

      let billingSource = "SELF";
      let sponsorUserId = null;
      let sponsorOrgId = null;

      if (!userActive) {
        if (invite.paymentMode === "SELF_PAID") {
          throw fail(402, "Subscription required", "SUBSCRIPTION_REQUIRED");
        }

        if (invite.paymentMode === "SPONSORED_BY_HOST") {
          const sponsorId = invite.sponsoredByUserId || invite.room?.ownerId;
          if (!ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION) {
            const sponsorOk = await hasActiveSubscriptionTx(trx, sponsorId);
            if (!sponsorOk) {
              throw fail(409, "Sponsor plan unavailable", "SPONSOR_NOT_AVAILABLE");
            }
          }
          const capacity = await hasSponsorCapacity(trx, invite.roomId);
          if (!capacity) {
            throw fail(409, "Sponsor capacity full", "SPONSOR_NOT_AVAILABLE");
          }
          billingSource = "SPONSORED_BY_HOST";
          sponsorUserId = sponsorId;
          sponsorOrgId = invite.sponsoredByOrgId || null;
        }
      }

      await trx.roomMember.upsert({
        where: { roomId_userId: { roomId: invite.roomId, userId: auth.userId } },
        create: {
          roomId: invite.roomId,
          userId: auth.userId,
          role: "MEMBER",
          billingSource,
          sponsorUserId,
          sponsorOrgId,
          joinedAt: now,
        },
        update: {
          leftAt: null,
          billingSource,
          sponsorUserId,
          sponsorOrgId,
        },
      });

      const newUse = invite.useCount + 1;
      await trx.invite.update({
        where: { id: invite.id },
        data: {
          useCount: newUse,
          status: newUse >= invite.maxUses ? "ACCEPTED" : "SENT",
          acceptedBillingSource: billingSource,
          acceptedByUserId: auth.userId,
        },
      });

      return {
        ok: true,
        roomId: invite.roomId,
        billing_source: billingSource,
      };
    });

    return json(result, 200);
  } catch (err) {
    if (err?.status) {
      return json({ ok: false, message: err.message, code: err.code }, err.status);
    }
    console.error("[invite accept] failed", err);
    return json({ ok: false, message: "Invite accept failed" }, 500);
  }
}
