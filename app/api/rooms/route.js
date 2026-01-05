// app/api/rooms/route.js
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

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

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
            select: { id: true, content: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "asc" },
      })
    : await prisma.roomMember.findMany({
        where: { userId: auth.userId, leftAt: null },
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
                select: { id: true, content: true, createdAt: true },
              },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      });

  const rooms = await Promise.all(
    (isAdmin
      ? memberships.map((r) => ({
          roomId: r.id,
          room: r,
          role: "ADMIN",
          lastReadAt: new Date(0),
        }))
      : memberships
    ).map(async (m) => {
      const last = m.room.messages?.[0];
      const memberCount = await prisma.roomMember.count({
        where: { roomId: m.roomId, leftAt: null },
      });
      const unreadCount = await prisma.roomMessage.count({
        where: {
          roomId: m.roomId,
          deletedAt: null,
          createdAt: { gt: m.lastReadAt || new Date(0) },
        },
      });
      return {
        id: m.roomId,
        title: m.room.title || "Vestlusruum",
        description: m.room.description || "",
        role: m.role,
        memberCount,
        lastMessage: last ? { id: last.id, content: last.content, createdAt: last.createdAt } : null,
        unreadCount,
      };
    })
  );

  return json({ ok: true, rooms });
}
