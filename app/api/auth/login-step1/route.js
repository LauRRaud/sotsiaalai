// app/api/auth/login-step1/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import {
  normalizeEmail,
  normalizePin,
  isValidPin,
  randomOtpCode,
  hashOtpCode,
  maskEmail,
  generateOpaqueToken,
  hashOpaqueToken,
  fingerprintUserAgent,
  computeIpFromHeaders,
  computeIpRange,
  DEVICE_COOKIE_NAME,
  OTP_TTL_MINUTES,
  TEMP_LOGIN_TOKEN_MINUTES,
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

function sanitizeEmail(email) {
  const normalized = normalizeEmail(email);
  return normalized || "";
}

async function createTempLoginToken({ userId, requiresOtp, userAgent, ipAddress, trustedDeviceId }) {
  const token = generateOpaqueToken(32);
  const expiresAt = new Date(Date.now() + TEMP_LOGIN_TOKEN_MINUTES * 60 * 1000);
  await prisma.loginTempToken.create({
    data: {
      userId,
      tokenHash: hashOpaqueToken(token),
      requiresOtp: Boolean(requiresOtp),
      expiresAt,
      userAgent,
      ipAddress,
      trustedDeviceId: trustedDeviceId || null,
    },
  });
  return { token, expiresAt };
}

async function sendOtpEmail(email, code) {
  const mailer = getMailer("login-otp");
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  const isDev = process.env.NODE_ENV === "development";

  console.log("[login-otp][DEV] OTP:", email, code);
  if (!from) {
    console.warn("[login-otp] EMAIL_FROM/SMTP_FROM puudub. Kood:", code);
    if (isDev) {
      return;
    }
  }

  const subject = "SotsiaalAI - sisselogimise kinnituskood";
  const text = `Tere!\n\nSinu kinnituskood on: ${code}\nKood kehtib ${OTP_TTL_MINUTES} minutit.\n\nKui sa ei proovinud sisse logida, teavita meid voimalikult kiiresti.`;
  const html = `
    <p>Tere!</p>
    <p>Sinu kinnituskood on: <strong>${code}</strong></p>
    <p>Kood kehtib ${OTP_TTL_MINUTES} minutit.</p>
    <p>Kui sa ei proovinud sisse logida, teavita meid voimalikult kiiresti.</p>
  `;

  try {
    if (!isDev) {
      await mailer.sendMail({ to: email, from, subject, text, html });
    }
  } catch (error) {
    console.error("[login-otp] SMTP viga:", error);
    if (!isDev) {
      throw error;
    }
  }
}


export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = sanitizeEmail(body?.email);
    const pin = normalizePin(body?.pin);
    if (!email || !isValidPin(pin)) {
      return json({ message: "Vale e-post või PIN.", code: "INVALID_CREDENTIALS" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user?.passwordHash) {
      return json({ message: "Vale e-post või PIN.", code: "INVALID_CREDENTIALS" }, 400);
    }

    const pinOk = await compare(pin, user.passwordHash);
    if (!pinOk) {
      return json({ message: "Vale e-post või PIN.", code: "INVALID_CREDENTIALS" }, 401);
    }

    const headers = request.headers;
    const userAgent = headers.get("user-agent") || "";
    const fingerprint = fingerprintUserAgent(userAgent);
    const ipAddress = computeIpFromHeaders(headers);
    const ipRange = computeIpRange(ipAddress);

    // 🔧 SIIN ON MUUDATUS:
    const cookieStore = await cookies();
    const deviceCookie = cookieStore.get(DEVICE_COOKIE_NAME)?.value;

    const now = new Date();
    let trustedDevice = null;
    if (deviceCookie) {
      const deviceTokenHash = hashOpaqueToken(deviceCookie);
      const candidate = await prisma.trustedDevice.findFirst({
        where: { userId: user.id, deviceTokenHash },
      });
      if (candidate && candidate.expiresAt > now) {
        const fingerprintMatch =
          !candidate.userAgentFingerprint || candidate.userAgentFingerprint === fingerprint;
        const ipMatch = !candidate.ipRange || !ipRange || candidate.ipRange === ipRange;
        if (fingerprintMatch && ipMatch) {
          trustedDevice = candidate;
          await prisma.trustedDevice.update({
            where: { id: candidate.id },
            data: { lastUsedAt: now },
          });
        }
      }
    }

    const { token, expiresAt } = await createTempLoginToken({
      userId: user.id,
      requiresOtp: !trustedDevice,
      userAgent,
      ipAddress,
      trustedDeviceId: trustedDevice?.id,
    });

    if (trustedDevice) {
      return json({
        status: "success",
        temp_login_token: token,
        expires_at: expiresAt.toISOString(),
      });
    }

    const otpCode = randomOtpCode();
    const otpHash = await hashOtpCode(otpCode);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await prisma.emailOtpCode.create({
      data: { userId: user.id, codeHash: otpHash, expiresAt: otpExpiresAt },
    });
    await sendOtpEmail(user.email, otpCode);

    return json({
      status: "need_2fa",
      temp_login_token: token,
      email_mask: maskEmail(user.email),
      otp_expires_at: otpExpiresAt.toISOString(),
    });
  } catch (error) {
    console.error("login-step1 error", error);
    return json({ message: "Sisselogimine ebaõnnestus." }, 500);
  }
}
