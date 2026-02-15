import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";
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
async function requireUser() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return {
      ok: false,
      status: 401,
      message: "Unauthorized"
    };
    return {
      ok: true,
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized"
    };
  }
}
function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("base64");
}
function randomToken() {
  const raw = crypto.randomBytes(48).toString("base64url");
  return {
    raw,
    hash: hashToken(raw)
  };
}
function buildJoinLink(token) {
  const base = resolveBaseUrl() || "http://localhost:3000";
  return `${base.replace(/\/+$/, "")}/join?token=${encodeURIComponent(token)}`;
}
function renderInviteEmail(lang, {
  to,
  token,
  roomTitle = "Chat room",
  inviterName = "SotsiaalAI"
}) {
  const mailer = getMailer("invite-resend");
  const link = buildJoinLink(token);
  const translations = {
    et: {
      subject: `Invitation: ${roomTitle}`,
      text: `Hi ${to},

${inviterName} invited you to the chat room "${roomTitle}".

Join: ${link}

If the link does not work, copy and paste it into your browser.
If you did not expect this email, you can ignore it.`,
      html: `<p>Hi ${to},</p><p>${inviterName} invited you to the chat room <b>${roomTitle}</b>.</p><p><a href="${link}">Join the chat</a></p><p>If the link does not work, copy and paste it into your browser.</p><p>If you did not expect this email, you can ignore it.</p>`
    },
    en: {
      subject: `Invitation: ${roomTitle}`,
      text: `Hi ${to},

${inviterName} invited you to the chat room "${roomTitle}".

Join: ${link}

If the link does not work, copy and paste it into your browser.
If you did not expect this email, you can ignore it.`,
      html: `<p>Hi ${to},</p><p>${inviterName} invited you to the chat room <b>${roomTitle}</b>.</p><p><a href="${link}">Join the chat</a></p><p>If the link does not work, copy and paste it into your browser.</p><p>If you did not expect this email, you can ignore it.</p>`
    },
    ru: {
      subject: `Приглашение: ${roomTitle}`,
      text: `Здравствуйте, ${to}!

${inviterName} пригласил вас в комнату чата «${roomTitle}».

Присоединиться: ${link}

Если ссылка не открывается, скопируйте и вставьте её в браузер.
Если вы не ожидали это письмо, просто проигнорируйте его.`,
      html: `<p>Здравствуйте, ${to}!</p><p>${inviterName} пригласил вас в комнату чата «<b>${roomTitle}</b>».</p><p><a href="${link}">Присоединиться к чату</a></p><p>Если ссылка не открывается, скопируйте и вставьте её в браузер.</p><p>Если вы не ожидали это письмо, просто проигнорируйте его.</p>`
    }
  };
  const tpl = translations[lang] || translations.et;
  return {
    mailer,
    subject: tpl.subject,
    text: tpl.text,
    html: tpl.html
  };
}
async function sendInviteEmail({
  to,
  token,
  roomTitle,
  inviterName,
  lang = "et"
}) {
  const {
    mailer,
    subject,
    text,
    html
  } = renderInviteEmail(lang, {
    to,
    token,
    roomTitle,
    inviterName
  });
  await mailer.sendMail({
    to,
    from: process.env.EMAIL_FROM || "info@sotsiaal.ai",
    subject,
    text,
    html
  });
}
export async function POST(_req, {
  params
}) {
  const auth = await requireUser();
  if (!auth.ok) return json({
    ok: false,
    message: auth.message
  }, auth.status);
  const id = params?.id;
  if (!id) return json({
    ok: false,
    message: "Missing id"
  }, 400);
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        id
      },
      include: {
        room: true
      }
    });
    if (!invite) return json({
      ok: false,
      message: "Invite not found"
    }, 404);
    if (invite.status !== "SENT") {
      return json({
        ok: false,
        message: "Only pending invites can be resent"
      }, 400);
    }
    const membership = await prisma.roomMember.findFirst({
      where: {
        roomId: invite.roomId,
        userId: auth.userId,
        leftAt: null
      }
    });
    if (!(invite.room.ownerId === auth.userId || ["OWNER", "MODERATOR"].includes(membership?.role))) {
      return json({
        ok: false,
        message: "Forbidden"
      }, 403);
    }
    const now = new Date();
    if (invite.expiresAt <= now) {
      return json({
        ok: false,
        message: "Invite expired"
      }, 410);
    }
    const {
      raw,
      hash
    } = randomToken();
    await prisma.invite.update({
      where: {
        id
      },
      data: {
        tokenHash: hash,
        status: "SENT"
      }
    });
    await sendInviteEmail({
      to: invite.inviteeEmail,
      token: raw,
      roomTitle: invite.room?.title || "Chat room",
      inviterName: auth.email || "SotsiaalAI",
      lang: "et"
    });
    return json({
      ok: true,
      id
    });
  } catch (err) {
    console.error("[invite resend] failed", err);
    return json({
      ok: false,
      message: "Resend failed"
    }, 500);
  }
}
