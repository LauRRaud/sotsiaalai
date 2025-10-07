// app/api/register/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { Role } from "@prisma/client";

// lubatud sisendvormid -> Prisma Role
const ROLE_MAP = {
  specialist: Role.SOCIAL_WORKER,
  "sotsiaaltöö": Role.SOCIAL_WORKER,
  "sotsiaaltöötaja": Role.SOCIAL_WORKER,
  "social_worker": Role.SOCIAL_WORKER,
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

function normalizeRole(input) {
  if (!input) return Role.CLIENT;
  const key = String(input).trim().toLowerCase();
  // ära võimalda ADMIN-it läbi registreerimisvormi
  const mapped = ROLE_MAP[key] ?? Role.CLIENT;
  return mapped === Role.ADMIN ? Role.CLIENT : mapped;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const role = normalizeRole(body?.role);

    if (!email || !password) return err("Puudub e-post või parool.");
    if (!email.includes("@")) return err("E-posti aadress pole korrektne.");
    if (password.length < 6) return err("Parool peab olema vähemalt 6 märki.");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return err("See e-post on juba kasutusel.", 409);

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role, // CLIENT või SOCIAL_WORKER
        // loob vaikimisi Subscriptioni (status=NONE) — sinu skeema default teeb ülejäänu
        subscriptions: { create: {} },
      },
    });

    // kliendile ei tagasta tundlikke andmeid
    return ok({}, 201);
  } catch (error) {
    console.error("register POST error", error);
    return err("Registreerimine ebaõnnestus.", 500);
  }
}
