// app/api/rooms/[roomId]/leave/route.js
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
    return { ok: true, userId: session.user.id };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

export async function POST(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const roomIdRaw = params?.roomId;
  if (!roomIdRaw) return json({ ok: false, message: "Missing roomId" }, 400);
  const roomId = Number.isNaN(Number(roomIdRaw)) ? roomIdRaw : Number(roomIdRaw);

  try {
    const membership = await prisma.roomMember.findFirst({
      where: { roomId, userId: auth.userId, leftAt: null },
    });
    if (!membership) return json({ ok: false, message: "Not a member" }, 404);
    if (membership.role === "OWNER") {
      return json({ ok: false, message: "Omanik ei saa ruumist lahkuda." }, 409);
    }

    await prisma.roomMember.update({
      where: { roomId_userId: { roomId, userId: auth.userId } },
      data: { leftAt: new Date() },
    });

    return json({ ok: true });
  } catch (err) {
    console.error("[room leave] failed", err);
    return json({ ok: false, message: "Failed to leave room" }, 500);
  }
}
