// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs";

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma.js";
import { compare } from "bcrypt";

// --- eID stubid: asenda päris SK API-ga hiljem ---
async function verifySmartId(personalCode) {
  return Boolean(personalCode && personalCode.length >= 6);
}
async function verifyMobileId(personalCode, phone) {
  return Boolean(personalCode && phone);
}

async function getOrCreateUserByAccount(provider, providerAccountId) {
  const account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
  if (account?.user) return account.user;

  const user = await prisma.user.create({ data: { role: "CLIENT" } });
  await prisma.account.create({
    data: { userId: user.id, provider, providerAccountId, type: "oauth" },
  });
  return user;
}

const auth = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // Email + parool
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: String(creds.email) } });
        if (!user?.passwordHash) return null;
        const ok = await compare(String(creds.password), user.passwordHash);
        return ok ? user : null;
      },
    }),

    // eID (Smart-ID / Mobiil-ID) — stub
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
          return await getOrCreateUserByAccount("smart_id", personalCode);
        }
        if (method === "mobiil_id") {
          const ok = await verifyMobileId(personalCode, phone);
          if (!ok) return null;
          return await getOrCreateUserByAccount("mobiil_id", personalCode);
        }
        return null;
      },
    }),

    // Google OAuth (pane .env võtmed)
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.userId = token.id;
        session.user = session.user || {};
        session.user.role = token.role;
      }
      return session;
    },
  },
});

// NextAuth v5 handlers:
export const { GET, POST } = auth.handlers;
