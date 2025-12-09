// app/api/rooms/[roomId]/members/route.js
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

function normalizeRoomId(roomId) {
  const maybe = Number(roomId);
  return Number.isFinite(maybe) ? maybe : roomId;
}

export async function GET(_req, { params }) {
  const roomIdRaw = params?.roomId;
  const roomId = normalizeRoomId(roomIdRaw);

  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const isAdmin = auth.userRole === "ADMIN";
  const membership = isAdmin
    ? { role: "ADMIN" }
    : await prisma.roomMember.findFirst({
        where: { roomId, userId: auth.userId, leftAt: null },
        select: { role: true },
      });
  if (!membership) return json({ ok: false, message: "Forbidden" }, 403);

  const members = await prisma.roomMember.findMany({
    where: { roomId, leftAt: null },
    select: {
      userId: true,
      role: true,
      user: { select: { profile: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { role: "asc" },
  });

  return json({
    ok: true,
    role: membership.role,
    members: members.map((m) => ({
      userId: m.userId,
      role: m.role,
      name: [m.user.profile?.firstName, m.user.profile?.lastName].filter(Boolean).join(" ") || "Liige",
      isCurrentUser: m.userId === auth.userId,
    })),
  });
}
