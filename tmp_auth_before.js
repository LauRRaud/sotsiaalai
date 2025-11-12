// auth.js — NextAuth v4 konfiguratsioon (JS)
import GoogleProviderImport from "next-auth/providers/google";
import CredentialsProviderImport from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma, { prisma as prismaNamed } from "./lib/prisma"; // mõlemad olemas, kui kuskil teises failis vajab

import { compare } from "bcrypt";

const GoogleProvider = GoogleProviderImport?.default ?? GoogleProviderImport;
const CredentialsProvider =
  CredentialsProviderImport?.default ?? CredentialsProviderImport;

const LOCALHOST_RE = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){1,3})(?::\d+)?$/i;

function normalizeBaseUrl(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

function computeBaseUrl() {
  const rawCandidates = [
    process.env.NEXTAUTH_URL,
    process.env.AUTH_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ];
  const normalized = rawCandidates.map(normalizeBaseUrl).filter(Boolean);

  if (process.env.NODE_ENV !== "development") {
    const firstNonLocal = normalized.find((url) => !LOCALHOST_RE.test(url));
    if (firstNonLocal) return firstNonLocal;
  }

  return (
    normalized.find((url) => LOCALHOST_RE.test(url)) ||
    normalized[0] ||
    "http://localhost:3000"
  );
}

const APP_BASE_URL = computeBaseUrl();

function toInternalDestination(targetUrl) {
  try {
    const parsed = new URL(targetUrl, APP_BASE_URL);
    if (parsed.origin === APP_BASE_URL || LOCALHOST_RE.test(parsed.origin)) {
      return `${APP_BASE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {}

  if (typeof targetUrl === "string" && targetUrl.startsWith("/")) {
    return `${APP_BASE_URL}${targetUrl}`;
  }

  return `${APP_BASE_URL}/start`;
}

/** -------- eID stubid (asenda hiljem päris SK integratsiooniga) -------- */
async function verifySmartId(personalCode) {
  return Boolean(personalCode && String(personalCode).trim().length >= 6);
}
async function verifyMobileId(personalCode, phone) {
  return Boolean(personalCode && phone);
}

/** Leia olemasolev Account või loo User + Account */
async function getOrCreateUserByAccount(provider, providerAccountId) {
  const account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
  if (account?.user) return account.user;

  const user = await prisma.user.create({ data: { role: "CLIENT" } });
  await prisma.account.create({
    data: {
      userId: user.id,
      provider,
      providerAccountId,
      type: "credentials", // eID stub login on credentials-liigiga
    },
  });
  return user;
}

/** --------- v4 authConfig (kasutab JWT sessioone) --------- */
export const authConfig = {
  adapter: PrismaAdapter(prisma),

  // v4: JWT strateegia – sobib App Routeri serverikomponentidega
  session: { strategy: "jwt" },

  // Soovi korral: pages: { signIn: "/api/auth/signin" },

  providers: [
    /** 1) Email + PIN (Credentials) */
    CredentialsProvider({
      id: "credentials",
      name: "Email & PIN",
      credentials: {
        email: { label: "Email", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email || "").trim().toLowerCase();
        const pinRaw = String(creds?.pin ?? creds?.password ?? "").trim();
        const pin = pinRaw.replace(/\s+/g, "");
        if (!email || !pin) return null;
        if (!/^\d{4,8}$/.test(pin)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null; // ajalooline field, sisaldab PIN hash'i

        const ok = await compare(pin, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin,
        };
      },
    }),

    /** 2) Eesti eID (Smart-ID / Mobiil-ID) – stub autoriseerimine */
    CredentialsProvider({
      id: "estonian_eid",
      name: "Estonian eID",
      credentials: {
        method: { label: "Method", type: "text" }, // "smart_id" | "mobiil_id"
        personalCode: { label: "Personal Code", type: "text" },
        phone: { label: "Phone", type: "text" },
      },
      authorize: async (creds) => {
        const method = String(creds?.method || "");
        const personalCode = String(creds?.personalCode || "");
        const phone = String(creds?.phone || "");

        if (method === "smart_id") {
          const ok = await verifySmartId(personalCode);
          if (!ok) return null;
          const user = await getOrCreateUserByAccount("smart_id", personalCode);
          return { id: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin };
        }

        if (method === "mobiil_id") {
          const ok = await verifyMobileId(personalCode, phone);
          if (!ok) return null;
          const user = await getOrCreateUserByAccount("mobiil_id", personalCode);
          return { id: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin };
        }

        return null;
      },
    }),

    /** 3) Google OAuth (toetab nii *_CLIENT_* kui ka legacy *_ID_* env’e) */
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_ID ||
        "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.GOOGLE_SECRET ||
        "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    /** JWT – salvestame rolli, isAdmin’i ning aktiivse tellimuse lipu */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CLIENT";
        token.isAdmin = Boolean(user.isAdmin);
      }

      // Lisa / värskenda aktiivse tellimuse lipp (ACTIVE ja kehtiv)
      if (token.id) {
        try {
          const active = await prisma.subscription.findFirst({
            where: {
              userId: String(token.id),
              status: "ACTIVE",
              OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
            },
            select: { id: true },
          });
          token.subActive = Boolean(active);
        } catch {
          token.subActive = false;
        }
      } else {
        token.subActive = false;
      }

      return token;
    },

    /** Session – peegelda JWT väärtused sessiooni */
    async session({ session, token }) {
      session.user = session.user || {};
      if (token?.id) session.user.id = token.id;
      session.user.role = token?.role || "CLIENT";
      session.user.isAdmin = Boolean(token?.isAdmin);
      session.subActive = Boolean(token?.subActive);
      return session;
    },

    /** Redirect – austa callbackUrl’i; muidu mine /start */
    async redirect({ url }) {
      return toInternalDestination(url);
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

