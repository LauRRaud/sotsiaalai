// auth.js — Auth.js (NextAuth v5) konfiguratsioon
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { compare } from "bcrypt";

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

/** --------- v5 authConfig (JWT sessioon) --------- */
export const authConfig = {
  adapter: PrismaAdapter(prisma),

  session: { strategy: "jwt" },

  providers: [
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email || "").trim().toLowerCase();
        const password = String(creds?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin,
        };
      },
    }),

    Credentials({
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

    Google({
      clientId:
        process.env.AUTH_GOOGLE_ID ??
        process.env.GOOGLE_CLIENT_ID ??
        process.env.GOOGLE_ID ??
        "",
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ??
        process.env.GOOGLE_CLIENT_SECRET ??
        process.env.GOOGLE_SECRET ??
        "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CLIENT";
        token.isAdmin = Boolean(user.isAdmin);
      }

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

    async session({ session, token }) {
      session.user = session.user || {};
      if (token?.id) session.user.id = token.id;
      session.user.role = token?.role || "CLIENT";
      session.user.isAdmin = Boolean(token?.isAdmin);
      session.subActive = Boolean(token?.subActive);
      return session;
    },

    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {}
      if (url?.startsWith?.("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/start`;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const authInstance = NextAuth(authConfig);

export const { handlers, auth, signIn, signOut } = authInstance;
export const { GET, POST } = handlers;

// Ühilduvus varem authOptions/authConfig otsijatele
export const authOptions = authConfig;

export default authInstance;
