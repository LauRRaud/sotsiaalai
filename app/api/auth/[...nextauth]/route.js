// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs";

import NextAuthImport from "next-auth";
import GoogleImport from "next-auth/providers/google";
import CredentialsImport from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma.js";
import { compare } from "bcrypt";

const asProvider = (mod) => mod?.default?.default ?? mod?.default ?? mod;
const NextAuth = asProvider(NextAuthImport);
const Google = asProvider(GoogleImport);
const Credentials = asProvider(CredentialsImport);

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

const providers = [
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
  Credentials({
    id: "estonian_eid",
    name: "Estonian eID",
    credentials: {
      method: { label: "Method", type: "text" },
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
];

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (token?.id) {
        const activeSub = await prisma.subscription.findFirst({
          where: {
            userId: token.id,
            status: "ACTIVE",
            OR: [
              { validUntil: null },
              { validUntil: { gt: new Date() } },
            ],
          },
          select: { id: true },
        });
        token.subActive = Boolean(activeSub);
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.userId = token.id;
        session.user = session.user || {};
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.subActive =
          token.subActive === true || token.subActive === "true";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
