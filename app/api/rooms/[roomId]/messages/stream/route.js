import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { subscribeRoom } from "@/lib/roomStream";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION = process.env.ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION !== "false";
async function requireUser() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return {
      ok: false,
      status: 401,
      message: "Unauthorized"
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
      message: "Unauthorized"
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
      OR: [{
        validUntil: null
      }, {
        validUntil: {
          gt: now
        }
      }]
    },
    select: {
      id: true
    }
  });
  return Boolean(sub);
}
async function ensureAccess(userId, roomId, userRole) {
  if (userRole === "ADMIN") return {
    ok: true
  };
  const member = await prisma.roomMember.findFirst({
    where: {
      userId,
      roomId,
      leftAt: null
    }
  });
  if (!member) return {
    ok: false,
    status: 403
  };
  const userActive = await hasActiveSubscription(userId);
  if (userActive) return {
    ok: true
  };
  if (member.billingSource === "SPONSORED_BY_HOST") {
    if (ALLOW_SPONSORED_WITHOUT_SUBSCRIPTION) return {
      ok: true
    };
    const sponsorActive = await hasActiveSubscription(member.sponsorUserId);
    if (sponsorActive) return {
      ok: true
    };
  }
  return {
    ok: false,
    status: 403
  };
}
function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  };
}
export async function GET(_req, {
  params
}) {
  const roomIdRaw = params?.roomId;
  if (!roomIdRaw) {
    return new NextResponse("Missing roomId", {
      status: 400
    });
  }
  const roomId = Number.isNaN(Number(roomIdRaw)) ? roomIdRaw : Number(roomIdRaw);
  const auth = await requireUser();
  if (!auth.ok) return new NextResponse(null, {
    status: auth.status
  });
  const access = await ensureAccess(auth.userId, roomId, auth.userRole);
  if (!access.ok) return new NextResponse(null, {
    status: access.status || 403
  });
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const write = data => controller.enqueue(encoder.encode(data));
      write(": connected\n\n");
      const unsubscribe = subscribeRoom(roomId, evt => {
        write(`data: ${JSON.stringify(evt)}\n\n`);
      });
      const heartbeat = setInterval(() => {
        try {
          write(": keep-alive\n\n");
        } catch {}
      }, 15000);
      const recheck = setInterval(async () => {
        try {
          const ok = await ensureAccess(auth.userId, roomId);
          if (!ok.ok) {
            clearInterval(heartbeat);
            clearInterval(recheck);
            unsubscribe();
            controller.close();
          }
        } catch {
          clearInterval(heartbeat);
          clearInterval(recheck);
          unsubscribe();
          controller.close();
        }
      }, 20000);
      controller.signal?.addEventListener("abort", () => {
        clearInterval(heartbeat);
        clearInterval(recheck);
        unsubscribe();
      });
    }
  });
  return new NextResponse(stream, {
    status: 200,
    headers: sseHeaders()
  });
}