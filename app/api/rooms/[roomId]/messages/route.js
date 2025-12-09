// app/api/rooms/[roomId]/messages/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { publishRoomEvent } from "@/lib/roomStream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 50;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_POST = 20;

const rateBuckets = new Map();

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

async function hasActiveSubscription(userId) {
  if (!userId) return false;
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    select: { id: true },
  });
  return Boolean(sub);
}

async function getMembership(userId, roomId) {
  return prisma.roomMember.findFirst({
    where: { userId, roomId, leftAt: null },
  });
}

async function ensureAccess(userId, roomId, userRole) {
  const isAdminRole = userRole === "ADMIN";

  if (isAdminRole) return { ok: true, member: { role: "ADMIN", roomId, userId }, billingSource: "ADMIN" };

  const member = await getMembership(userId, roomId);
  if (!member) return { ok: false, status: 403, message: "Ligipääs puudub" };

  const userActive = await hasActiveSubscription(userId);
  if (userActive) return { ok: true, member, billingSource: "SELF" };

  if (member.billingSource === "SPONSORED_BY_HOST") {
    const sponsorActive = await hasActiveSubscription(member.sponsorUserId);
    if (sponsorActive) return { ok: true, member, billingSource: "SPONSORED_BY_HOST" };
  }

  return { ok: false, status: 403, message: "Vestlusega liitumine ei ole hetkel võimalik. Palun võta ühendust oma spetsialistiga." };
}

function parseCursor(token) {
  if (!token) return null;
  const [ts, id] = token.split("_");
  const ms = Number(ts);
  if (!Number.isFinite(ms) || !id) return null;
  return { ts: new Date(ms), id };
}

function makeCursor(row) {
  if (!row) return null;
  const ms = row.createdAt instanceof Date ? row.createdAt.getTime() : new Date(row.createdAt).getTime();
  if (!Number.isFinite(ms)) return null;
  return `${ms}_${row.id}`;
}

function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > limit) {
    const err = new Error("Too many requests");
    err.status = 429;
    throw err;
  }
}

export async function GET(req, { params }) {
  const roomIdRaw = params?.roomId;
  if (!roomIdRaw) return json({ ok: false, message: "Missing roomId" }, 400);
  const roomId = Number.isNaN(Number(roomIdRaw)) ? roomIdRaw : Number(roomIdRaw);

  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const access = await ensureAccess(auth.userId, roomId, auth.userRole);
  if (!access.ok) return json({ ok: false, message: access.message }, access.status || 403);

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || PAGE_SIZE);
  const limit = Math.max(1, Math.min(PAGE_SIZE, Number.isFinite(limitParam) ? limitParam : PAGE_SIZE));
  const cursor = parseCursor(url.searchParams.get("cursor"));

  const where = { roomId, deletedAt: null };
  const take = limit + 1;

  const rows = await prisma.roomMessage.findMany({
    where: cursor
      ? {
          ...where,
          OR: [
            { createdAt: { lt: cursor.ts } },
            { createdAt: cursor.ts, id: { lt: cursor.id } },
          ],
        }
      : where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorId: true,
      author: {
        select: {
          role: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? makeCursor(page[page.length - 1]) : null;

  return json({
    ok: true,
    messages: page.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      authorId: m.authorId,
      authorName: [m.author?.profile?.firstName, m.author?.profile?.lastName].filter(Boolean).join(" ") || "Liige",
      authorRole: m.author?.role || "CLIENT",
    })),
    nextCursor,
  });
}

export async function POST(req, { params }) {
  const roomIdRaw = params?.roomId;
  if (!roomIdRaw) return json({ ok: false, message: "Missing roomId" }, 400);
  const roomId = Number.isNaN(Number(roomIdRaw)) ? roomIdRaw : Number(roomIdRaw);

  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const access = await ensureAccess(auth.userId, roomId, auth.userRole);
  if (!access.ok) return json({ ok: false, message: access.message }, access.status || 403);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid JSON" }, 400);
  }

  const content = String(payload?.content || "").trim();
  if (!content) return json({ ok: false, message: "Sõnum ei tohi olla tühi" }, 400);

  try {
    rateLimit(`roommsg:${roomId}:${auth.userId}`, RATE_LIMIT_POST, RATE_LIMIT_WINDOW_MS);
    const msg = await prisma.roomMessage.create({
      data: {
        roomId,
        authorId: auth.userId,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            role: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    const payload = {
      ok: true,
      message: {
        ...msg,
        authorName: [msg.author?.profile?.firstName, msg.author?.profile?.lastName].filter(Boolean).join(" ") || "Liige",
        authorRole: msg.author?.role || "CLIENT",
      },
    };
    try {
      publishRoomEvent(roomId, { type: "message", message: payload.message });
    } catch {}
    return json(payload);
  } catch (err) {
    if (err?.status === 429) return json({ ok: false, message: "Liiga palju sõnumeid, proovi veidi hiljem uuesti." }, 429);
    console.error("[room message POST] failed", err);
    return json({ ok: false, message: "Sõnumi saatmine ebaõnnestus" }, 500);
  }
}
