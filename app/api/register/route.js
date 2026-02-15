export const runtime = "nodejs";

import crypto from "node:crypto";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIpFromRequest } from "@/lib/request-ip";

const ROLE_MAP = {
  specialist: Role.SOCIAL_WORKER,
  worker: Role.SOCIAL_WORKER,
  social_worker: Role.SOCIAL_WORKER,
  socialworker: Role.SOCIAL_WORKER,
  client: Role.CLIENT,
  citizen: Role.CLIENT
};

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};

const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const REGISTER_RATE_LIMIT_WINDOW_MS = Number(
  process.env.REGISTER_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000
);
const REGISTER_RATE_LIMIT_PER_IP = Number(process.env.REGISTER_RATE_LIMIT_PER_IP || 20);
const REGISTER_RATE_LIMIT_PER_EMAIL = Number(
  process.env.REGISTER_RATE_LIMIT_PER_EMAIL || 4
);

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
  const normalized = String(input || "").trim().toLowerCase();
  return normalized.length > EMAIL_MAX
    ? normalized.slice(0, EMAIL_MAX)
    : normalized;
}

function validEmail(value) {
  return !!value && value.length <= EMAIL_MAX && EMAIL_RE.test(value);
}

function normalizePin(input) {
  return String(input || "")
    .trim()
    .replace(/\s+/g, "");
}

function validPin(pin) {
  return typeof pin === "string" && /^\d{4,8}$/.test(pin);
}

function normalizeRole(input) {
  if (!input) return Role.CLIENT;
  const key = String(input)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const mapped = ROLE_MAP[key] ?? Role.CLIENT;
  return mapped === Role.ADMIN ? Role.CLIENT : mapped;
}

function localeFromRequest(request, bodyLocale) {
  const direct = normalizeServerLocale(bodyLocale);
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
  if (!baseUrl) return "";

  const params = new URLSearchParams({ email, token });
  if (locale) params.set("locale", locale);

  return `${baseUrl.replace(/\/$/, "")}/api/verify-email?${params.toString()}`;
}

async function sendVerificationEmail(email, verifyUrl, locale) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (!from) {
    throw new Error("api.auth.verify.email_from_missing");
  }

  const mailer = getMailer("email-verify");
  await mailer.sendMail({
    to: email,
    from,
    subject: serverT(locale, "email.auth.verify.subject"),
    text: serverT(locale, "email.auth.verify.text", { verifyUrl }),
    html: serverT(locale, "email.auth.verify.html", { verifyUrl })
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const locale = localeFromRequest(request, body?.locale);

  try {
    const email = normalizeEmail(body?.email);
    const pin = normalizePin(body?.pin ?? body?.password);
    const role = normalizeRole(body?.role);
    const ip = getRequestIpFromRequest(request);

    const ipLimit = consumeRateLimit(
      `register:ip:${ip}`,
      REGISTER_RATE_LIMIT_PER_IP,
      REGISTER_RATE_LIMIT_WINDOW_MS
    );
    if (!ipLimit.allowed) {
      return errorJson("api.auth.register.rate_limited", 429, locale, {
        code: "RATE_LIMITED"
      });
    }

    if (email) {
      const emailLimit = consumeRateLimit(
        `register:email:${email}`,
        REGISTER_RATE_LIMIT_PER_EMAIL,
        REGISTER_RATE_LIMIT_WINDOW_MS
      );
      if (!emailLimit.allowed) {
        return errorJson("api.auth.register.rate_limited", 429, locale, {
          code: "RATE_LIMITED"
        });
      }
    }

    if (!validEmail(email)) {
      return errorJson("api.auth.register.invalid_email", 400, locale, {
        code: "INVALID_EMAIL"
      });
    }

    if (!validPin(pin)) {
      return errorJson("api.auth.register.pin_invalid", 400, locale, {
        code: "PIN_INVALID"
      });
    }

    const passwordHash = await hash(pin, 12);

    try {
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
          subscriptions: {
            create: {}
          }
        }
      });
    } catch (error) {
      if (error && typeof error === "object" && error.code === "P2002") {
        return errorJson("api.auth.register.email_in_use", 409, locale, {
          code: "EMAIL_IN_USE"
        });
      }
      throw error;
    }

    try {
      const token = crypto.randomBytes(32).toString("hex");
      const hours = Number(process.env.EMAIL_VERIFY_HOURS || 24);
      const expires = new Date(Date.now() + hours * 60 * 60 * 1000);

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
      if (!verifyUrl) {
        console.warn("[register] verify email skipped: base URL is not configured");
      } else {
        try {
          await sendVerificationEmail(email, verifyUrl, locale);
          await prisma.user.update({
            where: { email },
            data: { emailVerificationSentAt: new Date() }
          });
        } catch (sendError) {
          console.error("register verification email send failed", sendError);
        }
      }
    } catch (verifyError) {
      console.error("register verification flow failed", verifyError);
    }

    return json({}, 201);
  } catch (error) {
    console.error("register POST error", error);
    return errorJson("api.auth.register.failed", 500, locale, {
      code: "REGISTER_FAILED"
    });
  }
}
