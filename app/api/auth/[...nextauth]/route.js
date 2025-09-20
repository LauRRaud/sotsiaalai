// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma.js";
import { compare } from "bcrypt";

// --- eID stubid: asenda hiljem SK API-ga ---
async function verifySmartId(code) { return Boolean(code && code.length >= 6); }
async function verifyMobileId(code, phone) { return Boolean(code && phone); }

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
    // 1) Email + parool
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

    // 2) Estonian eID (Smart-ID / Mobiil-ID) — stub
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
        const code = String(creds?.personalCode || "");
        const phone = String(creds?.phone || "");

        if (method === "smart_id") {
          const ok = await verifySmartId(code);
          return ok ? getOrCreateUserByAccount("smart_id", code) : null;
        }
        if (method === "mobiil_id") {
          const ok = await verifyMobileId(code, phone);
          return ok ? getOrCreateUserByAccount("mobiil_id", code) : null;
        }
        return null;
      },
    }),

    // Google lisame hiljem, kui build on roheline ja .env võtmed valmis
    // Google({ clientId: process.env.GOOGLE_ID, clientSecret: process.env.GOOGLE_SECRET }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; }
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

export const { GET, POST } = auth.handlers;
