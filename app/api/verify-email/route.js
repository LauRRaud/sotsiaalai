export const runtime = "nodejs";

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";

const TOKEN_EXPIRY_HOURS = Number(process.env.EMAIL_VERIFY_HOURS || 24);
const VERIFY_RATE_LIMIT_WINDOW_MS = Number(
  process.env.VERIFY_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000
);
const VERIFY_RATE_LIMIT_PER_IP = Number(process.env.VERIFY_RATE_LIMIT_PER_IP || 30);
const VERIFY_RATE_LIMIT_PER_EMAIL = Number(
  process.env.VERIFY_RATE_LIMIT_PER_EMAIL || 5
);

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};

const mailer = getMailer("email-verify");

function json(payload = {}, status = 200) {
  return NextResponse.json(
    {
      ok: status < 400,
      ...payload
    },
    {
      status,
      headers: NO_STORE_HEADERS
    }
  );
}

function errorJson(messageKey, status = 400, locale = "en", extras = {}) {
  const translated = serverT(locale, messageKey, undefined, messageKey);
  return json(
    {
      messageKey,
      message: translated,
      error: translated,
      ...extras
    },
    status
  );
}

function normalizeEmail(input) {
  return String(input || "").trim().toLowerCase();
}

function localeFromRequest(request, directLocale) {
  const direct = normalizeServerLocale(directLocale);
  if (direct) return direct;

  const raw = String(request?.headers?.get("accept-language") || "");
  const parts = raw
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean);

  for (const part of parts) {
    const normalized = normalizeServerLocale(part);
    if (normalized) return normalized;
  }

  return "en";
}

function buildVerifyUrl(email, token, locale) {
  const baseUrl = resolveBaseUrl();
  if (!baseUrl) {
    throw new Error("api.auth.verify.base_url_missing");
  }

  const params = new URLSearchParams({ email, token });
  if (locale) params.set("locale", locale);

  return `${baseUrl.replace(/\/$/, "")}/api/verify-email?${params.toString()}`;
}

async function sendVerificationEmail(to, verifyUrl, locale) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (!from) {
    throw new Error("api.auth.verify.email_from_missing");
  }

  const info = await mailer.sendMail({
    to,
    from,
    subject: serverT(locale, "email.auth.verify.subject"),
    text: serverT(locale, "email.auth.verify.text", { verifyUrl }),
    html: serverT(locale, "email.auth.verify.html", { verifyUrl })
  });

  if (info?.message && process.env.NODE_ENV !== "production") {
    console.info("[email-verify] mock email message", info.message.toString());
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const locale = localeFromRequest(request, url.searchParams.get("locale"));

  try {
    const email = normalizeEmail(url.searchParams.get("email"));
    const token = String(url.searchParams.get("token") || "").trim();

    if (!email || !token) {
      return errorJson("api.auth.verify.invalid_link", 400, locale, {
        code: "INVALID_LINK"
      });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token
        }
      }
    });

    if (!verificationToken) {
      return errorJson("api.auth.verify.link_invalid_or_used", 400, locale, {
        code: "INVALID_LINK"
      });
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email }
      });
      return errorJson("api.auth.verify.link_expired", 410, locale, {
        code: "LINK_EXPIRED"
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email }
      });
      return errorJson("api.auth.verify.user_not_found", 404, locale, {
        code: "USER_NOT_FOUND"
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
      await tx.verificationToken.deleteMany({
        where: { identifier: email }
      });
    });

    try {
      const redirectBase = resolveBaseUrl() || url.origin;
      return NextResponse.redirect(new URL("/profiil", redirectBase));
    } catch {
      return json({ verified: true });
    }
  } catch (error) {
    console.error("verify-email GET error", error);
    return errorJson("api.auth.verify.confirm_failed", 500, locale, {
      code: "VERIFY_FAILED"
    });
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const locale = localeFromRequest(request, body?.locale);

  try {
    const email = normalizeEmail(body?.email);
    const ip = getRequestIpFromRequest(request);

    const ipLimit = consumeRateLimit(
      `verify-post:ip:${ip}`,
      VERIFY_RATE_LIMIT_PER_IP,
      VERIFY_RATE_LIMIT_WINDOW_MS
    );
    if (!ipLimit.allowed) {
      return errorJson("api.auth.verify.rate_limited", 429, locale, {
        code: "RATE_LIMITED"
      });
    }

    if (email) {
      const emailLimit = consumeRateLimit(
        `verify-post:email:${email}`,
        VERIFY_RATE_LIMIT_PER_EMAIL,
        VERIFY_RATE_LIMIT_WINDOW_MS
      );
      if (!emailLimit.allowed) {
        return errorJson("api.auth.verify.rate_limited", 429, locale, {
          code: "RATE_LIMITED"
        });
      }
    }

    if (!email || !email.includes("@")) {
      return errorJson("api.auth.verify.invalid_email", 400, locale, {
        code: "INVALID_EMAIL"
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      return json();
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({
        where: { identifier: email }
      });
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires
        }
      });
    });

    const verifyUrl = buildVerifyUrl(email, token, locale);
    await sendVerificationEmail(email, verifyUrl, locale);

    try {
      await prisma.user.update({
        where: { email },
        data: { emailVerificationSentAt: new Date() }
      });
    } catch {
      // do not fail if metadata update fails
    }

    return json();
  } catch (error) {
    console.error("verify-email POST error", error);

    if (
      typeof error?.message === "string" &&
      error.message.startsWith("api.auth.verify.")
    ) {
      return errorJson(error.message, 500, locale, {
        code: "VERIFY_CONFIG_ERROR"
      });
    }

    return errorJson("api.auth.verify.send_failed", 500, locale, {
      code: "VERIFY_SEND_FAILED"
    });
  }
}
