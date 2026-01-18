import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { publishRoomEvent } from "@/lib/roomStream";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
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
      role: session.user.role
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized"
    };
  }
}
async function canDelete(userId, roomId, authorId, userRole) {
  if (userRole === "OWNER" || userRole === "MODERATOR") return true;
  return userRole === "MEMBER" && userId === authorId;
}
export async function DELETE(_req, {
  params
}) {
  const roomId = params?.roomId;
  const msgId = params?.msgId;
  if (!roomId || !msgId) return json({
    ok: false,
    message: "Missing roomId or msgId"
  }, 400);
  const roomIdNormalized = Number.isNaN(Number(roomId)) ? roomId : Number(roomId);
  const auth = await requireUser();
  if (!auth.ok) return json({
    ok: false,
    message: auth.message
  }, auth.status);
  try {
    const membership = await prisma.roomMember.findFirst({
      where: {
        roomId: roomIdNormalized,
        userId: auth.userId,
        leftAt: null
      }
    });
    if (!membership) return json({
      ok: false,
      message: "Forbidden"
    }, 403);
    const message = await prisma.roomMessage.findFirst({
      where: {
        id: msgId,
        roomId: roomIdNormalized
      },
      select: {
        id: true,
        authorId: true,
        deletedAt: true
      }
    });
    if (!message) return json({
      ok: false,
      message: "Message not found"
    }, 404);
    if (message.deletedAt) return json({
      ok: true,
      id: msgId,
      deleted: true
    });
    const allowed = await canDelete(auth.userId, roomId, message.authorId, membership.role);
    if (!allowed) return json({
      ok: false,
      message: "Forbidden"
    }, 403);
    await prisma.roomMessage.update({
      where: {
        id: msgId
      },
      data: {
        deletedAt: new Date()
      }
    });
    try {
      publishRoomEvent(roomId, {
        type: "delete",
        id: msgId
      });
    } catch {}
    return json({
      ok: true,
      id: msgId,
      deleted: true
    });
  } catch (err) {
    console.error("[room message delete] failed", err);
    return json({
      ok: false,
      message: "Kustutamine ebaõnnestus"
    }, 500);
  }
}