// app/api/chat/conversations/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function getAuthOptions() {
  try {
    const mod = await import("@/pages/api/auth/[...nextauth]");
    return mod.authOptions || mod.default || mod.authConfig;
  } catch {
    try {
      const mod = await import("@/auth");
      return mod.authOptions || mod.default || mod.authConfig;
    } catch {
      return undefined;
    }
  }
}

async function requireUser() {
  const { getServerSession } = await import("next-auth/next");
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
  return { ok: true, userId: session.user.id };
}

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

export async function DELETE(_req, { params }) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const id = params?.id ? String(params.id).trim() : "";
  if (!id) return json({ ok: false, message: "id missing" }, 400);

  try {
    const existing = await prisma.conversationRun.findUnique({ where: { id } });
    if (!existing || existing.userId !== auth.userId) {
      return json({ ok: false, message: "not-found" }, 404);
    }

    await prisma.conversationRun.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
    });

    return json({ ok: true, deleted: id });
  } catch (err) {
    return json(
      { ok: false, message: "Database error while deleting conversation", error: err?.message },
      500,
    );
  }
}
