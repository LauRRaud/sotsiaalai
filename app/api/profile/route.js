// app/api/profile/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcrypt";
/** Vasta JSON-iga koos no-store päistega */
function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
/** Sisseloginud kasutaja (NextAuth v4 serverisessioonist) */
async function requireUser() {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id;
  if (!userId) return null;
  return { session, userId };
}
function makeError(message, status = 400, extras = {}) {
  return json({ ok: false, message, ...extras }, status);
}
export async function GET() {
  const ctx = await requireUser();
  if (!ctx) return makeError("Unauthorized", 401);
  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    // do not return passwordHash to client; derive a boolean instead
    select: { email: true, role: true, passwordHash: true },
  });
  if (!user) return makeError("User not found", 404);
  const { email, role, passwordHash } = user;
  return json({ ok: true, user: { email, role, hasPassword: !!passwordHash } });
}
export async function PUT(request) {
  const ctx = await requireUser();
  if (!ctx) return makeError("Unauthorized", 401);
  try {
    const body = await request.json().catch(() => ({}));
    const nextEmail =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const nextPassword =
      typeof body?.password === "string" ? body.password.trim() : undefined;
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : undefined;
    if (!nextEmail && !nextPassword) {
      return makeError("Midagi pole uuendada.", 400);
    }
    // Loe kehtiv kasutaja (vajame emaili ja parooli kontrolliks)
    const current = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { email: true, passwordHash: true },
    });
    if (!current) return makeError("User not found", 404);
    const data = {};
    let requiresReauth = false;
    // --- E-posti uuendamine ---
    if (nextEmail) {
      if (!nextEmail.includes("@")) {
        return makeError("E-posti aadress pole korrektne.", 400);
      }
      if (nextEmail !== current.email) {
        // kontrolli unikaalsust ainult siis, kui email tõesti muutub
        const exists = await prisma.user.findUnique({ where: { email: nextEmail } });
        if (exists && exists.id !== ctx.userId) {
          return makeError("See e-post on juba kasutusel.", 409);
        }
        data.email = nextEmail;
        // emaili muutmisel tühista varasem verif ja saatmise märge
        data.emailVerified = null;
        data.emailVerificationSentAt = null;
        requiresReauth = true;
      }
    }
    // --- Parooli uuendamine ---
    if (nextPassword) {
      if (nextPassword.length < 6) {
        return makeError("Parool peab olema vähemalt 6 märki.", 400);
      }
      // Kui kontol oli varem parool, nõua currentPassword kontrolli
      if (current.passwordHash) {
        if (!currentPassword) {
          return makeError("Sisesta kehtiv parool (currentPassword), et parooli muuta.", 400, {
            code: "CURRENT_PASSWORD_REQUIRED",
          });
        }
        const ok = await compare(currentPassword, current.passwordHash);
        if (!ok) {
          return makeError("Kehtiv parool on vale.", 401, { code: "CURRENT_PASSWORD_INVALID" });
        }
      }
      data.passwordHash = await hash(nextPassword, 12);
      requiresReauth = true;
    }
    if (Object.keys(data).length === 0) {
      // Pole sisulist muudatust (nt email sama ja parool puudus)
      return json({ ok: true, user: { email: current.email, role: undefined }, requiresReauth: false });
    }
    const updated = await prisma.user.update({
      where: { id: ctx.userId },
      data,
      select: { email: true, role: true },
    });
    return json({ ok: true, user: updated, requiresReauth });
  } catch (error) {
    // Prisma unikaalsus vms
    if (error?.code === "P2002") {
      return makeError("See e-post on juba kasutusel.", 409);
    }
    console.error("profile PUT error", error);
    return makeError("Profiili uuendamine ebaõnnestus.", 500);
  }
}
export async function DELETE() {
  const ctx = await requireUser();
  if (!ctx) return makeError("Unauthorized", 401);
  try {
    await prisma.user.delete({ where: { id: ctx.userId } });
    return json({ ok: true, deleted: true });
  } catch (error) {
    // Prisma P2025: record not found
    if (error?.code === "P2025") {
      return makeError("Kasutajat ei leitud.", 404);
    }
    console.error("profile DELETE error", error);
    return makeError("Konto kustutamine ebaõnnestus.", 500);
  }
}
