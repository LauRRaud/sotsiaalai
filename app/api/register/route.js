export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { Role } from "@prisma/client";

const ROLE_MAP = {
  specialist: Role.SOCIAL_WORKER,
  "eluküsimusega": Role.CLIENT,
  client: Role.CLIENT,
};

function normalizeRole(input) {
  if (!input) return Role.CLIENT;
  const key = String(input).toLowerCase();
  return ROLE_MAP[key] ?? Role.CLIENT;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const role = normalizeRole(body?.role);

    if (!email || !password) {
      return NextResponse.json({ error: "Puudub e-post või parool." }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "E-posti aadress pole korrektne." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Parool peab olema vähemalt 6 märki." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "See e-post on juba kasutusel." }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        subscriptions: { create: {} },
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("register POST error", error);
    return NextResponse.json({ error: "Registreerimine ebaõnnestus." }, { status: 500 });
  }
}
