import CredentialsProviderImport from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./lib/prisma";
import { compare } from "bcrypt";
import {
  hashOpaqueToken,
  normalizeEmail,
  normalizePin,
  isValidPin,
  isDirectPinLoginAllowed
} from "@/lib/auth/pin-login";
const CredentialsProvider = CredentialsProviderImport?.default ?? CredentialsProviderImport;
const LOCALHOST_RE = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){1,3})(?::\d+)?$/i;
function normalizeBaseUrl(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}
function computeBaseUrl() {
  const rawCandidates = [process.env.NEXTAUTH_URL, process.env.AUTH_URL, process.env.APP_URL, process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""];
  const normalized = rawCandidates.map(normalizeBaseUrl).filter(Boolean);
  if (process.env.NODE_ENV !== "development") {
    const firstNonLocal = normalized.find(url => !LOCALHOST_RE.test(url));
    if (firstNonLocal) return firstNonLocal;
  }
  return normalized.find(url => LOCALHOST_RE.test(url)) || normalized[0] || "http://localhost:3000";
}
const APP_BASE_URL = computeBaseUrl();
const ALLOW_DIRECT_PIN_LOGIN = isDirectPinLoginAllowed();
function isIgnorableJwtDecryptError(code, metadata) {
  if (code !== "JWT_SESSION_ERROR") return false;
  const candidates = [
    metadata?.error?.message,
    metadata?.error?.cause?.message,
    metadata?.message
  ];
  return candidates.some(value =>
    /decryption operation failed/i.test(String(value || ""))
  );
}
function toInternalDestination(targetUrl, runtimeBaseUrl = APP_BASE_URL) {
  const effectiveBaseUrl = normalizeBaseUrl(runtimeBaseUrl) || APP_BASE_URL;
  try {
    const parsed = new URL(targetUrl, effectiveBaseUrl);
    if (parsed.origin === effectiveBaseUrl || LOCALHOST_RE.test(parsed.origin)) {
      return `${effectiveBaseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {}
  if (typeof targetUrl === "string" && targetUrl.startsWith("/")) {
    return `${effectiveBaseUrl}${targetUrl}`;
  }
  return `${effectiveBaseUrl}/start`;
}
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  logger: {
    error(code, metadata) {
      if (isIgnorableJwtDecryptError(code, metadata)) return;
      console.error(`[next-auth][error][${code}]`, metadata ?? {});
    }
  },
  providers: [CredentialsProvider({
    id: "credentials",
    name: "Email & PIN",
    credentials: {
      email: {
        label: "Email",
        type: "text"
      },
      pin: {
        label: "PIN",
        type: "password"
      },
      temp_login_token: {
        label: "Temp Token",
        type: "text"
      }
    },
    authorize: async creds => {
      const tempTokenRaw = String(creds?.temp_login_token || "").trim();
      if (tempTokenRaw) {
        const tokenHash = hashOpaqueToken(tempTokenRaw);
        const loginToken = await prisma.loginTempToken.findUnique({
          where: {
            tokenHash
          },
          select: {
            id: true,
            userId: true,
            requiresOtp: true,
            otpVerifiedAt: true,
            expiresAt: true,
            usedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                isAdmin: true,
                sessionVersion: true
              }
            }
          }
        });
        if (!loginToken?.user) return null;
        const now = new Date();
        if (loginToken.expiresAt <= now || loginToken.usedAt) return null;
        if (loginToken.requiresOtp && !loginToken.otpVerifiedAt) return null;
        const user = await prisma.$transaction(async tx => {
          await tx.loginTempToken.update({
            where: {
              id: loginToken.id
            },
            data: {
              usedAt: now
            }
          });
          return tx.user.update({
            where: {
              id: loginToken.user.id
            },
            data: {
              sessionVersion: {
                increment: 1
              }
            },
            select: {
              id: true,
              email: true,
              role: true,
              isAdmin: true,
              sessionVersion: true
            }
          });
        });
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin,
          sessionVersion: user.sessionVersion
        };
      }
      if (!ALLOW_DIRECT_PIN_LOGIN) {
        return null;
      }
      const email = normalizeEmail(creds?.email);
      const pin = normalizePin(creds?.pin);
      if (!email || !isValidPin(pin)) return null;
      const user = await prisma.user.findUnique({
        where: {
          email
        },
        select: {
          id: true,
          email: true,
          role: true,
          isAdmin: true,
          passwordHash: true,
          sessionVersion: true
        }
      });
      if (!user?.passwordHash) return null;
      const ok = await compare(pin, user.passwordHash);
      if (!ok) return null;
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          sessionVersion: {
            increment: 1
          }
        },
        select: {
          id: true,
          email: true,
          role: true,
          isAdmin: true,
          sessionVersion: true
        }
      });
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        sessionVersion: updatedUser.sessionVersion
      };
    }
  })],
  callbacks: {
    async jwt({
      token,
      user
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "CLIENT";
        token.isAdmin = Boolean(user.isAdmin);
        token.sessionVersion = Number.isFinite(user.sessionVersion) ? user.sessionVersion : 0;
      }
      if (token.id) {
        try {
          const currentUser = await prisma.user.findUnique({
            where: {
              id: String(token.id)
            },
            select: {
              role: true,
              isAdmin: true,
              sessionVersion: true,
              subscriptions: {
                where: {
                  status: "ACTIVE",
                  OR: [{
                    validUntil: null
                  }, {
                    validUntil: {
                      gt: new Date()
                    }
                  }]
                },
                select: {
                  id: true
                },
                take: 1
              }
            }
          });
          if (!currentUser) {
            throw new Error("SESSION_USER_MISSING");
          }
          if (Number(token.sessionVersion ?? 0) !== Number(currentUser.sessionVersion ?? 0)) {
            throw new Error("SESSION_REVOKED");
          }
          token.role = currentUser.role ?? "CLIENT";
          token.isAdmin = Boolean(currentUser.isAdmin);
          token.subActive = currentUser.subscriptions.length > 0;
        } catch (error) {
          const reason = String(error?.message || "");
          if (reason === "SESSION_USER_MISSING" || reason === "SESSION_REVOKED") {
            throw error;
          }
          token.subActive = false;
        }
      } else {
        token.subActive = false;
      }
      return token;
    },
    async session({
      session,
      token
    }) {
      session.user = session.user || {};
      if (token?.id) session.user.id = token.id;
      session.user.role = token?.role || "CLIENT";
      session.user.isAdmin = Boolean(token?.isAdmin);
      session.subActive = Boolean(token?.subActive);
      return session;
    },
    async redirect({
      url,
      baseUrl
    }) {
      return toInternalDestination(url, baseUrl);
    }
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
};
