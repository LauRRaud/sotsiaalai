import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION = process.env.ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION !== "false";

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}

function errorJson(messageKey, status, extras = {}) {
  return json({
    ok: false,
    messageKey,
    message: messageKey,
    ...extras
  }, status);
}

async function requireUser() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return {
      ok: false,
      status: 401,
      message: "api.common.unauthorized"
    };
    return {
      ok: true,
      userId: session.user.id,
      userRole: session.user.role
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "api.common.unauthorized"
    };
  }
}

async function hasActiveSubscription(userId) {
  if (!userId) return false;
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [
        { validUntil: null },
        {
          validUntil: {
            gt: now
          }
        }
      ]
    },
    select: {
      id: true
    }
  });
  return Boolean(sub);
}

export async function PUT(_req, { params }) {
  const roomIdRaw = params?.roomId;
  const roomId = Number.isNaN(Number(roomIdRaw)) ? roomIdRaw : Number(roomIdRaw);
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);

  try {
    if (auth.userRole === "ADMIN") {
      return json({
        ok: true
      });
    }
    const member = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId: auth.userId,
        leftAt: null
      }
    });
    if (!member) return errorJson("api.common.forbidden", 403);

    if (auth.userRole !== "ADMIN") {
      const userActive = await hasActiveSubscription(auth.userId);
      if (!userActive) {
        if (member.billingSource === "SPONSORED_BY_HOST") {
          if (!ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION) {
            const sponsorActive = await hasActiveSubscription(member.sponsorUserId);
            if (!sponsorActive) return errorJson("api.common.forbidden", 403);
          }
        } else {
          return errorJson("api.common.forbidden", 403);
        }
      }
    }

    const latest = await prisma.roomMessage.findFirst({
      where: {
        roomId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        createdAt: true
      }
    });
    await prisma.roomMember.update({
      where: {
        roomId_userId: {
          roomId,
          userId: auth.userId
        }
      },
      data: {
        lastReadAt: latest?.createdAt || new Date()
      }
    });
    return json({
      ok: true
    });
  } catch (err) {
    console.error("[room read] failed", err);
    return errorJson("api.rooms.read_update_failed", 500);
  }
}
