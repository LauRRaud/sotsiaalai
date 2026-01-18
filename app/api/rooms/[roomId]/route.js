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
export async function DELETE(_req, {
  params
}) {
  const auth = await requireUser();
  if (!auth.ok) return json({
    ok: false,
    message: auth.message
  }, auth.status);
  const roomIdRaw = params?.roomId;
  if (!roomIdRaw) return json({
    ok: false,
    message: "Missing roomId"
  }, 400);
  const roomId = Number.isNaN(Number(roomIdRaw)) ? roomIdRaw : Number(roomIdRaw);
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId
      }
    });
    if (!room) return json({
      ok: false,
      message: "Room not found"
    }, 404);
    const isAdmin = auth.userRole === "ADMIN";
    if (!isAdmin && room.ownerId !== auth.userId) {
      return json({
        ok: false,
        message: "Forbidden"
      }, 403);
    }
    await prisma.room.delete({
      where: {
        id: roomId
      }
    });
    return json({
      ok: true
    });
  } catch (err) {
    console.error("[room delete] failed", err);
    return json({
      ok: false,
      message: "Failed to delete room"
    }, 500);
  }
}