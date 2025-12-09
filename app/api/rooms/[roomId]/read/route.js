// app/api/rooms/[roomId]/read/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    return { ok: true, userId: session.user.id, userRole: session.user.role };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

async function hasActiveSubscription(userId) {
  if (!userId) return false;
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    select: { id: true },
  });
  return Boolean(sub);
}

export async function PUT(_req, { params }) {
  const roomIdRaw = params?.roomId;
  const roomId = Number.isNaN(Number(roomIdRaw)) ? roomIdRaw : Number(roomIdRaw);

  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  try {
    if (auth.userRole === "ADMIN") {
      return json({ ok: true });
    }

    const member = await prisma.roomMember.findFirst({
      where: { roomId, userId: auth.userId, leftAt: null },
    });
    if (!member) return json({ ok: false, message: "Forbidden" }, 403);

    // Access check: self active or sponsor active if sponsored
    if (auth.userRole !== "ADMIN") {
      const userActive = await hasActiveSubscription(auth.userId);
      if (!userActive && member.billingSource === "SPONSORED_BY_HOST") {
        const sponsorActive = await hasActiveSubscription(member.sponsorUserId);
        if (!sponsorActive) return json({ ok: false, message: "Forbidden" }, 403);
      } else if (!userActive && member.billingSource !== "SPONSORED_BY_HOST") {
        return json({ ok: false, message: "Forbidden" }, 403);
      }
    }

    const latest = await prisma.roomMessage.findFirst({
      where: { roomId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    await prisma.roomMember.update({
      where: { roomId_userId: { roomId, userId: auth.userId } },
      data: { lastReadAt: latest?.createdAt || new Date() },
    });

    return json({ ok: true });
  } catch (err) {
    console.error("[room read] failed", err);
    return json({ ok: false, message: "Read marker update failed" }, 500);
  }
}
