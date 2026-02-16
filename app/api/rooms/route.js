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

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return errorJson(auth.message, auth.status);

  const isAdmin = auth.userRole === "ADMIN";
  const memberships = isAdmin
    ? await prisma.room.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      })
    : await prisma.roomMember.findMany({
        where: {
          userId: auth.userId,
          leftAt: null
        },
        select: {
          roomId: true,
          role: true,
          lastReadAt: true,
          room: {
            select: {
              title: true,
              description: true,
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  id: true,
                  content: true,
                  createdAt: true
                }
              }
            }
          }
        },
        orderBy: { joinedAt: "asc" }
      });

  const normalizedMemberships = isAdmin
    ? memberships.map(r => ({
        roomId: r.id,
        room: r,
        role: "ADMIN",
        lastReadAt: new Date(0)
      }))
    : memberships;
  if (!normalizedMemberships.length) {
    return json({
      ok: true,
      rooms: []
    });
  }

  const roomIds = [...new Set(normalizedMemberships.map(m => m.roomId).filter(Boolean))];
  const memberCounts = await prisma.roomMember.groupBy({
    by: ["roomId"],
    where: {
      roomId: { in: roomIds },
      leftAt: null
    },
    _count: {
      _all: true
    }
  });
  const memberCountMap = new Map(memberCounts.map(row => [row.roomId, row._count?._all || 0]));

  let unreadCountMap = new Map();
  if (isAdmin) {
    const unreadCounts = await prisma.roomMessage.groupBy({
      by: ["roomId"],
      where: {
        roomId: { in: roomIds },
        deletedAt: null
      },
      _count: {
        _all: true
      }
    });
    unreadCountMap = new Map(unreadCounts.map(row => [row.roomId, row._count?._all || 0]));
  } else {
    const unreadWhere = normalizedMemberships
      .map(m => {
        if (!m?.roomId) return null;
        return {
          roomId: m.roomId,
          deletedAt: null,
          createdAt: {
            gt: m.lastReadAt || new Date(0)
          }
        };
      })
      .filter(Boolean);
    if (unreadWhere.length) {
      const unreadCounts = await prisma.roomMessage.groupBy({
        by: ["roomId"],
        where: {
          OR: unreadWhere
        },
        _count: {
          _all: true
        }
      });
      unreadCountMap = new Map(unreadCounts.map(row => [row.roomId, row._count?._all || 0]));
    }
  }

  const rooms = normalizedMemberships.map(m => {
    const last = m.room.messages?.[0];
    const memberCount = memberCountMap.get(m.roomId) || 0;
    const unreadCount = unreadCountMap.get(m.roomId) || 0;
    return {
      id: m.roomId,
      title: m.room.title || null,
      description: m.room.description || "",
      role: m.role,
      memberCount,
      lastMessage: last
        ? {
            id: last.id,
            content: last.content,
            createdAt: last.createdAt
          }
        : null,
      unreadCount
    };
  });

  return json({
    ok: true,
    rooms
  });
}
