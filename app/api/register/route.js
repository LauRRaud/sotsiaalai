// app/api/register/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { Role } from "@prisma/client";
import crypto from "node:crypto";
import { getMailer, resolveBaseUrl } from "@/lib/mailer";
// lubatud sisendvormid -> Prisma Role
const ROLE_MAP = {
  specialist: Role.SOCIAL_WORKER,
  "sotsiaaltöö": Role.SOCIAL_WORKER,
  "sotsiaaltöötaja": Role.SOCIAL_WORKER,
  social_worker: Role.SOCIAL_WORKER,
  client: Role.CLIENT,
  "eluküsimusega": Role.CLIENT,
  "eluküsimusega pöörduja": Role.CLIENT,
};
// --- ühtlased vastused ---
function ok(payload = {}, status = 200) {
  return NextResponse.json({ ok: true, ...payload }, { status });
}
function err(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}
// lihtne e-posti kontroll (piisavalt range, aga mitte ülemäära)
const EMAIL_MAX = 254;
const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
function normalizeEmail(input) {
  const s = String(input || "").trim().toLowerCase();
  return s.length > EMAIL_MAX ? s.slice(0, EMAIL_MAX) : s;
}
function validEmail(s) {
  return !!s && s.length <= EMAIL_MAX && EMAIL_RE.test(s);
}
// lihtne parooli kontroll (min 6 märke; soovi korral lisa keerukus)
function normalizePassword(input) {
  return String(input || "").trim();
}
function validPassword(pw) {
  return typeof pw === "string" && pw.length >= 6 && pw.length <= 1024;
}
function normalizeRole(input) {
  if (!input) return Role.CLIENT;
  const key = String(input).trim().toLowerCase();
  const mapped = ROLE_MAP[key] ?? Role.CLIENT;
  // ära võimalda ADMIN-it läbi registreerimisvormi
  return mapped === Role.ADMIN ? Role.CLIENT : mapped;
}
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const password = normalizePassword(body?.password);
    const role = normalizeRole(body?.role);
    if (!validEmail(email)) return err("E-posti aadress pole korrektne.");
    if (!validPassword(password)) return err("Parool peab olema vähemalt 6 märki.");
    // NB! Võistlusseisu vastu kaitse: ära toetu ainult eelkontrollile,
    // püüa ka P2002 (unique constraint) all.
    const passwordHash = await hash(password, 12);
    try {
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role, // CLIENT või SOCIAL_WORKER
          subscriptions: { create: {} }, // skeema defaultid katavad ülejäänu
        },
      });
    } catch (e) {
      // Prisma unikaalsuse rikkumine
      if (e && typeof e === "object" && e.code === "P2002") {
        return err("See e-post on juba kasutusel.", 409);
      }
      throw e;
    }
    // Loo verifitseerimise token ja saada kinnituskiri
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const hours = Number(process.env.EMAIL_VERIFY_HOURS || 24);
      const expires = new Date(Date.now() + hours * 60 * 60 * 1000);
      await prisma.$transaction(async (tx) => {
        await tx.verificationToken.deleteMany({ where: { identifier: email } });
        await tx.verificationToken.create({ data: { identifier: email, token, expires } });
      });
      const baseUrl = resolveBaseUrl();
      if (baseUrl) {
        const verifyUrl = `${baseUrl.replace(/\/$/, "")}/api/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
        const mailer = getMailer("email-verify");
        const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
        if (from) {
          await mailer.sendMail({
            to: email,
            from,
            subject: "Kinnita oma e-posti aadress",
            text: `Tere!\n\nPalun kinnita oma e-posti aadress, klõpsates järgneval lingil:\n${verifyUrl}\n\nKui sa ei loonud kontot SotsiaalAI keskkonnas, ignoreeri seda kirja.`,
            html: `
              <p>Tere!</p>
              <p>Palun kinnita oma e-posti aadress, klõpsates järgneval lingil:</p>
              <p><a href="${verifyUrl}">${verifyUrl}</a></p>
              <p>Kui sa ei loonud kontot SotsiaalAI keskkonnas, ignoreeri seda kirja.</p>
            `,
          });
          try { await prisma.user.update({ where: { email }, data: { emailVerificationSentAt: new Date() } }); } catch {}
        } else {
          console.warn("[email-verify] EMAIL_FROM/SMTP_FROM seadistamata – jätan saatmata. Link:", verifyUrl);
        }
      } else {
        console.warn("[email-verify] Base URL määramata – ei saa koostada kinnituse linki.");
      }
    } catch (e) {
      console.error("register: verification email error", e);
      // jätame registreerimise siiski edukaks
    }
    // ära tagasta tundlikke andmeid
    return ok({}, 201);
  } catch (error) {
    console.error("register POST error", error);
    return err("Registreerimine ebaõnnestus.", 500);
  }
}
