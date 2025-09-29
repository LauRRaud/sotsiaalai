export const runtime = "nodejs";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "@/lib/prisma.js";
import { hash } from "bcrypt";

const TOKEN_EXPIRY_MINUTES = 60;

function resolveBaseUrl() {
  const direct = process.env.NEXTAUTH_URL || process.env.AUTH_URL || process.env.APP_URL;
  if (direct) return direct;
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : undefined;
}

function buildResetUrl(token) {
  const baseUrl = resolveBaseUrl();
  if (!baseUrl) {
    throw new Error("Base URL for password reset email is not configured.");
  }
  return `${baseUrl.replace(/\/$/, "")}/taasta-parool/${token}`;
}

function createTransporter() {
  if (process.env.EMAIL_SERVER) {
    return nodemailer.createTransport(process.env.EMAIL_SERVER);
  }

  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
    const authUser = process.env.SMTP_USER;
    const authPass = process.env.SMTP_PASS;

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: authUser && authPass ? { user: authUser, pass: authPass } : undefined,
    });
  }

  if (process.env.NODE_ENV !== "production") {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  throw new Error("Email transport is not configured.");
}

const globalForMailer = globalThis;

const mailer = globalForMailer.__sotsiaalai_mailer || createTransporter();

if (!globalForMailer.__sotsiaalai_mailer) {
  globalForMailer.__sotsiaalai_mailer = mailer;
}

async function sendResetEmail(to, resetUrl) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM (või SMTP_FROM) keskkonnamuutuja puudub.");
  }

  const info = await mailer.sendMail({
    to,
    from,
    subject: "SotsiaalAI parooli taastamine",
    text: `Tere!\n\nSaad parooli lähtestada lingi kaudu:\n${resetUrl}\n\nKui sa ei soovinud parooli taastada, võid selle kirja eirata.`,
    html: `
      <p>Tere!</p>
      <p>Saad parooli lähtestada lingi kaudu:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Kui sa ei soovinud parooli taastada, võid selle kirja eirata.</p>
    `,
  });

  if (info?.message && process.env.NODE_ENV !== "production") {
    console.info("[password-reset] Mock email message:\n", info.message.toString());
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Palun sisesta korrektne e-posti aadress." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Vastame alati 200, et vältida kontode enumerateerimist.
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({ where: { identifier: email } });
      await tx.verificationToken.create({ data: { identifier: email, token, expires } });
    });

    const resetUrl = buildResetUrl(token);
    await sendResetEmail(email, resetUrl);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("password reset POST error", error);
    return NextResponse.json(
      { error: "Taastelinki ei õnnestunud saata. Palun proovi hiljem uuesti." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = String(body?.token || "").trim();
    const password = String(body?.password || "").trim();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Puudub token või parool." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parool peab olema vähemalt 6 märki." },
        { status: 400 },
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token on vigane või on see juba kasutatud." },
        { status: 400 },
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: verificationToken.identifier, token } },
      });
      return NextResponse.json(
        { error: "Taastelink on aegunud. Palun taotle uus link." },
        { status: 410 },
      );
    }

    const email = normalizeEmail(verificationToken.identifier);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: verificationToken.identifier, token } },
      });
      return NextResponse.json(
        { error: "Kasutajat ei leitud." },
        { status: 404 },
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      await tx.verificationToken.delete({
        where: { identifier_token: { identifier: verificationToken.identifier, token } },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("password reset PUT error", error);
    return NextResponse.json(
      { error: "Parooli ei õnnestunud uuendada." },
      { status: 500 },
    );
  }
}