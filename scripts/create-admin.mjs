#!/usr/bin/env node
// scripts/create-admin.mjs
// Creates or updates a local admin user with credentials login.

import fs from "fs";
import path from "path";
import url from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Load env for local dev: prefer .env.local, then .env
const root = path.resolve(__dirname, "..");
const localEnv = path.join(root, ".env.local");
const defaultEnv = path.join(root, ".env");
if (fs.existsSync(localEnv)) dotenv.config({ path: localEnv });
else if (fs.existsSync(defaultEnv)) dotenv.config({ path: defaultEnv });

function parseArgs(argv) {
  const out = { admin: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--admin") { out.admin = true; continue; }
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) { out[m[1]] = m[2]; continue; }
    const key = a.replace(/^--/, "");
    const val = argv[i + 1];
    if (val && !val.startsWith("--")) { out[key] = val; i++; }
  }
  return out;
}

const args = parseArgs(process.argv);
const email = args.email || process.env.ADMIN_EMAIL;
const password = args.password || process.env.ADMIN_PASSWORD;
const roleInput = (args.role || process.env.ADMIN_ROLE || "ADMIN").toUpperCase();
const isAdmin = args.admin || String(process.env.ADMIN_FLAG || "").toLowerCase() === "true";

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs --email admin@localhost --password Parool123 [--role ADMIN] [--admin]\nYou can also set ADMIN_EMAIL and ADMIN_PASSWORD envs.");
  process.exit(1);
}

const ALLOWED_ROLES = new Set(["ADMIN", "SOCIAL_WORKER", "CLIENT"]);
const role = ALLOWED_ROLES.has(roleInput) ? roleInput : "ADMIN";

const prisma = new PrismaClient();

async function main() {
  console.log(`Connecting to DB: ${process.env.DATABASE_URL ? "OK" : "(no DATABASE_URL)"}`);
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { passwordHash, role, isAdmin },
    });
    console.log(`Updated user ${updated.email} (role=${updated.role}, isAdmin=${updated.isAdmin})`);
  } else {
    const created = await prisma.user.create({
      data: { email, passwordHash, role, isAdmin },
    });
    console.log(`Created user ${created.email} (role=${created.role}, isAdmin=${created.isAdmin})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => { console.error(err); prisma.$disconnect(); process.exit(1); });

