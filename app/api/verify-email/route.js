export const runtime = "nodejs";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";
const TOKEN_EXPIRY_HOURS = Number(process.env.EMAIL_VERIFY_HOURS || 24);
const VERIFY_RATE_LIMIT_WINDOW_MS = Number(process.env.VERIFY_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000);
const VERIFY_RATE_LIMIT_PER_IP = Number(process.env.VERIFY_RATE_LIMIT_PER_IP || 30);
const VERIFY_RATE_LIMIT_PER_EMAIL = Number(process.env.VERIFY_RATE_LIMIT_PER_EMAIL || 5);
const mailer = getMailer("email-verify");
function ok(payload = {}, status = 200) {
  return NextResponse.json({
    ok: true,
    ...payload
  }, {
    status
  });
}
function err(message, status = 400, extras = {}) {
  return NextResponse.json({
    ok: false,
    message,
    ...extras
  }, {
    status
  });
}
function normalizeEmail(input) {
  return String(input || "").trim().toLowerCase();
}
function buildVerifyUrl(email, token) {
  const baseUrl = resolveBaseUrl();
  if (!baseUrl) throw new Error("Base URL for email verification is not configured.");
  const b = baseUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    email,
    token
  });
  return `${b}/api/verify-email?${params.toString()}`;
}
async function sendVerificationEmail(to, verifyUrl) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (!from) throw new Error("EMAIL_FROM (või SMTP_FROM) keskkonnamuutuja puudub.");
  const info = await mailer.sendMail({
    to,
    from,
    subject: "Kinnita oma e-posti aadress",
    text: `Tere!\n\nPalun kinnita oma e-posti aadress, klõpsates järgneval lingil:\n${verifyUrl}\n\nKui sa ei loonud kontot SotsiaalAI keskkonnas, ignoreeri seda kirja.`,
    html: `
      <p>Tere!</p>
      <p>Palun kinnita oma e-posti aadress, klõpsates järgneval lingil:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Kui sa ei loonud kontot SotsiaalAI keskkonnas, ignoreeri seda kirja.</p>
    `
  });
  if (info?.message && process.env.NODE_ENV !== "production") {
    console.info("[email-verify] Mock email message:\n", info.message.toString());
  }
}
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const email = normalizeEmail(url.searchParams.get("email"));
    const token = String(url.searchParams.get("token") || "").trim();
    if (!email || !token) return err("Vigane või puuduv link.", 400);
    const vt = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token
        }
      }
    });
    if (!vt) return err("Link on vigane või juba kasutatud.", 400);
    if (vt.expires < new Date()) {
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email
        }
      });
      return err("Kinnituse link on aegunud.", 410);
    }
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (!user) {
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email
        }
      });
      return err("Kasutajat ei leitud.", 404);
    }
    await prisma.$transaction(async tx => {
      await tx.user.update({
        where: {
          id: user.id
        },
        data: {
          emailVerified: new Date()
        }
      });
      await tx.verificationToken.deleteMany({
        where: {
          identifier: email
        }
      });
    });
    try {
      const redirectBase = resolveBaseUrl() || url.origin;
      return NextResponse.redirect(new URL("/profiil", redirectBase));
    } catch {
      return ok({
        verified: true
      });
    }
  } catch (e) {
    console.error("verify-email GET error", e);
    return err("Kinnitamine ebaõnnestus.", 500);
  }
}
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const ip = getRequestIpFromRequest(request);
    const ipLimit = consumeRateLimit(`verify-post:ip:${ip}`, VERIFY_RATE_LIMIT_PER_IP, VERIFY_RATE_LIMIT_WINDOW_MS);
    if (!ipLimit.allowed) return err("Liiga palju kinnituskirja saatmise katseid. Proovi hiljem uuesti.", 429);
    if (email) {
      const emailLimit = consumeRateLimit(`verify-post:email:${email}`, VERIFY_RATE_LIMIT_PER_EMAIL, VERIFY_RATE_LIMIT_WINDOW_MS);
      if (!emailLimit.allowed) return err("Liiga palju kinnituskirja saatmise katseid. Proovi hiljem uuesti.", 429);
    }
    if (!email || !email.includes("@")) return err("Palun sisesta korrektne e-posti aadress.");
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (!user) return ok();
    if (user.emailVerified) return ok();
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.$transaction(async tx => {
      await tx.verificationToken.deleteMany({
        where: {
          identifier: email
        }
      });
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires
        }
      });
    });
    const verifyUrl = buildVerifyUrl(email, token);
    await sendVerificationEmail(email, verifyUrl);
    try {
      await prisma.user.update({
        where: {
          email
        },
        data: {
          emailVerificationSentAt: new Date()
        }
      });
    } catch {}
    return ok();
  } catch (e) {
    console.error("verify-email POST error", e);
    return err("Kinnituskirja ei õnnestunud saata.", 500);
  }
}
