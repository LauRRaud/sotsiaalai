// app/api/profile/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

/** Sisseloginud kasutaja (NextAuth v4 serverisessioonist) */
async function requireUser() {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id;
  if (!userId) return null;
  return { session, userId };
}

function makeError(message, status = 400, extras = {}) {
  return NextResponse.json({ ok: false, message, ...extras }, { status });
}

export async function GET() {
  const ctx = await requireUser();
  if (!ctx) return makeError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { email: true, role: true },
  });
  if (!user) return makeError("User not found", 404);

  return NextResponse.json({ ok: true, user });
}

export async function PUT(request) {
  const ctx = await requireUser();
  if (!ctx) return makeError("Unauthorized", 401);

  try {
    const body = await request.json();
    const nextEmail = body?.email ? String(body.email).trim().toLowerCase() : undefined;
    const nextPassword = body?.password ? String(body.password).trim() : undefined;

    if (!nextEmail && !nextPassword) {
      return makeError("Midagi pole uuendada.", 400);
    }

    const data = {};
    let requiresReauth = false;

    if (nextEmail) {
      if (!nextEmail.includes("@")) {
        return makeError("E-posti aadress pole korrektne.", 400);
      }
      // kontrolli unikaalsust
      const existing = await prisma.user.findUnique({ where: { email: nextEmail } });
      if (existing && existing.id !== ctx.userId) {
        return makeError("See e-post on juba kasutusel.", 409);
      }
      data.email = nextEmail;
      requiresReauth = true;
    }

    if (nextPassword) {
      if (nextPassword.length < 6) {
        return makeError("Parool peab olema vähemalt 6 märki.", 400);
      }
      data.passwordHash = await hash(nextPassword, 12);
      requiresReauth = true;
    }

    const user = await prisma.user.update({
      where: { id: ctx.userId },
      data,
      select: { email: true, role: true },
    });

    return NextResponse.json({ ok: true, user, requiresReauth });
  } catch (error) {
    console.error("profile PUT error", error);
    return makeError("Profiili uuendamine ebaõnnestus.", 500);
  }
}

export async function DELETE() {
  const ctx = await requireUser();
  if (!ctx) return makeError("Unauthorized", 401);

  try {
    await prisma.user.delete({ where: { id: ctx.userId } });
    return NextResponse.json({ ok: true, deleted: true });
  } catch (error) {
    console.error("profile DELETE error", error);
    // Prisma P2025: record not found
    if (error?.code === "P2025") {
      return makeError("Kasutajat ei leitud.", 404);
    }
    return makeError("Konto kustutamine ebaõnnestus.", 500);
  }
}
