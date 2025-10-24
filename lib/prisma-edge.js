// lib/prisma-edge.js
// Edge runtime versioon Prisma jaoks (ei kasuta fs moodulit)
import { PrismaClient } from "@prisma/client";

// --- Prisma singleton edge runtime'ile ---
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Hot-reload kaitse (ainult arenduses)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
