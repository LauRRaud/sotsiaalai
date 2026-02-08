export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashOpaqueToken, compareOtpCode, fingerprintUserAgent, computeIpFromHeaders, computeIpRange, generateOpaqueToken, buildDeviceCookie, DEVICE_COOKIE_NAME, TRUSTED_DEVICE_DAYS } from "@/lib/auth/pin-login";
import { consumeRateLimit } from "@/lib/rate-limit";
const LOGIN_STEP2_RATE_LIMIT_WINDOW_MS = Number(process.env.LOGIN_STEP2_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const LOGIN_STEP2_RATE_LIMIT_PER_IP = Number(process.env.LOGIN_STEP2_RATE_LIMIT_PER_IP || 60);
const LOGIN_STEP2_RATE_LIMIT_PER_TOKEN = Number(process.env.LOGIN_STEP2_RATE_LIMIT_PER_TOKEN || 15);
function json(data, status = 200) {
  return NextResponse.json({
    ok: status < 400,
    ...data
  }, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache"
    }
  });
}
async function fetchLoginToken(rawToken) {
  if (!rawToken) return null;
  const tokenHash = hashOpaqueToken(rawToken);
  return prisma.loginTempToken.findUnique({
    where: {
      tokenHash
    },
    select: {
      id: true,
      userId: true,
      requiresOtp: true,
      otpVerifiedAt: true,
      expiresAt: true,
      usedAt: true
    }
  });
}
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawToken = String(body?.temp_login_token || "").trim();
    const otpCode = String(body?.otp_code || "").trim();
    const rememberDevice = Boolean(body?.remember_device);
    const ipAddress = computeIpFromHeaders(request.headers) || "unknown";
    const ipLimit = consumeRateLimit(`login-step2:ip:${ipAddress}`, LOGIN_STEP2_RATE_LIMIT_PER_IP, LOGIN_STEP2_RATE_LIMIT_WINDOW_MS);
    if (!ipLimit.allowed) {
      return json({
        message: "Liiga palju koodi kontrolli katseid. Proovi hiljem uuesti.",
        code: "RATE_LIMITED"
      }, 429);
    }
    if (rawToken) {
      const tokenKey = hashOpaqueToken(rawToken).slice(0, 20);
      const tokenLimit = consumeRateLimit(`login-step2:token:${tokenKey}`, LOGIN_STEP2_RATE_LIMIT_PER_TOKEN, LOGIN_STEP2_RATE_LIMIT_WINDOW_MS);
      if (!tokenLimit.allowed) {
        return json({
          message: "Liiga palju koodi kontrolli katseid. Proovi hiljem uuesti.",
          code: "RATE_LIMITED"
        }, 429);
      }
    }
    if (!rawToken || otpCode.length === 0) {
      return json({
        message: "Puudub vajalik teave.",
        code: "MISSING_FIELDS"
      }, 400);
    }
    const loginToken = await fetchLoginToken(rawToken);
    if (!loginToken) {
      return json({
        message: "Sisselogimise link on aegunud.",
        code: "TOKEN_INVALID"
      }, 400);
    }
    const now = new Date();
    if (loginToken.expiresAt <= now || loginToken.usedAt) {
      return json({
        message: "Sisselogimise link on aegunud.",
        code: "TOKEN_EXPIRED"
      }, 400);
    }
    if (!loginToken.requiresOtp) {
      return json({
        status: "verified",
        temp_login_token: rawToken
      });
    }
    if (loginToken.otpVerifiedAt) {
      return json({
        status: "verified",
        temp_login_token: rawToken
      });
    }
    if (!/^\d{6}$/.test(otpCode)) {
      return json({
        message: "Vale kood.",
        code: "OTP_INVALID"
      }, 400);
    }
    const latestOtp = await prisma.emailOtpCode.findFirst({
      where: {
        userId: loginToken.userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    if (!latestOtp || latestOtp.usedAt || latestOtp.expiresAt <= now) {
      return json({
        message: "Kood ei sobi või on aegunud.",
        code: "OTP_INVALID"
      }, 400);
    }
    const otpOk = await compareOtpCode(otpCode, latestOtp.codeHash);
    if (!otpOk) {
      return json({
        message: "Kood ei sobi või on aegunud.",
        code: "OTP_INVALID"
      }, 401);
    }
    const headers = request.headers;
    const userAgent = headers.get("user-agent") || "";
    const fingerprint = fingerprintUserAgent(userAgent);
    const ipRange = computeIpRange(ipAddress);
    const deviceExpiresAt = new Date(Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000);
    let deviceCookieData = null;
    await prisma.$transaction(async tx => {
      await tx.emailOtpCode.update({
        where: {
          id: latestOtp.id
        },
        data: {
          usedAt: now
        }
      });
      let trustedDeviceId = null;
      if (rememberDevice) {
        const deviceToken = generateOpaqueToken(32);
        const record = await tx.trustedDevice.create({
          data: {
            userId: loginToken.userId,
            deviceTokenHash: hashOpaqueToken(deviceToken),
            userAgentFingerprint: fingerprint,
            ipRange,
            expiresAt: deviceExpiresAt,
            lastUsedAt: now
          }
        });
        trustedDeviceId = record.id;
        deviceCookieData = {
          token: deviceToken
        };
      }
      await tx.loginTempToken.update({
        where: {
          id: loginToken.id
        },
        data: {
          otpVerifiedAt: now,
          trustedDeviceId
        }
      });
    });
    const response = json({
      status: "verified",
      temp_login_token: rawToken
    });
    if (deviceCookieData) {
      const cookie = buildDeviceCookie(deviceCookieData.token);
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    } else {
      response.cookies.set(DEVICE_COOKIE_NAME, "", {
        path: "/",
        maxAge: 0
      });
    }
    return response;
  } catch (error) {
    console.error("login-step2 error", error);
    return json({
      message: "Koodi kontroll ebaõnnestus."
    }, 500);
  }
}
