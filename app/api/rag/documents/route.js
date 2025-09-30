// app/api/rag/documents/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

export async function GET(req) {
  const session = await getServerSession(authConfig);
  if (!session) return makeError("Pole sisse logitud", 401);
  if (!isAdmin(session?.user)) return makeError("Ligipääs keelatud", 403);

  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") || 25);
  const limit = Number.isNaN(limitParam) ? 25 : Math.min(Math.max(limitParam, 1), 100);

  const status = searchParams.get("status") || undefined;   // PENDING|PROCESSING|COMPLETED|FAILED
  const type = searchParams.get("type") || undefined;       // FILE|URL
  const audience = searchParams.get("audience") || undefined; // SOCIAL_WORKER|CLIENT|BOTH

  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (audience) where.audience = audience;

  const docs = await prisma.ragDocument.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      admin: {
        select: { id: true, email: true },
      },
    },
  });

  return NextResponse.json({ ok: true, docs });
}
