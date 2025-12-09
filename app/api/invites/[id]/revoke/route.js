// app/api/invites/[id]/revoke/route.js
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
    return { ok: true, userId: session.user.id, role: session.user.role };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

export async function POST(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const id = params?.id;
  if (!id) return json({ ok: false, message: "Missing id" }, 400);

  try {
    const invite = await prisma.invite.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!invite) return json({ ok: false, message: "Invite not found" }, 404);

    const membership = await prisma.roomMember.findFirst({
      where: { roomId: invite.roomId, userId: auth.userId, leftAt: null },
    });
    if (!(invite.room.ownerId === auth.userId || ["OWNER", "MODERATOR"].includes(membership?.role))) {
      return json({ ok: false, message: "Forbidden" }, 403);
    }

    await prisma.invite.update({
      where: { id },
      data: { status: "REVOKED" },
    });

    return json({ ok: true, id, status: "REVOKED" });
  } catch (err) {
    console.error("[invite revoke] failed", err);
    return json({ ok: false, message: "Revoke failed" }, 500);
  }
}
