// lib/authz.js
// Autoriseerimise abifunktsioonid: admini tuvastamine, rolli tuletamine,
// tellimuse kontroll ning mugavad helperid API-route’idele.

import prisma from "@/lib/prisma";

/**
 * Kas kasutaja on administraator?
 * Arvestab nii explicit role === "ADMIN" kui ka legacy isAdmin===true lippu.
 */
export function isAdmin(principal) {
  if (!principal) return false;
  const role = String(principal.role || "").toUpperCase();
  return role === "ADMIN" || principal.isAdmin === true;
}

/**
 * Tuleta roll sessioonist ("ADMIN" | "SOCIAL_WORKER" | "CLIENT").
 * Kui sessioon puudub või roll on tundmatu, tagastab "CLIENT".
 */
export function roleFromSession(session) {
  if (!session?.user) return "CLIENT";
  if (isAdmin(session.user)) return "ADMIN";

  const raw = String(session.user.role || "").toUpperCase();
  return raw === "SOCIAL_WORKER" ? "SOCIAL_WORKER" : "CLIENT";
}

/**
 * Normaliseeri roll sisulise käitumise jaoks.
 * ADMIN -> SOCIAL_WORKER (sisuvastused), muidu jätab rolli samaks.
 */
export function normalizeRole(role) {
  const r = String(role || "").toUpperCase();
  if (r === "ADMIN") return "SOCIAL_WORKER";
  if (r === "SOCIAL_WORKER") return "SOCIAL_WORKER";
  return "CLIENT";
}

/**
 * Lühike helper: võta sessioonist roll ja normaliseeri ühe sammuga.
 * Tagastab "SOCIAL_WORKER" või "CLIENT".
 */
export function effectiveRoleFromSession(session) {
  return normalizeRole(roleFromSession(session));
}

/**
 * Kontrolli, kas kasutajal on aktiivne tellimus.
 * Tingimus:
 *  - status === "ACTIVE"
 *  - JA (validUntil on NULL või validUntil > nüüd)
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
 * Tagastab objekti, mida on mugav API-route’is otse vastuseks kasutada.
 *
 * Kasutus (API-route):
 *   const gate = await requireSubscription(session, roleVoiUndefined);
 *   if (!gate.ok) return NextResponse.json({ message: gate.message }, { status: gate.status });
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

  // Tagame, et roll on normaliseeritud ka siis, kui kutsuja seda ei teinud.
  const effective = normalizeRole(role);

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
 * Mugav helper, kui vajad lihtsalt "kas lubada vestlus?" kontrolli ja
 * samas tahad kohe ka standardset veasõnumit/redirecti.
 */
export async function requireCanChat(session) {
  if (!session?.user) {
    return {
      ok: false,
      status: 401,
      message: "Logi sisse.",
      redirect: "/api/auth/signin?callbackUrl=/vestlus",
    };
  }
  if (isAdmin(session.user)) return { ok: true, status: 200 };
  if (await hasActiveSubscription(session.user.id)) return { ok: true, status: 200 };

  return {
    ok: false,
    status: 402,
    message: "Vestlemiseks on vajalik aktiivne tellimus.",
    redirect: "/tellimus",
    requireSubscription: true,
  };
}

/**
 * Lihtne boole: ADMIN → true, muidu peab olema aktiivne tellimus.
 */
export async function canChat(session) {
  if (!session?.user) return false;
  if (isAdmin(session.user)) return true;
  return hasActiveSubscription(session.user.id);
}

/**
 * API-route’i helper: veendu, et sessiooni kasutaja on admin.
 * Tagastab { ok: true } või { ok: false, status: 403, message: "..." }.
 */
export function assertAdmin(session) {
  if (!session?.user) {
    return { ok: false, status: 401, message: "Logi sisse." };
  }
  if (!isAdmin(session.user)) {
    return { ok: false, status: 403, message: "Pole õigusi." };
  }
  return { ok: true, status: 200 };
}

/**
 * Mugav kokkuvõte sessioonist: { role, effectiveRole, isAdmin, subActive }.
 * Kasulik UI/telemeetria/logide jaoks.
 */
export async function getAuthzForSession(session) {
  const role = roleFromSession(session);
  const effectiveRole = normalizeRole(role);
  const admin = isAdmin(session?.user);
  const subActive = admin ? true : await hasActiveSubscription(session?.user?.id);
  return { role, effectiveRole, isAdmin: admin, subActive };
}
