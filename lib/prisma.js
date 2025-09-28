// lib/prisma.js
import { PrismaClient } from "@prisma/client";

// Hoia Prisma klienti globaalses muutujas, et vältida
// topeltühendusi Next.js dev hot-reloadi ajal.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Arenduses salvestame instantsi globaali;
// tootmises EI salvesta (iga käivitus loob värske).
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
