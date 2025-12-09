// app/api/invites/route.js
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_INVITES = 10; // per user per minute
const SPONSORED_MEMBER_LIMIT = 50; // simple soft cap per room

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

function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const rateBuckets = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > limit) throw fail(429, "Liiga palju päringuid, proovi hiljem uuesti.");
}

async function requireUser() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return { ok: false, status: 401, message: "Unauthorized" };
    return {
      ok: true,
      userId: session.user.id,
      role: session.user.role,
      isAdmin: !!session.user.isAdmin,
      email: session.user.email,
    };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("base64");
}
function randomToken() {
  const raw = crypto.randomBytes(48).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

function normalizeEmails(emails) {
  if (!emails) return [];
  const items = Array.isArray(emails) ? emails : String(emails).split(/[,;\n\r]/);
  return [...new Set(items.map((e) => String(e || "").trim().toLowerCase()).filter(Boolean))];
}

function normalizeRelationship(value) {
  const raw = String(value || "").toUpperCase();
  return raw === "COLLEAGUE" ? "COLLEAGUE" : "CLIENT";
}
function normalizePaymentMode(value, relationship) {
  const raw = String(value || "").toUpperCase();
  if (raw === "SPONSORED_BY_HOST" || raw === "SPONSORED") return "SPONSORED_BY_HOST";
  if (raw === "SELF_PAID") return "SELF_PAID";
  return relationship === "CLIENT" ? "SPONSORED_BY_HOST" : "SELF_PAID";
}

async function ensureRoom(userId, roomId) {
  if (roomId) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw fail(404, "Room not found");
    await ensureOwnerMembership(room.id, room.ownerId);
    return room;
  }
  const existing = await prisma.room.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    await ensureOwnerMembership(existing.id, existing.ownerId);
    return existing;
  }
  const created = await prisma.room.create({
    data: {
      ownerId: userId,
      title: "Vestlusruum",
      description: "Vaikimisi ruum kutsumiseks",
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });
  return created;
}

async function ensureOwnerMembership(roomId, ownerId) {
  try {
    await prisma.roomMember.upsert({
      where: { roomId_userId: { roomId, userId: ownerId } },
      create: { roomId, userId: ownerId, role: "OWNER" },
      update: { role: "OWNER", leftAt: null },
    });
  } catch {}
}

async function requireRoomRole(userId, roomId, allowedRoles) {
  const room = await ensureRoom(userId, roomId);
  if (room.ownerId === userId) return { ok: true, room, membership: { role: "OWNER" } };
  const membership = await prisma.roomMember.findFirst({
    where: { roomId: room.id, userId, leftAt: null },
  });
  if (membership && allowedRoles.includes(membership.role)) {
    return { ok: true, room, membership };
  }
  return { ok: false, status: 403, message: "Forbidden" };
}

async function resolveSponsor(room) {
  return { userId: room.ownerId, orgId: null };
}

async function checkHostSponsorship(userId) {
  if (!userId) return false;
  const now = new Date();
  const active = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    select: { id: true },
  });
  return Boolean(active);
}

async function hasSponsorCapacity(roomId) {
  const count = await prisma.roomMember.count({
    where: { roomId, billingSource: "SPONSORED_BY_HOST", leftAt: null },
  });
  return count < SPONSORED_MEMBER_LIMIT;
}

function buildJoinLink(token) {
  const base = resolveBaseUrl() || "http://localhost:3000";
  return `${base.replace(/\/+$/, "")}/join?token=${encodeURIComponent(token)}`;
}

function renderInviteEmail(lang, { to, token, roomTitle = "Vestlusruum", inviterName = "SotsiaalAI" }) {
  const mailer = getMailer("invite");
  const link = buildJoinLink(token);
  const translations = {
    et: {
      subject: `Kutse: ${roomTitle}`,
      text: `Tere, ${to}!

${inviterName} kutsub sind vestlusruumi "${roomTitle}".

Liitu: ${link}

Kui link ei tööta, kopeeri ja kleebi aadress brauserisse.
Kui sa ei oodanud seda kirja, ignoreeri seda.`,
      html: `<p>Tere, ${to}!</p><p>${inviterName} kutsub sind vestlusruumi <b>${roomTitle}</b>.</p><p><a href="${link}">Liitu vestlusega</a></p><p>Kui link ei tööta, kopeeri ja kleebi aadress brauserisse.</p><p>Kui sa ei oodanud seda kirja, ignoreeri seda.</p>`,
    },
    en: {
      subject: `Invitation: ${roomTitle}`,
      text: `Hi ${to},

${inviterName} invited you to the chat room "${roomTitle}".

Join: ${link}

If the link does not work, copy and paste it into your browser.
If you did not expect this email, you can ignore it.`,
      html: `<p>Hi ${to},</p><p>${inviterName} invited you to the chat room <b>${roomTitle}</b>.</p><p><a href="${link}">Join the chat</a></p><p>If the link does not work, copy and paste it into your browser.</p><p>If you did not expect this email, you can ignore it.</p>`,
    },
    ru: {
      subject: `Приглашение: ${roomTitle}`,
      text: `Здравствуйте, ${to}!

${inviterName} пригласил вас в комнату чата «${roomTitle}».

Присоединиться: ${link}

Если ссылка не открывается, скопируйте и вставьте её в браузер.
Если вы не ожидали это письмо, просто проигнорируйте его.`,
      html: `<p>Здравствуйте, ${to}!</p><p>${inviterName} пригласил вас в комнату чата «<b>${roomTitle}</b>».</p><p><a href="${link}">Присоединиться к чату</a></p><p>Если ссылка не открывается, скопируйте и вставьте её в браузер.</p><p>Если вы не ожидали это письмо, просто проигнорируйте его.</p>`,
    },
  };
  const tpl = translations[lang] || translations.et;
  return { mailer, subject: tpl.subject, text: tpl.text, html: tpl.html };
}

