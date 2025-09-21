export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { getToken } from "next-auth/jwt";
import { hash } from "bcrypt";

async function requireUser(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return null;
  return { token, userId: token.id };
}

export async function GET(request) {
  const session = await requireUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request) {
  const session = await requireUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = body?.email ? String(body.email).trim().toLowerCase() : undefined;
    const password = body?.password ? String(body.password).trim() : undefined;

    if (!email && !password) {
      return NextResponse.json({ error: "Midagi pole uuendada." }, { status: 400 });
    }

    const data = {};

    if (email) {
      if (!email.includes("@")) {
        return NextResponse.json({ error: "E-posti aadress pole korrektne." }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== session.userId) {
        return NextResponse.json({ error: "See e-post on juba kasutusel." }, { status: 409 });
      }
      data.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Parool peab olema vähemalt 6 märki." }, { status: 400 });
      }
      data.passwordHash = await hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: { email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("profile PUT error", error);
    return NextResponse.json({ error: "Profiili uuendamine ebaõnnestus." }, { status: 500 });
  }
}
