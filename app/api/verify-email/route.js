export const runtime = "nodejs";

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { normalizeServerLocale, serverT } from "@/lib/i18n/serverMessages";
import { localizePath } from "@/lib/localizePath";
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
const VERIFY_PAGE_COPY = {
  et: {
    title: "Kinnita e-posti aadress",
    intro: "Konto aktiveerimiseks kinnita oma e-posti aadress alloleva nupuga.",
    confirm: "Kinnita e-post",
    successTitle: "E-post on kinnitatud",
    successBody: "Võid nüüd jätkata tellimuse aktiveerimise või sisselogimisega.",
    continueLabel: "Jätka"
  },
  en: {
    title: "Confirm your email address",
    intro: "To activate your account, confirm your email address using the button below.",
    confirm: "Confirm email",
    successTitle: "Email confirmed",
    successBody: "You can now continue to subscription activation or sign in.",
    continueLabel: "Continue"
  },
  ru: {
    title: "Подтвердите email",
    intro: "Чтобы активировать аккаунт, подтвердите email кнопкой ниже.",
    confirm: "Подтвердить email",
    successTitle: "Email подтверждён",
    successBody: "Теперь можно продолжить активацию подписки или войти.",
    continueLabel: "Продолжить"
  }
};

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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getVerifyCopy(locale) {
  return VERIFY_PAGE_COPY[locale] || VERIFY_PAGE_COPY.en;
}

function renderVerifyPage({
  locale,
  title,
  body,
  actionLabel,
  actionUrl,
  isError = false
}) {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeActionLabel = escapeHtml(actionLabel);
  const safeActionUrl = escapeHtml(actionUrl);

  return new NextResponse(
    `<!doctype html>
<html lang="${escapeHtml(locale)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      :root { color-scheme: dark light; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Arial, sans-serif;
        background:
          radial-gradient(circle at top, rgba(197,113,113,0.18), transparent 36%),
          linear-gradient(180deg, #0b1220 0%, #121a2b 100%);
        color: #f5f7fb;
      }
      .card {
        width: min(100%, 460px);
        border-radius: 20px;
        padding: 28px;
        background: rgba(12, 18, 30, 0.78);
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 32px;
        line-height: 1.05;
      }
      p {
        margin: 0;
        font-size: 17px;
        line-height: 1.5;
        color: ${isError ? "#fecaca" : "#e5e7eb"};
      }
      .actions {
        margin-top: 22px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 20px;
        border-radius: 999px;
        border: 0;
        text-decoration: none;
        background: ${isError ? "#b45309" : "#c57171"};
        color: white;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>${safeTitle}</h1>
      <p>${safeBody}</p>
      <div class="actions">
        <a class="button" href="${safeActionUrl}">${safeActionLabel}</a>
      </div>
    </main>
  </body>
</html>`,
    {
      status: isError ? 400 : 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...NO_STORE_HEADERS
      }
    }
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

function buildVerifyConfirmUrl({ requestUrl, email, token, locale }) {
  const confirmUrl = new URL(requestUrl);
  confirmUrl.searchParams.set("email", email);
  confirmUrl.searchParams.set("token", token);
  confirmUrl.searchParams.set("confirm", "1");
  if (locale) {
    confirmUrl.searchParams.set("locale", locale);
  } else {
    confirmUrl.searchParams.delete("locale");
  }
  return confirmUrl.toString();
}

function buildSubscriptionUrl({ requestUrl, locale }) {
  const redirectBase = resolveBaseUrl() || new URL(requestUrl).origin;
  const subscriptionPath = localizePath("/tellimus", locale);
  return new URL(`${subscriptionPath}?reason=email-verified`, redirectBase);
}

async function confirmVerification({ email, token }) {
  if (!email || !token) {
    return {
      ok: false,
      status: 400,
      messageKey: "api.auth.verify.invalid_link",
      code: "INVALID_LINK"
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.emailVerified) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });
    return { ok: true, alreadyVerified: true };
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
    return {
      ok: false,
      status: 400,
      messageKey: "api.auth.verify.link_invalid_or_used",
      code: "INVALID_LINK"
    };
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });
    return {
      ok: false,
      status: 410,
      messageKey: "api.auth.verify.link_expired",
      code: "LINK_EXPIRED"
    };
  }

  if (!user) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });
    return {
      ok: false,
      status: 404,
      messageKey: "api.auth.verify.user_not_found",
      code: "USER_NOT_FOUND"
    };
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

  return { ok: true, alreadyVerified: false };
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
  const copy = getVerifyCopy(locale);
  const email = normalizeEmail(url.searchParams.get("email"));
  const token = String(url.searchParams.get("token") || "").trim();
  const wantsConfirm = url.searchParams.get("confirm") === "1";

  try {
    if (!wantsConfirm) {
      if (!email || !token) {
        return renderVerifyPage({
          locale,
          title: copy.title,
          body: serverT(locale, "api.auth.verify.invalid_link", undefined, copy.intro),
          actionLabel: copy.continueLabel,
          actionUrl: buildSubscriptionUrl({ requestUrl: request.url, locale }).toString(),
          isError: true
        });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser?.emailVerified) {
        return NextResponse.redirect(buildSubscriptionUrl({ requestUrl: request.url, locale }));
      }

      return renderVerifyPage({
        locale,
        title: copy.title,
        body: copy.intro,
        actionLabel: copy.confirm,
        actionUrl: buildVerifyConfirmUrl({
          requestUrl: request.url,
          email,
          token,
          locale
        })
      });
    }

    const result = await confirmVerification({ email, token });
    if (!result.ok) {
      return renderVerifyPage({
        locale,
        title: copy.title,
        body: serverT(locale, result.messageKey, undefined, copy.intro),
        actionLabel: copy.continueLabel,
        actionUrl: buildSubscriptionUrl({ requestUrl: request.url, locale }).toString(),
        isError: true
      });
    }

    return NextResponse.redirect(buildSubscriptionUrl({ requestUrl: request.url, locale }));
  } catch (error) {
    console.error("verify-email GET error", error);
    return renderVerifyPage({
      locale,
      title: copy.successTitle,
      body: serverT(
        locale,
        "api.auth.verify.confirm_failed",
        undefined,
        copy.successBody
      ),
      actionLabel: copy.continueLabel,
      actionUrl: buildSubscriptionUrl({ requestUrl: request.url, locale }).toString(),
      isError: true
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
