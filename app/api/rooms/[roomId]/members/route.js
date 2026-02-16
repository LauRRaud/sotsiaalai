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

export async function GET(_req, { params }) {
  const roomId = String(params?.roomId || "").trim();
  if (!roomId) return errorJson("api.common.missing_room_id", 400);
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);

  const isAdmin = auth.userRole === "ADMIN";
  const membership = isAdmin
    ? { role: "ADMIN" }
    : await prisma.roomMember.findFirst({
        where: {
          roomId,
          userId: auth.userId,
          leftAt: null
        },
        select: {
          role: true
        }
      });
  if (!membership) return errorJson("api.common.forbidden", 403);

  const [room, members] = await Promise.all([
    prisma.room.findUnique({
      where: { id: roomId },
      select: { title: true }
    }),
    prisma.roomMember.findMany({
      where: {
        roomId,
        leftAt: null
      },
      select: {
        userId: true,
        role: true,
        displayName: true,
        user: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { role: "asc" }
    })
  ]);
  if (!room) return errorJson("api.rooms.not_found", 404);

  return json({
    ok: true,
    role: membership.role,
    roomTitle: room?.title || "",
    members: members.map(m => ({
      userId: m.userId,
      role: m.role,
      name: m.displayName || [m.user.profile?.firstName, m.user.profile?.lastName].filter(Boolean).join(" ") || "",
      isCurrentUser: m.userId === auth.userId
    }))
  });
}
