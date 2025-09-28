// app/api/profile/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

/** Loeb sisseloginud kasutaja serverisessioonist (NextAuth v4). */
async function requireUser() {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id;
  if (!userId) return null;
  return { session, userId };
}

function jsonError(message, status = 400, extras = {}) {
  return NextResponse.json({ error: message, ...extras }, { status });
}

export async function GET() {
  const ctx = await requireUser();
  if (!ctx) return jsonError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { email: true, role: true },
  });

  if (!user) return jsonError("User not found", 404);

  return NextResponse.json({ user });
}

export async function PUT(request) {
  const ctx = await requireUser();
  if (!ctx) return jsonError("Unauthorized", 401);

  try {
    const body = await request.json();
    const email = body?.email ? String(body.email).trim().toLowerCase() : undefined;
    const password = body?.password ? String(body.password).trim() : undefined;

    if (!email && !password) {
      return jsonError("Midagi pole uuendada.", 400);
    }

    const data = {};

    if (email) {
      if (!email.includes("@")) {
        return jsonError("E-posti aadress pole korrektne.", 400);
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== ctx.userId) {
        return jsonError("See e-post on juba kasutusel.", 409);
      }
      data.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return jsonError("Parool peab olema vähemalt 6 märki.", 400);
      }
      data.passwordHash = await hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: ctx.userId },
      data,
      select: { email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("profile PUT error", error);
    return jsonError("Profiili uuendamine ebaõnnestus.", 500);
  }
}
export async function DELETE() {
  const ctx = await requireUser();
  if (!ctx) return jsonError("Unauthorized", 401);

  try {
    await prisma.user.delete({ where: { id: ctx.userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("profile DELETE error", error);
    if (error?.code === "P2025") {
      return jsonError("Kasutajat ei leitud.", 404);
    }
    return jsonError("Konto kustutamine ebaõnnestus.", 500);
  }
}