async function sendInviteEmail({ to, token, roomTitle, inviterName, lang = "et" }) {
  const { mailer, subject, text, html } = renderInviteEmail(lang, { to, token, roomTitle, inviterName });
  await mailer.sendMail({
    to,
    from: process.env.EMAIL_FROM || "info@sotsiaal.ai",
    subject,
    text,
    html,
  });
}

export async function GET(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);

  const url = new URL(req.url);
  const roomId = url.searchParams.get("room_id") || url.searchParams.get("roomId");

  try {
    const roomCheck = await requireRoomRole(auth.userId, roomId || undefined, ["OWNER", "MODERATOR"]);
    if (!roomCheck.ok) return json({ ok: false, message: roomCheck.message }, roomCheck.status || 403);
    const room = roomCheck.room;

    const invites = await prisma.invite.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        inviteeEmail: true,
        status: true,
        expiresAt: true,
        maxUses: true,
        useCount: true,
        relationshipType: true,
        paymentMode: true,
        createdAt: true,
        acceptedBillingSource: true,
        acceptedByUserId: true,
      },
    });

    return json({ ok: true, invites, roomId: room.id });
  } catch (err) {
    if (err?.status) return json({ ok: false, message: err.message }, err.status);
    console.error("[invites GET] failed", err);
    return json({ ok: false, message: "Failed to load invites" }, 500);
  }
}

export async function POST(req) {
  const auth = await requireUser();
  if (!auth.ok) return json({ ok: false, message: auth.message }, auth.status);
  rateLimit(`invites:create:${auth.userId}`, RATE_LIMIT_INVITES, RATE_LIMIT_WINDOW_MS);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid JSON" }, 400);
  }

  const emails = normalizeEmails(payload?.emails);
  if (!emails.length) {
    return json({ ok: false, message: "Lisa vähemalt üks e-posti aadress" }, 400);
  }

  try {
    const roomId = payload?.room_id || payload?.roomId || null;
    const roomCheck = await requireRoomRole(auth.userId, roomId || undefined, ["OWNER", "MODERATOR"]);
    if (!roomCheck.ok) return json({ ok: false, message: roomCheck.message }, roomCheck.status || 403);
    const room = roomCheck.room;

    const relationshipType = normalizeRelationship(payload?.relationship_type || payload?.relationshipType);
    const paymentMode = normalizePaymentMode(payload?.payment_mode || payload?.paymentMode, relationshipType);
    const lang = (payload?.lang || payload?.language || "et").toString().toLowerCase();

    const expiresHours = Number(payload?.expires_in_hours ?? payload?.expiresInHours ?? 168);
    const maxUsesInput = Number(payload?.max_uses ?? payload?.maxUses ?? 1);
    const maxUses = Math.max(1, Number.isFinite(maxUsesInput) ? maxUsesInput : 1);
    const expiresAt = new Date(
      Date.now() + Math.max(1, Number.isFinite(expiresHours) ? expiresHours : 168) * 3600 * 1000
    );

    const sponsor = await resolveSponsor(room);
    if (paymentMode === "SPONSORED_BY_HOST") {
      const sponsorOk = await checkHostSponsorship(sponsor.userId);
      if (!sponsorOk) {
        return json({ ok: false, message: "Sponsoreeritud kutseid ei saa luua: plaan puudub." }, 409);
      }
      const capacity = await hasSponsorCapacity(room.id);
      if (!capacity) {
        return json({ ok: false, message: "Sponsoreeritud kohtade limiit on täis." }, 409);
      }
    }

    const created = [];
    for (const email of emails) {
      const { raw, hash } = randomToken();
      const invite = await prisma.invite.create({
        data: {
          roomId: room.id,
          inviterId: auth.userId,
          inviteeEmail: email,
          tokenHash: hash,
          status: "SENT",
          relationshipType,
          paymentMode,
          sponsoredByUserId: sponsor.userId,
          sponsoredByOrgId: sponsor.orgId,
          expiresAt,
          maxUses,
          useCount: 0,
        },
        select: {
          id: true,
          inviteeEmail: true,
          status: true,
          expiresAt: true,
          maxUses: true,
          useCount: true,
          relationshipType: true,
          paymentMode: true,
          createdAt: true,
        },
      });
      created.push({ ...invite, token: raw });
      try {
        await sendInviteEmail({
          to: email,
          token: raw,
          roomTitle: room.title || "Vestlusruum",
          inviterName: auth.email || "SotsiaalAI",
          lang,
        });
      } catch (err) {
        console.error("[invite email] failed", err);
      }
    }

    return json({
      ok: true,
      roomId: room.id,
      invites: created.map(({ token, ...rest }) => rest),
    });
  } catch (err) {
    if (err?.status) return json({ ok: false, message: err.message }, err.status);
    console.error("[invites POST] failed", err);
    return json({ ok: false, message: "Failed to create invites" }, 500);
  }
}
