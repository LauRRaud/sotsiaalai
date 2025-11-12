// scripts/create-admin.mjs
import { prisma } from "../lib/prisma.js";
import { hash } from "bcrypt";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--email") out.email = args[++i];
    else if (a === "--pin" || a === "--password") out.pin = args[++i];
    else if (a === "--role") out.role = args[++i];
    else if (a === "--admin") out.admin = true;
  }
  return out;
}

async function main() {
  const { email, pin, role, admin } = parseArgs();
  if (!email || !pin) {
    console.error("Usage: node scripts/create-admin.mjs --email EMAIL --pin PIN [--role ADMIN] [--admin]");
    process.exit(1);
  }
  if (!/^\d{4,8}$/.test(pin)) {
    console.error("PIN must be 4-8 digits.");
    process.exit(1);
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const passwordHash = await hash(pin, 12);

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    user = await prisma.user.create({ data: { email: normalizedEmail, role: role || "ADMIN", isAdmin: Boolean(admin) } });
    console.log("Created user:", user.id);
  }

  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: normalizedEmail,
      passwordHash,
      role: role || user.role,
      isAdmin: admin ? true : user.isAdmin,
    },
  });

  console.log("Updated user:", { id: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin });
}

main().catch((e) => { console.error(e); process.exit(1); });
