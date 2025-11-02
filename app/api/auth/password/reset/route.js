// app/api/auth/password/reset/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";
const TOKEN_EXPIRY_MINUTES = Number(process.env.RESET_TOKEN_MINUTES || 60);
// ----------------- utils: responses -----------------
function ok(payload = {}) {
  return NextResponse.json({ ok: true, ...payload }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
function err(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
// ----------------- base URL & reset link -----------------
function buildResetUrl(token) {
  const baseUrl = resolveBaseUrl();
  if (!baseUrl) throw new Error("Base URL for password reset email is not configured.");
  return `${baseUrl.replace(/\/$/, "")}/taasta-parool/${token}`;
}
// ----------------- SMTP config helpers -----------------
function parseConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    const secure = url.protocol === "smtps:" || url.protocol === "smtp+ssl:";
    const host = url.hostname;
    const port = url.port ? Number(url.port) : secure ? 465 : 587;
    const user = url.username ? decodeURIComponent(url.username) : undefined;
    const pass = url.password ? decodeURIComponent(url.password) : undefined;
    return { host, port, secure, auth: user && pass ? { user, pass } : undefined };
  } catch (error) {
    throw new Error(`EMAIL_SERVER väärtus on vigane: ${error.message}`);
  }
}
function resolveSmtpConfig() {
  if (process.env.EMAIL_SERVER) return parseConnectionString(process.env.EMAIL_SERVER);
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
    const authUser = process.env.SMTP_USER || undefined;
    const authPass = process.env.SMTP_PASS || undefined;
    return {
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: authUser && authPass ? { user: authUser, pass: authPass } : undefined,
    };
  }
  return undefined;
}
// ----------------- “dev” mailer (logib välja) -----------------
function createDevTransporter() {
  return {
    async sendMail(message) {
      const serialized = JSON.stringify(message, null, 2);
      console.info("[password-reset] Mock email message:\n", serialized);
      return { message: serialized };
    },
  };
}
// ----------------- raw SMTP client -----------------
async function connectSocket({ host, port, secure }) {
  return new Promise((resolve, reject) => {
    const socket = secure
      ? tls.connect({ host, port, servername: host })
      : net.createConnection({ host, port });
    const cleanup = () => {
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
      socket.off(secure ? "secureConnect" : "connect", onConnect);
    };
    const onError = (e) => { cleanup(); reject(e); };
    const onTimeout = () => { cleanup(); socket.destroy(new Error("SMTP ühendus aegus.")); reject(new Error("SMTP ühendus aegus.")); };
    const onConnect = () => {
      cleanup();
      socket.setTimeout(SMTP_TIMEOUT_MS, () => socket.destroy(new Error("SMTP ühendus aegus.")));
      resolve(socket);
    };
    socket.once(secure ? "secureConnect" : "connect", onConnect);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}
async function upgradeToTls(socket, host) {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: host }, () => {
      secureSocket.setTimeout(SMTP_TIMEOUT_MS, () => secureSocket.destroy(new Error("SMTP ühendus aegus.")));
      resolve(secureSocket);
    });
    secureSocket.once("error", reject);
  });
}
async function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const lines = [];
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
      socket.off("end", onClose);
    };
    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      let idx;
      while ((idx = buffer.indexOf("\r\n")) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        if (!line) continue;
        lines.push(line);
        if (line.length >= 4 && line[3] === " ") {
          cleanup();
          const code = Number(line.slice(0, 3));
          resolve({ code, lines });
          return;
        }
      }
    };
    const onError = (e) => { cleanup(); reject(e); };
    const onClose = () => { cleanup(); reject(new Error("SMTP ühendus suleti ootamatult.")); };
    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("close", onClose);
    socket.once("end", onClose);
  });
}
async function sendCommand(socket, command) {
  if (command) socket.write(`${command}\r\n`);
  return readResponse(socket);
}
function parseEhloResponse(response) {
  const capabilities = response.lines.map((l) => l.slice(4).trim()).map((c) => c.toUpperCase());
  return { capabilities, supportsStartTls: capabilities.includes("STARTTLS") };
}
async function ensureAuthenticated(socket, auth) {
  if (!auth) return;
  const initial = await sendCommand(socket, "AUTH LOGIN");
  if (initial.code === 503) return; // already authed
  if (initial.code !== 334) throw new Error(`SMTP AUTH LOGIN ebaõnnestus (kood ${initial.code}).`);
  const userRes = await sendCommand(socket, Buffer.from(auth.user, "utf8").toString("base64"));
  if (userRes.code !== 334) throw new Error(`SMTP AUTH kasutajanimi ebaõnnestus (kood ${userRes.code}).`);
  const passRes = await sendCommand(socket, Buffer.from(auth.pass, "utf8").toString("base64"));
  if (passRes.code !== 235 && passRes.code !== 503) {
    throw new Error(`SMTP AUTH parool ebaõnnestus (kood ${passRes.code}).`);
  }
}
function extractAddress(value) {
  if (!value) return "";
  const match = /<([^>]+)>/.exec(value);
  return match ? match[1].trim() : String(value).trim();
}
function normalizeRecipients(to) {
  if (!to) return [];
  if (Array.isArray(to)) return to.flatMap((t) => normalizeRecipients(t));
  return String(to).split(",").map((p) => p.trim()).filter(Boolean);
}
function encodeSubject(subject) {
  if (!subject) return "";
  return /^[\x00-\x7F]*$/.test(subject)
    ? subject
    : `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}
function buildMimeMessage({ from, to, subject, text, html }) {
  const boundary = `sotsiaalai-${crypto.randomBytes(12).toString("hex")}`;
  const normalizedTo = Array.isArray(to) ? to.join(", ") : to;
  const headers = [
    `From: ${from}`,
    `To: ${normalizedTo}`,
    `Subject: ${encodeSubject(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(16).slice(2)}@${(from || "").split("@").at(-1) || "sotsiaal.ai"}>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const plain = text || (html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");
  const htmlPart = html || (text ? `<pre>${text}</pre>` : plain);
  const parts = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    plain,
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    htmlPart,
    `--${boundary}--`,
    "",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${parts.join("\r\n")}`;
}
async function sendSmtpMail({ host, port, secure, auth, message }) {
  const recipients = normalizeRecipients(message.to);
  if (!recipients.length) throw new Error("E-kirjal peab olema vähemalt üks adressaat.");
  const envelopeFrom = extractAddress(message.from);
  if (!envelopeFrom) throw new Error("EMAIL_FROM peab sisaldama kehtivat aadressi.");
  let socket = await connectSocket({ host, port, secure });
  try {
    const greeting = await readResponse(socket);
    if (greeting.code !== 220) throw new Error(`SMTP server vastas koodiga ${greeting.code}.`);
    const ehloHost = os.hostname() || "localhost";
    let ehlo = parseEhloResponse(await sendCommand(socket, `EHLO ${ehloHost}`));
    if (!secure && ehlo.supportsStartTls) {
      const startTls = await sendCommand(socket, "STARTTLS");
      if (startTls.code !== 220) throw new Error(`STARTTLS käivitamine ebaõnnestus (kood ${startTls.code}).`);
      socket = await upgradeToTls(socket, host);
      ehlo = parseEhloResponse(await sendCommand(socket, `EHLO ${ehloHost}`));
    }
    await ensureAuthenticated(socket, auth);
    const mailFrom = await sendCommand(socket, `MAIL FROM:<${envelopeFrom}>`);
    if (mailFrom.code !== 250) throw new Error(`MAIL FROM käsk ebaõnnestus (kood ${mailFrom.code}).`);
    for (const rcpt of recipients) {
      const res = await sendCommand(socket, `RCPT TO:<${extractAddress(rcpt)}>`);
      if (![250, 251].includes(res.code)) throw new Error(`RCPT TO ebaõnnestus (kood ${res.code}).`);
    }
    const dataStart = await sendCommand(socket, "DATA");
    if (dataStart.code !== 354) throw new Error(`DATA käsk ebaõnnestus (kood ${dataStart.code}).`);
    const payload = buildMimeMessage(message);
    socket.write(`${payload}\r\n.\r\n`);
    const dataResult = await readResponse(socket);
    if (dataResult.code !== 250) throw new Error(`Kirja edastamine ebaõnnestus (kood ${dataResult.code}).`);
    await sendCommand(socket, "QUIT");
    return { message: payload };
  } finally {
    socket.end();
  }
}
function createTransporter() {
  const config = resolveSmtpConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[password-reset] Email transport puudub. Kasuta EMAIL_SERVER või SMTP_* keskkonnamuutujaid.");
    }
    return createDevTransporter();
  }
  return {
    async sendMail(message) {
      return sendSmtpMail({ ...config, message });
    },
  };
}
const mailer = getMailer("password-reset");
async function sendResetEmail(to, resetUrl) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (!from) throw new Error("EMAIL_FROM (või SMTP_FROM) keskkonnamuutuja puudub.");
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
const normalizeEmail = (e) => String(e || "").trim().toLowerCase();
// ----------------- Routes -----------------
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    if (!email || !email.includes("@")) return err("Palun sisesta korrektne e-posti aadress.", 400);
    const user = await prisma.user.findUnique({ where: { email } });
    // Vastame alati 200, vältimaks konto-enumeratsiooni
    if (!user) return ok();
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({ where: { identifier: email } });
      await tx.verificationToken.create({ data: { identifier: email, token, expires } });
    });
    const resetUrl = buildResetUrl(token);
    await sendResetEmail(email, resetUrl);
    return ok();
  } catch (e) {
    console.error("password reset POST error", e);
    return err("Taastelinki ei õnnestunud saata. Palun proovi hiljem uuesti.", 500);
  }
}
export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = String(body?.token || "").trim();
    const password = String(body?.password || "").trim();
    if (!token || !password) return err("Puudub token või parool.", 400);
    if (password.length < 6) return err("Parool peab olema vähemalt 6 märki.", 400);
    // NB: kasuta findFirst, ära eelda @unique tokenil
    const verificationToken = await prisma.verificationToken.findFirst({ where: { token } });
    if (!verificationToken) return err("Token on vigane või on see juba kasutatud.", 400);
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return err("Taastelink on aegunud. Palun taotle uus link.", 410);
    }
    const email = normalizeEmail(verificationToken.identifier);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return err("Kasutajat ei leitud.", 404);
    }
    const passwordHash = await hash(password, 12);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      await tx.verificationToken.deleteMany({ where: { token } });
    });
    return ok({ requiresReauth: true });
  } catch (e) {
    console.error("password reset PUT error", e);
    return err("Parooli ei õnnestunud uuendada.", 500);
  }
}
