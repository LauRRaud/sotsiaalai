// lib/prisma.js
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import fs from "fs";

// --- Lae keskkonnamuutujad vastavalt režiimile ---
const envPath =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env";

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Kui olemas rag.env, lae see lisaks (üle ei kirjuta juba seatud muutujaid)
if (fs.existsSync("rag.env")) {
  dotenv.config({ path: "rag.env", override: false });
}

// --- Prisma singleton ---
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
