// app/api/auth/login-resend-otp/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashOpaqueToken,
  randomOtpCode,
  hashOtpCode,
  maskEmail,
  OTP_TTL_MINUTES,
} from "@/lib/auth/pin-login";
import { getMailer } from "@/lib/mailer";

function json(data, status = 200) {
  return NextResponse.json(
    { ok: status < 400, ...data },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    }
  );
}

async function fetchToken(raw) {
  if (!raw) return null;
  const tokenHash = hashOpaqueToken(raw);
  return prisma.loginTempToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      requiresOtp: true,
      expiresAt: true,
      usedAt: true,
      otpVerifiedAt: true,
    },
  });
}

async function resendOtp(email, userId) {
  const code = randomOtpCode();
  const codeHash = await hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await prisma.emailOtpCode.create({
    data: { userId, codeHash, expiresAt },
  });
  const mailer = getMailer("login-otp");
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (!from) {
    console.warn("[login-otp] EMAIL_FROM/SMTP_FROM puudub. Kood:", code);
    return { code, expiresAt };
  }
  const subject = "SotsiaalAI – uus kinnituskood";
  const text = `Sinu uus kinnituskood on: ${code}\nKood kehtib ${OTP_TTL_MINUTES} minutit.`;
  const html = `<p>Sinu uus kinnituskood on: <strong>${code}</strong></p><p>Kood kehtib ${OTP_TTL_MINUTES} minutit.</p>`;
  await mailer.sendMail({ to: email, from, subject, text, html });
  return { code, expiresAt };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawToken = String(body?.temp_login_token || "").trim();
    if (!rawToken) {
      return json({ message: "Puudub temp_login_token." }, 400);
    }
    const loginToken = await fetchToken(rawToken);
    if (
      !loginToken ||
      loginToken.usedAt ||
      loginToken.otpVerifiedAt ||
      !loginToken.requiresOtp ||
      loginToken.expiresAt <= new Date()
    ) {
      return json({ message: "Seda koodi ei saa uuesti saata.", code: "TOKEN_INVALID" }, 400);
    }
    const user = await prisma.user.findUnique({
      where: { id: loginToken.userId },
      select: { email: true },
    });
    if (!user?.email) {
      return json({ message: "Kasutajat ei leitud.", code: "USER_MISSING" }, 404);
    }

    const { expiresAt } = await resendOtp(user.email, loginToken.userId);
    return json({
      status: "resent",
      email_mask: maskEmail(user.email),
      otp_expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("login-resend-otp error", error);
    return json({ message: "Koodi saatmine ebaõnnestus." }, 500);
  }
}
