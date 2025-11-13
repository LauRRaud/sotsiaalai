// auth.js — NextAuth v4 konfiguratsioon (JS)
import CredentialsProviderImport from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma, { prisma as prismaNamed } from "./lib/prisma"; // mõlemad olemas, kui kuskil teises failis vajab

import { compare } from "bcrypt";
import {
  hashOpaqueToken,
  normalizeEmail,
  normalizePin,
  isValidPin,
} from "@/lib/auth/pin-login";

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
const ALLOW_DIRECT_PIN_LOGIN = process.env.LOGIN_ALLOW_DIRECT_PIN === "true";

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

/** --------- v4 authConfig (kasutab JWT sessioone) --------- */
export const authConfig = {
  adapter: PrismaAdapter(prisma),

  // v4: JWT strateegia – sobib App Routeri serverikomponentidega
  session: { strategy: "jwt" },

  // Soovi korral: pages: { signIn: "/api/auth/signin" },

  providers: [
    // Email + PIN (Credentials)
    CredentialsProvider({
      id: "credentials",
      name: "Email & PIN",
      credentials: {
        email: { label: "Email", type: "text" },
        pin: { label: "PIN", type: "password" },
        temp_login_token: { label: "Temp Token", type: "text" },
      },
      authorize: async (creds) => {
        const tempTokenRaw = String(creds?.temp_login_token || "").trim();
        if (tempTokenRaw) {
          const tokenHash = hashOpaqueToken(tempTokenRaw);
          const loginToken = await prisma.loginTempToken.findUnique({
            where: { tokenHash },
            select: {
              id: true,
              userId: true,
              requiresOtp: true,
              otpVerifiedAt: true,
              expiresAt: true,
              usedAt: true,
              user: {
                select: { id: true, email: true, role: true, isAdmin: true },
              },
            },
          });
          if (!loginToken?.user) return null;
          const now = new Date();
          if (loginToken.expiresAt <= now || loginToken.usedAt) return null;
          if (loginToken.requiresOtp && !loginToken.otpVerifiedAt) return null;
          await prisma.loginTempToken.update({
            where: { id: loginToken.id },
            data: { usedAt: now },
          });
          const user = loginToken.user;
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
          };
        }

        if (!ALLOW_DIRECT_PIN_LOGIN) {
          return null;
        }

        const email = normalizeEmail(creds?.email);
        const pin = normalizePin(creds?.pin);
        if (!email || !isValidPin(pin)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

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

