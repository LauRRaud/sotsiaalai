import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const json = (data, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });

function isAdminSession(session) {
  return !!session?.user?.isAdmin || String(session?.user?.role || "").toUpperCase() === "ADMIN";
}

export async function GET(req) {
  const session = await getServerSession(authConfig);
  if (!session) return json({ ok: false, message: "Auth required" }, 401);
  if (!isAdminSession(session)) return json({ ok: false, message: "Forbidden" }, 403);

  const url = new URL(req.url);
  const params = url.searchParams;
  const limit = Math.min(200, Math.max(1, Number(params.get("limit") || 50)));
  const offset = Math.max(0, Number(params.get("offset") || 0));
  const event = params.get("event") || undefined;
  const role = params.get("role") || undefined;
  const crisisParam = params.get("isCrisis");
  const sinceDays = Math.min(180, Math.max(1, Number(params.get("days") || 30)));
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  const where = { createdAt: { gte: since } };
  if (event) where.event = event;
  if (role) where.role = role;
  if (crisisParam === "true" || crisisParam === "false") {
    where.data = { path: ["isCrisis"], equals: crisisParam === "true" };
  }

  const items = await prisma.chatLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    select: { id: true, createdAt: true, event: true, role: true, userId: true, data: true },
  });

  return json({ ok: true, items });
}
