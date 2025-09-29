// lib/authz.js
// Autoriseerimise abifunktsioonid: admini tuvastamine ja tellimuse kontroll.
// Kasutab Prisma klienti (vt lib/prisma.js).

import prisma from "@/lib/prisma";

/**
 * Kas kasutaja on administraator?
 * Arvestab nii explicit role === "ADMIN" kui ka legacy isAdmin=true lippu.
 */
export function isAdmin(principal) {
  if (!principal) return false;
  const role = String(principal.role || "").toUpperCase();
  return role === "ADMIN" || principal.isAdmin === true;
}

/**
 * Tuleta roll sessioonist (ADMIN/SOCIAL_WORKER/CLIENT).
 * Kui sessioon puudub, tagastab "CLIENT".
 */
export function roleFromSession(session) {
  if (!session?.user) return "CLIENT";
  if (isAdmin(session.user)) return "ADMIN";
  const raw = String(session.user.role || "").toUpperCase();
  return raw === "SOCIAL_WORKER" ? "SOCIAL_WORKER" : "CLIENT";
}

/**
 * Mõnes äriloogikas soovime, et ADMIN käituks nagu SOCIAL_WORKER (nt sisulised vastused).
 * See abi funktsioon normaliseerib rolli vastavalt.
 */
export function normalizeRole(role) {
  const r = String(role || "").toUpperCase();
  if (r === "ADMIN") return "SOCIAL_WORKER";
  if (r === "SOCIAL_WORKER") return "SOCIAL_WORKER";
  return "CLIENT";
}

/**
 * Kontrolli, kas kasutajal on aktiivne tellimus.
 * Tingimus:
 *  - status === "ACTIVE"
 *  - ja (validUntil on NULL või validUntil > nüüd)
 */
export async function hasActiveSubscription(userId) {
  if (!userId) return false;
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    select: { id: true },
  });
  return !!sub;
}

/**
 * Nõua tellimust CLIENT/SOCIAL_WORKER rollil (ADMIN pääseb ilma).
 * Tagastab objekti, millega saab API-route’is vastuse vormistada.
 *
 * Kasutus (API-route):
 *   const gate = await requireSubscription(session, normalizedRole);
 *   if (!gate.ok) {
 *     return NextResponse.json(
 *       { ok: false, message: gate.message, requireSubscription: gate.requireSubscription, redirect: gate.redirect },
 *       { status: gate.status }
 *     );
 *   }
 */
export async function requireSubscription(session, role) {
  if (!session) {
    return {
      ok: false,
      status: 401,
      message: "Logi sisse.",
      redirect: "/api/auth/signin?callbackUrl=/vestlus",
    };
  }

  // ADMIN ei vaja tellimust
  if (isAdmin(session.user)) {
    return { ok: true, status: 200 };
  }

  const effective = String(role || "").toUpperCase();
  if (effective === "SOCIAL_WORKER" || effective === "CLIENT") {
    const ok = await hasActiveSubscription(session.user.id);
    if (!ok) {
      return {
        ok: false,
        status: 402, // Payment Required
        message: "Vestlemiseks on vajalik aktiivne tellimus.",
        redirect: "/tellimus",
        requireSubscription: true,
      };
    }
  }

  return { ok: true, status: 200 };
}

/**
 * Mugav helper, kui vajad lihtsalt "kas lubada vestlus?" kontrolli.
 * ADMIN → true. Muidu peab olema aktiivne tellimus.
 */
export async function canChat(session) {
  if (!session?.user) return false;
  if (isAdmin(session.user)) return true;
  return hasActiveSubscription(session.user.id);
}
