// lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis; // või: globalThis /** @type {{ prisma?: PrismaClient }} */ (globalThis)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
